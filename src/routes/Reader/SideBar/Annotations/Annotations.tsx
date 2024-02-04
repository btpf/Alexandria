import React, { useEffect, useState } from 'react'

import { useAppDispatch, useAppSelector } from '@store/hooks'
import Trash from '@resources/feathericons/trash-2.svg'
import styles from './Annotations.module.scss'
import { DeleteHighlight } from '@store/slices/bookState'
import { CloseSidebarMenu } from '@store/slices/appState'
import { getChapterCFIMap } from '@shared/scripts/getChapterCfiMap'


interface AnnotationData{
  title?: string,
  href?: string,
  annotation?: string,
  AnnotationCFI: string,
  color?: string,
  highlightedText?: string,
}

const Annotations = ()=>{
  const dispatch = useAppDispatch()
  const selectedRendition = useAppSelector((state) => state.appState.state.selectedRendition)
  const renditionInstance = useAppSelector((state) => state.bookState[selectedRendition]?.instance)
  const annotations = useAppSelector((state) => state.bookState[selectedRendition]?.data.highlights)
  const [data, updateData] = useState<Array<AnnotationData>>([])

  // Handles case where new annotation is made
  useEffect(()=>{

    const promiseArray:Array<Promise<AnnotationData>> = []
    if(!annotations){
      return
    }

    // This will create the promises which fetch the annotated text across the book
    Object.keys(annotations).forEach((item)=>{
      const myPromise:Promise<AnnotationData> = new Promise(function(myResolve, myReject) {
        // "Producing Code" (May take some time)
        ((renditionInstance.book.getRange(item) as unknown) as Promise<Range>).then((rangeData:Range)=>{
          const documentFragement = rangeData.cloneContents()
          const text = documentFragement.textContent || ""
          const myData:AnnotationData = {AnnotationCFI: item, annotation: annotations[item].note, color: annotations[item].color, highlightedText: text}
          myResolve(myData); // when successful
        })
        
        // myReject();  // when error
      });
      promiseArray.push(myPromise)
    })



    const finalState:Array<AnnotationData> = []
    const allChapters = getChapterCFIMap(renditionInstance.book)
    Promise.all(promiseArray).then((values) => {
      for (const value of values){
        let titlename;
        for(const item in allChapters){
          if(!allChapters[item].cfi){
            continue
          }
          const comparison = renditionInstance.epubcfi.compare(value.AnnotationCFI, allChapters[item].cfi)
          // In the case where the current chapter is ahead of our annotation, break before setting the title
          if (comparison < 0){
            break
          }
          titlename = allChapters[item].title
        }
        finalState.push({...value, title:titlename})

      }

      // Sort annotations by location in book
      finalState.sort((a, b)=>{
        return renditionInstance.epubcfi.compare( a.AnnotationCFI, b.AnnotationCFI)
      }
      )
      updateData(finalState)
    });


  }, [annotations])

  return (
    <div>
      {data.map((item)=>{
        return (
          <div key={item.AnnotationCFI} className={styles.annotationContainer}>
            <div className={styles.AnnotationLeftSubContainer} onClick={()=>{
              renditionInstance.annotations.remove(item.AnnotationCFI, "highlight")
              dispatch(DeleteHighlight({highlightRange:item.AnnotationCFI, color:"any", note:"", view:selectedRendition}))
              
            }}> 
              <Trash/>
            </div>
            <div className={styles.AnnotationRightSubContainer} onClick={()=>{
              renditionInstance.display(item.AnnotationCFI)
              dispatch(CloseSidebarMenu())
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