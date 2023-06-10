import {bookState} from "./slices/bookState";
import {appState} from './slices/appState'


type AppStateActionNames = keyof typeof appState.actions
type completeAppStateActionNames = `appState/${AppStateActionNames}`

type bookStateActionNames = keyof typeof bookState.actions

type completeBookStateActionNames = `bookState/${bookStateActionNames}`



export default new Set<completeAppStateActionNames|completeBookStateActionNames>([
  "bookState/AddHighlight",
  "bookState/ChangeHighlightColor",
  "bookState/ChangeHighlightNote",
  "bookState/DeleteHighlight",
  "bookState/SetProgress",
  "appState/AddTheme",
  "appState/RenameTheme",
  "appState/UpdateTheme",
  "appState/DeleteTheme"
])
