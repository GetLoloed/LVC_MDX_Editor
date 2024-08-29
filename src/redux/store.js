import { configureStore } from '@reduxjs/toolkit';
import imagesReducer from './reducers/imagesReducer';
import localStorageMiddleware from './middleware/localStorageMiddleware';
import blocReducer from './reducers/BlocReducer';
import fileExplorerReducer from './reducers/fileExplorerReducer';
import markdownEditorReducer from './reducers/markdownEditorReducer';
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('reduxState');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

const preloadedState = loadState();

const store = configureStore({
  reducer: {
    images: imagesReducer,
    blocs: blocReducer,
    fileExplorer: fileExplorerReducer,
    markdownEditor: markdownEditorReducer,
  },
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(localStorageMiddleware),
});

export default store;