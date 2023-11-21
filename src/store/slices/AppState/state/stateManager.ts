import { PayloadAction } from "@reduxjs/toolkit"
import { appStateReducer, appStateReducerSingle, initialAppState } from "../../appState"


const SetMaximized:appStateReducer = (state, action: PayloadAction<boolean>) =>{
  state.state.maximized = action.payload
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
  const myState = {...initialAppState.state}
  myState.localSystemFonts = state.state.localSystemFonts
  myState["maximized"] = state.state.maximized

  state.state = myState
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

const ToggleProgressMenu:appStateReducerSingle =(state) =>{
  state.state.progressMenuActive = !state.state.progressMenuActive
}

const setReaderMargins:appStateReducer = (state, action: PayloadAction<number>) =>{
  state.readerMargins = action.payload
}

export interface footnoteUpdate{
  link: string,
  text:string
}

const SetFootnoteActive:appStateReducer = (state, action: PayloadAction<footnoteUpdate>) =>{
  state.state.footnote.link = action.payload.link
  state.state.footnote.text = action.payload.text
  state.state.footnote.active = true;
}

const HideFootnote:appStateReducerSingle =(state) =>{
  state.state.footnote.active = false;
}

export interface locaFontsListPayload{
  fonts: {[fontName: string]: Array<string>}
}

const SetLocalFontsList:appStateReducer = (state, action: PayloadAction<locaFontsListPayload>) =>{
  state.state.localSystemFonts = action.payload.fonts
}

export const actions = {
  SetMaximized,
  SetSelectedRendition,
  SelectSidebarMenu,
  CloseSidebarMenu,
  ToggleMenu,
  SetDictionaryWord,
  ToggleThemeMenu,
  setReaderMargins,
  SetDualReaderMode,
  resetBookAppState,
  SetDualReaderReversed,
  ToggleProgressMenu,
  SetFootnoteActive,
  HideFootnote,
  SetLocalFontsList
}
  