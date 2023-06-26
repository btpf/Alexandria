import { PayloadAction } from "@reduxjs/toolkit"
import { WritableDraft } from "immer/dist/internal";
import { appStateReducer, appStateReducerSingle } from "../appState";
import { defaultAppState } from "../appStateTypes";
import { Theme } from "../EpubJSBackend/data/theme/themeManager.d";

interface RenameThemePayload{
  oldThemeName: string,
  newThemeName: string
}
interface UpdateThemePayload{
  themeName: string,
  theme: Theme
}
export type ThemeDict = {[themeName:string]: Theme}


export const BaseReaderThemeLight = {
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
  
export const BaseReaderThemeDark:Theme = {
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




const AddReaderTheme:appStateReducerSingle = (state) =>{

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
    state.themes[`New Theme`] = BaseReaderThemeLight
  }else{
    state.themes[`New Theme (${i})`] = BaseReaderThemeLight
  }

}
const LoadReaderThemes:appStateReducer = (state, action: PayloadAction<defaultAppState>) =>{
  if(Object.keys(action.payload.themes).length == 0){
    return
  }
  state.themes = action.payload.themes
}

const RenameReaderTheme:appStateReducer = (state, action: PayloadAction<RenameThemePayload>) =>{
  if(state.themes[action.payload.newThemeName] == undefined){
    state.themes[action.payload.newThemeName] = state.themes[action.payload.oldThemeName]
    delete state.themes[action.payload.oldThemeName]
  }
}
const DeleteReaderTheme:appStateReducer = (state, action) =>{
  delete state.themes[action.payload]
}

const UpdateReaderTheme:appStateReducer = (state, action: PayloadAction<UpdateThemePayload>) =>{
  console.log(action.payload)
      type bodyTypes = Array<keyof typeof BaseReaderThemeLight.body>
      if(state.themes[action.payload.themeName] !== undefined){
        (Object.keys(action.payload.theme.body) as bodyTypes).forEach((key)=>{
        
          state.themes[action.payload.themeName].body[key] = action.payload.theme.body[key]

        })
      }
}


export const actions = {
  AddReaderTheme,
  LoadReaderThemes,
  RenameReaderTheme,
  DeleteReaderTheme,
  UpdateReaderTheme
}
