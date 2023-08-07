import React, { useEffect, useState } from "react"
import { Virtuoso } from 'react-virtuoso'

import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import styles from '../FontsTheme.module.scss'

import SaveIcon from '@resources/iconmonstr/iconmonstr-save-14.svg'
import TashIcon from '@resources/feathericons/trash-2.svg'
import { invoke } from "@tauri-apps/api";
import { convertFileSrc } from "@tauri-apps/api/tauri";


// import styles from './Settings.module.scss'

// import BackArrow from '@resources/feathericons/arrow-left.svg'
// import { Link } from "react-router-dom"
const defaultMarks = [100,200,300,400,500,600,700,800].reduce((a, v)=>{
  
  return {...a, ...{
    [v]:{label: <div style={{fontWeight:v}}>{v}</div>}
  }}
  
},{})
type ListFontsType = { fontMap: {[key: string]: boolean} };
const Installed = (props:any)=>{
  // const sidebarOpen = useAppSelector((state) => state.bookState[0]?.state?.sidebarMenuSelected)
  // const renditionInstance = useAppSelector((state) => state.bookState[0]?.instance)
  // const dispatch = useAppDispatch()
  const [selectedPage, setSelectedPage] = useState("Installed")
  const [textFiltered, setTextFilter] = useState("")
  const [fontList, setFontList] = useState<{[key: string]: boolean}>({})

  useEffect(()=>{
    invoke("list_fonts").then((response)=>{
      const typedResponse = response as ListFontsType
      // console.log(response.fontMap)
      setFontList(typedResponse.fontMap)
      Object.keys(typedResponse.fontMap).forEach((item)=>{
        // console.log(item)
        invoke("get_font_urls", {name: item}).then((paths)=>{
          const typedPaths = paths as [string]
          const newPath = typedPaths.find((path)=> path.includes("400.ttf"))
          if(newPath == undefined){
            console.log("font was not found")
            return
          }
          console.log(newPath)
          // if(!path) return
          // // this means if the name has an extension like .ttf
          // if(item.includes(".")){
          const fontName = item.split(".")[0].replaceAll(" ", "_")
          console.log("LOADING", fontName, "With path", newPath)
          const font = new FontFace(fontName, `url(${convertFileSrc(newPath)})`);
          //   // wait for font to be loaded
          font.load().then(()=>{
            document.fonts.add(font);
          });
          // }

        })
      })

      

    })
  }, [])
  return (
    <>
      
      {/* 
      Disabled for now, we will look into this in the future
      <div onClick={()=>{
        console.log("Placeholder install from device")
      }}>Install From Device</div> */}

      <div className={styles.pageTitle}>Installed/Enabled Fonts</div>
      <div className={styles.comboContainer}>
        <div className={styles.comboContainerText}>Font Name</div>
        <input onChange={(e)=>{
          console.log(e.target.value,e.target.value.length)
          setTextFilter(e.target.value)
          // setCurrentDataList(myStyle.filter((item)=>item.name.toLowerCase().includes(e.target.value.toLowerCase())))
        }} value={textFiltered} style={{display:"block"}} className={styles.comboTextBox}/>
      </div>

      {/* <div style={{backgroundColor:"white"}}>Installed & Enabled Fonts</div> */}
      <div className={styles.listContainer}>
        <Virtuoso style={{ height: '100%' }} totalCount={Object.keys(fontList).length} itemContent={index => {

          const mappedFontName = Object.keys(fontList)[index]

          return (<div className={styles.localThemeContainer}>
            <TashIcon onClick={()=>{
              const filtered = Object.fromEntries(Object.entries(fontList).filter(([k,v]) => k != mappedFontName));
              setFontList(filtered)
              invoke("delete_font", {name: mappedFontName}).then(()=>{
                console.log("Font deleted")
              })
            }} className={styles.trash}/>     
            <input className={styles.selector} checked={fontList[mappedFontName]} type="radio" onChange={()=>{/*Removes error from console */}} onClick={()=>{
              const newObj = {} as {[key: string]: boolean}
              newObj[mappedFontName] = !fontList[mappedFontName]
              const newList = {...fontList, ...newObj}
              setFontList(newList)
              invoke("toggle_font", {name: mappedFontName})
            }}/>
            <label style={{fontFamily:mappedFontName.split(".")[0].replaceAll(" ", "_")}} className={styles.label} htmlFor="test3">{Object.keys(fontList)[index]}</label>
            
          </div>)}} />
        
      </div>
      <div onClick={()=>props.changePage()} className={styles.fontDownloaderButton}>Download Fonts</div>
    </>

    

  )
}

export default Installed