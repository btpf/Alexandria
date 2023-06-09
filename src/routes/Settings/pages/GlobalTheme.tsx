import { invoke } from "@tauri-apps/api"
import { convertFileSrc } from "@tauri-apps/api/tauri"
import React, { useState } from "react"
// import styles from './Settings.module.scss'

// import BackArrow from '@resources/feathericons/arrow-left.svg'
// import { Link } from "react-router-dom"

const GlobalTheme = ()=>{
  const [fontUrl, setFontUrl] = useState("")
  // const sidebarOpen = useAppSelector((state) => state.bookState[0]?.state?.sidebarMenuSelected)
  // const renditionInstance = useAppSelector((state) => state.bookState[0]?.instance)
  // const dispatch = useAppDispatch()
  
  return (
    <div style={{width:"100%", height:"100%"}}>
      Work in progress
      <div onClick={()=>{
        console.log(invoke("get_font_url").then(async (s)=>{
          console.log(s)
          console.log(convertFileSrc(s))
          setFontUrl(convertFileSrc(s))
          const font = new FontFace("Abhaya Libre_-_600", `local(Fasthand), url(${convertFileSrc(s)})`);
          // wait for font to be loaded
          await font.load();
          // add font to document
          document.fonts.add(font);
        }))
      }}>TestMeHere</div>
      <div style={{fontFamily:"Abhaya Libre_-_600"}}>
        Hello World
      </div>
    </div>

  )
}


export default GlobalTheme