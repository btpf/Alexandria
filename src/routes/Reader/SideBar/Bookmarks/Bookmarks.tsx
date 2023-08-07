import React, { useEffect, useState } from 'react'

import { useAppDispatch, useAppSelector } from '@store/hooks'
import Trash from '@resources/feathericons/trash-2.svg'
import { NavItem, Rendition } from 'epubjs'
import Spine from 'epubjs/types/spine'
import { DeleteHighlight, CloseSidebarMenu, ToggleBookmark } from '@store/slices/bookState'

import styles from './Bookmarks.module.scss'


interface Bookmark{
  cfi: string,
  title: string
}

const getChapterCFIMap = (renditionInstance: Rendition)=>{
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

  traverseTree(renditionInstance.book.navigation.toc)
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
  const id:number = (renditionInstance.book.spine as fixedSpine).spineByHref[item.href] || 0 
  return {...item, cfi: `epubcfi(${(renditionInstance.book.spine as fixedSpine).items[id].cfiBase}!/0)` }
  })
  return allChapters
}

const Annotations = ()=>{
  const dispatch = useAppDispatch()
  const renditionInstance = useAppSelector((state) => state.bookState[0]?.instance)
  const bookmarks = useAppSelector((state) => state.bookState[0]?.data.bookmarks)
  const [orderedBookmarks, setOrderedBookmarks] = useState(Array<Bookmark>)


  useEffect(()=>{
    
    console.log(bookmarks)
    if(!bookmarks || !renditionInstance.book?.spine || !renditionInstance.book?.navigation?.toc){
      return
    }
    const workingBookmarks = Array.from(bookmarks)
  
  
  
    const allChapters = getChapterCFIMap(renditionInstance)

    
    const newOrderedBookmarks = workingBookmarks.map((cfi)=>{
      let titlename;
      for(const item in allChapters){
        if(!allChapters[item].cfi){
          continue
        }
        const comparison = renditionInstance.epubcfi.compare(cfi, allChapters[item].cfi)
        // In the case where the current chapter is ahead of our annotation, break before setting the title
        if (comparison < 0){
          break
        }
        titlename = allChapters[item].title.trim()
      }
      return {cfi, title:titlename}
    
    })

  
    // Sort annotations by location in book
    newOrderedBookmarks.sort((a, b)=>{
      return renditionInstance.epubcfi.compare( a.cfi, b.cfi)
    }
    )

    setOrderedBookmarks(newOrderedBookmarks)
  }, [bookmarks])

  return (
    <div>
      {orderedBookmarks.map((item)=>{
        return (
          <div key={item.cfi} className={styles.annotationContainer}>
            <div className={styles.AnnotationLeftSubContainer} onClick={()=>{
              renditionInstance.annotations.remove(item.cfi, "highlight")
              dispatch(ToggleBookmark({view:0,bookmarkLocation:item.cfi}))
                
            }}> 
              <Trash/>
            </div>
            <div className={styles.AnnotationRightSubContainer} onClick={()=>{
              renditionInstance.display(item.cfi)
              dispatch(CloseSidebarMenu(0))
            }}> 
              <div className={styles.AnnotationChapter}>{item.cfi}</div>
                      
              <div className={styles.noteTextContainer}>{item.title}</div>
        
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Annotations