export const webpubFromText = async (uri:string, filename:string, checksum:string) => {
  const res = await fetch(uri)
  const blob = await res.blob()
  const identifier = checksum
  const text = await new Response(blob).text()
  const chapters = text.split(/(\r?\n){3,}/g)
    .filter(x => !/^\r?\n$/.test(x))
    .map(c => {
      const ps = c.split(/(\r?\n){2}/g)
        .filter(x => !/^\r?\n$/.test(x))
      const doc = document.implementation.createHTMLDocument()
      ps.forEach(p => {
        const el = doc.createElement('p')
        el.textContent = p
        doc.body.appendChild(el)
      })
      const blob = new Blob(
        [doc.documentElement.outerHTML],
        { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      return {
        href: url,
        type: 'text/html',
        title: ps[0].replace(/\r?\n/g, '')
      }
    })
  
  return {
    metadata: {
      title: filename,
      identifier
    },
    links: [],
    readingOrder: chapters,
    toc: chapters,
    resources: []
  }
}