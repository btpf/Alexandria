import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { invoke } from '@tauri-apps/api';
import { Rendition } from 'epubjs-myh'
import { castDraft, castImmutable } from 'immer'
const uuid = require("uuid");
export enum LOADSTATE{
  INITIAL,
  LOADING,
  COMPLETE,
  CANCELED
}
interface RenditionInstance{
  instance: Rendition
  UID: number,
  hash: string,
  title: string
}

export interface bookStateStructure{
  title: string,
  instance: Rendition,
  UID: number,
  hash: string
  loadState: LOADSTATE,
  state:{
    sidebarMenuSelected: boolean|string,
    menuToggled: boolean,
    themeMenuActive: boolean,
    modals:{
      selectedCFI: string,
      quickbarModal: {visible: boolean, x:number, y:number},
      noteModal: {visible: boolean, x:number, y:number}
    },
    skipMouseEvent: boolean
  },
  data:{
    highlights:{[cfiRange:string]:highlightData},
    bookmarks:Set<string>,
    progress: number,
    theme:{
      font: string,
      fontSize: number,
      backgroundColor: string
      color:string
    }
  }
}

interface BookInstances {
  [key: string]: bookStateStructure
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

interface progressUpdate{
  view: number,
  progress: number
}

interface bookmarkAction {
  view: number,
  bookmarkLocation: string
}

interface loadProgressUpdate{
  view:number,
  state: LOADSTATE
}

interface MoveModalAction{
  view:number,
  x: number,
  y: number,
  visible: boolean
}
interface MoveModalCFIAction{
  view:number,
  selectedCFI: string
}

interface sideBarUpdate{
  view:number,
  state: string|boolean
}

export const SyncedAddRendition = createAsyncThunk(
  'bookState/SyncedAddRendition',
  // if you type your function argument here
  async (renditionData: RenditionInstance, thunkAPI) => {
    // console.log("ASYNC CALLED 1")
    if(window.__TAURI__){
      // invoke("get_books").then((data)=>{
      //   setBooks((data as BookData[]))
      // })

      // console.log(thunkAPI.getState())
      // thunkAPI.dispatch(AddHighlight(highlightData))
      // console.log(thunkAPI.getState())

      // Eventually, this should match bookStateStructure.data
      interface expectedLoadData{
        data:{
          highlights:{[cfiRange:string]:highlightData},
          bookmarks:Set<string>,
        },
      }
      
      const result:expectedLoadData = await invoke("load_book_data", {checksum: renditionData.hash})

   

      const bookmarks = result.data.bookmarks
      const highlights = result.data.highlights


      for (const [key, value] of Object.entries(highlights)) {
        thunkAPI.dispatch(AddHighlight({highlightRange:key, color:value.color, note:value.note, view:0}))
      }
      bookmarks.forEach((bookmark)=>{
        thunkAPI.dispatch(ToggleBookmark({
          view: 0,
          bookmarkLocation: bookmark
        }))
      })

      

    }
    
    return true
  }
)


// Define the initial state using that type
const initialState: BookInstances = {}

export const bookState = createSlice({
  name: 'bookState',
  initialState,
  reducers: {
    AddRendition: (state, action: PayloadAction<RenditionInstance>) => {

      const t:bookStateStructure = {
        title: action.payload.title,
        instance: action.payload.instance,
        UID: action.payload.UID, 
        hash: action.payload.hash,
        loadState:LOADSTATE.INITIAL, 
        data:{
          progress: 0,
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
          themeMenuActive: false,
          skipMouseEvent: false,
          modals:{
            selectedCFI: "",
            quickbarModal: {visible: false, x:0, y:0},
            noteModal: {visible: false, x:0, y:0}
          }
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
    SetProgress: (state, action: PayloadAction<progressUpdate>) =>{
      state[action.payload.view].data.progress = action.payload.progress
    },
    MoveQuickbarModal: (state, action: PayloadAction<MoveModalAction>) =>{
      state[action.payload.view].state.modals.quickbarModal = {x: action.payload.x, y:action.payload.y, visible: action.payload.visible}
    },
    HideQuickbarModal: (state, action: PayloadAction<number>) =>{
      state[action.payload].state.modals.quickbarModal.visible = false
    },
    MoveNoteModal: (state, action: PayloadAction<MoveModalAction>) =>{
      state[action.payload.view].state.modals.noteModal = {x: action.payload.x, y:action.payload.y, visible: action.payload.visible}
    },
    ShowNoteModal: (state, action: PayloadAction<number>) =>{
      state[action.payload].state.modals.noteModal.visible = true
    },
    HideNoteModal: (state, action: PayloadAction<number>) =>{
      state[action.payload].state.modals.noteModal.visible = false
    },
    SetModalCFI: (state, action: PayloadAction<MoveModalCFIAction>) =>{
      state[action.payload.view].state.modals.selectedCFI = action.payload.selectedCFI
    },
    SkipMouseEvent: (state, action: PayloadAction<number>) =>{
      console.log("Next event will be skipped")
      state[action.payload].state.skipMouseEvent = true;
    },
    AllowMouseEvent: (state, action: PayloadAction<number>) =>{
      state[action.payload].state.skipMouseEvent = false;
    },
  },

  extraReducers: (builder) => {
    builder.addCase(SyncedAddRendition.pending, (state, action) => {
      console.log("PENDING CASE")
      const t:bookStateStructure = {
        title: action.meta.arg.title,
        instance: action.meta.arg.instance,
        UID: action.meta.arg.UID, 
        hash: action.meta.arg.hash,
        loadState:LOADSTATE.INITIAL, 
        data:{
          progress: 0,
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
          themeMenuActive: false,
          skipMouseEvent: false,
          modals:{
            selectedCFI: "",
            quickbarModal: {visible: false, x:0, y:0},
            noteModal: {visible: false, x:0, y:0}
          }
        }}
      // https://github.com/immerjs/immer/issues/389

      state[action.meta.arg.UID] = castDraft(t)
    })

    builder.addCase(SyncedAddRendition.fulfilled, (state, action) => {
      console.log("Fulfulled Initial Load")
    })
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
  ToggleThemeMenu,
  SetProgress,
  MoveQuickbarModal,
  MoveNoteModal,
  SetModalCFI,
  SkipMouseEvent,
  ShowNoteModal,
  HideNoteModal,
  HideQuickbarModal,
  AllowMouseEvent
} = bookState.actions

// type Getters<Type> = {
//   [Property in keyof typeof Type as `bookState/${Capitalize<string & Property>}`]: number
// };
type bookStateActionNames = keyof typeof bookState.actions
type bookActionPaths = Record<`bookState/${bookStateActionNames}`, string>; 



export const ActionNames = ((Object.keys(bookState.actions) as Array<keyof typeof bookState>).map((name)=>"bookState/" + name).reduce((a, v) => ({ ...a, [v]: v}),
  {}) as bookActionPaths)

export const SyncedDataActions = new Set([
  ActionNames['bookState/AddHighlight'],
  ActionNames['bookState/ChangeHighlightColor'],
  ActionNames['bookState/SetProgress']
])

// satisfies Record<Colors, unknown>;



export default bookState.reducer