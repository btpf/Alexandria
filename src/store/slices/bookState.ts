import { ActionReducerMapBuilder, createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit'
import {BookInstances} from './bookStateTypes'

import {actions as stateActions} from './EpubJSBackend/state/stateManager';
import {actions as dataActions} from './EpubJSBackend/data/dataManager';
import {actions as epubjsManagerActions, RenditionBuilder} from './EpubJSBackend/epubjsManager';
import {actions as themeManagerActions, setFontThunk, setLineHeightThunk, setParagraphSpacingThunk, setThemeThunk, setWordSpacingThunk, setTextAlignmentThunk} from './EpubJSBackend/data/theme/themeManager';

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
  builder.addCase(setParagraphSpacingThunk.pending, (state, action)=>{
    state[action.meta.arg.view].data.theme.paragraphSpacing = action.meta.arg.value
  })
  builder.addCase(setTextAlignmentThunk.pending, (state, action)=>{
    state[action.meta.arg.view].data.theme.textAlign = action.meta.arg.value
  })
  builder.addCase(setLineHeightThunk.pending, (state, action)=>{
    state[action.meta.arg.view].data.theme.lineHeight = action.meta.arg.value
  })

  builder.addMatcher(isAnyOf(setThemeThunk.fulfilled,setTextAlignmentThunk.fulfilled, setParagraphSpacingThunk.fulfilled, setFontThunk.fulfilled, setWordSpacingThunk.fulfilled, setLineHeightThunk.fulfilled), (state, action)=>{
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
      word-spacing: ${action.payload.theme.wordSpacing}px !important;
      line-height: ${action.payload.theme.lineHeight}% !important;
    }
    p{
      font-family: inherit !important;
      font-size: inherit !important;
      font-weight: inherit !important;
      word-spacing: inherit !important;
      
      background-color: inherit !important;
      color: inherit !important;
      ${action.payload.theme.paragraphSpacing >= 0? `margin-bottom: ${action.payload.theme.paragraphSpacing}px !important;`:""}
      ${action.payload.theme.textAlign == "default"?"":`text-align: ${action.payload.theme.textAlign} !important;`}
    }
    div{
      font-family: inherit !important;
      font-size: inherit !important;
      font-weight: inherit !important;
      word-spacing: inherit !important;

      background-color: inherit !important;
      color: inherit !important;
    }
    section{
      font-family: inherit !important;
      font-size: inherit !important;
      font-weight: inherit !important;
      word-spacing: inherit !important;

      background-color: inherit !important;
      color: inherit !important;
    }
    a{
      color: ${theme.reader.body.link} !important;
      text-decoration: none !important;
    }
    img{
        ${`filter: ${theme.reader.image.invert?"invert(100%)":"unset"};`}
        ${`mix-blend-mode: ${theme.reader.image.mixBlendMode?theme.reader.image.mixBlendMode:"unset"};`}
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
    console.log("REGISTERING CSS NAME")
    console.log(id)

    // Lets add code to remove the old theme

    // First we will remove the old theme from all views
    const contents = state[action.payload.view].instance.getContents()
    const oldThemeName = state[action.payload.view].instance.themes._current
    const themesObject = state[action.payload.view].instance.themes._themes
    contents.forEach((content)=>{

      const ThemeElement = content.document.getElementById("epubjs-inserted-css-" + oldThemeName)
      if(ThemeElement){
        ThemeElement.remove()
      }

    })
    // Then remove from _themes
    if(oldThemeName in themesObject){
      delete themesObject[oldThemeName]
    }


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

  /* dataManager */
  ToggleBookmark,
  DeleteHighlight, 
  AddHighlight, 
  ChangeHighlightColor, 
  ChangeHighlightNote, 
  SetProgress,

  /* state manager */
  SkipMouseEvent,
  AllowMouseEvent,
  setProgrammaticProgressUpdate,
  

} = actions

export default bookState.reducer

export {SyncedAddRendition} from './EpubJSBackend/epubjsManager'