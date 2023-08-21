import { PayloadAction } from "@reduxjs/toolkit"
import { epubjs_reducer } from "@store/slices/EpubJSBackend/epubjsManager.d"
import { SetDictionaryWordPayload, sideBarUpdate } from "./stateManager.d";


type ProgrammaticProgressUpdatePayload = {
  view: number,
  state: boolean
}

const setProgrammaticProgressUpdate:epubjs_reducer =(state, action: PayloadAction<ProgrammaticProgressUpdatePayload>) =>{
  state[action.payload.view].state.isProgrammaticProgressUpdate = action.payload.state
}

const SkipMouseEvent:epubjs_reducer = (state, action: PayloadAction<number>) =>{
  console.log("Next event will be skipped")
  state[action.payload].state.skipMouseEvent = true;
}

const AllowMouseEvent:epubjs_reducer = (state, action: PayloadAction<number>) =>{
  state[action.payload].state.skipMouseEvent = false;
}





export const actions = {
  SkipMouseEvent,
  AllowMouseEvent,
  setProgrammaticProgressUpdate
}