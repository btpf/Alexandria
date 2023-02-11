import { PayloadAction } from "@reduxjs/toolkit"
import { epubjs_reducer } from "@store/slices/EpubJSBackend/epubjsManager.d"
import { SetThemePayload, sideBarUpdate } from "./stateManager.d";
const uuid = require("uuid");





const ToggleThemeMenu:epubjs_reducer =(state, action: PayloadAction<number>) =>{
  state[action.payload].state.themeMenuActive = !state[action.payload].state.themeMenuActive
}

const SelectSidebarMenu:epubjs_reducer = (state, action: PayloadAction<sideBarUpdate>) =>{
  state[action.payload.view].state.sidebarMenuSelected = action.payload.state
}

const CloseSidebarMenu:epubjs_reducer = (state, action: PayloadAction<number>) =>{
  state[action.payload].state.sidebarMenuSelected = false
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


export const actions = {
  ToggleThemeMenu,
  SelectSidebarMenu,
  CloseSidebarMenu,
  SetTheme,
  ToggleMenu,
  SkipMouseEvent,
  AllowMouseEvent
}