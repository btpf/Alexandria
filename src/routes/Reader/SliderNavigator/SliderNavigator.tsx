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
  const selectedRendition = useAppSelector((state) => state.appState.state.selectedRendition)
  const renditionInstance:Rendition = useAppSelector((state) => state.bookState[selectedRendition]?.instance)
  const renditionState = useAppSelector((state) => state.bookState[selectedRendition]?.loadState)
  const currentPercent = useAppSelector((state) => state.bookState[selectedRendition]?.data.progress)
  const currentCfi = useAppSelector((state) => state.bookState[selectedRendition]?.data.cfi)
  const isProgrammaticProgressUpdate = useAppSelector((state) => state.bookState[selectedRendition]?.state.isProgrammaticProgressUpdate)


  const dispatch = useAppDispatch()




  const [markers, setMarkers] = useState<MarkType>(defaultMarks)
  const [mouseOnSlider, setMouseOnSlider] = useState(false)

  // This is used to animate the mouse if scrolling
  const [placeholderProgress, setPlaceholderProgress] = useState(0)



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


  useEffect(() => {
    if(renditionState != LOADSTATE.COMPLETE && renditionState != LOADSTATE.BOOK_PARSING_COMPLETE){
      return
    }
    // If the previous update event was because of the epub reader
    // cancel the event
    if(isProgrammaticProgressUpdate){
      dispatch(setProgrammaticProgressUpdate({view:selectedRendition, state:false}))
      return
    }
    const handler = setTimeout(() =>{ 
      dispatch(setProgrammaticProgressUpdate({view:selectedRendition, state:true}))
      if(currentCfi)
        renditionInstance.display(currentCfi)
    }, 100);

    return () => clearTimeout(handler);
  }, [currentCfi]);



  useEffect(()=>{


    if(renditionState != LOADSTATE.COMPLETE){
      return
    }


    const chapterCFIMap = getChapterCFIMap(renditionInstance)

    const markerObject: MarkType = {}

    chapterCFIMap.forEach((item)=>{
      const myPercentage = renditionInstance.book.locations.percentageFromCfi(item.cfi)
      // Alternative method of finding the percentage from CFI, Commented out as it seems unnecessary
      // if(myPercentage == 0){
      //   const sectionLocation = renditionInstance.book.locations.locationFromCfi(item.cfi)
      //   myPercentage = renditionInstance.book.locations.percentageFromLocation(sectionLocation)
      // }
      markerObject[myPercentage * 1000] = <strong>|</strong>
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
        if(typeof e !== "number"){
          return
        }

        if(mouseOnSlider){
          setPlaceholderProgress(e)
          return
        }

        // This complicates logic and can likely be removed.
        // dispatch(SetProgress({view: 0, progress: e/1000}))


      }}


      onBeforeChange={(e)=>{
        setMouseOnSlider(true)
      }}
      onAfterChange={(e)=>{
        if(typeof e !== "number"){
          return
        }
        
        // Refocus onto a different element so that when using the arrow keys,
        // You will not be controlling the slider, but rather using window button events.
        // Controlling the slider with arrow keys leads to poor navigation experience
        window?.document?.getElementById("reader-background")?.focus()
        setMouseOnSlider(false)
        dispatch(SetProgress({view: selectedRendition, progress: e/1000, cfi: renditionInstance.book.locations.cfiFromPercentage(e/1000)}))
      }}
      value={mouseOnSlider? placeholderProgress: currentPercent * 1000}
      max={1000}/>
  )
}

export default SliderNavigator