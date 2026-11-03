import { createSlice } from "@reduxjs/toolkit";


interface SearchState {
    query: string;
}

const initialState: SearchState = {
    query: "",
}

export const searchSlice = createSlice({
    name: "search",
    initialState,
    reducers: {
        setQuery : (state, action) => {
            state.query = action.payload;
        },
        clearSearchQuery: (state) => {
            state.query = "";
        }
    } 
})

export const { setQuery, clearSearchQuery } = searchSlice.actions;
export default searchSlice.reducer;