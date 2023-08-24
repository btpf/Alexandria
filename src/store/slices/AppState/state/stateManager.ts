import { PayloadAction } from "@reduxjs/toolkit"
import { appStateReducer, appStateReducerSingle, initialAppState } from "../../appState"


const SetFullScreen:appStateReducer = (state, action: PayloadAction<boolean>) =>{
  state.state.fullscreen = action.payload
}

const SetSelectedRendition:appStateReducer = (state, action: PayloadAction<number>) =>{
  state.state.selectedRendition = action.payload
}

const SetDualReaderMode:appStateReducer = (state, action: PayloadAction<boolean>) =>{
  state.state.dualReaderMode = action.payload
}

const SetDualReaderReversed:appStateReducer = (state, action: PayloadAction<boolean>) =>{
  state.state.dualReaderReversed = action.payload
}

const resetBookAppState:appStateReducerSingle = (state) =>{
  state.state = initialAppState.state
}

const SelectSidebarMenu:appStateReducer = (state, action: PayloadAction<string|boolean>) =>{
  state.state.sidebarMenuSelected = action.payload
}

const CloseSidebarMenu:appStateReducerSingle = (state) =>{
  state.state.sidebarMenuSelected = false
}

const ToggleMenu:appStateReducerSingle = (state) =>{
  state.state.menuToggled = !state.state.menuToggled
}

const SetDictionaryWord:appStateReducer = (state, action: PayloadAction<string>) =>{
  state.state.dictionaryWord = action.payload
}

const ToggleThemeMenu:appStateReducerSingle =(state) =>{
  state.state.themeMenuActive = !state.state.themeMenuActive
}

const setReaderMargins:appStateReducer = (state, action: PayloadAction<number>) =>{
  state.readerMargins = action.payload
}

export const actions = {
  SetFullScreen,
  SetSelectedRendition,
  SelectSidebarMenu,
  CloseSidebarMenu,
  ToggleMenu,
  SetDictionaryWord,
  ToggleThemeMenu,
  setReaderMargins,
  SetDualReaderMode,
  resetBookAppState,
  SetDualReaderReversed
}
  