import { PayloadAction } from "@reduxjs/toolkit"
import { epubjs_reducer } from "@store/slices/EpubJSBackend/epubjsManager.d"
import { highlightAction, bookmarkAction, progressUpdate } from "./dataManager.d"



const AddHighlight:epubjs_reducer = (state, action: PayloadAction<highlightAction>) =>{
  state[action.payload.view].data.highlights[action.payload.highlightRange] = {color:action.payload.color, note:action.payload.note}
}
const ToggleBookmark:epubjs_reducer = (state, action: PayloadAction<bookmarkAction>) =>{
  if(state[action.payload.view].data.bookmarks.has(action.payload.bookmarkLocation)){
    state[action.payload.view].data.bookmarks.delete(action.payload.bookmarkLocation)
  }else{
    state[action.payload.view].data.bookmarks.add(action.payload.bookmarkLocation)
  }
}
const DeleteHighlight:epubjs_reducer = (state, action: PayloadAction<highlightAction>) =>{
  delete state[action.payload.view].data.highlights[action.payload.highlightRange]
}
const ChangeHighlightColor:epubjs_reducer = (state, action: PayloadAction<highlightAction>) =>{
  console.log(action.payload.highlightRange)
  console.log(JSON.stringify(state[action.payload.view].data.highlights[action.payload.highlightRange]))
  console.log(state[action.payload.view].data.highlights[action.payload.highlightRange])
  state[action.payload.view].data.highlights[action.payload.highlightRange] = {color:action.payload.color, note:state[action.payload.view].data.highlights[action.payload.highlightRange].note}
}
const ChangeHighlightNote:epubjs_reducer = (state, action: PayloadAction<highlightAction>) =>{
  state[action.payload.view].data.highlights[action.payload.highlightRange] = {color:state[action.payload.view].data.highlights[action.payload.highlightRange].color, note:action.payload.note}
}
const SetProgress:epubjs_reducer = (state, action: PayloadAction<progressUpdate>) =>{
  state[action.payload.view].data.progress = action.payload.progress
  state[action.payload.view].data.cfi = action.payload.cfi

}


export const actions = {
  AddHighlight,
  ToggleBookmark,
  DeleteHighlight,
  ChangeHighlightColor,
  ChangeHighlightNote,
  SetProgress
}