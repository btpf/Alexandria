import { configureStore } from '@reduxjs/toolkit'
import bookState from './slices/bookState'
import SyncedDataActions from './syncedActions'
import counterSlice from './slices/counterSlice'
import appState from './slices/appState'

import {enableMapSet} from "immer"
import { invoke } from '@tauri-apps/api'
import { LOADSTATE } from './slices/constants'
import { bookStateStructure } from './slices/EpubJSBackend/epubjsManager.d'

enableMapSet()

const store =  configureStore({
  reducer: {
    counter: counterSlice,
    appState,
    bookState
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        // This is done since the redux state will only be set once with the rendition and is an 'isolated app'
        // Isolated since state and react does not directly influence it's rendering. Only library calls do.
        // See:
        // https://redux.js.org/style-guide/#do-not-put-non-serializable-values-in-state-or-actions
        // https://redux-toolkit.js.org/usage/usage-guide#working-with-non-serializable-data
        // https://stackoverflow.com/questions/66733221/how-should-react-redux-work-with-non-serializable-data
        // Although it will break dev tools, and is against the recommendation of markerikson, I believe this approach
        // is "correct" enough
        ignoredActions: ['bookState/AddRendition', 'bookState/AddBookmark'],
        ignoredPaths: ['bookState.0.instance', 'bookState.1.instance', 'bookState.0.data.bookmarks']
      },
    }).concat(storeAPI => next => action => {
      
      next(action)
      if(SyncedDataActions.has(action.type)){
        const currentState = storeAPI.getState()
        if(action.type.includes("bookState")){

          console.log("Synced bookState Action:", action)
          const currentBook:bookStateStructure = currentState.bookState[0]
          const bookUID = currentBook.hash
  
  
          // Only save the data if the book is done with it's loading phase
          // During the loading phase, all sorts of synced actions will get called, but this is only the initial population,
          // And nothing here should be saved.
          if(window.__TAURI__ && currentBook.loadState == LOADSTATE.COMPLETE){
            const saveData = {
              title: currentBook.title,
              data:{
                progress: currentBook.data.progress,
                bookmarks: Array.from(currentBook.data.bookmarks),
                highlights: currentBook.data.highlights,
                theme:{...currentBook.data.theme}
              }
            }
            console.log("This is the save data: ")
            console.log(saveData)
            invoke("update_data_by_hash", {payload:saveData, hash: currentBook.hash})
          }

        }else if (action.type.includes("appState")){
          console.log("Synced App State")
          console.log(currentState.appState.themes)
          invoke("set_reader_themes", {payload:currentState.appState.themes})
          invoke("set_global_themes", {payload:currentState.appState.globalThemes})
          invoke("set_settings", {payload:{selectedGlobalTheme: currentState.appState.selectedGlobalTheme}})
        }
        

      }



    }),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

export default store