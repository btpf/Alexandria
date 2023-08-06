import { ActionReducerMapBuilder, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import { invoke } from "@tauri-apps/api"
import { castDraft } from "immer"
import { CalculateBoxPosition, NOTE_MODAL_HEIGHT, NOTE_MODAL_WIDTH } from "src/routes/Reader/ReaderView/functions/ModalUtility"
// import { bookState } from "../bookStateSlice"
import { bookState, setRenderMode } from "../bookState"


// import { bookState } from "../bookStateSlice"
import { BackendInstance, BookInstances } from "../bookStateTypes"
import { LOADSTATE } from "../constants"
import { bookStateStructure, dataInterface, loadProgressUpdate } from "./epubjsManager.d"

import { epubjs_reducer } from "@store/slices/EpubJSBackend/epubjsManager.d"
import { setFontThunk, setThemeThunk } from "./data/theme/themeManager"
import { RootState } from "@store/store"



export const SyncedAddRendition = createAsyncThunk(
  'bookState/SyncedAddRendition',
  // if you type your function argument here
  async (renditionData: BackendInstance, thunkAPI) => {


    // console.log("ASYNC CALLED 1")
    if(window.__TAURI__){
      // invoke("get_books").then((data)=>{
      //   setBooks((data as BookData[]))
      // })
      
      // console.log(thunkAPI.getState())
      // thunkAPI.dispatch(AddHighlight(highlightData))
      // console.log(thunkAPI.getState())
      
      // Eventually, this should match bookStateStructure.data

      type dataInterfacePayload = {data: dataInterface}
      let result:dataInterfacePayload;

      try {
        result = await invoke("load_book_data", {checksum: renditionData.hash})
      } catch (error) {
        if(error == "First Read"){
          console.log("First Read, Populating with default data")

          // In the case where nothing else is set, at least set the theme to the globally selected one.
          thunkAPI.dispatch(setThemeThunk({
            view: 0,
            themeName: (thunkAPI.getState() as RootState).appState.selectedTheme
          }))

          return
        }
        console.log("Error Caught in invoke Load_book_data:", error)
        return 
      }
         
      
      // if(result.data.theme.renderMode && result.data.theme.renderMode != renditionData.renderMode){
      //   thunkAPI.dispatch(setRenderMode({view:0, renderMode: result.data.theme.renderMode}))
      //   return
      // }



      const bookmarks = result.data.bookmarks
      const highlights = result.data.highlights
      
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
      
      thunkAPI.dispatch(bookState.actions.SetProgress({view:0, progress:result.data.progress, cfi: result.data.cfi}))

      
      thunkAPI.dispatch(setFontThunk({
        view: 0,
        font: result.data.theme.font,
        fontSize: result.data.theme.fontSize,
        fontWeight: result.data.theme.fontWeight
      }))


    }
          
    return true
  }
)



export const RenditionBuilder = (builder:ActionReducerMapBuilder<BookInstances>) =>{
  builder.addCase(SyncedAddRendition.pending, (state, action) => {
    console.log("PENDING CASE")
    const t:bookStateStructure = {
      title: action.meta.arg.title,
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
          readerMargins: action.meta.arg.readerMargins? action.meta.arg.readerMargins: 100,
          renderMode: action.meta.arg.renderMode?action.meta.arg.renderMode: "default"
        }
      }, 
      state:{
        isProgrammaticProgressUpdate: false,
        sidebarMenuSelected: false,
        menuToggled: false, 
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