import { PayloadAction } from "@reduxjs/toolkit"
import { WritableDraft } from "immer/dist/internal";
import { appStateReducer, appStateReducerSingle } from "../appState";
import { defaultAppState } from "../appStateTypes";

interface RenameThemePayload{
  oldThemeName: string,
  newThemeName: string
}

interface globalThemeType {
  primaryBackground: string,
  secondaryBackground: string,
  primaryText : string,
  secondaryText: string 
}


export const BaseGlobalThemeDark = {
  primaryBackground: "#111111",
  secondaryBackground: "#252525",
  primaryText: "white",
  secondaryText: "grey"
}
export const BaseGlobalThemeLight = {
  primaryBackground: "white",
  secondaryBackground: "#FAF9F6",
  primaryText: "black",
  secondaryText: "grey"
}

const AddGlobalTheme:appStateReducerSingle = (state) =>{

  console.log("ADDING THEME")
  let i = 0

  while(true){
    if(i == 0){
      
      if(state.globalThemes[`New Theme`] == undefined){
              
        break
      }

    }else{
      if(state.globalThemes[`New Theme (${i})`] == undefined){
        break
      }

    }
    i++
  }

  if(i==0){
    state.globalThemes[`New Theme`] = BaseGlobalThemeLight
  }else{
    state.globalThemes[`New Theme (${i})`] = BaseGlobalThemeLight
  }

}

const RenameGlobalTheme:appStateReducer = (state, action: PayloadAction<RenameThemePayload>) =>{
  if(state.globalThemes[action.payload.newThemeName] == undefined){
    state.globalThemes[action.payload.newThemeName] = state.globalThemes[action.payload.oldThemeName]
    delete state.globalThemes[action.payload.oldThemeName]
  }
}
const DeleteGlobalTheme:appStateReducer = (state, action) =>{
  delete state.globalThemes[action.payload]
}

type UpdateThemePayload = {
  themeName: string,
  theme: globalThemeType
}
const UpdateGlobalTheme:appStateReducer = (state, action: PayloadAction<UpdateThemePayload>) =>{
  console.log(action.payload)
      type bodyTypes = Array<keyof typeof BaseGlobalThemeLight>
      if(state.globalThemes[action.payload.themeName] !== undefined){
        (Object.keys(action.payload.theme) as bodyTypes).forEach((key)=>{
        
          state.globalThemes[action.payload.themeName][key] = action.payload.theme[key]

        })
      }
}

const setSelectedGlobalTheme:appStateReducer = (state, action: PayloadAction<string>) =>{
  // Return in the case where the config file is empty
  if(action.payload == ""){
    return
  }

  // In the case we are setting the theme to one which doesn't exists, Do not crash the application.
  if(!Object.keys(state.globalThemes).includes(action.payload)){
    return
  }
  console.log("SELECTED GLOBAL THEME CHANGE")
  state.selectedGlobalTheme = action.payload
  console.log(state)
}

const LoadGlobalThemes:appStateReducer = (state, action: PayloadAction<defaultAppState>) =>{
  if(Object.keys(action.payload.themes).length == 0){
    return
  }
  state.globalThemes = action.payload.themes
}


export const actions = {
  AddGlobalTheme,
  RenameGlobalTheme,
  DeleteGlobalTheme,
  UpdateGlobalTheme,
  setSelectedGlobalTheme,
  LoadGlobalThemes
}
