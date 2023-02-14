import React, { useRef, useState } from "react"
import styles from './Settings.module.scss'

import BackArrow from '@resources/feathericons/arrow-left.svg'
import { Link, Route, Routes, useLocation, useNavigate } from "react-router-dom"
import Blue from "./pages/Blue"
import Red from "./pages/Red"

const Settings = ()=>{
  const navigate = useNavigate()
  const location = useLocation()

  let mobileTitle = location.pathname
  const subpaths = mobileTitle.split('/')
  
  if (subpaths.length == 2){
    mobileTitle = "Settings"
  }else{
    mobileTitle = subpaths[2]
  }

  return (
    <div className={styles.settingsPageContainer}>
      <div className={styles.titleBar}>

        {/* This is the titlebar for desktop screens */}
        <div onClick={()=> navigate("/")} className={styles.backButtonContainer + " " + styles.hidesm}>
          <BackArrow/>
        </div>
        <div className={styles.titleText  + " " + styles.hidesm}>Settings</div>


        {/* This is the titlebar for mobile screens */}
        <div onClick={()=> mobileTitle=="Settings"? navigate("/"): navigate("/settings")} className={styles.backButtonContainer + " " + styles.hidegtsm}>
          <BackArrow/>
        </div>
        <div className={styles.titleText  + " " + styles.hidegtsm}>{mobileTitle}</div>
        
      </div>

      <div className={`${mobileTitle!="Settings"?styles.navbarActive:""} ${styles.responsiveSettingsGrid}`}>
        <div className={styles.navbar}>
          <div onClick={()=>navigate("Appearance")}>Appearance</div>
          <div><Link to={"Presets"}>Presets</Link></div>
        </div>

        <div className={styles.contentContainer}>
          <Routes>
            <Route path="/" element={<Blue />} />
            <Route path="/appearance" element={<Blue />} />
            <Route  path="/Presets" element={<Red />} />
          </Routes>
        </div>
      </div>

    </div>

  )
}


export default Settings