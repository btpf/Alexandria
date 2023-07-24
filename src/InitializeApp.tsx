// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck - This is to disable errors related to the variable styling of the application

import { useAppSelector } from "@store/hooks"
import { LoadThemes, setSelectedTheme } from "@store/slices/appState"
import { invoke } from "@tauri-apps/api"
import React, { useEffect } from "react"
import { useDispatch } from "react-redux"
import styles from './InitializeStyles.module.scss'
const InitializeApp = ({children}: JSX.ElementChildrenAttribute) =>{
  const themes = useAppSelector((state)=> state.appState.themes)
  const selectedGlobalTheme = useAppSelector((state)=> state.appState.selectedTheme)
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
      // dispatch(LoadGlobalThemes(response))
    })

  }, [])
  console.log(themes, selectedGlobalTheme)
  return (
    <div className={styles.appContainer} style={{
      "--background-secondary":themes[selectedGlobalTheme].ui.secondaryBackground,
      "--background-primary":themes[selectedGlobalTheme].ui.primaryBackground,
      "--text-primary":themes[selectedGlobalTheme].ui.primaryText,
      "--text-secondary":themes[selectedGlobalTheme].ui.secondaryText,
      "height":"100%", "backgroundColor":themes[selectedGlobalTheme].ui.secondaryBackground, color: themes[selectedGlobalTheme].ui.primaryText}}>
      {/* <div style={{"height":"100%"}}> */}
      {children}
    </div>
  )
}

export default InitializeApp