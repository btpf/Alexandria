import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {BookInstances} from './bookStateTypes'

import {actions as modalActions} from './EpubJSBackend/state/modals/modals';
import {actions as stateActions} from './EpubJSBackend/state/stateManager';
import {actions as dataActions} from './EpubJSBackend/data/dataManager';
import {actions as epubjsManagerActions} from './EpubJSBackend/epubjsManager';
import {actions as themeManagerActions} from './EpubJSBackend/data/theme/themeManager';

import { builderFunc} from './EpubJSBackend/epubjsManager'

// Define the initial state using that type
const initialState: BookInstances = {}

export const bookState = createSlice({
  name: 'bookState',
  initialState,
  reducers: {
    RemoveRendition: (state, action: PayloadAction<number>) => {
      delete state[action.payload]
    },
   
 
    ...epubjsManagerActions,
    ...dataActions,
    ...modalActions,
    ...stateActions,
    ...themeManagerActions
    
  },

  extraReducers: (builder) => {
    builderFunc(builder)
  },
})

// export const {SyncedAddRendition} = asyncActions(bookState).thunks


const actions = bookState.actions;
// Action creators are generated for each case reducer function
export const { 
  RemoveRendition,
  SetLoadState, 

  /* themeManager */
  SetFont,
  SetTheme,

  /* dataManager */
  ToggleBookmark,
  DeleteHighlight, 
  AddHighlight, 
  ChangeHighlightColor, 
  ChangeHighlightNote, 
  SetProgress,

  /* state manager */
  SelectSidebarMenu,
  CloseSidebarMenu,
  ToggleMenu, 
  ToggleThemeMenu,
  SkipMouseEvent,
  AllowMouseEvent,
  
  /* Modals */
  MoveQuickbarModal,
  HideQuickbarModal,
  MoveNoteModal,
  ShowNoteModal,
  HideNoteModal,
  SetModalCFI
} = actions

export default bookState.reducer

export {SyncedAddRendition} from './EpubJSBackend/epubjsManager'