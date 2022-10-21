import React, { useEffect, useState } from 'react'

import { useAppDispatch, useAppSelector } from '@store/hooks'
import Trash from '@resources/feathericons/trash-2.svg'
import styles from './Annotations.module.scss'
import { NavItem, Rendition } from 'epubjs-myh'
import Spine from 'epubjs-myh/types/spine'
import { DeleteHighlight, ToggleSidebar } from '@store/slices/bookStateSlice'


interface AnnotationData{
  title?: string,
  href?: string,
  annotation?: string,
  AnnotationCFI: string,
  color?: string,
  highlightedText?: string,
}


const getChapterCFIMap = (renditionInstance: Rendition)=>{
  let allChapters: any[] = []

  function traverseTree(node: NavItem[]){
    node.forEach((subNode)=>{
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
    const id:number = (renditionInstance.book.spine as fixedSpine).spineByHref[item.href]
    // console.log(id)
    // console.log(renditionInstance.book.spine)
    return {...item, cfi: `epubcfi(${(renditionInstance.book.spine as fixedSpine).items[id].cfiBase}!/0)` }
  })
  return allChapters
}

const Annotations = ()=>{
  const dispatch = useAppDispatch()
  const renditionInstance = useAppSelector((state) => state.bookState[0]?.instance)
  const annotations = useAppSelector((state) => state.bookState[0]?.data.highlights)
  const [data, updateData] = useState<Array<AnnotationData>>([])
  useEffect(()=>{
    const promiseArray:Array<Promise<AnnotationData>> = []
    if(!annotations){
      return
    }
    Object.keys(annotations).forEach((item)=>{
      const myPromise:Promise<AnnotationData> = new Promise(function(myResolve, myReject) {
        // "Producing Code" (May take some time)
        ((renditionInstance.book.getRange(item) as unknown) as Promise<Range>).then((rangeData:Range)=>{
          const myData:AnnotationData = {AnnotationCFI: item, annotation: annotations[item].note, color: annotations[item].color, highlightedText: (rangeData.endContainer as any).data.substring(rangeData.startOffset, rangeData.endOffset)}
          myResolve(myData); // when successful
        })
        
        // myReject();  // when error
      });
      promiseArray.push(myPromise)


    })
    const finalState:Array<AnnotationData> = []
    const allChapters = getChapterCFIMap(renditionInstance)
    Promise.all(promiseArray).then((values) => {
      for (const value of values){
        let previousItem;
        for(const item of allChapters){
          
          const comparison = renditionInstance.epubcfi.compare(value.AnnotationCFI, item.cfi)
          if (comparison <= 0){
            finalState.push({...value, title:previousItem.title})
            break
          }
          previousItem = item
        }
      }

      finalState.sort((a, b)=>{
        return renditionInstance.epubcfi.compare( a.AnnotationCFI, b.AnnotationCFI)
      }
      )
      updateData(finalState)
    });
    // console.log(finalState)


  }, [annotations])

  return (
    <div>
      {data.map((item)=>{
        return (
          <div key={item.AnnotationCFI} className={styles.annotationContainer}>
            <div className={styles.AnnotationLeftSubContainer} onClick={()=>{
              renditionInstance.annotations.remove(item.AnnotationCFI, "highlight")
              dispatch(DeleteHighlight({highlightRange:item.AnnotationCFI, color:"any", note:"", view:0}))
              
            }}> 
              <Trash/>
            </div>
            <div className={styles.AnnotationRightSubContainer} onClick={()=>{
              renditionInstance.display(item.AnnotationCFI)
              dispatch(ToggleSidebar(0))
            }}> 
              <div className={styles.AnnotationChapter}>{item.title}</div>
                    
              <div className={styles.highlightedTextContainer} style={{borderLeft: `10px solid ${item.color}`}}>{item.highlightedText}</div>
              <div className={styles.noteTextContainer}>{item.annotation}</div>
      
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Annotations