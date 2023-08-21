import { createSlice, current, PayloadAction } from '@reduxjs/toolkit'
import { WritableDraft } from 'immer/dist/internal';
import {Theme} from './EpubJSBackend/data/theme/themeManager.d'
import {actions as globalThemeActions} from './AppState/globalThemes'
import {actions as stateActions} from './AppState/state/stateManager'
import { defaultAppState } from './appStateTypes';
import { BaseThemeDark, BaseThemeLight } from './AppState/globalThemes';
import { setThemeThunk } from './EpubJSBackend/data/theme/themeManager';
import {actions as modalActions} from './AppState/state/modals/modals';


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
  readerMargins: 75,
  state:{
    fullscreen: false,
    selectedRendition: 0,
    dualReaderMode: true,
    dictionaryWord: "",
    sidebarMenuSelected: false,
    menuToggled: true, 
    themeMenuActive: false,
    modals:{
      selectedCFI: "",
      quickbarModal: {visible: false, x:0, y:0},
      noteModal: {visible: false, x:0, y:0}
    }
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
    ...modalActions,
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
  SetSortSettings,
  SetSelectedRendition,
  setReaderMargins,

  /* State */
  SelectSidebarMenu,
  CloseSidebarMenu,
  ToggleMenu, 
  SetDictionaryWord,
  ToggleThemeMenu,

  /* Modals */
  MoveQuickbarModal,
  HideQuickbarModal,
  MoveNoteModal,
  ShowNoteModal,
  HideNoteModal,
  SetModalCFI,
} = appState.actions

export default appState.reducer