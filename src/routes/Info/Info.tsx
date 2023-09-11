import React, { useCallback, useEffect, useRef, useState } from 'react'; // we need this to make JSX compile
import { Link, useNavigate, useParams } from "react-router-dom";

import styles from './Info.module.scss'

import BackArrow from '@resources/feathericons/arrow-left.svg'

import { save } from '@tauri-apps/api/dialog';
import { writeTextFile } from '@tauri-apps/api/fs';



import { convertFileSrc, invoke } from '@tauri-apps/api/tauri'
import epubjs, { EpubCFI, NavItem, Book } from 'epubjs';


import TitleBarButtons  from '@shared/components/TitleBarButtons';

import { platform } from '@tauri-apps/api/os';

import Spine from 'epubjs/types/spine';
import html from './generator/html';
import parser from '../Reader/ReaderView/Parser/parser';

import {getBookUrlByHash, createBookInstance} from '@shared/scripts/TauriActions'

interface AnnotationData{
  title?: string,
  href?: string,
  annotation?: string,
  AnnotationCFI: string,
  color?: string,
  highlightedText?: string,
}

const getChapterCFIMap = (book: Book)=>{
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

const epubcfi = new EpubCFI
const Info = (props:any) =>{
  const navigate = useNavigate();
  const params = useParams();
  const [metaData, setMetaData] = useState({});
  const [annotationData, setAnnotationData] = useState([]);
  const [coverUrl, setCoverUrl] = useState();

  const setAnnotationMethod = (annotations, book:Book)=>{

    const promiseArray:Array<Promise<AnnotationData>> = []
    if(!annotations){
      return
    }

    // This will create the promises which fetch the annotated text across the book
    Object.keys(annotations).forEach((item)=>{
      const myPromise:Promise<AnnotationData> = new Promise(function(myResolve, myReject) {
        // "Producing Code" (May take some time)
        ((book.getRange(item) as unknown) as Promise<Range>).then((rangeData:Range)=>{
          const myData:AnnotationData = {AnnotationCFI: item, annotation: annotations[item].note, color: annotations[item].color, highlightedText: (rangeData.endContainer as any).data.substring(rangeData.startOffset, rangeData.endOffset)}
          myResolve(myData); // when successful
        })
        
        // myReject();  // when error
      });
      promiseArray.push(myPromise)
    })



    const finalState:Array<AnnotationData> = []
    const allChapters = getChapterCFIMap(book)
    Promise.all(promiseArray).then((values) => {
      for (const value of values){
        let titlename;
        for(const item in allChapters){
          if(!allChapters[item].cfi){
            continue
          }
         
          
          // epubcfi("dsf")
          const comparison = epubcfi.compare(value.AnnotationCFI, allChapters[item].cfi)
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
        
        return epubcfi.compare( a.AnnotationCFI, b.AnnotationCFI)
      }
      )

      setAnnotationData(finalState)
      // updateData(finalState)
    });
  }
  useEffect(()=>{
    const myFun = async ()=>{


      if(!params.bookHash){
        console.log("Info page opened and bookhash not found")
        return
      }

      const bookValue = await getBookUrlByHash(params.bookHash)
      const book = await createBookInstance(bookValue, params.bookHash)

      if(!book){
        console.log("Info page opened and book failed to load")
        return
      }

      let result = null 

      try {
        result = await invoke("load_book_data", {checksum: params.bookHash})
        
      } catch (error) {
        console.log("Book error: ", error)
      }

      
      // setAnnotationData(result.data.highlights)

      book.ready.then((bookData)=>{
        console.log(book)
        setMetaData(book.packaging.metadata)
        if(result)
          setAnnotationMethod(result.data.highlights, book)
      })

      book.coverUrl().then((url)=>{
        setCoverUrl(url)
      })
      console.log(bookValue)
    }
    myFun()
  }, [params])
  return (
    <div className={styles.infoPageContainer}>
      <div data-tauri-drag-region className={styles.titleBar}>
        {/* This is the titlebar for desktop screens */}
        <div onClick={()=> navigate("/")} className={styles.backButtonContainer}>
          <BackArrow/>
        </div>
        <div className={styles.titleText}>Info</div>
        <div className={styles.titleBarButtonsContainer}>
          <TitleBarButtons/>

        </div>
      </div>
      <div className={styles.overflowContainer}>
      
        <div className={styles.contentContainer}>

          <div className={styles.leftSide}>
            <h1 className={styles.bookTitle}> {metaData["title"]} </h1>
            <img className={styles.coverStyles} src={coverUrl}/>
            <h2 className={styles.bookTitle}> Written By: {metaData["creator"]} </h2>
            <div className={styles.bookDescription} dangerouslySetInnerHTML={{__html:metaData["description"]}}></div>
          </div>

          <div className={styles.rightSide}>
            <h3>Metadata</h3>
            <div className={styles.metaContainer}>
              {Object.keys(metaData).filter((item)=> item != "title" && item != "creator" && item != "description" && metaData[item] != "").map((key)=>{
                // if typeof {}
                return(
                  <div key={key}>
                    {key} : {JSON.stringify(metaData[key])}
                  </div>
                )
              })}
            </div>
            <div className={styles.annotationTitleContainer}> <div/> <h3> Annotations </h3> 
              <div className={styles.exportButton}
                onClick={async ()=> {
                  const exportData = html(metaData, annotationData)
                  const savePath = await save({
                    defaultPath: `Annotations of ${metaData["title"]}.html`,
                    filters: [{
                      name: "Annotation Export (.html)",
                      extensions: ['html']
                    }]
                  })
                  if(savePath)
                    await writeTextFile(savePath, exportData);
                }}
              >Export</div> </div>
            <div className={styles.highlightContainer}>
              {annotationData.map((item)=>{
                return (
                  <div key={item.AnnotationCFI} className={styles.annotationContainer}>
                    <div className={styles.AnnotationRightSubContainer}> 
                      <div className={styles.AnnotationChapter}>{item.title} - {item.AnnotationCFI}</div>
                    
                      <div className={styles.highlightedTextContainer} style={{borderLeft: `10px solid ${item.color}`}}>{item.highlightedText}</div>
                      <div className={styles.noteTextContainer}>{item.annotation}</div>
      
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>




    </div>
  )
} 


export default Info

