import React from 'react'

import styles from './SpacingContainer.module.scss'

import { useAppDispatch, useAppSelector } from '@store/hooks'

import { setLineHeightThunk, setParagraphSpacingThunk, setTextAlignmentThunk, setWordSpacingThunk } from '@store/slices/EpubJSBackend/data/theme/themeManager'
import { setReaderMargins } from '@store/slices/appState'

import AlignLeft from '@resources/iconmonstr/iconmonstr-text-align-left-lined.svg'
import AlignRight from '@resources/iconmonstr/iconmonstr-text-align-right-lined.svg'
import AlignCenter from '@resources/iconmonstr/iconmonstr-text-align-center-lined.svg'
import AlignJustify from '@resources/iconmonstr/iconmonstr-text-description-lined.svg'
import ResetDefault from '@resources/iconmonstr/iconmonstr-undo-7.svg'
const SpacingContainer = ()=>{
  const dispatch = useAppDispatch()
  const selectedRendition = useAppSelector((state) => state.appState.state.selectedRendition)

  const wordSpacing = useAppSelector((state) => state.bookState[selectedRendition]?.data.theme.wordSpacing)
  const lineHeight = useAppSelector((state) => state.bookState[selectedRendition]?.data.theme.lineHeight)
  const readerMargins = useAppSelector((state) => state.appState.readerMargins)
  const paragraphSpacing = useAppSelector((state) => state.bookState[selectedRendition]?.data.theme.paragraphSpacing)
  return ( 
    <>
      {/* <div> */}
      <div className={styles.settingLabel}>Text Alignment</div>
      <div className={styles.alignmentContainer}>
        <ResetDefault  height="48" viewBox="0 0 24 24"
          onClick={()=>dispatch(setTextAlignmentThunk({view:selectedRendition, value:"default"}))}/>
        <AlignLeft height="48" viewBox="0 0 24 24" onClick={()=>dispatch(setTextAlignmentThunk({view:selectedRendition, value:"start"}))}/> 
        <AlignJustify height="48" viewBox="0 0 24 24"
          onClick={()=>dispatch(setTextAlignmentThunk({view:selectedRendition, value:"justify"}))}/>
        <AlignCenter height="48" viewBox="0 0 24 24"
          onClick={()=>dispatch(setTextAlignmentThunk({view:selectedRendition, value:"center"}))}/>
        <AlignRight height="48" viewBox="0 0 24 24"
          onClick={()=>dispatch(setTextAlignmentThunk({view:selectedRendition, value:"end"}))}/>
      
      
      </div>
        
      {/* </div> */}
      <div className={styles.scaleItems}>
        <div className={styles.settingContainer}>
          <div>
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
        </div>

        <div className={styles.settingContainer}>
          <div>
            <div className={styles.settingLabel}>Line Height</div>
            <div className={styles.settingButtonContainer}>
              <div className={styles.settingButton} onClick={()=>dispatch(setLineHeightThunk({view:selectedRendition, value: lineHeight - 5}))}>-</div>
              <div className={styles.resizeSize}>{lineHeight}%</div>
              <div className={styles.settingButton} onClick={()=>dispatch(setLineHeightThunk({view:selectedRendition, value: lineHeight + 5}))}>+</div>
            </div>
          </div>
        </div>

        <div className={styles.settingContainer}>
          <div>
            <div className={styles.settingLabel}>Reader Margins</div>
            <div className={styles.settingButtonContainer}>
              <div className={styles.settingButton} onClick={()=>{
                dispatch(setReaderMargins( Math.min(readerMargins+5, 100)))
              }}>-</div>
              <div className={styles.resizeSize}>{100 - readerMargins}%</div>
              <div className={styles.settingButton} onClick={()=>{

                dispatch(setReaderMargins(Math.max(readerMargins-5, 5)))
            
              }}>+</div>
            </div>
          </div>
        </div>


        <div className={styles.settingContainer}>
          <div>
            <div className={styles.settingLabel}>Paragraph Spacing</div>
            <div className={styles.settingButtonContainer}>
              <div className={styles.settingButton} onClick={()=>{
                // To Implement
                dispatch(setParagraphSpacingThunk({view:selectedRendition, value: Math.max(paragraphSpacing -5, -1)}))
              }}>-</div>
              <div className={styles.resizeSize}>{paragraphSpacing == -1?"default":`${paragraphSpacing}px`}</div>
              <div className={styles.settingButton} onClick={()=>{
                if(paragraphSpacing == -1){
                  dispatch(setParagraphSpacingThunk({view:selectedRendition, value: paragraphSpacing + 1}))
                  return
                }
                dispatch(setParagraphSpacingThunk({view:selectedRendition, value: paragraphSpacing + 5}))
                // dispatch(setReaderMargins(Math.max(readerMargins-5, 5)))
            
              }}>+</div>
            </div>
          </div>
        </div>

        
      </div>
    </>
  )
}


export default SpacingContainer