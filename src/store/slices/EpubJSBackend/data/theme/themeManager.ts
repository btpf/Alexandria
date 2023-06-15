import { ActionReducerMapBuilder, createAsyncThunk, current, PayloadAction } from "@reduxjs/toolkit"
import { BookInstances } from "@store/slices/bookStateTypes";
import { AppDispatch, RootState } from "@store/store";
import { epubjs_reducer } from "../../epubjsManager.d"
import {SetFontPayload, SetThemePayload} from './themeManager.d'


const SetFont:epubjs_reducer = (state, action: PayloadAction<SetFontPayload>) =>{
  const {font, fontSize} = action.payload
  if (font){
    state[action.payload.view].data.theme.font = font
    state[action.payload.view].instance.themes.font(font)
  }
  if(fontSize){
    state[action.payload.view].data.theme.fontSize = fontSize
    state[action.payload.view].instance.themes.fontSize(fontSize+"%")
  }
}
type themeDispatchType = {
  themeName: string, 
  view: number
}
export const setThemeThunk = createAsyncThunk(
  'bookState/setThemeV2',
  // if you type your function argument here
  async (themePayload: themeDispatchType, thunkAPI) => {
    const state = (thunkAPI.getState() as RootState)
    
    const themeSpecs = state.appState.themes[themePayload.themeName]

    return {...themePayload, theme: themeSpecs}

  }
)

// const SetTheme:epubjs_reducer = (state, action: PayloadAction<SetThemePayload>) =>{
//   const themeName = action.payload.themeName
//   const rendition = state[action.payload.view].instance

 

//   // console.log(themeObject)
//   // if(!themeObject){
//   //   rendition.themes.select("default")
//   //   // Force the current page to rerender
//   //   // This will break entire project since .start() will also remove all event handlers
//   //   if(rendition.manager){
//   //     rendition.start();
//   //   }
//   //   return
//   // }
//   const id = uuid.v4();
//   // Register Theme object
//   state[action.payload.view].instance.themes.registerRules(id,themeObject);
//   // Select Theme
//   state[action.payload.view].instance.themes.select(id)

//   // Update UI colors
//   if(action.payload.theme?.body.background){
//     state[action.payload.view].data.theme.backgroundColor = action.payload.theme?.body.background
//   }
//   if(action.payload.theme?.body.color){
//     state[action.payload.view].data.theme.color = action.payload.theme?.body.color
//   }

// }

export const actions = {
  SetFont,
  // SetTheme
}