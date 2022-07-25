import React from 'react';
import 'react-native/tvos-types.d';
import 'react-native-url-polyfill/auto';
import { Provider } from 'react-redux';
import { store } from '@services/store';
import AppLayout from '@layouts/appLayout';
import { FlagsProvider } from 'flagged';
if (__DEV__) {
  require('./src/services/reactotronDebugger/reactotronConfig').default;
}

//as Example

global.roh_rlog({
  name: 'Reactotron Configured',
  preview: 'ROH App',
  important: true,
});

type TAppProps = {};

const App: React.FC<TAppProps> = () => {
  return (
    <Provider store={store}>
      <FlagsProvider
        features={{
          hasOpera: false,
          canExit: true,
          showLiveStream: false,
          hasQRCode: false,
        }}>
        <AppLayout />
      </FlagsProvider>
    </Provider>
  );
};

export default App;
