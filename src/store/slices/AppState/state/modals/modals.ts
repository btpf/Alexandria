import { PayloadAction } from "@reduxjs/toolkit"
import { appStateReducer, appStateReducerSingle } from "@store/slices/appState"
import { WritableDraft } from "immer/dist/internal"

import { BookInstances } from "../../../bookStateTypes"
import { MoveModalAction, MoveModalCFIAction } from "./modalsTypes"



const MoveQuickbarModal:appStateReducer = (state, action: PayloadAction<MoveModalAction>) =>{
  state.state.modals.quickbarModal = {x: action.payload.x, y:action.payload.y, visible: action.payload.visible}
}
const HideQuickbarModal:appStateReducerSingle = (state) =>{
  state.state.modals.quickbarModal.visible = false
}
const MoveNoteModal:appStateReducer = (state, action: PayloadAction<MoveModalAction>) =>{
  state.state.modals.noteModal = {x: action.payload.x, y:action.payload.y, visible: action.payload.visible}
}
const ShowNoteModal:appStateReducerSingle = (state) =>{
  state.state.modals.noteModal.visible = true
}
const HideNoteModal:appStateReducerSingle = (state) =>{
  state.state.modals.noteModal.visible = false
}
const SetModalCFI:appStateReducer = (state, action: PayloadAction<string>) =>{
  state.state.modals.selectedCFI = action.payload
}


export const actions = {
  MoveQuickbarModal,
  HideQuickbarModal,
  MoveNoteModal,
  ShowNoteModal,
  HideNoteModal,
  SetModalCFI
}