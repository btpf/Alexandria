import { configureStore } from '@reduxjs/toolkit'
import bookState from './slices/bookStateSlice'
import counterSlice from './slices/counterSlice'
import profileSlice from './slices/profileSlice'

import {enableMapSet} from "immer"

enableMapSet()

const store =  configureStore({
  reducer: {
    counter: counterSlice,
    profile: profileSlice,
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
    }),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

export default store