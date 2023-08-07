import React, { useEffect, useState } from 'react'
import ReaderView from './ReaderView/ReaderView'
import styles from './Reader.module.scss'

import Bookmark from '@resources/feathericons/bookmark.svg'
import List from '@resources/feathericons/list.svg'
import Search from '@resources/feathericons/search.svg'
import Font from '@resources/iconmonstr/text-3.svg'
import ArrowLeft from '@resources/feathericons/arrow-left.svg'
import ArrowRight from '@resources/feathericons/arrow-right.svg'
import HomeIcon from '@resources/feathericons/home.svg'

import { Rendition } from 'epubjs'
import Sidebar from './SideBar/SideBar'
import { useAppDispatch, useAppSelector } from '@store/hooks'
import { SelectSidebarMenu, ToggleBookmark, ToggleMenu, ToggleThemeMenu } from '@store/slices/bookState'
import SliderNavigator from './SliderNavigator/SliderNavigator'
import SettingsBar from './SettingsBar/SettingsBar'
import { useNavigate } from 'react-router-dom'
import Dictionary from './ReaderView/Dictionary/Dictionary'

import TitleBarButtons  from '@shared/components/TitleBarButtons';



const Home = () =>{

  const menuOpen = useAppSelector((state) => state.bookState[0]?.state?.menuToggled)
  const ThemeMenuActive = useAppSelector((state) => state.bookState[0]?.state?.themeMenuActive)
  const renditionInstance = useAppSelector((state) => state.bookState[0]?.instance)
  const bookmarks = useAppSelector((state) => state.bookState[0]?.data.bookmarks)

  const [isPageBookmarked, setPageBookmarked] = useState(false)
  const [mouseOverMenu, setMouseOverMenu] = useState(false)
  const [currentPage, setCurrentPage] = useState('')
  const sidebarOpen = useAppSelector((state) => state.bookState[0]?.state?.sidebarMenuSelected)

  // const ThemeName = useAppSelector((state)=> state.bookState[0]?.data?.theme?.themeName)
  const ReaderBackgroundColor = useAppSelector((state) => {

    return state.appState.themes[state.appState.selectedTheme]?.reader?.body?.background

  })
  const ReaderColor = useAppSelector((state) => {

    return state.appState.themes[state.appState.selectedTheme]?.reader?.body?.color

  })
  // const UIColor = useAppSelector((state) => state.appState.themes[state.bookState[0]?.data?.theme?.themeName].body.color)

  const navigate = useNavigate();
  
  useEffect(()=>{
    if(renditionInstance){
      const pageTurnHandler = (e:any)=>{
        setCurrentPage(e.end)
      }
      renditionInstance.on("locationChanged", pageTurnHandler)

      return ()=>{
        renditionInstance.off("locationChanged", pageTurnHandler)
      }
    }

  }, [renditionInstance])


  useEffect(()=>{
    if(!bookmarks){
      return
    }
    if(renditionInstance.location && bookmarks.has(currentPage) ){
      setPageBookmarked(true)
    }else{
      setPageBookmarked(false)
    }
  },[bookmarks, currentPage])




  const dispatch = useAppDispatch()

  const showMenuUi = mouseOverMenu || menuOpen

  return (
    <div className={styles.readerFlex} style={{"backgroundColor":ReaderBackgroundColor, color: ReaderColor}} onClick={(e)=>{
      console.log(e.target)
    }}>

      <div onMouseLeave={()=>setMouseOverMenu(false)} onMouseOver={()=>setMouseOverMenu(true)} data-tauri-drag-region style={{backgroundColor:showMenuUi? "":ReaderBackgroundColor}} className={`${styles.readerTitleBar}`}>
        <div className={`${styles.menuButtonContainerLeft} ${!showMenuUi && styles.optionsToggled}`}>
          <HomeIcon viewBox="0 0 24 24" onClick={()=>navigate('/')}/>
          <List viewBox="0 0 24 24" onClick={()=>{sidebarOpen?dispatch(SelectSidebarMenu({view:0, state:false})):dispatch(SelectSidebarMenu({view:0, state:"Chapters"}))}}/>
          <Bookmark viewBox="0 0 24 24" style={{fill:isPageBookmarked? "gold":'none', strokeWidth: 1}} onClick={()=>{dispatch(ToggleBookmark({view:0, bookmarkLocation:renditionInstance.location.end.cfi}))}}/>
        </div>

        <div style={!showMenuUi?{color:ReaderColor, opacity:0.35}:{}} className={styles.title}>
          {renditionInstance?.book?.packaging?.metadata?.title}
        </div>
        <div className={`${styles.menuButtonContainerRight} ${!showMenuUi && styles.optionsToggled}`}>
          <Search viewBox="0 0 24 24" onClick={()=>{
            if(sidebarOpen){
              if(sidebarOpen == "Search"){
                dispatch(SelectSidebarMenu({view:0, state:false}))
              }else{
                dispatch(SelectSidebarMenu({view:0, state:"Search"}))
              }
            }else{
              dispatch(SelectSidebarMenu({view:0, state:"Search"}))
            }
            
          }}/>
          <Font viewBox="0 0 24 24" onClick={()=>{
            dispatch(ToggleThemeMenu(0))
            dispatch(ToggleMenu(0))
          }}/>
          

          <TitleBarButtons disabled={!showMenuUi}/>
        </div>
      </div>

      {/* This handles the case where the reader is now displayed, preventing a flash 
          These two elements id='reader-background' and <ReaderView> must be next to eachother in this order
          for page flipping logic found in registerHandlers.tsx
      */}
      <div style={{backgroundColor:ReaderBackgroundColor}} id="reader-background" className={styles.readerBackgroundFallback}/>
      <ReaderView/>

      <div onMouseLeave={()=>setMouseOverMenu(false)} onMouseOver={()=>setMouseOverMenu(true)} className={`${styles.readerFooterBar}  ${!showMenuUi && styles.optionsToggled}`}>
        <div onClick={()=>renditionInstance?.prev()} className={`${styles.arrowButtonContainer}`}>
          <ArrowLeft viewBox={"0 0 24 24"} />
        </div>
        <div className={styles.sliderContainer}>
          <SliderNavigator/>
        </div>
        <div onClick={()=>renditionInstance?.next()} className={`${styles.arrowButtonContainer}`}>
          <ArrowRight style={{marginLeft:"auto", marginRight:"auto"}} viewBox={"0 0 24 24"}/>
        </div>

      </div>



      <Sidebar/>
      <SettingsBar/>
      <Dictionary/>


      <div onClick={()=>{

        if(sidebarOpen){
          dispatch(SelectSidebarMenu({view:0, state:false}))
        }else{
          dispatch(SelectSidebarMenu({view:0, state:false}))
        }
        if(ThemeMenuActive){
          dispatch(ToggleThemeMenu(0))
        }
      }} className={`${styles.opaqueScreen} ${(sidebarOpen) && styles.opaqueScreenActive}`}/>

    </div>
  )
} 

export default Home

