import React, { useEffect, useState } from 'react'
import styles from './SideBar.module.scss'


import { NavItem, Rendition } from 'epubjs-myh'
import Chapters from './Chapters/Chapters'
import { useAppDispatch, useAppSelector } from '@store/hooks'
import { ToggleSidebar } from '@store/slices/bookStateSlice'
import Annotations from './Annotations/Annotations'
import Bookmarks from './Bookmarks/Bookmarks'


const Sidebar = ()=>{
  const sidebarOpen = useAppSelector((state) => state.bookState[0]?.state?.sidebarToggled)
  const renditionInstance = useAppSelector((state) => state.bookState[0]?.instance)

  const [selectedBookmarkTab, selectBookmarkTab] = useState("Chapters");
  const dispatch = useAppDispatch()

  return (
    <div className={styles.sideBarContainer}>
      <div onClick={()=>{sidebarOpen? dispatch(ToggleSidebar(0)): false}} className={`${styles.opaqueScreen} ${sidebarOpen && styles.opaqueScreenActive}`}/>
      <div className={`${styles.sideBar} ${sidebarOpen && styles.sideBarActive}`}>
        <div className={styles.tabSelector}>
          {["Chapters", "Bookmarks", "Annotations"].map((item)=>{
            return (
              <div key={item} onClick={()=>selectBookmarkTab(item)} className={`${selectedBookmarkTab == item && styles.selectedBookmarkTab}`}>
                {item}
              </div>
            )
          })}
        </div>

        <div style={{flexGrow:1, overflowY:"scroll"}}>
          <SidebarContent selection={selectedBookmarkTab} renditionInstance={renditionInstance}/>
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
  if(props.selection == "Annotations"){
    return (
      <Annotations/>
    )
  }
  return <Bookmarks/>
  
  
  return (<div></div>)
  
}