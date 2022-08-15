import { createSlice, PayloadAction } from '@reduxjs/toolkit'


interface profileState {
  name: string,
  age: number
}

// Define the initial state using that type
const initialState: profileState = {
  name: "untitled",
  age: -1
}

export const profile = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setDetails: (state, action: PayloadAction<profileState>) =>{
      state.name = action.payload.name
      state.age = action.payload.age
    }
  },
})

// Action creators are generated for each case reducer function
export const { setDetails } = profile.actions

export default profile.reducer