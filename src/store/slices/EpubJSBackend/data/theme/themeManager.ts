import { createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "@store/store";
import { invoke } from "@tauri-apps/api";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { bookStateStructure, dataInterface, epubjs_reducer } from "../../epubjsManager.d"
import { platform } from '@tauri-apps/api/os';

let IS_LINUX:boolean|undefined = undefined

type renderModeDispatchType = {
  view: number,
  renderMode: string
}
const setRenderMode:epubjs_reducer = (state, action: PayloadAction<renderModeDispatchType>) =>{
  ((state[action.payload.view] as bookStateStructure).data as dataInterface).theme.renderMode = action.payload.renderMode
}



type fontDispatchType = {
  view: number,
  font?: string,
  fontSize?: number,
  fontWeight?: number
}
export const setFontThunk = createAsyncThunk(
  'bookState/setFontV2',
  async (fontPayload: fontDispatchType, thunkAPI) => {

    if(IS_LINUX == undefined){
      IS_LINUX = await platform() == "linux"
    }


    const state = (thunkAPI.getState() as RootState)
    console.log("PRINTING SETFONT STATE")
    console.log(state)

    const view = fontPayload.view

    

    const currentBookInstance:bookStateStructure = state.bookState[view]
    const themeSpecs = state.appState.themes[state.appState.selectedTheme]
    const newObj = ({} as {font?: string, fontSize?: number, fontCache?: string, fontWeight?:number})

    if(fontPayload.fontSize){
      newObj["fontSize"] = fontPayload.fontSize
    }
    if(fontPayload.fontWeight){
      newObj["fontWeight"] = fontPayload.fontWeight
    }

    if(fontPayload.font){
      if(fontPayload.font == "Default"){
        newObj["font"] = ""
        newObj["fontCache"] = ""

        const newTheme = {...currentBookInstance.data.theme, ...newObj}
        return {
          view,
          themeBase: themeSpecs,
          theme: newTheme
        }

      }

      newObj["font"] = fontPayload.font
      // Update the fontCache Here
      // We will need a function called get_font_urls which will 
      // return all of the font urls inside the folder with the given font name
      const paths = await invoke("get_font_urls", {name: newObj["font"]})
      const typedPaths = (paths as [string])
      let fontsCache = ''
      if(typedPaths){
        typedPaths.forEach((path)=>{
          const pathDissect = path.split(" - ")
          const myWeight = pathDissect[pathDissect.length - 1].replace(".ttf","")
  
          fontsCache += 
            `@font-face {
              font-family: "${fontPayload.font}";
              src: url("${IS_LINUX?"http://127.0.0.1:16780/" + path.split('/').slice(-4).join("/"):convertFileSrc(path)}") format("truetype");
              font-weight: ${myWeight};
              font-style: normal;
            }
            `
        })
      }

      newObj["fontCache"] = fontsCache
      const newTheme = {...currentBookInstance.data.theme, ...newObj}
      return {
        view,
        themeBase: themeSpecs,
        theme: newTheme
      }
      
    }


    const newTheme = {...currentBookInstance.data.theme, ...newObj}

    return {
      view,
      themeBase: themeSpecs,
      theme: newTheme
      
    }






  }
)

type themeDispatchType = {
  themeName: string, 
  view: number
}
export const setThemeThunk = createAsyncThunk(
  'bookState/setThemeV2',
  // if you type your function argument here
  async (themePayload: themeDispatchType, thunkAPI) => {
    const state = (thunkAPI.getState() as RootState)
    console.log("DISPATCHING THEME")
    console.log(state.appState.themes)
    const themeSpecs = state.appState.themes[themePayload.themeName]
    const currentBookInstance:bookStateStructure = state.bookState[themePayload.view]
    console.log(currentBookInstance.data.theme)

    const newTheme = {...currentBookInstance.data.theme, themeName: themePayload.themeName}

    return {
      view: themePayload.view,
      themeBase: themeSpecs,
      theme: newTheme
    }
  }
)

type genericNumericDispatchType = {
  value: number, 
  view: number
}

export const setWordSpacingThunk = createAsyncThunk(
  'bookState/setWordSpacing',
  // if you type your function argument here
  async (payload: genericNumericDispatchType, thunkAPI) => {
    const state = (thunkAPI.getState() as RootState)

    const currentBookInstance:bookStateStructure = state.bookState[payload.view]
    const themeSpecs = state.appState.themes[state.appState.selectedTheme]


    const newTheme = {...currentBookInstance.data.theme, wordSpacing:payload.value}

    return {
      view: payload.view,
      themeBase: themeSpecs,
      theme: newTheme
    }
  }
)

export const setParagraphSpacingThunk = createAsyncThunk(
  'bookState/setParagraphSpacing',
  // if you type your function argument here
  async (payload: genericNumericDispatchType, thunkAPI) => {
    const state = (thunkAPI.getState() as RootState)

    const currentBookInstance:bookStateStructure = state.bookState[payload.view]
    const themeSpecs = state.appState.themes[state.appState.selectedTheme]


    const newTheme = {...currentBookInstance.data.theme, paragraphSpacing:payload.value}

    return {
      view: payload.view,
      themeBase: themeSpecs,
      theme: newTheme
    }
  }
)

type genericStringDispatchType = {
  value: string, 
  view: number
}

export const setTextAlignmentThunk = createAsyncThunk(
  'bookState/setTextAlignment',
  // if you type your function argument here
  async (payload: genericStringDispatchType, thunkAPI) => {
    const state = (thunkAPI.getState() as RootState)

    const currentBookInstance:bookStateStructure = state.bookState[payload.view]
    const themeSpecs = state.appState.themes[state.appState.selectedTheme]


    const newTheme = {...currentBookInstance.data.theme, textAlign:payload.value}

    return {
      view: payload.view,
      themeBase: themeSpecs,
      theme: newTheme
    }
  }
)

export const setLineHeightThunk = createAsyncThunk(
  'bookState/setLineHeight',
  // if you type your function argument here
  async (payload: genericNumericDispatchType, thunkAPI) => {
    const state = (thunkAPI.getState() as RootState)

    const currentBookInstance:bookStateStructure = state.bookState[payload.view]
    const themeSpecs = state.appState.themes[state.appState.selectedTheme]

    
    function roundToTenth(num:number){
      return Math.round(num*10)/10
    }

    // 0.9 represents the default unset line-height
    const newLineHeightValue = roundToTenth(Math.max(payload.value, 0.9))
    const newTheme = {...currentBookInstance.data.theme, lineHeight:newLineHeightValue}

    return {
      view: payload.view,
      themeBase: themeSpecs,
      theme: newTheme
    }
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
  // SetFont,
  // SetTheme
  setRenderMode
}