import { createAction, createSlice, current, PayloadAction } from '@reduxjs/toolkit'
import {BookInstances} from './bookStateTypes'

import {actions as modalActions} from './EpubJSBackend/state/modals/modals';
import {actions as stateActions} from './EpubJSBackend/state/stateManager';
import {actions as dataActions} from './EpubJSBackend/data/dataManager';
import {actions as epubjsManagerActions} from './EpubJSBackend/epubjsManager';
import {actions as themeManagerActions, setThemeThunk} from './EpubJSBackend/data/theme/themeManager';

import { builderFunc} from './EpubJSBackend/epubjsManager'

// Define the initial state using that type
const initialState: BookInstances = {}


const uuid = require("uuid");


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
    builderFunc(builder),
    builder.addCase(setThemeThunk.fulfilled, (state, action)=>{
      const themeName = action.payload.themeName
      const rendition = state[action.payload.view].instance
      const theme = action.payload.theme
    
     
    
      // console.log(themeObject)
      // if(!themeObject){
      //   rendition.themes.select("default")
      //   // Force the current page to rerender
      //   // This will break entire project since .start() will also remove all event handlers
      //   if(rendition.manager){
      //     rendition.start();
      //   }
      //   return
      // }
      const id = uuid.v4();
      // Register Theme object
      state[action.payload.view].instance.themes.registerRules(id,theme);
      // Select Theme
      state[action.payload.view].instance.themes.select(id)
    
      state[action.payload.view].data.theme.themeName = themeName
      
    
    })
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
  // SetTheme,

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
  SetModalCFI,
} = actions

export default bookState.reducer

export {SyncedAddRendition} from './EpubJSBackend/epubjsManager'