import { PayloadAction } from "@reduxjs/toolkit"
import { appStateReducer } from "../appState"



const SetFullScreen:appStateReducer = (state, action: PayloadAction<boolean>) =>{
  state.state.fullscreen = action.payload
}


export const actions = {
  SetFullScreen,
}
  