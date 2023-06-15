import React, { useEffect, useState } from 'react'

import styles from './ThemesContainer.module.scss'

import { useAppDispatch, useAppSelector } from '@store/hooks'
import { Theme } from '@store/slices/EpubJSBackend/data/theme/themeManager.d';
import { setThemeThunk } from '@store/slices/EpubJSBackend/data/theme/themeManager';

interface ThemeInterface{
  [name: string]: Theme
}


const ThemesContainer = ()=>{
  const dispatch = useAppDispatch()
  const appThemes = useAppSelector((state) => state.appState.themes)
  const fontSize = useAppSelector((state) => state.bookState[0]?.data.theme.fontSize)
  return ( 
    
    <div className={styles.themeSelectorContainer}>
      {Object.keys(appThemes).map((item)=>{
        const {background, color} = (appThemes[item]).body
        return (
          <div key={item} onClick={()=>{
            // dispatch(SetTheme({view:0, theme:appThemes[item]}))
            dispatch(setThemeThunk({themeName: item, view:0}))
          }} style={{backgroundColor: background, color}} className={styles.theme}>
            {item}
          </div>
        )
      })}
    </div>
  )
}


export default ThemesContainer