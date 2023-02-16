import { createSlice, PayloadAction } from '@reduxjs/toolkit'
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


interface defaultState {
    themes: ThemeDict
  
  }
const initialState: defaultState = {
  themes:{
    "Default Theme": Base,
    dark,
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

export const app = createSlice({
  name: 'app',
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

    RenameTheme: (state, action: PayloadAction<RenameThemePayload>) =>{
      if(state.themes[action.payload.newThemeName] == undefined){
        state.themes[action.payload.newThemeName] = state.themes[action.payload.oldThemeName]
        delete state.themes[action.payload.oldThemeName]
      }
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
  UpdateTheme
} = app.actions

export default app.reducer