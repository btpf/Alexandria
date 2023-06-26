import {bookState} from "./slices/bookState";
import {appState} from './slices/appState'

type AppStateActionNames = (keyof typeof appState.actions) 
type completeAppStateActionNames = `appState/${AppStateActionNames}`

type bookStateActionNames = keyof typeof bookState.actions | 'setThemeV2/fulfilled'

type completeBookStateActionNames = `bookState/${bookStateActionNames}`

export default new Set<completeAppStateActionNames|completeBookStateActionNames>([
  "bookState/AddHighlight",
  "bookState/ChangeHighlightColor",
  "bookState/ChangeHighlightNote",
  "bookState/DeleteHighlight",
  "bookState/SetProgress",
  "bookState/setThemeV2/fulfilled",
  "bookState/SetFont",
  "appState/AddReaderTheme",
  "appState/RenameReaderTheme",
  "appState/UpdateReaderTheme",
  "appState/DeleteReaderTheme",
  "appState/AddGlobalTheme",
  "appState/DeleteGlobalTheme",
  "appState/UpdateGlobalTheme",
  "appState/RenameGlobalTheme",
  "appState/setSelectedGlobalTheme"
])
