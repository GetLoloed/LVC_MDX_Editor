import { configureStore } from '@reduxjs/toolkit';
import bibliothequeReducer from '../features/bibliotheque';
import fileStructureReducer from '../features/fileStructureSlice';
import blocsReducer from '../features/blocsSlice';

const store = configureStore({
  reducer: {
    bibliotheque: bibliothequeReducer,
    fileStructure: fileStructureReducer,
    blocs: blocsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat((store) => (next) => (action) => {
      const result = next(action);
      const state = store.getState();
      localStorage.setItem('reduxState', JSON.stringify(state));
      return result;
    }),
});

// Charger l'état initial depuis le localStorage
const savedState = localStorage.getItem('reduxState');
if (savedState) {
  store.dispatch({ type: 'INITIALIZE_STATE', payload: JSON.parse(savedState) });
}

export default store;
