import React from 'react'

import styles from './ThemesContainer.module.scss'

import { useAppDispatch, useAppSelector } from '@store/hooks'
import { Theme } from '@store/slices/EpubJSBackend/data/theme/themeManager.d';
import { setThemeThunk } from '@store/slices/EpubJSBackend/data/theme/themeManager';
import { setSelectedTheme } from '@store/slices/appState';

interface ThemeInterface{
  [name: string]: Theme
}


const ThemesContainer = ()=>{
  const dispatch = useAppDispatch()
  const selectedRendition = useAppSelector((state) => state.appState.state.selectedRendition)
  const isDualReaderMode = useAppSelector((state) => state.appState.state.dualReaderMode)

  const appThemes = useAppSelector((state) => state.appState.themes)

  const OrderedAppThemeKeys = Object.keys(appThemes);
  const idxoflight = OrderedAppThemeKeys.indexOf("Default Light");
  [ OrderedAppThemeKeys[0], OrderedAppThemeKeys[idxoflight] ] = [ OrderedAppThemeKeys[idxoflight],OrderedAppThemeKeys[0] ];
  const idxofdark = OrderedAppThemeKeys.indexOf("Default Dark");
  [ OrderedAppThemeKeys[1], OrderedAppThemeKeys[idxofdark] ] = [ OrderedAppThemeKeys[idxofdark], OrderedAppThemeKeys[1] ];
  return ( 
    
    <div className={styles.themeSelectorContainer}>
      {OrderedAppThemeKeys.map((item)=>{
        const {background, color} = (appThemes[item].reader).body
        return (
          <div key={item} onClick={()=>{
            // This will select and save the global theme.
            dispatch(setSelectedTheme(item))

            // Below will simply update the rendition themes.
            if(isDualReaderMode){
              dispatch(setThemeThunk({themeName: item, view:0}))
              dispatch(setThemeThunk({themeName: item, view:1}))
              return
            }
            dispatch(setThemeThunk({themeName: item, view:selectedRendition}))
          }} style={{backgroundColor: background, color}} className={styles.theme}>
            {item}
          </div>
        )
      })}
    </div>
  )
}


export default ThemesContainer