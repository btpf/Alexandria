import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Rendition } from 'epubjs-myh'
import { castDraft, castImmutable } from 'immer'


interface bookState{
  instance: Rendition,
  options:{
    sidebarToggled: boolean,
    menuToggled: boolean
  }
}


// Define the initial state using that type
const initialState: Array<bookState> = []

export const bookState = createSlice({
  name: 'bookState',
  initialState,
  reducers: {
    AddRendition: (state, action: PayloadAction<Rendition>) => {
      const t:bookState = {instance: action.payload, options:{sidebarToggled: false, menuToggled: false}}
      // https://github.com/immerjs/immer/issues/389
      state.push(castImmutable(t))
    },
    ToggleSidebar: (state, action: PayloadAction<number>) =>{
      state[action.payload].options.sidebarToggled = !state[action.payload].options.sidebarToggled
    },
    ToggleMenu: (state, action: PayloadAction<number>) =>{
      state[action.payload].options.menuToggled = !state[action.payload].options.menuToggled
    }
  },
})

// Action creators are generated for each case reducer function
export const { AddRendition, ToggleSidebar, ToggleMenu } = bookState.actions

export default bookState.reducer