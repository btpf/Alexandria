import { useAppSelector } from "@store/hooks"
import { LoadThemes } from "@store/slices/appState"
import { invoke } from "@tauri-apps/api"
import React, { useEffect } from "react"
import { useDispatch } from "react-redux"

const InitializeApp = ({children}: JSX.ElementChildrenAttribute) =>{
  const globalTheme = useAppSelector((state)=> state.appState.globalThemes)
  const dispatch = useDispatch()
  useEffect(()=>{
    console.log("App Loading")
    invoke("get_reader_themes").then((response:any)=>{
      dispatch(LoadThemes(response))
    })

  }, [])

  return (
    <div style={{"height":"100%", "backgroundColor":globalTheme.default.secondaryBackground, color: globalTheme.default.text}}>
      {/* <div style={{"height":"100%"}}> */}
      {children}
    </div>
  )
}

export default InitializeApp