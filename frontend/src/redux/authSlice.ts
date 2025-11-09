import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type RootState } from './store';

// Define una interfaz más específica para el usuario
interface User {
  id?: number;
  first_name: string;
  last_name?: string;
  email: string;
  username?: string;
  language?: string;
  // Agrega otros campos que devuelva tu API
}

interface AuthState {
  user: User | null;
  token: string | null;
  language: string;
}

const initialState: AuthState = {
  user: null,
  token: null,
  language: 'es',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      { payload: { user, token } }: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = user;
      state.token = token;
      state.language = user.language || 'es';
    },
    logOut: (state) => {
      state.user = null;
      state.token = null;
      state.language = 'es';
    },
    updateLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
  },
});

export const { setCredentials, logOut, updateLanguage } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectCurrentToken = (state: RootState) => state.auth.token;