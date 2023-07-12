import React, { useEffect, useState } from 'react'

import styles from './DisplayContainer.module.scss'

import { useAppDispatch, useAppSelector } from '@store/hooks'

import { invoke } from '@tauri-apps/api'
import {Rendition} from 'epubjs/types'
import { convertFileSrc } from '@tauri-apps/api/tauri'
import { setLineHeightThunk, setWordSpacingThunk } from '@store/slices/EpubJSBackend/data/theme/themeManager'
import { setReaderMargins, setRenderMode } from '@store/slices/bookState'
import ScriptIcon from '@resources/iconmonstr/iconmonstr-script-2.svg'
import SinglePageIcon from '@resources/material/article_black_24dp.svg'
const DisplayContainer = ()=>{
  const dispatch = useAppDispatch()
 
  return ( 
    <>
      <div className={styles.optionsContainer}>
        <div onClick={()=>{
          dispatch(setRenderMode({view:0, renderMode:"single"}))
        }} className={`${styles.optionContainer}`}><SinglePageIcon  width={50} height={50} viewBox="3 3 18 18" />Single Column</div>
        <div onClick={()=>{
          // TODO: Possible to optimize with the below methods
          // renditionInstance.flow("paginated")
          // renditionInstance.spread("none")
          dispatch(setRenderMode({view:0, renderMode:"auto"}))
        }} className={`${styles.optionContainer}`}>
          <div className={styles.doubleColumnIcon}>
            <SinglePageIcon width={50} height={50} viewBox="3 3 18 18" style={{marginRight:4}}/>
            <SinglePageIcon width={50} height={50} viewBox="3 3 18 18"/>
          </div>
          Double Column
        </div>
        <div onClick={()=>{
          dispatch(setRenderMode({view:0, renderMode:"continuous"}))
        }} className={`${styles.optionContainer}`}><ScriptIcon width={50} height={50} viewBox="0 0 24 24"/>Scrolled</div>

        
        
      </div>
    </>
  )
}


export default DisplayContainer