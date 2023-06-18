import { createSlice, current, PayloadAction } from '@reduxjs/toolkit'
import {Theme} from './EpubJSBackend/data/theme/themeManager.d'

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

export type ThemeDict = {[themeName:string]: Theme}

export type GlobalThemeDict = {[themeName:string]: {
  primaryBackground: string,
  secondaryBackground: string,
  primaryText: string,
  secondaryText: string
}}

interface defaultState {
    themes: ThemeDict,
    globalThemes: GlobalThemeDict
  
  }
const initialState: defaultState = {
  themes:{
    "Default Light": Base,
    "Default Dark": dark,
  },
  globalThemes:{
    "default":{
      primaryBackground: "#111111",
      secondaryBackground: "#252525",
      primaryText: "white",
      secondaryText: "grey"
    },
    // "default":{
    //   primaryBackground: "white",
    //   secondaryBackground: "white",
    //   primaryText: "black",
    //   secondaryText: "grey"
    // }
  }
}

interface RenameThemePayload{
    oldThemeName: string,
    newThemeName: string
}
interface UpdateThemePayload{
    themeName: string,
    theme: Theme
}

export const appState = createSlice({
  name: 'appState',
  initialState,
  reducers: {
    AddTheme: (state) =>{

      console.log("ADDING THEME")
      let i = 0

      while(true){
        if(i == 0){
          if(state.themes[`New Theme`] == undefined){
                
            break
          }

        }else{
          if(state.themes[`New Theme (${i})`] == undefined){
            break
          }

        }
        i++
      }

      if(i==0){
        state.themes[`New Theme`] = Base
      }else{
        state.themes[`New Theme (${i})`] = Base
      }

    },
    LoadThemes: (state, action: PayloadAction<defaultState>) =>{
      if(Object.keys(action.payload.themes).length == 0){
        return
      }
      state.themes = action.payload.themes
    },
    RenameTheme: (state, action: PayloadAction<RenameThemePayload>) =>{
      if(state.themes[action.payload.newThemeName] == undefined){
        state.themes[action.payload.newThemeName] = state.themes[action.payload.oldThemeName]
        delete state.themes[action.payload.oldThemeName]
      }
    },
    DeleteTheme: (state, action) =>{
      console.log(action.payload)
      console.log(current(state).themes)
      delete state.themes[action.payload]
    },

    UpdateTheme: (state, action: PayloadAction<UpdateThemePayload>) =>{
      console.log(action.payload)
      type bodyTypes = Array<keyof typeof Base.body>
      if(state.themes[action.payload.themeName] !== undefined){
        (Object.keys(action.payload.theme.body) as bodyTypes).forEach((key)=>{
        
          state.themes[action.payload.themeName].body[key] = action.payload.theme.body[key]

        })
      }
    }
  },
})

// Action creators are generated for each case reducer function
export const { 
  AddTheme,
  RenameTheme,
  UpdateTheme,
  DeleteTheme,
  LoadThemes
} = appState.actions

export default appState.reducer