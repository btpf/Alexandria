import { configureStore } from '@reduxjs/toolkit'
import bookState from './slices/bookStateSlice'
import counterSlice from './slices/counterSlice'
import profileSlice from './slices/profileSlice'

const store =  configureStore({
  reducer: {
    counter: counterSlice,
    profile: profileSlice,
    bookState
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

export default store