import { ActionReducerMapBuilder, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import { castDraft } from "immer"
import { CalculateBoxPosition, NOTE_MODAL_HEIGHT, NOTE_MODAL_WIDTH } from "src/routes/Reader/ReaderView/functions/ModalUtility"
// import { bookState } from "../bookStateSlice"
import { bookState } from "../bookState"


// import { bookState } from "../bookStateSlice"
import { BackendInstance, BookInstances } from "../bookStateTypes"
import { LOADSTATE } from "../constants"
import { bookStateHydrationStructure, bookStateStructure, loadProgressUpdate } from "./epubjsManager.d"

import { epubjs_reducer } from "@store/slices/EpubJSBackend/epubjsManager.d"
import { setFontThunk, setLineHeightThunk, setParagraphSpacingThunk, setTextAlignmentThunk, setThemeThunk, setWordSpacingThunk } from "./data/theme/themeManager"
import { RootState } from "@store/store"
import { MoveNoteModal, SetModalCFI } from "../appState"

export type SyncedAddRenditionPayload = {firstLoad?:boolean, saveData:bookStateHydrationStructure} & BackendInstance

export const SyncedAddRendition = createAsyncThunk(
  'bookState/SyncedAddRendition',
  // if you type your function argument here
  async (renditionData: SyncedAddRenditionPayload, thunkAPI) => {

    // This prevents any data from loading if this is the first time
    // the book was opened.
    if(renditionData.firstLoad){
      // In the case where nothing else is set, at least set the theme to the globally selected one.
      thunkAPI.dispatch(setThemeThunk({
        view: renditionData.UID,
        themeName: (thunkAPI.getState() as RootState).appState.selectedTheme
      }))

      return
    }
    // console.log("ASYNC CALLED 1")
    if(window.__TAURI__){

      const bookmarks = renditionData.saveData.data.bookmarks
      const highlights = renditionData.saveData.data.highlights
      
      const renditionInstance = renditionData.instance
      
      for (const [cfiRange, value] of Object.entries(highlights)) {
        thunkAPI.dispatch(bookState.actions.AddHighlight({highlightRange:cfiRange, color:value.color, note:value.note, view:renditionData.UID}))
      
        renditionInstance.annotations.highlight(cfiRange,{}, (e:MouseEvent) => {
      
          // This will prevent page turning when clicking on highlight
          thunkAPI.dispatch(bookState.actions.SkipMouseEvent(renditionData.UID))
      

          const boundingBox = renditionInstance.getRange(cfiRange).getBoundingClientRect()
          const {x, y} = CalculateBoxPosition(
            renditionInstance,
            cfiRange,
            NOTE_MODAL_WIDTH,
            NOTE_MODAL_HEIGHT)
                
          thunkAPI.dispatch(SetModalCFI(cfiRange))
          thunkAPI.dispatch(MoveNoteModal({
            view: renditionData.UID,
            x,
            y,
            visible: true
          }))
      
                
        }, '', {fill:value.color});
      }

      bookmarks.forEach((bookmark)=>{
        thunkAPI.dispatch(bookState.actions.ToggleBookmark({
          view: renditionData.UID,
          bookmarkLocation: bookmark
        }))
      })
      
      thunkAPI.dispatch(bookState.actions.SetProgress({view:renditionData.UID, progress:renditionData.saveData.data.progress, cfi: renditionData.saveData.data.cfi}))

      
      await thunkAPI.dispatch(setFontThunk({
        view: renditionData.UID,
        font: renditionData.saveData.data.theme.font,
        fontSize: renditionData.saveData.data.theme.fontSize,
        fontWeight: renditionData.saveData.data.theme.fontWeight
      }))

      await thunkAPI.dispatch(setLineHeightThunk({
        view:renditionData.UID,
        value: renditionData.saveData.data.theme.lineHeight
      }))

      await thunkAPI.dispatch(setWordSpacingThunk({
        view:renditionData.UID,
        value: renditionData.saveData.data.theme.wordSpacing
      }))
      await thunkAPI.dispatch(setParagraphSpacingThunk({
        view:renditionData.UID,
        value: renditionData.saveData.data.theme.paragraphSpacing
      }))

      await thunkAPI.dispatch(setTextAlignmentThunk({
        view:renditionData.UID,
        value: renditionData.saveData.data.theme.textAlign
      }))

    }
          
    return true
  }
)



export const RenditionBuilder = (builder:ActionReducerMapBuilder<BookInstances>) =>{
  builder.addCase(SyncedAddRendition.pending, (state, action) => {
    // const readerMarginsToUse = action?.meta?.arg?.saveData?.data?.theme?.readerMargins ? action.meta.arg.saveData.data.theme.readerMargins: 75
    const renderModeToUse = action?.meta?.arg?.saveData?.data?.theme?.renderMode ? action.meta.arg.saveData.data.theme.renderMode: "default"
    const t:bookStateStructure = {
      title: action.meta.arg.saveData.title || action.meta.arg.instance.book.packaging.metadata.title,
      author: action.meta.arg.saveData.author || action.meta.arg.instance.book.packaging.metadata.creator,
      modified: action.meta.arg.saveData.modified || Date.now(),
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
          lineHeight: 0.9,
          paragraphSpacing: -1,
          textAlign: "default",
          // readerMargins: readerMarginsToUse,
          renderMode: renderModeToUse
        }
      }, 
      state:{
        isProgrammaticProgressUpdate: false,
        skipMouseEvent: false,
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