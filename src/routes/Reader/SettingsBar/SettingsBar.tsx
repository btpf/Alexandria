import React, { useEffect, useState } from 'react'
import styles from './SettingsBar.module.scss'


import { NavItem, Rendition } from 'epubjs-myh'
import { useAppDispatch, useAppSelector } from '@store/hooks'
import { SetFont } from '@store/slices/bookState'
import FontsContainer from './FontsContainer/FontsContainer'
import ThemesContainer from './ThemesContainer/ThemesContainer'

const menuExpanded = {
  transform: `translateY(100%)`,
  // width: "0%"
}

const SettingsBar = ()=>{
  const fontSize = useAppSelector((state) => state.bookState[0]?.data.theme.fontSize)
  const renditionInstance = useAppSelector((state) => state.bookState[0]?.instance)
  const dispatch = useAppDispatch()
  const [menu, setMenu] = useState("Fonts")
  const ThemeMenuActive = useAppSelector((state) => state.bookState[0]?.state?.themeMenuActive)
  const MenuToggled = useAppSelector((state) => state.bookState[0]?.state?.menuToggled)
  const UIBackgroundColor = useAppSelector((state) => state.bookState[0]?.data?.theme?.backgroundColor)

  return (
    <div style={!MenuToggled?{backgroundColor:UIBackgroundColor}:{}} className={styles.overflowContainer}>
      <div style={!ThemeMenuActive?menuExpanded:{}} className={styles.settingsBarContainer}>
        {/* <div className={styles.opaqueScreenActive}/> */}
        <div className={styles.touchBar}/>
        <div className={styles.currentMenuContainer}>
          {['Fonts', 'Themes'].map((item,i)=>{
            return (
              <div key={i} style={{color:item==menu?"#008DDD":"black"}} onClick={()=>setMenu(item)}> {item}</div>
            )
          })}
        </div>
        <div className={styles.settingsContainer}>
        
          {menu == "Fonts"?<FontsContainer/>:<ThemesContainer/>}
        </div>
      </div>
    </div>
  )
}


export default SettingsBar