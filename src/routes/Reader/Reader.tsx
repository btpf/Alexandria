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
import { ToggleBookmark } from '@store/slices/bookState'
import SliderNavigator from './SliderNavigator/SliderNavigator'
import SettingsBar from './SettingsBar/SettingsBar'
import { useNavigate, useParams } from 'react-router-dom'
import Dictionary from './ReaderView/Dictionary/Dictionary'

import TitleBarButtons  from '@shared/components/TitleBarButtons';
import { Toaster } from 'react-hot-toast'
import QuickbarModal from './ReaderView/functions/QuickbarModal'
import NoteModal from './ReaderView/functions/NoteModal'
import { resetBookAppState, SelectSidebarMenu, ToggleMenu, ToggleThemeMenu } from '@store/slices/appState'


const Home = () =>{
  const selectedRendition:number = useAppSelector((state) => state.appState.state.selectedRendition)
  const isDualReaderMode = useAppSelector((state) => state.appState.state.dualReaderMode)

  const menuOpen = useAppSelector((state) => state?.appState?.state?.menuToggled)
  const ThemeMenuActive = useAppSelector((state) => state?.appState?.state?.themeMenuActive)
  const renditionInstance = useAppSelector((state) => state.bookState[selectedRendition]?.instance)
  const bookmarks = useAppSelector((state) => state.bookState[selectedRendition]?.data.bookmarks)
  const displayedCFI = useAppSelector((state) => state.bookState[selectedRendition]?.data.cfi)
  
  const [isPageBookmarked, setPageBookmarked] = useState(false)
  const [mouseOverMenu, setMouseOverMenu] = useState(false)
  const [currentPage, setCurrentPage] = useState('')
  const params = useParams()
  const sidebarOpen = useAppSelector((state) => state?.appState?.state?.sidebarMenuSelected)
  const dualReaderReversed = useAppSelector((state) => state?.appState?.state?.dualReaderReversed)


  const ReaderBackgroundColor = useAppSelector((state) => {

    return state.appState.themes[state.appState.selectedTheme]?.reader?.body?.background

  })
  const ReaderColor = useAppSelector((state) => {

    return state.appState.themes[state.appState.selectedTheme]?.reader?.body?.color

  })

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
          <HomeIcon viewBox="0 0 24 24" onClick={()=>{
            navigate('/')
            dispatch(resetBookAppState())
          }}/>
          <List viewBox="0 0 24 24" onClick={()=>{sidebarOpen?dispatch(SelectSidebarMenu(false)):dispatch(SelectSidebarMenu("Chapters"))}}/>
          <Bookmark viewBox="0 0 24 24" style={{fill:isPageBookmarked? "gold":'none', strokeWidth: 1}} onClick={()=>{dispatch(ToggleBookmark({view:selectedRendition, bookmarkLocation:renditionInstance.location.end.cfi}))}}/>
        </div>

        <div style={!showMenuUi?{color:ReaderColor, opacity:0.35}:{}} className={styles.title}>
          {renditionInstance?.book?.packaging?.metadata?.title}
          {/* - {displayedCFI} */}
          - {selectedRendition}
        </div>
        <div className={`${styles.menuButtonContainerRight} ${!showMenuUi && styles.optionsToggled}`}>
          <Search viewBox="0 0 24 24" onClick={()=>{
            if(sidebarOpen){
              if(sidebarOpen == "Search"){
                dispatch(SelectSidebarMenu(false))
              }else{
                dispatch(SelectSidebarMenu("Search"))
              }
            }else{
              dispatch(SelectSidebarMenu("Search"))
            }
            
          }}/>
          <Font viewBox="0 0 24 24" onClick={()=>{
            dispatch(ToggleThemeMenu())
            dispatch(ToggleMenu())
          }}/>
          

          <TitleBarButtons disabled={!showMenuUi}/>
        </div>
      </div>

      {/* This handles the case where the reader is now displayed, preventing a flash 
          These two elements id='reader-background' and <ReaderView> must be next to eachother in this order
          for page flipping logic found in registerHandlers.tsx
      */}
      <div style={{backgroundColor:ReaderBackgroundColor}} tabIndex={0} id="reader-background" className={styles.readerBackgroundFallback}/>
      <div className={styles.readerViewsContainer} style={isDualReaderMode?{gridTemplateColumns:"1fr 1fr"}:{gridTemplateColumns:"1fr"}}>
        <ReaderView view={!dualReaderReversed?0:1} contributesMountPoint={0} bookHash={params.bookHash1}/>
        {isDualReaderMode?<ReaderView view={!dualReaderReversed?1:0} contributesMountPoint={1} bookHash={params.bookHash2}/>:<></>}
      </div>

      <QuickbarModal/>
      <NoteModal/>
      <Toaster
        position="top-right"
        reverseOrder={false}
      />
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
          dispatch(SelectSidebarMenu(false))
        }else{
          dispatch(SelectSidebarMenu(false))
        }
        if(ThemeMenuActive){
          dispatch(ToggleThemeMenu())
        }
      }} className={`${styles.opaqueScreen} ${(sidebarOpen) && styles.opaqueScreenActive}`}/>

    </div>
  )
} 

export default Home

