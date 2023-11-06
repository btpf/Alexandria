import { Rendition } from "@btpf/epubjs";
import { SetFootnoteActive } from "@store/slices/appState";
import store from "@store/store";


const EPUB_NS = 'http://www.idpf.org/2007/ops';
const resolveURL = (url, relativeTo) => {
  // HACK-ish: abuse the URL API a little to resolve the path
  // the base needs to be a valid URL, or it will throw a TypeError,
  // so we just set a random base URI and remove it later
  const base = 'https://example.invalid/'
  return new URL(url, base + relativeTo).href.replace(base, '')
}

const isExternalURL = href => {
  if (href.startsWith('blob:')) return false
  return href.startsWith('mailto:') || href.includes('://')
}



const refTypes = [
  'annoref', // deprecated
  'biblioref',
  'glossref',
  'noteref',
]
const forbidRefTypes = [
  'backlink',
  'referrer'
]
const noteTypes = [
  'annotation', // deprecated
  'note', // deprecated
  'footnote',
  'endnote',
  'rearnote' // deprecated
]


export const handleLinkClick = async (renditionInstance: Rendition, href:string)=>{

  //   const type = link.getAttributeNS(EPUB_NS, 'type')
  //   const types = type ? type.split(' ') : []
  //   const isRefLink = refTypes.some(x => types.includes(x))
  const book = renditionInstance.book;
  const id = href.split('#')[1]
  //   const pageHref = "part0012.html#id_119";
  console.log("LOGGING PAGEREDF")
  console.log(href)
  const pageHref = resolveURL(href,
    //   From contents.sectionIndex -> id
    book.spine.spineItems[renditionInstance.location.start.index].href)

  const followLink = () => {
    renditionInstance.display(pageHref)
    return false
  }

  if (isExternalURL(href)){
    // e.stopPropagation()
    // e.preventDefault()
    return followLink()// DO NOTHING, allow event to pass
    // }
    // else if (!isRefLink || forbidRefTypes.some(x => types.includes(x))){
    //   e.stopPropagation()
    //   e.preventDefault()
    //   // console.log("SHOULD BYPASS")
    //   return
  }
  else {

    const item = book.spine.get(pageHref)
    if (item) await item.load(book.load.bind(book))
    console.log(item)
    if(!item || !item.document) return followLink()
    let el = item.document
      .getElementById(id)
    if (!el) return followLink()

    let dt
    if (el.nodeName.toLowerCase() === 'dt') {
      const dfn = el.querySelector('dfn')
      if (dfn) dt = dfn
      else dt = el
      el = el.nextElementSibling
    }

    // this bit deals with situations like
    //     <p><sup><a id="note1" href="link1">1</a></sup> My footnote</p>
    // where simply getting the ID or its parent would not suffice
    // although it would still fail to extract useful texts for some books
    const isFootnote = el => {
      const nodeName = el.nodeName.toLowerCase()
      return [
        'a', 'span', 'sup', 'sub',
        'em', 'strong', 'i', 'b',
        'small', 'big'
      ].every(x => x !== nodeName)
    }
    if (!isFootnote(el)) {
      while (true) {
        const parent = el.parentElement
        if (!parent) break
        el = parent
        if (isFootnote(parent)) break
      }
    }
    if (item) item.unload()
    if (el.innerText.trim()) {

      const elType = el.getAttributeNS(EPUB_NS, 'type')
      const elTypes = elType ? elType.split(' ') : []

      // footnotes not matching this would be hidden (see above)
      // and so one cannot navigate to them
      const canLink = !(el.nodeName === 'aside'
                  && noteTypes.some(x => elTypes.includes(x)))

      // console.log("ARRIVED TO END")

      const text = (dt ? `<strong>${dt.innerHTML}</strong><br/>` : '') + el.innerHTML

      store.dispatch(SetFootnoteActive({
        text: text,
        link: pageHref
      }))


    } else return followLink()
  }
}