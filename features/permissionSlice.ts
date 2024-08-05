import { PermissionModel } from "@/models/permission.model";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface PermissionsState {
  permissions: PermissionModel;
}

const initialState: PermissionsState = {
  permissions: <PermissionModel>{},
};

export const permissionSlice = createSlice({
  name: "permission_slice",
  initialState,
  reducers: {
    resetPermissions: (state) => {
      state.permissions = <PermissionModel>{};
    },
    setPermissions: (state, action: PayloadAction<PermissionModel>) => {
      state.permissions = action.payload;
    },
  },
});

export const { resetPermissions, setPermissions } = permissionSlice.actions;

export default permissionSlice.reducer;
