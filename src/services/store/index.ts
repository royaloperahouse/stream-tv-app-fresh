import createSagaMiddleware, { SagaMiddleware } from 'redux-saga';
import {
  configureStore,
  combineReducers,
  compose,
  applyMiddleware,
  EnhancedStore,
  AnyAction,
  Middleware,
  MiddlewareArray,
} from '@reduxjs/toolkit';

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

type RootState = ReturnType<typeof rootReducer>;

let store: EnhancedStore<RootState, AnyAction, MiddlewareArray<Middleware[]>>;
let sagaMiddleware: SagaMiddleware<object>;

if (__DEV__) {
  const Reactotron =
    require('@services/reactotronDebugger/reactotronConfig').default;
  //Reactotron.clear();
  const createFlipperMiddleware = require('redux-flipper').default;
  const sagaMonitor = Reactotron.createSagaMonitor();
  console.log('sagaMonitor created');
  sagaMiddleware = createSagaMiddleware({ sagaMonitor });
  console.log('sagaMiddleware with sagaMonitor created');
  store = configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({ thunk: false, serializableCheck: false }).concat(
        createFlipperMiddleware(),
      ),
    devTools: __DEV__,
    enhancers: [Reactotron.createEnhancer(), applyMiddleware(sagaMiddleware)],
  });
} else {
  sagaMiddleware = createSagaMiddleware();
  store = configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({ thunk: false, serializableCheck: false }).concat(
        sagaMiddleware,
      ),
    devTools: __DEV__,
    enhancers: [],
  });
}

export type TRootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

sagaMiddleware.run(rootSaga);
export { store };

/**
  const Reactotron =
    require('@services/reactotronDebugger/reactotronConfig').default;
  Reactotron.clear();
  const createFlipperMiddleware = require('redux-flipper').default;
  const sagaMonitor = Reactotron.createSagaMonitor();
  console.log('sagaMonitor created');
  sagaMiddleware = createSagaMiddleware({ sagaMonitor });
  console.log('sagaMiddleware with sagaMonitor created');
  store = configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({ thunk: false, serializableCheck: false }).concat(
        createFlipperMiddleware(),
        sagaMiddleware,
      ),
    devTools: __DEV__,
    enhancers: [Reactotron.createEnhancer()],
  });
 */
