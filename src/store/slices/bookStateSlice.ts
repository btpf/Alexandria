import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Rendition } from 'epubjs-myh'
import { castDraft, castImmutable } from 'immer'


interface bookState{
  instance: Rendition,
  options:{
    sidebarToggled: boolean
  }
}


// Define the initial state using that type
const initialState: Array<bookState> = []

export const bookState = createSlice({
  name: 'bookState',
  initialState,
  reducers: {
    AddRendition: (state, action: PayloadAction<Rendition>) => {
      const t:bookState = {instance: action.payload, options:{sidebarToggled: false}}
      // https://github.com/immerjs/immer/issues/389
      state.push(castImmutable(t))
    },
  },
})

// Action creators are generated for each case reducer function
export const { AddRendition } = bookState.actions

export default bookState.reducer