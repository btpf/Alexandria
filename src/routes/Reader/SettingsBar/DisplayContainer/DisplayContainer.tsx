import React from 'react'

import styles from './DisplayContainer.module.scss'

import { useAppDispatch, useAppSelector } from '@store/hooks'

import {  setRenderMode } from '@store/slices/bookState'
import ScriptIcon from '@resources/iconmonstr/iconmonstr-script-2.svg'
import SinglePageIcon from '@resources/material/article_black_24dp.svg'
import Swap from '@resources/feathericons/repeat.svg'
import { SetDualReaderReversed } from '@store/slices/appState'
import { bookStateStructure } from '@store/slices/EpubJSBackend/epubjsManager.d'

const DisplayContainer = ()=>{
  const dispatch = useAppDispatch()
  const selectedRendition = useAppSelector((state) => state.appState.state.selectedRendition)
  const dualReaderReversed = useAppSelector((state) => state.appState.state.dualReaderReversed)
  const isDualReaderMode = useAppSelector((state) => state.appState.state.dualReaderMode)
  const readerMode = useAppSelector((state) => (state.bookState[selectedRendition] as bookStateStructure)?.data?.theme?.renderMode)

  const renderModeDispatcher = (renderMode:string) =>{
    dispatch(setRenderMode({view:0, renderMode:renderMode}))
    if(isDualReaderMode){
      dispatch(setRenderMode({view:1, renderMode:renderMode}))
    }
  }
  return ( 
    <>
      <div className={styles.optionsContainer}>
        <div onClick={()=>{
          renderModeDispatcher("single")
        }} className={`${styles.optionContainer} ${readerMode=="single"? styles.active:""}`}><SinglePageIcon  width={50} height={50} viewBox="3 3 18 18" />Single Column</div>
        <div onClick={()=>{
          // TODO: Possible to optimize with the below methods
          // renditionInstance.flow("paginated")
          // renditionInstance.spread("none")
          renderModeDispatcher("auto")
        }} className={`${styles.optionContainer}  ${readerMode=="auto"? styles.active:""}`}>
          <div className={styles.doubleColumnIcon}>
            <SinglePageIcon width={50} height={50} viewBox="3 3 18 18" style={{marginRight:4}}/>
            <SinglePageIcon width={50} height={50} viewBox="3 3 18 18"/>
          </div>
          Double Column
        </div>
        <div onClick={()=>{
          renderModeDispatcher("continuous")
        }} className={`${styles.optionContainer}  ${readerMode=="continuous"? styles.active:""}`}><ScriptIcon width={50} height={50} viewBox="0 0 24 24"/>Scrolled</div>

        

        
        
      </div>

      <div onClick={()=>{
        dispatch(SetDualReaderReversed(!dualReaderReversed))

      }} style={isDualReaderMode?{height:"auto", position:"absolute", marginTop:160}:{display:"none"}} className={`${styles.optionContainer}`}>
        <Swap  width={25} height={25} viewBox="0 0 24 24"/>
        Dual Panel Swap
      </div>
    </>
  )
}


export default DisplayContainer