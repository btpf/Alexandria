import React, { useState } from 'react'
import styles from './SettingsBar.module.scss'


import { useAppDispatch, useAppSelector } from '@store/hooks'
import FontsContainer from './FontsContainerV2/FontsContainer'
import ThemesContainer from './ThemesContainer/ThemesContainer'
import SpacingContainer from './SpacingContainer/SpacingContainer'
import DisplayContainer from './DisplayContainer/DisplayContainer'

import SettingsIcon from '@resources/feathericons/settings.svg'
import { useNavigate } from 'react-router-dom'
import BottomMenuContainer from '../Components/BottomMenuContainer/BottomMenuContainer'

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
    <BottomMenuContainer active={ThemeMenuActive}>
      <div className={styles.settingsContainer}>
        {DisplaySubpage(menu)}
      </div>

      <div className={styles.currentMenuContainer}>
        <SettingsIcon 
          className={styles.settingsIconBottomBar} 
          style={{ opacity: showQuickSettingsIcon? "":0}}
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
        {/* This line is simply just used as a spacer. It is invisible */}
        <SettingsIcon style={{marginLeft:"auto", marginRight:15, opacity:0}}/>
      </div>
    </BottomMenuContainer>

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