import React, { useEffect, useState } from 'react'
import styles from './SliderNavigator.module.scss'

import { useAppDispatch, useAppSelector } from '@store/hooks'


import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import { NavItem, Rendition } from 'epubjs-myh'
import Spine from 'epubjs-myh/types/spine'
import { LOADSTATE } from '@store/slices/bookStateSlice';

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


  const dispatch = useAppDispatch()


  const [currentPercent, setPercent] = useState(0)

  // This will track whether the slider was updated because of a locationChanged event
  // or it was because of a mousedown event
  const [isEpubNavigate, setEpubNavigate] = useState(false)


  const [markers, setMarkers] = useState(defaultMarks)




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

  useEffect(()=>{
    if(!renditionInstance){
      return
    }

    const pageTurnHandler = (e:any)=>{
      // On the event from epubjs, set the epubNavigate to true
      // This will cancel out a loop of the epub reader changing
      setEpubNavigate(true)
      setPercent(renditionInstance.book.locations.percentageFromCfi(e.end))
    }

    renditionInstance.on("locationChanged", pageTurnHandler)

    return ()=>{
      renditionInstance.off("locationChanged", pageTurnHandler)
    }
    

  }, [renditionInstance])


  useEffect(() => {
    if(!renditionInstance){
      return
    }

    // If the previous update event was because of the epub reader
    // cancel the event
    if(isEpubNavigate){
      setEpubNavigate(false)
      return
    }
    const handler = setTimeout(() =>{ 
      
      setEpubNavigate(true)
      renditionInstance.display(renditionInstance.book.locations.cfiFromPercentage(currentPercent))
    }, 100);

    return () => clearTimeout(handler);
  }, [currentPercent]);


  // Handles case where new annotation is made
  useEffect(()=>{


    if(renditionState != LOADSTATE.COMPLETE){
      return
    }

    console.log("Change y")
    console.log(markers, defaultMarks)
    console.log(renditionInstance.book.locations)

    const chapterCFIMap = getChapterCFIMap(renditionInstance)

    const markerObject = {}
    
    chapterCFIMap.forEach((item)=>{
      markerObject[renditionInstance.book.locations.percentageFromCfi(item.cfi) * 1000] = <strong>|</strong>
    })
    console.log("SD")
    console.log(markerObject)
    setMarkers(markerObject)


  }, [renditionState])

  return (
    <Slider
      marks={markers}
      min={0}
      className={styles.slider}
      onChange={(e)=>{

        setPercent(e/1000)
              

      }}
      value={currentPercent * 1000}
      max={1000}/>
  )
}

export default SliderNavigator