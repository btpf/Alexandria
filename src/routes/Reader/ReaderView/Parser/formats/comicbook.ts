import JSZip from "jszip"

const imageType = async blob => {
  // Construct an ArrayBuffer (byte array) from the first 16 bytes of the given blob.
  const slicedBlob = blob.slice(0, 16)
  const blobArrayBuffer = await new Response(slicedBlob).arrayBuffer()

  // Construct a Uint8Array object to represent the ArrayBuffer (byte array).
  const byteArray = new Uint8Array(blobArrayBuffer)

  // Convert the byte array to hexadecimal.
  let hex = ''
  byteArray.forEach(byte => {
    hex += `0${byte.toString(16)}`.slice(-2).toUpperCase()
  })

  // Return image type based on the converted hexadecimal
  if (hex.startsWith('FFD8FF')) {
    return 'jpeg'
  } else if (hex.startsWith('89504E47')) {
    return 'png'
  } else if (hex.startsWith('47494638')) {
    return 'gif'
  } else if (hex.startsWith('424D')) {
    return 'bmp'
  } else if (hex.startsWith('52494646') && hex.slice(16, 24) === '57454250') {
    return 'webp'
  } else {
    return 'unknown'
  }
}

const unpackZipArchive = async archiveBlob => {
  const archive = await JSZip.loadAsync(archiveBlob)

  const archiveFiles = Object.keys(archive.files).map(name => archive.files[name])
  return Promise.all(
    archiveFiles.map(async file => {
      const name = file.name.split('.').slice(0, -1).join('')
      const blob = await file.async('blob')
      const type = await imageType(blob)

      return { name, blob, type }
    })
  )
}

const unpackArchive = async (archiveBlob, inputType) => {
  const archive = await Archive.open(archiveBlob)

  try {
    await archive.extractFiles()
  } catch (error) {
    if (inputType === 'cbr' && error && error.message && error.message === 'Parsing filters is unsupported.') {
      throw new Error('CBR could not be extracted. [Parsing filters is unsupported]')
    }

    throw error
  }

  const archiveFiles = await archive.getFilesArray()
  return Promise.all(
    archiveFiles.map(async ({file}) => {
      const name = file.name.split('.').slice(0, -1).join('')
      const blob = file
      const type = await imageType(blob)

      return { name, blob, type }
    })
  )
}

export const webpubFromComicBookArchive = async (uri, inputType, layout, filename, checksum) => {
  const automaticStylesheet = () => {
    return `
            * {
                margin: 0 !important;
                padding: 0 !important;
            }

            body {
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .image-wrapper {
                display: flex;
                align-items: center;
                justify-content: center;

                min-height: 99.5vh;
            }

            .image-wrapper img {
                width: 100vw;
                max-height: 99.5vh;
                object-fit: contain;
            }
            .image-wrapper img.left {
                object-position: right center;
            }
            .image-wrapper img.right {
                object-position: left center;
            }
        `
  }

  const fitPageStylesheet = () => {
    return `
            * {
                margin: 0 !important;
                padding: 0 !important;
            }

            body {
                display: flex;
                align-items: center;
                justify-content: center;
            }
        `
  }

  const fitWidthStylesheet = () => {
    return `
            * {
                margin: 0 !important;
                padding: 0 !important;
            }

            body {
                text-align: center;
            }

            .image-wrapper img {
                width: 100%;
            }
        `
  }

  const continuousStylesheet = () => {
    return `
            * {
                margin: 0 !important;
                padding: 0 !important;
            }

            body {
                text-align: center;
                margin-bottom: 20px !important;
            }

            .image-wrapper img {
                display: block;
                width: 100%;
            }
        `
  }

  const automaticScripts = async () => { return `` }
  const fitPageScripts = async () => { return `` }
  const fitWidthScripts = async () => { return `` }
  const continuousScripts = async () => { return `` }

  let stylesheet;
  let scripts;
  switch (layout) {
  case 'automatic': {
    stylesheet = automaticStylesheet()
    scripts = await automaticScripts()
    break
  }
  case 'single-column': {
    stylesheet = fitPageStylesheet()
    scripts = await fitPageScripts()
    break
  }
  case 'scrolled': {
    stylesheet = fitWidthStylesheet()
    scripts = await fitWidthScripts()
    break
  }
  case 'continuous': {
    stylesheet = continuousStylesheet()
    scripts = await continuousScripts()
    break
  }
  default: {
    stylesheet = fitPageStylesheet()
    scripts = await fitPageScripts()
    console.log('unexpected layout')
  }
  }

  const stylesheetBlob = new Blob([stylesheet], { type: 'text/css' })
  const stylesheetURL = URL.createObjectURL(stylesheetBlob)

  const res = await fetch(uri)
  const blob = await res.blob()
  const identifier = await checksum
  let files
  switch (inputType) {
  case 'cbz': files = await unpackZipArchive(blob); break
  case 'cbr': files = await unpackArchive(blob, inputType); break
  case 'cb7': files = await unpackArchive(blob, inputType); break
  case 'cbt': files = await unpackArchive(blob, inputType); break
  }

  let cover
  const sectionLinkObjects = files.filter(file =>
    ['jpeg', 'png', 'gif', 'bmp', 'webp'].includes(file.type))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((image, i) => {
      const left = i % 2
      const src = URL.createObjectURL(image.blob)
      if (i === 0) cover = src
      const html = `
                <!doctype html>
                <html>
                    <head>
                        <title>${image.name}</title>
                        <link rel="stylesheet" type="text/css" href="${stylesheetURL}" />
                    </head>

                    <body>
                        <section class="image-wrapper">
                            <img src="${src}" alt="${image.name}" class="${left ? 'left' : 'right'}" />
                        </section>

                        <!-- SCRIPTS -->
                        ${scripts}
                    </body>
                </html>
            `

      const pageHTMLBlob = new Blob([html], { type: 'text/html' })
      const pageURL = URL.createObjectURL(pageHTMLBlob)

      return {
        href: pageURL,
        type: 'text/html',
        title: image.name,
        properties: [left ? 'page-spread-left' : 'page-spread-right']
      }
    })

  return {
    metadata: {
      title: filename,
      identifier,
      layout: layout === 'automatic' ? 'pre-paginated' : 'reflowable'
    },
    links: [],
    readingOrder: sectionLinkObjects,
    toc: sectionLinkObjects,
    resources: [
      { rel: ['cover'], href: cover }
    ]
  }
}
