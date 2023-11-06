import React, { useEffect, useState } from 'react'

import styles from './ProgressMenu.module.scss'
import { useAppDispatch, useAppSelector } from '@store/hooks'

import { LOADSTATE } from '@store/slices/constants'
import BottomMenuContainer from '../Components/BottomMenuContainer/BottomMenuContainer'
import { getChapterCFIMap } from '@shared/scripts/getChapterCfiMap'
import toast from 'react-hot-toast'
import { EpubCFI } from '@btpf/epubjs'
const WORDS_PER_MINUTE = 200
const CHARACTERS_PER_PAGE = 1024

const CHARACTERS_PER_WORD = (lang:string) =>
  lang === 'zh' || lang === 'ja' || lang === 'ko' ? 2.5 : 6

const estimate = (currentPercentage:number, endPercentage:number, totalLocations:number, language:string) =>
  (endPercentage - currentPercentage) * totalLocations
* CHARACTERS_PER_PAGE
/ CHARACTERS_PER_WORD(language)
/ WORDS_PER_MINUTE



const ProgressInfoBar = ()=>{
  const dispatch = useAppDispatch()
  const menuActive = useAppSelector((state) => state?.appState?.state?.progressMenuActive)
  const selectedRendition = useAppSelector((state) => state.appState.state.selectedRendition)
  const displayedCFI = useAppSelector((state) => state.bookState[selectedRendition]?.data.cfi)
  const renditionInstance = useAppSelector((state) => state.bookState[selectedRendition]?.instance)
  const renditionState = useAppSelector((state) => state.bookState[selectedRendition]?.loadState)
  const [chapterCfiMap, setChapterCfiMap] = useState([])
  const [chapterEndPercentage, setChapterEndPercentage] = useState(0.0);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [numberOfChapters, setNumberOfChapters] = useState(0);
  const [controlledCfi, setControlledCfi] = useState(displayedCFI);
  
  useEffect(()=>{


    if(renditionState != LOADSTATE.COMPLETE){
      return
    }

    const result = getChapterCFIMap(renditionInstance.book)
    setChapterCfiMap(result)

    setNumberOfChapters(result.length)

  }, [renditionState, selectedRendition])

  useEffect(()=>{
    if(renditionState != LOADSTATE.COMPLETE || !chapterCfiMap){
      return
    }
    if(!displayedCFI){
      return
    }
    let nextCFI = {cfi: displayedCFI}

    let chapterCount = 0
    for(const item in chapterCfiMap){
      if(!chapterCfiMap[item].cfi){
        continue
      }
      const comparison = renditionInstance.epubcfi.compare(displayedCFI, chapterCfiMap[item].cfi)
      nextCFI = chapterCfiMap[item];
      // In the case where the current chapter is ahead of our annotation, break and set cfi
      if (comparison < 0){
        break
      }
      chapterCount += 1
    }

    setChapterEndPercentage(renditionInstance?.book.locations.percentageFromCfi(nextCFI.cfi))
    setCurrentChapter(chapterCount)
    setControlledCfi(displayedCFI)
  }, [displayedCFI, chapterCfiMap])

  function navigateChapter(){
    const item = chapterCfiMap[currentChapter - 1]
    if(item){
      renditionInstance.display(item.cfi)
    }
  }
  
  function navigateCfi(){
    try {
      const testCFI = new EpubCFI()
      // Perform tests on the cfi first, catching any errors before crashing with .display()
      testCFI.isCfiString(controlledCfi)
      testCFI.parse(controlledCfi)


      renditionInstance.display(controlledCfi).then(()=>{
        renditionInstance.display(controlledCfi)
      }).catch((e:any)=>{
        toast.error("Invalid CFI: e1")
        console.log("Caught Error Displaying CFI: e1")
        console.log(e)
      })
    } catch (error) {
      toast.error("Invalid CFI: e2")
      console.log("Caught Error Displaying CFI: e2")
      console.log(error)
    }

  }

  const currentPercentage = renditionInstance?.book.locations.percentageFromCfi(displayedCFI)
  
  const locationsCount = renditionInstance?.book.locations.total
  const lang = renditionInstance?.book.package.metadata.language
  return (
    <BottomMenuContainer active={menuActive}>
      {/* {renditionInstance} */}
      <div className={styles.progressContainer}>
        <div><div className={styles.heading}>Time Left In Chapter: </div>{Math.round(renditionInstance && estimate(currentPercentage, chapterEndPercentage, locationsCount, lang) || 0)} Minutes</div>
        <div><div className={styles.heading}>Time Left In Book: </div>{Math.round(renditionInstance && estimate(currentPercentage, 1, locationsCount, lang) || 0)} Minutes</div>
        <div><div className={styles.heading}>Chapter </div><input className={styles.chapterBox} type="number" value={currentChapter} onKeyDown={(e)=>e.key == 'Enter' && navigateChapter()} onChange={(e) => setCurrentChapter(Number.parseInt(e.target.value))}/> of {numberOfChapters}</div>
        <div><div className={styles.heading}>CFI: </div><input className={styles.cfiBox} 
          onKeyDown={(e)=>e.key == 'Enter' && navigateCfi()} onChange={(e) => setControlledCfi(e.target.value)}
          value={controlledCfi || ""} 
          onFocus={e => e.target.select()}
          onMouseUp={e => e.preventDefault()}
        /> </div>
      </div>

    </BottomMenuContainer>
  )
}

export default ProgressInfoBar