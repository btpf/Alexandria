import { Book, NavItem } from "@btpf/epubjs"
import Spine from "@btpf/epubjs/types/spine"

// Gets the cfi for each chapter name and returns it. Used for finding chapter of annotation
export const getChapterCFIMap = (book: Book)=>{
  let allChapters: any[] = []
  
  // Recursive function which gets all the chapters and subchapters in order
  function traverseTree(node: NavItem[]){
    node.forEach((subNode)=>{
      // href is saved for using spineByHref which returns the ID needed for getting the cfi of the chapter
      allChapters.push({href: subNode.href, title:subNode.label})
      if(subNode.subitems){
        traverseTree(subNode.subitems)
      }
    })
  }
  
  traverseTree(book.navigation.toc)
  allChapters = allChapters.map((item)=>{
    interface fixedSpine extends Spine{
      spineByHref: [value:number],
      items: [key:any]
    }
  
    let temp = item.href
    if(temp.includes(".xhtml#") || temp.includes(".html#")){
      temp = temp.split("#")
      temp.pop()
      item.href = temp.join()
    }
  
    // This fixes a bug where the spineByHref returns undefined
    const id:number = (book.spine as fixedSpine).spineByHref[item.href] || 0 
    return {...item, cfi: `epubcfi(${(book.spine as fixedSpine).items[id].cfiBase}!/0)` }
  })
  return allChapters
}