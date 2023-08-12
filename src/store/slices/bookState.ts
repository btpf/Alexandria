import { ActionReducerMapBuilder, createAction, createSlice, current, isAnyOf, PayloadAction } from '@reduxjs/toolkit'
import {BookInstances} from './bookStateTypes'

import {actions as modalActions} from './EpubJSBackend/state/modals/modals';
import {actions as stateActions} from './EpubJSBackend/state/stateManager';
import {actions as dataActions} from './EpubJSBackend/data/dataManager';
import {actions as epubjsManagerActions, RenditionBuilder} from './EpubJSBackend/epubjsManager';
import {actions as themeManagerActions, setFontThunk, setLineHeightThunk, setThemeThunk, setWordSpacingThunk} from './EpubJSBackend/data/theme/themeManager';

// Define the initial state using that type
const initialState: BookInstances = {}


const uuid = require("uuid");


const ThemeBuilder = (builder: ActionReducerMapBuilder<BookInstances>) =>{
  // This should take the following design for action

  // {
  //   View: View Number,
  //   theme: Basic theme details which are modified
  //   themeBase: the base theme css
  // }

  // This pending case is needed because when initially loading the book
  // Two thunks, setTheme and setFont are called
  // SetFontThunk will execute before setThemeThunk has been fulfilled
  // It will then override the theme with the default one, since it has not been set
  builder.addCase(setThemeThunk.pending, (state, action)=>{
    state[action.meta.arg.view].data.theme.themeName = action.meta.arg.themeName
  })

  builder.addCase(setWordSpacingThunk.pending, (state, action)=>{
    state[action.meta.arg.view].data.theme.wordSpacing = action.meta.arg.value
  })
  builder.addCase(setLineHeightThunk.pending, (state, action)=>{
    state[action.meta.arg.view].data.theme.lineHeight = action.meta.arg.value
  })

  builder.addMatcher(isAnyOf(setThemeThunk.fulfilled, setFontThunk.fulfilled, setWordSpacingThunk.fulfilled, setLineHeightThunk.fulfilled), (state, action)=>{
    const theme = action.payload.themeBase
    // line-height is facing an issue. When navigating backwards to a from a chapter to the previous
    // Sometimes, you will jump to a page which is not the last.
    let css = 
    `body{
      background-color: ${theme.reader.body.background} !important;
      color: ${theme.reader.body.color} !important;
      font-family: "${action.payload.theme.font}" !important;
      font-size: ${action.payload.theme.fontSize}% !important;
      font-weight: ${action.payload.theme.fontWeight} !important;
      word-spacing: ${action.payload.theme.wordSpacing}% !important;
      line-height: ${action.payload.theme.lineHeight}% !important;
    }
    p{
      font-family: "${action.payload.theme.font}" !important;
      font-size: ${action.payload.theme.fontSize}% !important;
      font-weight: ${action.payload.theme.fontWeight} !important;
      word-spacing: ${action.payload.theme.wordSpacing}% !important;
    }
    a{
      color: ${theme.reader.body.link};
      text-decoration: none;
    }
    img{
        ${theme.reader.image.invert? "filter: invert(100%);":""}
        ${theme.reader.image.mixBlendMode? `mix-blend-mode: ${theme.reader.image.mixBlendMode};`:""}
      }
    `

    // img{
    //   filter: invert(100%);
    //   mix-blend-mode: difference;
    //   mix-blend-mode: screen;
    // }
    css += action.payload.theme.fontCache

    state[action.payload.view].data.theme = {...action.payload.theme}

    const id = uuid.v4();
    // Register Theme object
    state[action.payload.view].instance.themes.registerCss(id,css);
    // state[action.payload.view].instance.themes.registerRules(id + "WOW", {body:{color:theme.body.color, background:theme.body.background}});
    // Select Theme
    state[action.payload.view].instance.themes.select(id)
  
    
  })
}

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
    RenditionBuilder(builder)
    ThemeBuilder(builder)
  },
})

// export const {SyncedAddRendition} = asyncActions(bookState).thunks


const actions = bookState.actions;
// Action creators are generated for each case reducer function
export const { 
  RemoveRendition,
  SetLoadState, 

  /* themeManager */
  // SetFont,
  // SetTheme,
  setRenderMode,
  setReaderMargins,

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
  SetDictionaryWord,
  setProgrammaticProgressUpdate,
  
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