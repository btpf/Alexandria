import { PayloadAction, current } from "@reduxjs/toolkit"
// import { current, WritableDraft } from "immer/dist/internal";
import { appStateReducer, appStateReducerSingle } from "../appState";
import { defaultAppState } from "../appStateTypes";

interface RenameThemePayload{
  oldThemeName: string,
  newThemeName: string
}
export type uiTheme = {
  primaryBackground: string,
  secondaryBackground: string,
  primaryText : string,
  secondaryText: string 
}

export type ThemeType = {
  ui:uiTheme,
  reader:{
    body: {
      background: string,
      color: string,
    },
    
    'a:link': {
      color: string,
      'text-decoration': string,
    },
    'a:link:hover': {
      background: string,
    },
  }
}


export const BaseThemeDark = {
  ui:{
    primaryBackground: "#111111",
    secondaryBackground: "#252525",
    primaryText: "white",
    secondaryText: "grey"
  },
  reader:{
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
  }

}
export const BaseThemeLight = {
  ui:{
    primaryBackground: "white",
    secondaryBackground: "#FAF9F6",
    primaryText: "rgba(0, 0, 0, 0.8)",
    secondaryText: "rgba(0, 0, 0, 0.6)"
  },
  reader:{
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
  }
}

const AddTheme:appStateReducerSingle = (state) =>{

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
    state.themes[`New Theme`] = BaseThemeLight
  }else{
    state.themes[`New Theme (${i})`] = BaseThemeLight
  }

}

const RenameTheme:appStateReducer = (state, action: PayloadAction<RenameThemePayload>) =>{
  if(state.themes[action.payload.newThemeName] == undefined){
    state.themes[action.payload.newThemeName] = state.themes[action.payload.oldThemeName]
    delete state.themes[action.payload.oldThemeName]
  }
}
const DeleteTheme:appStateReducer = (state, action) =>{
  delete state.themes[action.payload]
}

type GetAllKeys<T> = T extends object
  ? {
      [K in keyof T]-?: K extends string | number
        ? `${K}` | `${GetAllKeys<T[K]>}`
        : never;
    }[keyof T]
  : never;


type UpdateThemePayload = {
  themeName: string,
  newColor: ThemeType,
  path: GetAllKeys<ThemeType>
}


const UpdateTheme:appStateReducer = (state, action: PayloadAction<UpdateThemePayload>) =>{

  if(state.themes[action.payload.themeName] !== undefined){

    let currentObject:any = state.themes[action.payload.themeName]
    const path = action.payload.path
    for (let index = 0; index < path.length - 1; index++) {
      currentObject = currentObject[path[index]]
      
    }

    currentObject[path[path.length - 1]] = action.payload.newColor




  }
}

const setSelectedTheme:appStateReducer = (state, action: PayloadAction<string>) =>{
  // Return in the case where the config file is empty
  if(action.payload == ""){
    return
  }

  // In the case we are setting the theme to one which doesn't exists, Do not crash the application.
  if(!Object.keys(state.themes).includes(action.payload)){
    return
  }
  console.log("SELECTED GLOBAL THEME CHANGE")
  state.selectedTheme = action.payload
  console.log(state)
}

const LoadThemes:appStateReducer = (state, action: PayloadAction<defaultAppState>) =>{
  if(Object.keys(action.payload.themes).length == 0){
    return
  }
  state.themes = action.payload.themes
}


export const actions = {
  AddTheme,
  RenameTheme,
  DeleteTheme,
  UpdateTheme,
  setSelectedTheme,
  LoadThemes
}
