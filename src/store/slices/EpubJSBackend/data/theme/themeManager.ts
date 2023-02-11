import { PayloadAction } from "@reduxjs/toolkit"
import { epubjs_reducer } from "../../epubjsManager.d"
import {SetFontPayload} from './themeManager.d'

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

export const actions = {
  SetFont
}