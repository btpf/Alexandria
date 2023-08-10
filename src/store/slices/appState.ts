import { createSlice, current, PayloadAction } from '@reduxjs/toolkit'
import { WritableDraft } from 'immer/dist/internal';
import {Theme} from './EpubJSBackend/data/theme/themeManager.d'
import {actions as globalThemeActions} from './AppState/globalThemes'
import {actions as stateActions} from './AppState/state'
import { defaultAppState } from './appStateTypes';
import { BaseThemeDark, BaseThemeLight } from './AppState/globalThemes';
import { setThemeThunk } from './EpubJSBackend/data/theme/themeManager';



export type appStateReducer = (state: WritableDraft<defaultAppState>, action: PayloadAction<any>) => any
export type appStateReducerSingle = (state: WritableDraft<defaultAppState>) => any


const initialState: defaultAppState = {
  themes:{
    "Default Dark":BaseThemeDark,
    "Default Light":BaseThemeLight
  },
  selectedTheme: "Default Light",
  sortBy:"title",
  sortDirection:"ASC",
  state:{
    fullscreen: false
  }
}

type SortPayload = {
  sortDirection:string,
  sortBy:string
}

export const appState = createSlice({
  name: 'appState',
  initialState,
  reducers: {
    // ...readerThemeActions,
    ...globalThemeActions,
    ...stateActions,
    SetSortSettings:(state, action: PayloadAction<SortPayload>) =>{
      state.sortDirection = action.payload.sortDirection
      state.sortBy = action.payload.sortBy
    }
    

  },
  extraReducers(builder) {
    builder.addCase(setThemeThunk.pending, (state, action)=>{
      state.selectedTheme = action.meta.arg.themeName
    })
  },
})

// Action creators are generated for each case reducer function
export const { 
  // AddReaderTheme,
  // RenameReaderTheme,
  // LoadReaderThemes,
  // DeleteReaderTheme,
  // UpdateReaderTheme,
  /* Global Theme Actions */
  AddTheme,
  RenameTheme,
  DeleteTheme,
  UpdateTheme,
  setSelectedTheme,
  LoadThemes,

  SetFullScreen,
  SetSortSettings
} = appState.actions

export default appState.reducer