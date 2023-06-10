import { LoadThemes } from "@store/slices/appState"
import { invoke } from "@tauri-apps/api"
import React, { useEffect } from "react"
import { useDispatch } from "react-redux"

const InitializeApp = () =>{
  const dispatch = useDispatch()
  useEffect(()=>{
    console.log("App Loading")
    invoke("get_reader_themes").then((response:any)=>{
      dispatch(LoadThemes(response))
    })

  }, [])

  return (
    <>
    </>
  )
}

export default InitializeApp