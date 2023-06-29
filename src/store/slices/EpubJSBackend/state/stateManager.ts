import { PayloadAction } from "@reduxjs/toolkit"
import { epubjs_reducer } from "@store/slices/EpubJSBackend/epubjsManager.d"
import { SetDictionaryWordPayload, sideBarUpdate } from "./stateManager.d";


const ToggleThemeMenu:epubjs_reducer =(state, action: PayloadAction<number>) =>{
  state[action.payload].state.themeMenuActive = !state[action.payload].state.themeMenuActive
}

const SelectSidebarMenu:epubjs_reducer = (state, action: PayloadAction<sideBarUpdate>) =>{
  state[action.payload.view].state.sidebarMenuSelected = action.payload.state
}

const CloseSidebarMenu:epubjs_reducer = (state, action: PayloadAction<number>) =>{
  state[action.payload].state.sidebarMenuSelected = false
}

const ToggleMenu:epubjs_reducer = (state, action: PayloadAction<number>) =>{
  state[action.payload].state.menuToggled = !state[action.payload].state.menuToggled
}


const SkipMouseEvent:epubjs_reducer = (state, action: PayloadAction<number>) =>{
  console.log("Next event will be skipped")
  state[action.payload].state.skipMouseEvent = true;
}

const AllowMouseEvent:epubjs_reducer = (state, action: PayloadAction<number>) =>{
  state[action.payload].state.skipMouseEvent = false;
}

const SetDictionaryWord:epubjs_reducer = (state, action: PayloadAction<SetDictionaryWordPayload>) =>{
  state[action.payload.view].state.dictionaryWord = action.payload.word
}

export const actions = {
  ToggleThemeMenu,
  SelectSidebarMenu,
  CloseSidebarMenu,
  ToggleMenu,
  SkipMouseEvent,
  AllowMouseEvent,
  SetDictionaryWord
}