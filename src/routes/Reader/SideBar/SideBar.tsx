import React, { useEffect, useState } from 'react'
import styles from './SideBar.module.scss'


import { NavItem, Rendition } from 'epubjs-myh'
import Chapters from './Chapters/Chapters'
import { useAppDispatch, useAppSelector } from '@store/hooks'
import { SelectSidebarMenu } from '@store/slices/bookState'
import Annotations from './Annotations/Annotations'
import Bookmarks from './Bookmarks/Bookmarks'
import Search from './Search/Search'


const Sidebar = ()=>{
  const sidebarOpen = useAppSelector((state) => state.bookState[0]?.state?.sidebarMenuSelected)
  const renditionInstance = useAppSelector((state) => state.bookState[0]?.instance)
  const dispatch = useAppDispatch()

  return (
    <div className={styles.sideBarContainer}>
      {/* <div onClick={()=>{sidebarOpen? dispatch(SelectSidebarMenu({view:0, state:false})): false}} className={`${styles.opaqueScreen} ${sidebarOpen && styles.opaqueScreenActive}`}/> */}
      <div className={`${styles.sideBar} ${sidebarOpen && styles.sideBarActive}`}>
        <div className={styles.tabSelector}>
          {["Chapters", "Bookmarks", "Annotations", "Search"].map((item)=>{
            return (
              <div key={item} onClick={()=>dispatch(SelectSidebarMenu({view:0, state:item}))} className={`${sidebarOpen == item && styles.selectedBookmarkTab}`}>
                {item}
              </div>
            )
          })}
        </div>

        <div style={{flexGrow:1, overflowY:"scroll"}}>
          <SidebarContent selection={sidebarOpen} renditionInstance={renditionInstance}/>
        </div>

      </div>
    </div>
  )
}

export default Sidebar

type SidebarContentTypes = {
    selection: string| boolean,
    renditionInstance: Rendition|undefined
  };
  
const SidebarContent = React.memo((props: SidebarContentTypes)=>{
    
  
  

     
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
  if(props.selection == "Bookmarks"){
    return <Bookmarks/>
  }

  return <Search/>
  
  
  
  return (<div></div>)
  
}, (_, nextProps)=> nextProps.selection == false)

SidebarContent.displayName = 'SidebarContent';