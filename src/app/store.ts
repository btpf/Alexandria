import { configureStore } from '@reduxjs/toolkit'
import counterSlice from '../features/counterSlice'
import profileSlice from '../features/profileSlice'

const store =  configureStore({
  reducer: {
    counter: counterSlice,
    profile: profileSlice
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

export default store