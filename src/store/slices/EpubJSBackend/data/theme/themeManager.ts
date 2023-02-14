import { PayloadAction } from "@reduxjs/toolkit"
import { epubjs_reducer } from "../../epubjsManager.d"
import {SetFontPayload, SetThemePayload} from './themeManager.d'
const uuid = require("uuid");


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

const SetTheme:epubjs_reducer = (state, action: PayloadAction<SetThemePayload>) =>{
  const themeObject = action.payload.theme
  const rendition = state[action.payload.view].instance
  // console.log(themeObject)
  // if(!themeObject){
  //   rendition.themes.select("default")
  //   // Force the current page to rerender
  //   // This will break entire project since .start() will also remove all event handlers
  //   if(rendition.manager){
  //     rendition.start();
  //   }
  //   return
  // }
  const id = uuid.v4();
  // Register Theme object
  state[action.payload.view].instance.themes.registerRules(id,themeObject);
  // Select Theme
  state[action.payload.view].instance.themes.select(id)

  // Update UI colors
  if(action.payload.theme?.body.background){
    state[action.payload.view].data.theme.backgroundColor = action.payload.theme?.body.background
  }
  if(action.payload.theme?.body.color){
    state[action.payload.view].data.theme.color = action.payload.theme?.body.color
  }

}

export const actions = {
  SetFont,
  SetTheme
}