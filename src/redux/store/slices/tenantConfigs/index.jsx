import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tenantLabels: null,
};

export const tenantConfigSlice = createSlice({
  name: 'tenantConfigs',
  initialState,
  reducers: {
    setTenantLanguageData(state, { payload: data }) {
      state.tenantLabels = data;
    },
  },
});

export const { setTenantLanguageData } = tenantConfigSlice.actions;

export default tenantConfigSlice.reducer;
