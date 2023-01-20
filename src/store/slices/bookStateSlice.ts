import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Rendition } from 'epubjs-myh'
import { castDraft, castImmutable } from 'immer'
const uuid = require("uuid");
export enum LOADSTATE{
  INITIAL,
  LOADING_LOCATIONS,
  COMPLETE,
  CANCELED
}
interface RenditionInstance{
  instance: Rendition
  UID: number
}

interface bookState{
  instance: Rendition,
  UID: number,
  loadState: LOADSTATE,
  state:{
    sidebarMenuSelected: boolean|string,
    menuToggled: boolean,
    themeMenuActive: boolean
  },
  data:{
    highlights:{[cfiRange:string]:highlightData},
    bookmarks:Set<string>,
    theme:{
      font: string,
      fontSize: number,
      backgroundColor: string
      color:string
    }
  }
}

interface BookInstances {
  [key: string]: bookState
}


interface SetFontPayload{
  view: number
  font?: string
  fontSize?: number
}

export interface Theme{
  body: {
    background?: string,
    color?: string,
  },
  '*'?: {
    color?: string,
    background?: string,
  },
  'a:link'?: {
    color?: string,
    'text-decoration'?: string,
  },
  'a:link:hover'?: {
    background?: string,
  }
}

interface SetThemePayload{
  view: number
  theme:Theme
}

interface highlightData {
  color: string,
  note: string
}

interface highlightAction extends highlightData {
  view: number,
  highlightRange: string
}

interface bookmarkAction {
  view: number,
  bookmarkLocation: string
}

interface loadProgressUpdate{
  view:number,
  state: LOADSTATE
}

interface sideBarUpdate{
  view:number,
  state: string|boolean
}


// Define the initial state using that type
const initialState: BookInstances = {}

export const bookState = createSlice({
  name: 'bookState',
  initialState,
  reducers: {
    AddRendition: (state, action: PayloadAction<RenditionInstance>) => {

      const t:bookState = {
        instance: action.payload.instance,
        UID: action.payload.UID, 
        loadState:LOADSTATE.INITIAL, 
        data:{
          highlights:{},
          bookmarks: new Set(), 
          theme:{
            font:"Helvetica, sans-serif", 
            fontSize:100,
            backgroundColor:'white',
            color:'grey'
          }
        }, 
        state:{
          sidebarMenuSelected: false,
          menuToggled: false, 
          themeMenuActive: false
        }}
      // https://github.com/immerjs/immer/issues/389

      state[action.payload.UID] = castDraft(t)
    },
    RemoveRendition: (state, action: PayloadAction<number>) => {
      delete state[action.payload]
    },
    SetLoadState: (state, action: PayloadAction<loadProgressUpdate>) =>{
      if (Object.keys(state).includes(String(action.payload.view))){
        state[action.payload.view].loadState = action.payload.state
      }

    },
    ToggleThemeMenu:(state, action: PayloadAction<number>) =>{
      state[action.payload].state.themeMenuActive = !state[action.payload].state.themeMenuActive
    },
    SelectSidebarMenu: (state, action: PayloadAction<sideBarUpdate>) =>{
      state[action.payload.view].state.sidebarMenuSelected = action.payload.state
    },
    CloseSidebarMenu: (state, action: PayloadAction<number>) =>{
      state[action.payload].state.sidebarMenuSelected = false
    },
    SetFont: (state, action: PayloadAction<SetFontPayload>) =>{
      const {font, fontSize} = action.payload
      if (font){
        state[action.payload.view].data.theme.font = font
        state[action.payload.view].instance.themes.font(font)
      }
      if(fontSize){
        state[action.payload.view].data.theme.fontSize = fontSize
        state[action.payload.view].instance.themes.fontSize(fontSize+"%")
      }
      
    },
    SetTheme: (state, action: PayloadAction<SetThemePayload>) =>{
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

    },
    ToggleMenu: (state, action: PayloadAction<number>) =>{
      state[action.payload].state.menuToggled = !state[action.payload].state.menuToggled
    },
    AddHighlight: (state, action: PayloadAction<highlightAction>) =>{
      state[action.payload.view].data.highlights[action.payload.highlightRange] = {color:action.payload.color, note:""}
    },
    ToggleBookmark:(state, action: PayloadAction<bookmarkAction>) =>{
      if(state[action.payload.view].data.bookmarks.has(action.payload.bookmarkLocation)){
        state[action.payload.view].data.bookmarks.delete(action.payload.bookmarkLocation)
      }else{
        state[action.payload.view].data.bookmarks.add(action.payload.bookmarkLocation)
      }
    },
    DeleteHighlight: (state, action: PayloadAction<highlightAction>) =>{
      delete state[action.payload.view].data.highlights[action.payload.highlightRange]
    },
    ChangeHighlightColor: (state, action: PayloadAction<highlightAction>) =>{
      console.log(action.payload.highlightRange)
      console.log(JSON.stringify(state[action.payload.view].data.highlights[action.payload.highlightRange]))
      console.log(state[action.payload.view].data.highlights[action.payload.highlightRange])
      state[action.payload.view].data.highlights[action.payload.highlightRange] = {color:action.payload.color, note:state[action.payload.view].data.highlights[action.payload.highlightRange].note}
    },
    ChangeHighlightNote: (state, action: PayloadAction<highlightAction>) =>{
      state[action.payload.view].data.highlights[action.payload.highlightRange] = {color:state[action.payload.view].data.highlights[action.payload.highlightRange].color, note:action.payload.note}
    },
  },
})

// Action creators are generated for each case reducer function
export const { 
  AddRendition,
  RemoveRendition,
  SetLoadState, 
  DeleteHighlight, 
  SelectSidebarMenu,
  CloseSidebarMenu,
  ToggleMenu, 
  AddHighlight, 
  ChangeHighlightColor, 
  ChangeHighlightNote, 
  ToggleBookmark,
  SetFont,
  SetTheme,
  ToggleThemeMenu
} = bookState.actions

export default bookState.reducer