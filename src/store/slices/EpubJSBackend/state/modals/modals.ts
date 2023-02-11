import { PayloadAction } from "@reduxjs/toolkit"
import { WritableDraft } from "immer/dist/internal"

import { BookInstances } from "../../../bookStateTypes"
import { MoveModalAction, MoveModalCFIAction } from "./modalsTypes"



const MoveQuickbarModal = (state:WritableDraft<BookInstances>, action: PayloadAction<MoveModalAction>) =>{
  state[action.payload.view].state.modals.quickbarModal = {x: action.payload.x, y:action.payload.y, visible: action.payload.visible}
}
const HideQuickbarModal = (state:WritableDraft<BookInstances>, action: PayloadAction<number>) =>{
  state[action.payload].state.modals.quickbarModal.visible = false
}
const MoveNoteModal = (state:WritableDraft<BookInstances>, action: PayloadAction<MoveModalAction>) =>{
  state[action.payload.view].state.modals.noteModal = {x: action.payload.x, y:action.payload.y, visible: action.payload.visible}
}
const ShowNoteModal = (state:WritableDraft<BookInstances>, action: PayloadAction<number>) =>{
  state[action.payload].state.modals.noteModal.visible = true
}
const HideNoteModal = (state:WritableDraft<BookInstances>, action: PayloadAction<number>) =>{
  state[action.payload].state.modals.noteModal.visible = false
}
const SetModalCFI = (state:WritableDraft<BookInstances>, action: PayloadAction<MoveModalCFIAction>) =>{
  state[action.payload.view].state.modals.selectedCFI = action.payload.selectedCFI
}


export const actions = {
  MoveQuickbarModal,
  HideQuickbarModal,
  MoveNoteModal,
  ShowNoteModal,
  HideNoteModal,
  SetModalCFI
}