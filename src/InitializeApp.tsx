// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck - This is to disable errors related to the variable styling of the application

import { useAppSelector } from "@store/hooks"
import { LoadReaderThemes, LoadGlobalThemes, setSelectedGlobalTheme } from "@store/slices/appState"
import { invoke } from "@tauri-apps/api"
import React, { useEffect } from "react"
import { useDispatch } from "react-redux"
import styles from './InitializeStyles.module.scss'
const InitializeApp = ({children}: JSX.ElementChildrenAttribute) =>{
  const globalTheme = useAppSelector((state)=> state.appState.globalThemes)
  const selectedGlobalTheme = useAppSelector((state)=> state.appState.selectedGlobalTheme)
  const dispatch = useDispatch()
  useEffect(()=>{
    console.log("App Loading")
    invoke("get_reader_themes").then((response:any)=>{
      dispatch(LoadReaderThemes(response))
    })
    invoke("get_global_themes").then((response:any)=>{
      dispatch(LoadGlobalThemes(response))
    })
    invoke("get_settings").then((response:any)=>{
      dispatch(setSelectedGlobalTheme(response.selectedGlobalTheme))
      // dispatch(LoadGlobalThemes(response))
    })

  }, [])

  return (
    <div className={styles.appContainer} style={{
      "--background-secondary":globalTheme[selectedGlobalTheme].secondaryBackground,
      "--background-primary":globalTheme[selectedGlobalTheme].primaryBackground,
      "--text-primary":globalTheme[selectedGlobalTheme].primaryText,
      "--text-secondary":globalTheme[selectedGlobalTheme].secondaryText,
      "height":"100%", "backgroundColor":globalTheme[selectedGlobalTheme].secondaryBackground, color: globalTheme[selectedGlobalTheme].primaryText}}>
      {/* <div style={{"height":"100%"}}> */}
      {children}
    </div>
  )
}

export default InitializeApp