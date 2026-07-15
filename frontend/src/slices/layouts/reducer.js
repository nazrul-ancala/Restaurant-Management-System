import { createSlice } from "@reduxjs/toolkit";
//constants
import {
  layoutTypes,
  leftSidebarTypes,
  layoutModeTypes,
  layoutWidthTypes,
  layoutPositionTypes,
  topbarThemeTypes,
  leftsidbarSizeTypes,
  leftSidebarViewTypes,
  leftSidebarImageTypes,
  preloaderTypes,
  sidebarVisibilitytypes
} from "../../Components/constants/layout";

export const LAYOUT_STORAGE_KEY = "rms_layout";

const defaultState = {
  layoutType: layoutTypes.VERTICAL,
  leftSidebarType: leftSidebarTypes.DARK,
  layoutModeType: layoutModeTypes.LIGHTMODE,
  layoutWidthType: layoutWidthTypes.FLUID,
  layoutPositionType: layoutPositionTypes.FIXED,
  topbarThemeType: topbarThemeTypes.LIGHT,
  leftsidbarSizeType: leftsidbarSizeTypes.SMALLHOVER,
  leftSidebarViewType: leftSidebarViewTypes.DEFAULT,
  leftSidebarImageType: leftSidebarImageTypes.NONE,
  leftSidebarCustomImage: null,
  preloader: preloaderTypes.DISABLE,
  sidebarVisibilitytype: sidebarVisibilitytypes.SHOW
};

// Rehydrate from localStorage so sidebar size / theme / mode choices
// survive a page reload instead of resetting to the hardcoded defaults.
function loadPersistedLayout() {
  try {
    const raw = localStorage.getItem(LAYOUT_STORAGE_KEY);
    return raw ? { ...defaultState, ...JSON.parse(raw) } : defaultState;
  } catch {
    return defaultState;
  }
}

export const initialState = loadPersistedLayout();

const LayoutSlice = createSlice({
  name: 'LayoutSlice',
  initialState,
  reducers: {
    changeLayoutAction(state, action) {
      state.layoutType = action.payload;
    },
    changeLayoutModeAction(state, action) {
      state.layoutModeType = action.payload;
    },
    changeSidebarThemeAction(state, action) {
      state.leftSidebarType = action.payload;
    },
    changeLayoutWidthAction(state, action) {
      state.layoutWidthType = action.payload;
    },
    changeLayoutPositionAction(state, action) {
      state.layoutPositionType = action.payload;
    },
    changeTopbarThemeAction(state, action) {
      state.topbarThemeType = action.payload;
    },
    changeLeftsidebarSizeTypeAction(state, action) {
      state.leftsidbarSizeType = action.payload;
    },
    changeLeftsidebarViewTypeAction(state, action) {
      state.leftSidebarViewType = action.payload;
    },
    changeSidebarImageTypeAction(state, action) {
      state.leftSidebarImageType = action.payload;
    },
    changeSidebarCustomImageAction(state, action) {
      state.leftSidebarCustomImage = action.payload;
    },
    changePreLoaderAction(state, action) {
      state.preloader = action.payload;
    },
    changeSidebarVisibilityAction(state, action) {
      state.sidebarVisibilitytype = action.payload;
    },
  }
});

export const {
  changeLayoutAction,
  changeLayoutModeAction,
  changeSidebarThemeAction,
  changeLayoutWidthAction,
  changeLayoutPositionAction,
  changeTopbarThemeAction,
  changeLeftsidebarSizeTypeAction,
  changeLeftsidebarViewTypeAction,
  changeSidebarImageTypeAction,
  changeSidebarCustomImageAction,
  changePreLoaderAction,
  changeSidebarVisibilityAction
} = LayoutSlice.actions;

export default LayoutSlice.reducer;