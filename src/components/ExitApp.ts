import { NativeModules } from 'react-native';

const { ExitApp } = NativeModules;

interface IExitApp {
  exit: () => void;
}

export default ExitApp as IExitApp;
