import React from "react"

import styles from './PreviewWidget.module.scss'

import { useAppSelector } from "@store/hooks";

import { ThemeType } from "@store/slices/AppState/globalThemes";
import { GetAllKeys } from "@store/utlity";

import Bookmark from '@resources/feathericons/bookmark.svg'
import List from '@resources/feathericons/list.svg'
import Search from '@resources/feathericons/search.svg'
import Font from '@resources/iconmonstr/text-3.svg'
import HomeIcon from '@resources/feathericons/home.svg'




const PreviewWidget = (props:{readerOptions:any})=>{
  

  const appThemes = useAppSelector((state) => state.appState.themes)
  const selectedTheme = useAppSelector((state) => state.appState.selectedTheme)

  const readerBackgroundColor = (props.readerOptions[1].path as GetAllKeys<ThemeType>[]).reduce((themeObjLevel:any, pathNavigate) => themeObjLevel[pathNavigate], appThemes[selectedTheme])
  const readerColor = (props.readerOptions[0].path as GetAllKeys<ThemeType>[]).reduce((themeObjLevel:any, pathNavigate) => themeObjLevel[pathNavigate], appThemes[selectedTheme])

  return (


    <div className={styles.widgetContainer}>
      <div className={styles.widgetTopBar}>
        <div className={styles.topBarTitle}>
Book Title
        </div>
        <div className={styles.topBarLeft}>
          <div className={styles.widgetIconContainer}>
            <List height={10} width={10} viewBox="0 0 24 24" />
          </div>
            
          <div className={styles.widgetIconContainer}>
            <Bookmark height={10} width={10} viewBox="0 0 24 24" />
          </div>
        </div>
        <div className={styles.topBarRight}>
          <div className={styles.widgetIconContainer}>
            <Search height={10} width={10} viewBox="0 0 24 24" />
          </div>
          <div className={styles.widgetIconContainer}>
            <Font height={10} width={10} viewBox="0 0 24 24" />
          </div>
          <div className={styles.widgetIconContainer}>
            <HomeIcon height={10} width={10} viewBox="0 0 24 24" />
          </div>
            
            
            
        </div>

      </div>
      <div className={styles.widgetSideBar}>
        <div>Chapter 1
        </div>        <div>Chapter 2
        </div>        <div>Chapter 3
        </div>        <div>Chapter 4
        </div>
      </div>
      <div style={{backgroundColor:readerBackgroundColor, color:readerColor}} className={styles.widgetContentContainer}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad <div style={{display:"inline", color:"var(--link)"}}>hyperlink</div> veniam, quis nostrud exercitation ullamco laboris nisi ut <div
          
          style={{
            display:"inline",
            backgroundColor:"	rgb(50,205,50,0.5)"
          }}>aliquip </div>
        <div
          className={styles.noteContainer}
          style={{position:"absolute", fontSize:5,padding:"3px 0px 0px 3px", display:"inline", width:40, height:40, marginTop:-40,marginLeft:-35, backgroundColor:"var(--background-primary)"}}> Note text </div>
           ex ea commodo consequat.
        <br/>
        <div>
          <div
            style={{
              "filter":appThemes[selectedTheme].reader.image.invert?"invert()":"",
              mixBlendMode:appThemes[selectedTheme].reader.image.mixBlendMode
            }}>        
            <HomeIcon viewBox="0 0 24 24" height={40} width={40} 
              style={{
                background:"white",
                color:"black",

              }} 
        
              className={styles.imageExample}/>
          </div>
        </div>


      </div>
    </div>
  )
}


export default PreviewWidget