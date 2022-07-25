/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { decode, encode } from 'base-64';
// Pronlem with allSettled in RN; use promise.allsettled as polyfill
if (typeof Promise.allSettled !== 'function') {
  Promise.allSettled = require('promise.allsettled');
}

// Problem with base64 encode decode in RN; use base-64 package as polyfill
if (typeof global.btoa !== 'function') {
  global.btoa = encode;
}

if (typeof global.atob !== 'function') {
  global.atob = decode;
}

AppRegistry.registerComponent(appName, () => App);
