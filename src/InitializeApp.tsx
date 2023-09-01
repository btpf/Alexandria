// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck - This is to disable errors related to the variable styling of the application

import { useAppSelector } from "@store/hooks"
import { LoadThemes, SetFullScreen, setSelectedTheme, SetSortSettings } from "@store/slices/appState"
import { invoke } from "@tauri-apps/api"
import { appWindow } from "@tauri-apps/api/window"
import React, { useEffect, useLayoutEffect } from "react"
import { useDispatch } from "react-redux"
import styles from './InitializeStyles.module.scss'
import { Toaster } from 'react-hot-toast'

const InitializeApp = ({children}: JSX.ElementChildrenAttribute) =>{
  const themes = useAppSelector((state)=> state.appState.themes)
  const selectedTheme = useAppSelector((state)=> state.appState.selectedTheme)
  const isFullscreen = useAppSelector((state)=> state.appState.state.fullscreen)
  const dispatch = useDispatch()
  useEffect(()=>{
    console.log("App Loading")
    // invoke("get_reader_themes").then((response:any)=>{
    //   dispatch(LoadReaderThemes(response))
    // })
    invoke("get_global_themes").then((response:any)=>{
      dispatch(LoadThemes(response))
    })
    invoke("get_settings").then((response:any)=>{
      dispatch(setSelectedTheme(response.selectedTheme))
      dispatch(SetSortSettings({sortBy: response.sortBy, sortDirection:response.sortDirection}))
      // dispatch(LoadGlobalThemes(response))
    })

  }, [])


  useLayoutEffect(() => {
    async function updateSize() {
      const result = await appWindow.isMaximized()
      if(result !== isFullscreen){
        dispatch(SetFullScreen(result))
      }
    }
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [isFullscreen]);


  return (
    <div className={styles.appContainer} style={{
      "--background-secondary":themes[selectedTheme].ui.secondaryBackground,
      "--background-primary":themes[selectedTheme].ui.primaryBackground,
      "--text-primary":themes[selectedTheme].ui.primaryText,
      "--text-secondary":themes[selectedTheme].ui.secondaryText,
      "--link":themes[selectedTheme].reader.body.link,
      "--rounded-corners":isFullscreen?"0px":"10px",
      "height":"100%", "backgroundColor":themes[selectedTheme].ui.tertiaryBackground, color: themes[selectedTheme].ui.primaryText}}>
      {/* <div style={{"height":"100%"}}> */}
      <Toaster
        containerStyle={{top:60}}
        position="top-right"
        style={{PointerEvent:"none"}}
        reverseOrder={false}
      />
      {children}
    </div>
  )
}

export default InitializeApp