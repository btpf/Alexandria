import React, { useEffect, useState } from 'react'

import styles from './FontsContainer.module.scss'

import { useAppDispatch, useAppSelector } from '@store/hooks'
import { SetFont } from '@store/slices/bookState'
import { invoke } from '@tauri-apps/api'
import { convertFileSrc } from '@tauri-apps/api/tauri'

const FontsContainer = ()=>{
  const dispatch = useAppDispatch()
  const fontSize = useAppSelector((state) => state.bookState[0]?.data.theme.fontSize)
  const [fontsList, setFontList] = useState<string[]>([])
  type ListFontsType = { fontMap: {[key: string]: boolean} };


  useEffect(()=>{
    invoke("list_fonts").then((payload)=>{
      const typedPayload = (payload as ListFontsType)
      const tempList:Array<string> = []
      Object.keys(typedPayload.fontMap).forEach((item)=>{
        
        
        // console.log(item)
        if(typedPayload.fontMap[item]){
          tempList.push(item)
          invoke("get_font_url", {name: item}).then((path)=>{
            const typedPath = path as string
            // this means if the name has an extension like .ttf
            if(item.includes(".")){
              const fontName = item.split(".")[0].replaceAll(" ", "_")
              const font = new FontFace(fontName, `url(${convertFileSrc(typedPath)})`);
              // wait for font to be loaded
              font.load().then(()=>{
                document.fonts.add(font);
                console.log()
              });
            }

          })
        }
      })
      setFontList(tempList)
    })
  },[])
  return ( 
    <>
      <div className={styles.fontContainer}>
        {["Default",...fontsList].map((item)=>{
          const fontName = item.split(".")[0].replaceAll(" ", "_")
          return (
            <div key={item} onClick={()=>{dispatch(SetFont({view: 0, font: item}))}} style={{fontFamily:fontName}} className={styles.font}>
              <div className={styles.fontLetter}>A</div>
              <div className={styles.fontName}>{fontName}</div>
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