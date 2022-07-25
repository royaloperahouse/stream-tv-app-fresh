import { combineReducers } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { configureStore } from '@reduxjs/toolkit';

// reducers
import {
  reducer as authReducer,
  name as authReducerName,
} from '@services/store/auth/Slices';
import {
  reducer as eventsReducer,
  name as eventsReducerName,
} from '@services/store/events/Slices';
import {
  reducer as settingsReducer,
  name as settingsReducerName,
} from '@services/store/settings/Slices';

import { rootSaga } from '@services/store/rootSaga';

declare global {
  var roh_rlog: (obj: {
    name?: string;
    preview?: string;
    value?: any;
    important?: boolean;
    image?: string;
  }) => void;
}

global.roh_rlog = () => {};

/* const Reactotron = __DEV__
  ? require('@services/reactotronDebugger/reactotronConfig').default
  : {}; */
const rootReducer = combineReducers({
  [authReducerName]: authReducer,
  [eventsReducerName]: eventsReducer,
  [settingsReducerName]: settingsReducer,
});

const sagaMiddleware = createSagaMiddleware();
const anyMiddlewares = [sagaMiddleware];

const enhancers: any[] = [];
export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({ thunk: false, serializableCheck: false }).concat(
      anyMiddlewares,
    ),
  devTools: __DEV__,
  enhancers: enhancers,
});
export type TRootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

sagaMiddleware.run(rootSaga);
