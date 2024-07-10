import React from 'react';
import 'react-native-url-polyfill/auto';
import { Provider } from 'react-redux';
import { store } from '@services/store';
import AppLayout from '@layouts/appLayout';
import { FlagsProvider } from 'flagged';
import * as Sentry from '@sentry/react-native';
import { SentryDSN } from '@configs/globalConfig';
import { enableScreens } from 'react-native-screens';

Sentry.init({
  dsn: SentryDSN,
});
if (__DEV__) {
  fetch('https://jsonplaceholder.typicode.com/todos/1')
    .then(response => response.json())
    .then(() => console.log('fetch works'))
    .catch(err => {
      console.log('something went wron with fetch ' + err?.message);
    })
    .finally(() => console.log('fetching test finished'));
}

//as Example

import { roh_rlog } from 'services/reactotronDebugger/reactotronConfig';
roh_rlog({
  name: 'Reactotron Configured',
  preview: 'ROH App',
  important: true,
});

type TAppProps = {};

const App: React.FC<TAppProps> = () => {
  enableScreens();
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
