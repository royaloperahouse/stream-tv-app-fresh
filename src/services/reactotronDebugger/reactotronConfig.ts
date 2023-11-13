import Reactotron from 'reactotron-react-native';
//import ReactotronFlipper from 'reactotron-react-native/dist/flipper';
import { reactotronRedux } from 'reactotron-redux';
import sagaPlugin from 'reactotron-redux-saga';
import { getUniqueId } from 'react-native-device-info';

/*
import {Platform} from 'react-native';

  customComandConfig
    id?: number;
    command: string;
    handler: (args?: any) => void;
    title?: string;
    description?: string;
    args?: CustomCommandArg[];

Middleware example
const middleware = (tron) => {
  tron.onCustomCommand({
    command: 'CustomCommandExample',
    handler: () => {
      console._rtron.log('Custom Command: ', Platform.OS);
    },
    title: 'My custom command',
    description: 'Description for my custom command',
  });
  // plugin definition
  return {};
};
*/

const actionsBlackList = [
  'EFFECT_TRIGGERED',
  'EFFECT_RESOLVED',
  'EFFECT_REJECTED',
];

const requestBlackList = /symbolicate/;

export let roh_rlog;
export default Reactotron.configure({
  name: 'ROH App',
  getClientId: getUniqueId, //need for singl reactotron connection after refresh or reload;
  //createSocket: path => new ReactotronFlipper(path), // need to check
})
  .useReactNative({
    asyncStorage: false,
    networking: {
      ignoreUrls: requestBlackList,
    },
    editor: false, // there are more options to editor
    errors: { veto: () => false }, // or turn it off with false
    overlay: false, // just turning off overlay
  })
  .use(reactotron => {
    roh_rlog = ({
      name = 'A Report',
      preview = 'A Report header',
      value,
      important,
      image,
    }) => {
      reactotron.display({ name, preview, value, important, image });
    };
    return reactotron;
  })
  .use(reactotronRedux())
  .use(
    sagaPlugin({
      except: actionsBlackList,
    }),
  )
  //.use(middleware) example of add middleware
  .connect();
