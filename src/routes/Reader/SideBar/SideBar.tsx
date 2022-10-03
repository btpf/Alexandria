import React, { useEffect, useState } from 'react'
import styles from './SideBar.module.scss'


import { NavItem, Rendition } from 'epubjs-myh'
import produce from 'immer'
import recursiveMap from './Chapters/Chapters'
import Chapters from './Chapters/Chapters'

type SidebarTypes = {
    sidebarOpen: boolean,
    renditionInstance: Rendition | undefined
  };
const Sidebar = (props:SidebarTypes)=>{
  const [selectedBookmarkTab, selectBookmarkTab] = useState("Chapters");

  return (
    <div className={styles.sideBarContainer}>
      <div className={`${styles.opaqueScreen} ${props.sidebarOpen && styles.opaqueScreenActive}`}/>
      <div className={`${styles.sideBar} ${props.sidebarOpen && styles.sideBarActive}`}>
        <div className={styles.tabSelector}>
          {["Chapters", "Bookmarks", "Annotations"].map((item)=>{
            return (
              <div key={item} onClick={()=>selectBookmarkTab(item)} className={`${selectedBookmarkTab == item && styles.selectedBookmarkTab}`}>
                {item}
              </div>
            )
          })}
        </div>

        <div style={{flexGrow:1, overflowY:"auto"}}>
          <SidebarContent selection={selectedBookmarkTab} renditionInstance={props.renditionInstance}/>
        </div>

      </div>
    </div>
  )
}

export default Sidebar

type SidebarContentTypes = {
    selection: string,
    renditionInstance: Rendition|undefined
  };
  
const SidebarContent = (props: SidebarContentTypes)=>{
    
  
  

     
  if(props.selection == "Chapters" && props.renditionInstance?.book?.navigation){
    return (
      <Chapters renditionInstance={props.renditionInstance}/>
    )
  }
  
  
  return (<div></div>)
  
}