"use client"
import { createSlice } from '@reduxjs/toolkit'

export const UserSlice = createSlice({
    name: "users",
    // initialState: {},
    initialState: {
        name: "",
        accountNO: "",
        phoneNo: "",
        isLoggedIn: false,
    },
    reducers: {
        updateName: (state, action) => {
            state.name = action.payload.name;
            return state;
        },
        updateAccountNo: (state, action) => {
            state.accountNO = action.payload.accountNO;
            return state;
        },
        updatePhoneNO: (state, action) => {
            state.phoneNo = action.payload.phoneNO;
            return state;
        },
        LogIn: (state) => {
            state.isLoggedIn = true;
            return state;
        },
        LogOut: (state) => {
            state.isLoggedIn = false;
            return state;
        },
        // updateUser: (state, action) => {
        //     return {
        //         ...state,
        //         ...action.payload,
        //     };
        // },
        
    },

});

export const { updateName, updateAccountNo,updatePhoneNO,LogIn,LogOut } = UserSlice.actions;
export default UserSlice.reducer;