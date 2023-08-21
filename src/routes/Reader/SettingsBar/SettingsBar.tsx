import React, { useEffect, useState } from 'react'
import styles from './SettingsBar.module.scss'


import { NavItem, Rendition } from 'epubjs'
import { useAppDispatch, useAppSelector } from '@store/hooks'
import FontsContainer from './FontsContainerV2/FontsContainer'
import ThemesContainer from './ThemesContainer/ThemesContainer'
import SpacingContainer from './SpacingContainer/SpacingContainer'
import DisplayContainer from './DisplayContainer/DisplayContainer'

import SettingsIcon from '@resources/feathericons/settings.svg'
import { useNavigate } from 'react-router-dom'

const menuExpanded = {
  transform: `translateY(100%)`,
  // width: "0%"
}

const SettingsBar = ()=>{
  const dispatch = useAppDispatch()
  const [menu, setMenu] = useState("Fonts")
  const ThemeMenuActive = useAppSelector((state) => state?.appState?.state?.themeMenuActive)
  const navigate = useNavigate();

  const showQuickSettingsIcon = menu == "Fonts" || menu == "Themes" 
  return (
    // This serves the dual purpose of preventing a flashbang
    <div className={styles.overflowContainer}>
      <div style={{transform:!ThemeMenuActive?`translateY(100%)`:''}} className={styles.settingsBarContainer}>
        {/* <div className={styles.settingsIcon}><SettingsIcon/></div> */}

        <div className={styles.settingsContainer}>
          {DisplaySubpage(menu)}
        </div>

        <div className={styles.currentMenuContainer}>
          <SettingsIcon 
            className={styles.settingsIconBottomBar} 
            style={{marginRight:"auto", marginLeft:15, opacity: showQuickSettingsIcon? 1:0}}
            onClick={()=>{
              console.log(window.location.pathname)
              navigate("/settings/" + menu, {state:{backPath:window.location.pathname}})
            }}
          />
          {['Fonts', 'Themes', "Spacing", "Display"].map((item,i)=>{
            return (
              // <div key={i} style={{color:item==menu?"#008DDD":"black"}} onClick={()=>setMenu(item)}> {item}</div>
              <div key={i} style={{opacity: item==menu?"100%":"50%"}} className={`${styles.tabSection}`} onClick={()=>setMenu(item)}> {item}</div>
            )
          })}
          <SettingsIcon style={{marginLeft:"auto", marginRight:15, opacity:0}}/>
        </div>
      </div>
    </div>
  )
}

const DisplaySubpage = (pageName:string)=>{
  switch (pageName) {
  case "Fonts":
    return <FontsContainer/>
  case "Themes":
    return <ThemesContainer/>
  case "Spacing":
    return <SpacingContainer/>
  case "Display":
    return <DisplayContainer/>
  default:
    break;
  }
} 

export default SettingsBar