import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Rendition } from 'epubjs-myh'
import { castDraft, castImmutable } from 'immer'


interface bookState{
  instance: Rendition,
  state:{
    sidebarToggled: boolean,
    menuToggled: boolean
  }
  data:{
    highlights:{[cfiRange:string]:highlightData}
  }
}

interface highlightData {
  color: string,
  note: string
}

interface highlightAction extends highlightData {
  view: number,
  highlightRange: string
}


// Define the initial state using that type
const initialState: Array<bookState> = []

export const bookState = createSlice({
  name: 'bookState',
  initialState,
  reducers: {
    AddRendition: (state, action: PayloadAction<Rendition>) => {
      const t:bookState = {instance: action.payload, data:{highlights:{}}, state:{sidebarToggled: false, menuToggled: false}}
      // https://github.com/immerjs/immer/issues/389
      state.push(castImmutable(t))
    },
    ToggleSidebar: (state, action: PayloadAction<number>) =>{
      state[action.payload].state.sidebarToggled = !state[action.payload].state.sidebarToggled
    },
    ToggleMenu: (state, action: PayloadAction<number>) =>{
      state[action.payload].state.menuToggled = !state[action.payload].state.menuToggled
    },
    AddHighlight: (state, action: PayloadAction<highlightAction>) =>{
      state[action.payload.view].data.highlights[action.payload.highlightRange] = {color:action.payload.color, note:""}
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
export const { AddRendition, DeleteHighlight, ToggleSidebar, ToggleMenu, AddHighlight, ChangeHighlightColor, ChangeHighlightNote } = bookState.actions

export default bookState.reducer