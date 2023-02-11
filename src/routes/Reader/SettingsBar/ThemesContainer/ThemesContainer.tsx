import React, { useEffect, useState } from 'react'

import styles from './ThemesContainer.module.scss'

import { useAppDispatch, useAppSelector } from '@store/hooks'
import { SetTheme, Theme } from '@store/slices/bookState'

const dark = {
  body: {
    background: `#444`,
    color: `#fff`,
  },
  'a:link': {
    color: `#1e83d2`,
    'text-decoration': 'none',
  },
  'a:link:hover': {
    background: 'rgba(0, 0, 0, 0.1)',
  },
};

const Base:Theme = {
  body: {
    background: `white`,
    color: `black`,
  },

  'a:link': {
    color: `#0000EE`,
    'text-decoration': 'inherit',
  },
  'a:link:hover': {
    background: 'inherit',
  },
};


interface ThemeInterface{
  [name: string]: Theme
}
const testThemes: ThemeInterface = {
  Dark: dark, 
//   Default: Base
}

const ThemesContainer = ()=>{
  const dispatch = useAppDispatch()
  const fontSize = useAppSelector((state) => state.bookState[0]?.data.theme.fontSize)
  return ( 
    
    <div className={styles.themeSelectorContainer}>
      <div onClick={()=>{
        dispatch(SetTheme({view:0, theme:Base}))}}
      style={{backgroundColor: 'white', color:'black'}} className={styles.theme}>
          Default
      </div>
      {Object.keys(testThemes).map((item)=>{
        const {background, color} = (testThemes[item]).body
        return (
          <div key={item} onClick={()=>{
            dispatch(SetTheme({view:0, theme:testThemes[item]}))
          }} style={{backgroundColor: background, color}} className={styles.theme}>
            {item}
          </div>
        )
      })}
    </div>
  )
}


export default ThemesContainer