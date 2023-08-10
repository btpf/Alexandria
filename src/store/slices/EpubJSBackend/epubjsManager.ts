import { ActionReducerMapBuilder, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import { invoke } from "@tauri-apps/api"
import { castDraft } from "immer"
import { CalculateBoxPosition, NOTE_MODAL_HEIGHT, NOTE_MODAL_WIDTH } from "src/routes/Reader/ReaderView/functions/ModalUtility"
// import { bookState } from "../bookStateSlice"
import { bookState, setReaderMargins, setRenderMode } from "../bookState"


// import { bookState } from "../bookStateSlice"
import { BackendInstance, BookInstances } from "../bookStateTypes"
import { LOADSTATE } from "../constants"
import { bookStateHydrationStructure, bookStateStructure, dataInterface, loadProgressUpdate } from "./epubjsManager.d"

import { epubjs_reducer } from "@store/slices/EpubJSBackend/epubjsManager.d"
import { setFontThunk, setLineHeightThunk, setThemeThunk, setWordSpacingThunk } from "./data/theme/themeManager"
import { RootState } from "@store/store"

export type SyncedAddRenditionPayload = {firstLoad?:boolean, saveData:bookStateHydrationStructure} & BackendInstance

export const SyncedAddRendition = createAsyncThunk(
  'bookState/SyncedAddRendition',
  // if you type your function argument here
  async (renditionData: SyncedAddRenditionPayload, thunkAPI) => {

    // This prevents any data from loading if this is the first time
    // the book was opened.
    if(renditionData.firstLoad){
      return
    }
    // console.log("ASYNC CALLED 1")
    if(window.__TAURI__){

      const bookmarks = renditionData.saveData.data.bookmarks
      const highlights = renditionData.saveData.data.highlights
      
      const renditionInstance = renditionData.instance
      
      for (const [cfiRange, value] of Object.entries(highlights)) {
        thunkAPI.dispatch(bookState.actions.AddHighlight({highlightRange:cfiRange, color:value.color, note:value.note, view:0}))
      
        renditionInstance.annotations.highlight(cfiRange,{}, (e:MouseEvent) => {
      
          // This will prevent page turning when clicking on highlight
          thunkAPI.dispatch(bookState.actions.SkipMouseEvent(0))
      

          const boundingBox = renditionInstance.getRange(cfiRange).getBoundingClientRect()
          const {x, y} = CalculateBoxPosition(
            renditionInstance,
            cfiRange,
            NOTE_MODAL_WIDTH,
            NOTE_MODAL_HEIGHT)
                
          thunkAPI.dispatch(bookState.actions.SetModalCFI({view:0,selectedCFI:cfiRange}))
          thunkAPI.dispatch(bookState.actions.MoveNoteModal({
            view: 0,
            x,
            y,
            visible: true
          }))
      
                
        }, '', {fill:value.color});
      }

      bookmarks.forEach((bookmark)=>{
        thunkAPI.dispatch(bookState.actions.ToggleBookmark({
          view: 0,
          bookmarkLocation: bookmark
        }))
      })
      
      thunkAPI.dispatch(bookState.actions.SetProgress({view:0, progress:renditionData.saveData.data.progress, cfi: renditionData.saveData.data.cfi}))

      
      await thunkAPI.dispatch(setFontThunk({
        view: 0,
        font: renditionData.saveData.data.theme.font,
        fontSize: renditionData.saveData.data.theme.fontSize,
        fontWeight: renditionData.saveData.data.theme.fontWeight
      }))

      await thunkAPI.dispatch(setLineHeightThunk({
        view:0,
        value: renditionData.saveData.data.theme.lineHeight
      }))

      await thunkAPI.dispatch(setWordSpacingThunk({
        view:0,
        value: renditionData.saveData.data.theme.wordSpacing
      }))

      await thunkAPI.dispatch(setReaderMargins({
        view:0,
        value: renditionData.saveData.data.theme.readerMargins
      }))

    }
          
    return true
  }
)



export const RenditionBuilder = (builder:ActionReducerMapBuilder<BookInstances>) =>{
  builder.addCase(SyncedAddRendition.pending, (state, action) => {
    const readerMarginsToUse = action?.meta?.arg?.saveData?.data?.theme?.readerMargins ? action.meta.arg.saveData.data.theme.readerMargins: 100
    const renderModeToUse = action?.meta?.arg?.saveData?.data?.theme?.renderMode ? action.meta.arg.saveData.data.theme.renderMode: "default"
    const t:bookStateStructure = {
      title: action.meta.arg.saveData.title || action.meta.arg.instance.book.packaging.metadata.title,
      author: action.meta.arg.saveData.author || action.meta.arg.instance.book.packaging.metadata.creator,
      instance: action.meta.arg.instance,
      UID: action.meta.arg.UID, 
      hash: action.meta.arg.hash,
      loadState:action.meta.arg.initialLoadState? action.meta.arg.initialLoadState:LOADSTATE.LOADING, 
      data:{
        progress: 0,
        cfi:"",
        highlights:{},
        bookmarks: new Set(), 
        theme:{
          font:"", 
          fontCache: "",
          fontSize:100,
          fontWeight: 400,
          wordSpacing: 0,
          lineHeight: 100,
          readerMargins: readerMarginsToUse,
          renderMode: renderModeToUse
        }
      }, 
      state:{
        isProgrammaticProgressUpdate: true, // For first load
        sidebarMenuSelected: false,
        menuToggled: true, 
        themeMenuActive: false,
        skipMouseEvent: false,
        dictionaryWord: "",
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

    switch (state[action.meta.arg.UID].loadState) {
    case LOADSTATE.BOOK_PARSING_COMPLETE:
      state[action.meta.arg.UID].loadState = LOADSTATE.COMPLETE
      break;
    case LOADSTATE.LOADING:
      state[action.meta.arg.UID].loadState = LOADSTATE.DATA_PARSING_COMPLETE
      break;
    }

  })
}
  


const SetLoadState:epubjs_reducer = (state, action: PayloadAction<loadProgressUpdate>) =>{
  if (Object.keys(state).includes(String(action.payload.view))){
    state[action.payload.view].loadState = action.payload.state
  }

}

export const actions = {
  SetLoadState
}