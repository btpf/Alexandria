// eslint-disable-next-line @typescript-eslint/ban-ts-comment

import { useAppSelector } from "@store/hooks"
import { LoadThemes, SetLocalFontsList, SetMaximized, setSelectedTheme, SetSortSettings } from "@store/slices/appState"
import { invoke } from "@tauri-apps/api"
import { appWindow } from "@tauri-apps/api/window"
import React, { useEffect, useLayoutEffect, useState } from "react"
import { useDispatch } from "react-redux"
import styles from './InitializeStyles.module.scss'
import toast, { Toaster } from 'react-hot-toast'
import { getMatches } from '@tauri-apps/api/cli'
import { importBook} from '@shared/scripts/TauriActions'
// @ts-expect-error Migrations should have flexible datatypes, so JS will be easier.
import performMigrations from './migrations.js'

const InitializeApp = ({children}: JSX.ElementChildrenAttribute) =>{
  const themes = useAppSelector((state)=> state.appState.themes)
  const selectedTheme = useAppSelector((state)=> state.appState.selectedTheme)
  const isMaximized = useAppSelector((state)=> state.appState.state.maximized)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const dispatch = useDispatch()
  useEffect(()=>{

    performMigrations().then(()=>{
    // Handles case where application gets launch parameters 
      getMatches().then(async (matches) => {
        let bookHash = null;

        // Prevent infinite loop by only running code if on homescreen
        if(window.location.pathname == "/"){
          if(matches.args.source.value && typeof matches.args.source.value == "string"){
            try {
              const response = await importBook(matches.args.source.value)
              console.log("Bookhash imported")
              if(!response){
                toast.error("Error: No importBook response")
                return
              }
              bookHash = response.hash

            } catch (error:any) {
              // const error = error as string;
              console.log(error)
              if(!error.startsWith("Error: Book is duplicate")){
                toast.error(error)
                return
              }else{
                bookHash = error.split(" - ")[1]
                console.log(bookHash)
              }
            }

            window.location.pathname = ("/reader/" + bookHash)
          }
        }
      })
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

      invoke("list_system_fonts").then((response)=>{
        dispatch(SetLocalFontsList({fonts:response}));
      })

    })



  }, [])


  useLayoutEffect(() => {
    async function updateSize() {
      const currentlyMaximized = await appWindow.isMaximized()
      const currentlyFullscreen = await appWindow.isFullscreen()

      if(currentlyMaximized !== isMaximized){
        dispatch(SetMaximized(currentlyMaximized))
      }
      
      if(currentlyFullscreen != isFullScreen){
        setIsFullScreen(currentlyFullscreen)
      }
    }
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [isMaximized, isFullScreen]);


  return (
    <div className={styles.appContainer} style={{
      "--background-secondary":themes[selectedTheme].ui.secondaryBackground,
      "--background-primary":themes[selectedTheme].ui.primaryBackground,
      "--text-primary":themes[selectedTheme].ui.primaryText,
      "--text-secondary":themes[selectedTheme].ui.secondaryText,
      "--link":themes[selectedTheme].reader.body.link,
      "--rounded-corners":(isMaximized || isFullScreen)?"0px":"10px",
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