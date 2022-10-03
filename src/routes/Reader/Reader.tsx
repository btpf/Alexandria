import React, { useEffect, useState } from 'react'
import ReaderView from './ReaderView/ReaderView'
import styles from './Reader.module.scss'

import Bookmark from '@resources/feathericons/bookmark.svg'
import List from '@resources/feathericons/list.svg'
import Search from '@resources/feathericons/search.svg'
import Font from '@resources/iconmonstr/text-3.svg'
import ArrowLeft from '@resources/feathericons/arrow-left.svg'
import ArrowRight from '@resources/feathericons/arrow-right.svg'

import { Rendition } from 'epubjs-myh'
import Sidebar from './SideBar/SideBar'

const Home = () =>{
  const [menuOpen, toggleMenu] = useState(false);
  const [sidebarOpen, toggleSidebar] = useState(false);
  const [renditionInstance, setRendition] = useState<undefined|Rendition>(undefined);

  return (
    <div className={styles.readerFlex}>

      <div className={`${styles.readerTitleBar}  ${menuOpen && styles.optionsToggled}`}>
        <div className={`${styles.menuButtonContainer}`}>
          <List onClick={()=>{toggleSidebar(!sidebarOpen)}}/>
          <Bookmark/>
        </div>
        <div>
          {"Charlotte's Web"}
        </div>
        <div className={`${styles.menuButtonContainer}`}>
          <Search/>
          <Font/>
        </div>
      </div>
      <ReaderView
        onToggleState={()=>{
          toggleMenu(!menuOpen)
        }}

        onRenditionInstance={(rendition)=>{
          setRendition(rendition)
        }}
      />

      <div className={`${styles.readerFooterBar}  ${menuOpen && styles.optionsToggled}`}>
        <div onClick={()=>renditionInstance?.prev()} className={`${styles.menuButtonContainer}`}>
          <ArrowLeft/>
        </div>
        <div onClick={()=>renditionInstance?.next()} className={`${styles.menuButtonContainer}`}>
          <ArrowRight/>
        </div>

      </div>



      <Sidebar sidebarOpen={sidebarOpen} renditionInstance={renditionInstance}/>


    </div>
  )
} 

export default Home

