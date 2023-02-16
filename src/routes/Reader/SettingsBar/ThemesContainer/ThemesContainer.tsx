import React, { useEffect, useState } from 'react'

import styles from './ThemesContainer.module.scss'

import { useAppDispatch, useAppSelector } from '@store/hooks'
import { SetTheme } from '@store/slices/bookState'
import { Theme } from '@store/slices/EpubJSBackend/data/theme/themeManager.d';

interface ThemeInterface{
  [name: string]: Theme
}


const ThemesContainer = ()=>{
  const dispatch = useAppDispatch()
  const appThemes = useAppSelector((state) => state.app.themes)
  const fontSize = useAppSelector((state) => state.bookState[0]?.data.theme.fontSize)
  return ( 
    
    <div className={styles.themeSelectorContainer}>
      {Object.keys(appThemes).map((item)=>{
        const {background, color} = (appThemes[item]).body
        return (
          <div key={item} onClick={()=>{
            dispatch(SetTheme({view:0, theme:appThemes[item]}))
          }} style={{backgroundColor: background, color}} className={styles.theme}>
            {item}
          </div>
        )
      })}
    </div>
  )
}


export default ThemesContainer