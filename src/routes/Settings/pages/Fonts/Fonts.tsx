import React, { useEffect, useState } from "react"
import { Virtuoso } from 'react-virtuoso'

import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import styles from './FontsTheme.module.scss'
import SaveIcon from '@resources/iconmonstr/iconmonstr-save-14.svg'
import TashIcon from '@resources/feathericons/trash-2.svg'
import { invoke } from "@tauri-apps/api";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import Installed from "./Installed/Installed";
import Downloader from "./Downloader/Downloader";

// import styles from './Settings.module.scss'

// import BackArrow from '@resources/feathericons/arrow-left.svg'
// import { Link } from "react-router-dom"
const defaultMarks = [100,200,300,400,500,600,700,800].reduce((a, v)=>{
  
  return {...a, ...{
    [v]:{label: <div style={{fontWeight:v}}>{v}</div>}
  }}
  
},{})

type ListFontsType = { fontMap: {[key: string]: boolean} };


const Fonts = ()=>{
  // const sidebarOpen = useAppSelector((state) => state.bookState[0]?.state?.sidebarMenuSelected)
  // const renditionInstance = useAppSelector((state) => state.bookState[0]?.instance)
  // const dispatch = useAppDispatch()
  const [selectedPage, setSelectedPage] = useState("Installed")
  const [textFiltered, setTextFilter] = useState("")
  const [fontList, setFontList] = useState<{[key: string]: boolean}>({})

  useEffect(()=>{
    invoke("list_fonts").then((response)=>{
      const response2 = response as ListFontsType
      // console.log(response.fontMap)
      setFontList(response2.fontMap)
      Object.keys(response2.fontMap).forEach((item)=>{
        // console.log(item)
        invoke("get_font_url", {name: item}).then((path:any)=>{
          if(!path) return
          // this means if the name has an extension like .ttf
          if(item.includes(".")){
            const fontName = item.split(".")[0].replaceAll(" ", "_")
            const font = new FontFace(fontName, `url(${convertFileSrc(path)})`);
            // wait for font to be loaded
            font.load().then(()=>{
              document.fonts.add(font);
            });
          }

        })
      })

      

    })
  }, [])
  return (
    <div className={styles.themeContainer}>
      <div className={styles.navigatorContainer}>
        <div className={styles.navigatorButton} 
          style={{color:(selectedPage=="Installed")?"black":""}}
          onClick={()=>setSelectedPage("Installed")}>
        Installed
        </div>
        <div className={styles.navigatorButton} 
          style={{color:(selectedPage=="Downloaded")?"black":""}}
          onClick={()=>setSelectedPage("Downloaded")}>
        Downloaded
        </div>
      </div>
      {(selectedPage=="Downloaded")? <Downloader/>:<Installed/>}
      
    </div>

    

  )
}

export default Fonts