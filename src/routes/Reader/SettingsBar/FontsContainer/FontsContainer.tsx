import React, { useEffect, useState } from 'react'

import styles from './FontsContainer.module.scss'

import { useAppDispatch, useAppSelector } from '@store/hooks'
import { SetFont } from '@store/slices/bookState'

const FontsContainer = ()=>{
  const dispatch = useAppDispatch()
  const fontSize = useAppSelector((state) => state.bookState[0]?.data.theme.fontSize)
    
  return ( 
    <>
      <div className={styles.fontContainer}>
        {["Original", "Comic Sans MS", "monospace", "Fira Sans"].map((item)=>{
          return (
            <div key={item} onClick={()=>{dispatch(SetFont({view: 0, font: item}))}} style={{fontFamily:item}} className={styles.font}>
              <div className={styles.fontLetter}>A</div>
              <div className={styles.fontName}>{item}</div>
            </div>
          )
        })}
      </div>

      <div className={styles.fontSizeContainer}>
        <div className={styles.resizeContainer} onClick={()=>{dispatch(SetFont({view: 0, fontSize: fontSize-5}))}}>T</div>
        <div className={styles.resizeSize}>{fontSize}%</div>
        <div className={styles.resizeContainer} onClick={()=>{dispatch(SetFont({view: 0, fontSize: fontSize+5}))}}>T</div>
      </div>
    </>
  )
}


export default FontsContainer