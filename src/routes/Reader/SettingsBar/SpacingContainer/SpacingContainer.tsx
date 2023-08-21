import React, { useEffect, useState } from 'react'

import styles from './SpacingContainer.module.scss'

import { useAppDispatch, useAppSelector } from '@store/hooks'

import { invoke } from '@tauri-apps/api'
import { convertFileSrc } from '@tauri-apps/api/tauri'
import { setLineHeightThunk, setWordSpacingThunk } from '@store/slices/EpubJSBackend/data/theme/themeManager'
import {  setRenderMode } from '@store/slices/bookState'
import { setReaderMargins } from '@store/slices/appState'
const SpacingContainer = ()=>{
  const dispatch = useAppDispatch()
  const selectedRendition = useAppSelector((state) => state.appState.state.selectedRendition)

  const wordSpacing = useAppSelector((state) => state.bookState[selectedRendition]?.data.theme.wordSpacing)
  const lineHeight = useAppSelector((state) => state.bookState[selectedRendition]?.data.theme.lineHeight)
  const readerMargins = useAppSelector((state) => state.appState.readerMargins)
  return ( 
    <>
      <div className={styles.settingContainer}>
        <div className={styles.settingLabel}>Word Spacing</div>
        <div className={styles.settingButtonContainer}>
          <div className={styles.settingButton} onClick={()=>{
            dispatch(setWordSpacingThunk({view:selectedRendition, value: wordSpacing - 5}))
          }}>-</div>
          <div className={styles.resizeSize}>{wordSpacing}px</div>
          <div className={styles.settingButton} onClick={()=>{
            dispatch(setWordSpacingThunk({view:selectedRendition, value: wordSpacing + 5}))
          }}>+</div>
        </div>
      </div>

      <div className={styles.settingContainer}>
        <div className={styles.settingLabel}>Line Height</div>
        <div className={styles.settingButtonContainer}>
          <div className={styles.settingButton} onClick={()=>dispatch(setLineHeightThunk({view:selectedRendition, value: lineHeight - 5}))}>-</div>
          <div className={styles.resizeSize}>{lineHeight}%</div>
          <div className={styles.settingButton} onClick={()=>dispatch(setLineHeightThunk({view:selectedRendition, value: lineHeight + 5}))}>+</div>
        </div>
      </div>

      <div className={styles.settingContainer}>
        <div className={styles.settingLabel}>Reader Margins</div>
        <div className={styles.settingButtonContainer}>
          <div className={styles.settingButton} onClick={()=>{
          // renditionInstance.flow
            // readerInstance.flow("scrolled-continuous")
            // //// readerInstance.setManager(readerInstance.requireManager("continuous"))
            // console.log()
            // readerInstance.manager.destroy()
            // readerInstance.q.clear();
            // readerInstance.manager = false
            // readerInstance.setManager("continuous")
            // readerInstance.start()
            // dispatch(setRenderMode({view:selectedRendition, renderMode: "continuous"}))
            dispatch(setReaderMargins( Math.min(readerMargins+5, 100)))
          }}>-</div>
          <div className={styles.resizeSize}>{100 - readerMargins}%</div>
          <div className={styles.settingButton} onClick={()=>{

            dispatch(setReaderMargins(Math.max(readerMargins-5, 5)))
            
          }}>+</div>
        </div>
      </div>
    </>
  )
}


export default SpacingContainer