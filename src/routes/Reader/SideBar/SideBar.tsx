import React, { useEffect, useState } from 'react'
import styles from './SideBar.module.scss'


import { NavItem, Rendition } from 'epubjs'
import Chapters from './Chapters/Chapters'
import { useAppDispatch, useAppSelector } from '@store/hooks'
import Annotations from './Annotations/Annotations'
import Bookmarks from './Bookmarks/Bookmarks'
import Search from './Search/Search'
import { SelectSidebarMenu } from '@store/slices/appState'


const Sidebar = ()=>{
  const selectedRendition = useAppSelector((state) => state.appState.state.selectedRendition)
  const sidebarOpen = useAppSelector((state) => state?.appState?.state?.sidebarMenuSelected)
  const renditionInstance = useAppSelector((state) => state.bookState[selectedRendition]?.instance)
  const dispatch = useAppDispatch()

  return (
    <div className={styles.sideBarContainer}>
      <div className={`${styles.sideBar} ${sidebarOpen && styles.sideBarActive}`}>
        <div className={styles.tabSelector}>
          {["Chapters", "Bookmarks", "Annotations", "Search"].map((item)=>{
            return (
              <div key={item} onClick={()=>dispatch(SelectSidebarMenu(item))} className={`${sidebarOpen == item && styles.selectedBookmarkTab}`}>
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
  let query = ""
  if(typeof props.selection == typeof query){
    if((props.selection as string).includes("#")){
      query = (props.selection as string).split("#")[1]
    }
  }
    
  return <Search query={query}/>
  
  
  
  return (<div></div>)
  
}, (_, nextProps)=> nextProps.selection == false)

SidebarContent.displayName = 'SidebarContent';