import React, { useEffect, useState } from 'react'

import styles from './FontsContainer.module.scss'

import { useAppDispatch, useAppSelector } from '@store/hooks'
import { invoke } from '@tauri-apps/api'
import { convertFileSrc } from '@tauri-apps/api/tauri'
import { setFontThunk } from '@store/slices/EpubJSBackend/data/theme/themeManager'

const FontsContainer = ()=>{
  const dispatch = useAppDispatch()
  const fontSize = useAppSelector((state) => state.bookState[0]?.data.theme.fontSize)
  const fontWeight = useAppSelector((state) => state.bookState[0]?.data.theme.fontWeight)
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
            console.log("This should be my path::::")
            console.log(path)
            const typedPath = path as string
            if(path == null){
              return
            }
            // this means if the name has an extension like .ttf
            const fontName = item.replaceAll(" ", "_")
            const font = new FontFace(fontName, `url(${convertFileSrc(typedPath)})`);
            // wait for font to be loaded
            font.load().then(()=>{
              document.fonts.add(font);
              console.log()
            });


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
          return (
            <div key={item} onClick={()=>{
              
              dispatch(setFontThunk({view:0, font:item}))
              
            }} style={{fontFamily:item.replaceAll(" ", "_")}} className={styles.font}>
              <div className={styles.fontName}>{item}</div>
            </div>
          )
        })}
      </div>

      <div className={styles.settingsContainer}>
        <div>
          <div>Font Size</div>
          <div className={styles.fontSizeContainer}>
          
            <div className={styles.resizeContainer} onClick={()=>{
              // dispatch(SetFont({view: 0, fontSize: fontSize-5}))
              dispatch(setFontThunk({view: 0, fontSize: fontSize-5}))
            }}>-</div>
            <div className={styles.resizeSize}>{fontSize}%</div>
            <div className={`${styles.resizeContainer}`} onClick={()=>{
              dispatch(setFontThunk({view: 0, fontSize: fontSize+5}))
          
            }}>+</div>
          </div>
        </div>

        <div>
          <div>Font Weight</div>
          <div className={styles.fontSizeContainer}>
            <div className={styles.resizeContainer} onClick={()=>{
              // dispatch(SetFont({view: 0, fontSize: fontSize-5}))
              dispatch(setFontThunk({view: 0, fontWeight: fontWeight-100}))
            }}>-</div>
            <div className={styles.resizeSize}>{fontWeight}</div>
            <div className={styles.resizeContainer} onClick={()=>{
              dispatch(setFontThunk({view: 0, fontWeight: Math.min(fontWeight+100, 900)}))
          
            }}>+</div>
          </div>
        </div>

      </div>
      
    </>
  )
}


export default FontsContainer