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

import { Rendition } from 'epubjs-myh'
import Sidebar from './SideBar/SideBar'
import { useAppDispatch, useAppSelector } from '@store/hooks'
import { SelectSidebarMenu, ToggleBookmark, ToggleMenu, ToggleThemeMenu } from '@store/slices/bookState'
import SliderNavigator from './SliderNavigator/SliderNavigator'
import SettingsBar from './SettingsBar/SettingsBar'
import { useNavigate } from 'react-router-dom'
import Dictionary from './ReaderView/Dictionary/Dictionary'





const Home = () =>{

  const menuOpen = useAppSelector((state) => state.bookState[0]?.state?.menuToggled)
  const ThemeMenuActive = useAppSelector((state) => state.bookState[0]?.state?.themeMenuActive)
  const renditionInstance = useAppSelector((state) => state.bookState[0]?.instance)
  const bookmarks = useAppSelector((state) => state.bookState[0]?.data.bookmarks)

  const [isPageBookmarked, setPageBookmarked] = useState(false)
  const [currentPage, setCurrentPage] = useState('')
  const sidebarOpen = useAppSelector((state) => state.bookState[0]?.state?.sidebarMenuSelected)

  // const ThemeName = useAppSelector((state)=> state.bookState[0]?.data?.theme?.themeName)
  const ReaderBackgroundColor = useAppSelector((state) => {
    const themeName = state.bookState[0]?.data?.theme?.themeName
    if(themeName){
      return state.appState.themes[state.bookState[0]?.data?.theme?.themeName]?.body?.background
    
    }
    return "white"
  })
  const ReaderColor = useAppSelector((state) => {
    const themeName = state.bookState[0]?.data?.theme?.themeName
    if(themeName){
      return state.appState.themes[state.bookState[0]?.data?.theme?.themeName]?.body?.color
    
    }
    return "white"
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
  return (
    <div className={styles.readerFlex} style={{"backgroundColor":ReaderBackgroundColor, color: ReaderColor}} >

      <div style={{backgroundColor:menuOpen? "":ReaderBackgroundColor}} className={`${styles.readerTitleBar}`}>
        <div className={`${styles.menuButtonContainer} ${!menuOpen && styles.optionsToggled}`}>
          <List onClick={()=>{sidebarOpen?dispatch(SelectSidebarMenu({view:0, state:false})):dispatch(SelectSidebarMenu({view:0, state:"Chapters"}))}}/>
          <Bookmark style={{fill:isPageBookmarked? "gold":'none'}} onClick={()=>{dispatch(ToggleBookmark({view:0, bookmarkLocation:renditionInstance.location.end.cfi}))}}/>
        </div>

        <div style={!menuOpen?{color:ReaderColor, opacity:0.35}:{}} className={styles.title}>
          {renditionInstance?.book?.packaging?.metadata?.title}
        </div>
        <div className={`${styles.menuButtonContainer} ${!menuOpen && styles.optionsToggled}`}>
          <Search onClick={()=>{
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
          <Font onClick={()=>{
            dispatch(ToggleThemeMenu(0))
            dispatch(ToggleMenu(0))
          }}/>
          <HomeIcon onClick={()=>navigate('/')}/>
        </div>
      </div>


      
      <ReaderView/>

      <div style={{backgroundColor:menuOpen? "":ReaderBackgroundColor}} className={`${styles.readerFooterBar}  ${!menuOpen && styles.optionsToggled}`}>
        <div onClick={()=>renditionInstance?.prev()} className={`${styles.menuButtonContainer}`}>
          <ArrowLeft/>
        </div>
        <div className={styles.sliderContainer} style={{backgroundColor:menuOpen? '':ReaderBackgroundColor}}>
          <SliderNavigator/>
        </div>
        <div onClick={()=>renditionInstance?.next()} className={`${styles.menuButtonContainer}`}>
          <ArrowRight/>
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

