import { createSlice, current, PayloadAction } from '@reduxjs/toolkit'
import { WritableDraft } from 'immer/dist/internal';
import {Theme} from './EpubJSBackend/data/theme/themeManager.d'
import {actions as readerThemeActions, BaseReaderThemeDark, BaseReaderThemeLight} from './AppState/readerThemes';
import {actions as globalThemeActions} from './AppState/globalThemes'
import { defaultAppState } from './appStateTypes';
import { BaseGlobalThemeDark, BaseGlobalThemeLight } from './AppState/globalThemes';



export type appStateReducer = (state: WritableDraft<defaultAppState>, action: PayloadAction<any>) => any
export type appStateReducerSingle = (state: WritableDraft<defaultAppState>) => any


const initialState: defaultAppState = {
  themes:{
    "Default Light": BaseReaderThemeLight,
    "Default Dark": BaseReaderThemeDark,
  },
  globalThemes:{
    "Default Dark":BaseGlobalThemeDark,
    "Default Light":BaseGlobalThemeLight
  },
  selectedGlobalTheme: "Default Dark"
}


export const appState = createSlice({
  name: 'appState',
  initialState,
  reducers: {
    ...readerThemeActions,
    ...globalThemeActions
  }
})

// Action creators are generated for each case reducer function
export const { 
  AddReaderTheme,
  RenameReaderTheme,
  LoadReaderThemes,
  DeleteReaderTheme,
  UpdateReaderTheme,
  /* Global Theme Actions */
  AddGlobalTheme,
  RenameGlobalTheme,
  DeleteGlobalTheme,
  UpdateGlobalTheme,
  setSelectedGlobalTheme,
  LoadGlobalThemes
} = appState.actions

export default appState.reducer