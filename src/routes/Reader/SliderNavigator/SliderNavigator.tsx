import React, { useEffect, useState } from 'react'
import styles from './SliderNavigator.module.scss'

import { useAppDispatch, useAppSelector } from '@store/hooks'


import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import { NavItem, Rendition } from 'epubjs'
import Spine from 'epubjs/types/spine'
import { setProgrammaticProgressUpdate, SetProgress } from '@store/slices/bookState';
import { LOADSTATE } from '@store/slices/constants';



interface MarkObj {
  style?: React.CSSProperties;
  label?: React.ReactNode;
}

type MarkType = Record<string | number, React.ReactNode | MarkObj>

 
const defaultMarks = {
  500: {
    style: {
      top: 10,
    },
    label: <strong>loading...</strong>
  },
};


const SliderNavigator = ()=>{
  const renditionInstance = useAppSelector((state) => state.bookState[0]?.instance)
  const renditionState = useAppSelector((state) => state.bookState[0]?.loadState)
  const currentPercent = useAppSelector((state) => state.bookState[0]?.data.progress)
  const isProgrammaticProgressUpdate = useAppSelector((state) => state.bookState[0]?.state.isProgrammaticProgressUpdate)


  const dispatch = useAppDispatch()




  const [markers, setMarkers] = useState<MarkType>(defaultMarks)




  // Gets the cfi for each chapter name and returns it. Used for finding chapter of annotation
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
    // This fixes a bug where the spineByHref returns undefined
    const id:number = (renditionInstance.book.spine as fixedSpine).spineByHref[item.href] || 0 

    return {...item, cfi: `epubcfi(${(renditionInstance.book.spine as fixedSpine).items[id].cfiBase}!/0)` }
    })
    return allChapters
  }


  useEffect(() => {
    if(renditionState != LOADSTATE.COMPLETE && renditionState != LOADSTATE.BOOK_PARSING_COMPLETE){
      return
    }

    // If the previous update event was because of the epub reader
    // cancel the event
    if(isProgrammaticProgressUpdate){
      dispatch(setProgrammaticProgressUpdate({view:0, state:false}))
      return
    }
    const handler = setTimeout(() =>{ 
      dispatch(setProgrammaticProgressUpdate({view:0, state:true}))
      if(currentPercent)
        renditionInstance.display(renditionInstance.book.locations.cfiFromPercentage(currentPercent))
    }, 100);

    return () => clearTimeout(handler);
  }, [currentPercent]);



  useEffect(()=>{


    if(renditionState != LOADSTATE.COMPLETE){
      return
    }


    const chapterCFIMap = getChapterCFIMap(renditionInstance)

    const markerObject: MarkType = {}

    chapterCFIMap.forEach((item)=>{
      markerObject[renditionInstance.book.locations.percentageFromCfi(item.cfi) * 1000] = <strong>|</strong>
    })

    setMarkers(markerObject)

  }, [renditionState])

  return (
    <Slider
      marks={markers}
      min={0}
      className={styles.slider}
      // @ts-expect-error This is a hacky workaround for styling. I will never use anything but css in js again.
      style={{"--slider-track-color":"red"}}

      onChange={(e)=>{
        if(typeof e === "number"){
          dispatch(SetProgress({view: 0, progress: e/1000}))
          
        }

      }}
      value={currentPercent * 1000}
      max={1000}/>
  )
}

export default SliderNavigator