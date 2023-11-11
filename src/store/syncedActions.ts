import {bookState} from "./slices/bookState";
import {appState} from './slices/appState'

type AppStateActionNames = (keyof typeof appState.actions) 
type completeAppStateActionNames = `appState/${AppStateActionNames}`

// This line is to generate the valid types which simply populated autocomplete
type bookStateActionNames = keyof typeof bookState.actions | 
'setThemeV2/fulfilled' | 
'setFontV2/fulfilled' |
'setWordSpacing/fulfilled' |
'setLineHeight/fulfilled' |
'setParagraphSpacing/fulfilled'|
'setTextAlignment/fulfilled'

type completeBookStateActionNames = `bookState/${bookStateActionNames}`

// All synced actions, including fulfilled thunks, should be added here
export default new Set<completeAppStateActionNames|completeBookStateActionNames>([
  "bookState/AddHighlight",
  "bookState/ToggleBookmark",
  "bookState/ChangeHighlightColor",
  "bookState/ChangeHighlightNote",
  "bookState/DeleteHighlight",
  "bookState/SetProgress",
  "bookState/setThemeV2/fulfilled",
  "bookState/setFontV2/fulfilled",
  "appState/AddTheme",
  "appState/DeleteTheme",
  "appState/UpdateTheme",
  "appState/RenameTheme",
  "appState/setSelectedTheme",
  'bookState/setWordSpacing/fulfilled',
  'bookState/setLineHeight/fulfilled',
  'bookState/setParagraphSpacing/fulfilled',
  "bookState/setRenderMode",
  "appState/SetSortSettings",
  "bookState/setTextAlignment/fulfilled"
])
