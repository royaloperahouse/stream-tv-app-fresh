import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoaded: boolean;
  devicePin: null | string;
  customerId: null | number;
  showIntroScreen: boolean;
  errorString: string;
  fullSubscription: boolean;
  fullSubscriptionUpdateDate: string;
  userEmail: string;
  isDeepLinkingFlow: boolean;
  countryCode: string;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  isLoaded: false,
  devicePin: null,
  customerId: null,
  showIntroScreen: true,
  errorString: '',
  fullSubscription: false,
  fullSubscriptionUpdateDate: '',
  userEmail: '',
  isDeepLinkingFlow: false,
  countryCode: '',
};

const defaultPinError =
  'Sorry, there has been an error retrieving the pin code. Please try again later';

const appSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    startLoginLoop: state => state,
    endLoginLoop: state => state,
    turnOnDeepLinkingFlow: (
      state,
      _: PayloadAction<{ eventId: string | null }>,
    ) => {
      state.isDeepLinkingFlow = true;
      return state;
    },
    turnOffDeepLinkingFlow: (
      state,
      _: PayloadAction<{ isRegularFlow?: boolean }>,
    ) => {
      state.isDeepLinkingFlow = false;
      return state;
    },
    startFullSubscriptionLoop: state => state,
    endFullSubscriptionLoop: state => state,
    switchOnIntroScreen: state => {
      state.showIntroScreen = true;
    },
    switchOffIntroScreen: state => {
      state.showIntroScreen = false;
    },
    checkDeviceStart: state => {
      state.isLoading = true;
    },
    checkDeviceSuccess: (
      state,
      action: PayloadAction<{
        data: {
          attributes: {
            customerId: AuthState['customerId'];
            deviceId: AuthState['devicePin'];
            email: AuthState['userEmail'];
            countryCode: AuthState['countryCode'];
          };
        };
      }>,
    ) => {
      const { payload } = action;
      state.isAuthenticated = true;
      state.customerId = payload.data.attributes.customerId; //5158973, 5158974, 5158975 for payPerViewv
      state.devicePin = payload.data.attributes.deviceId;
      state.isLoading = false;
      state.showIntroScreen = false;
      state.errorString = '';
      state.userEmail = payload.data.attributes.email;
      state.isLoaded = true;
      state.countryCode = payload.data.attributes.countryCode;
    },
    checkDeviceError: (
      state,
      action: PayloadAction<{
        detail?: AuthState['devicePin'];
        status: number;
        title: string;
      }>,
    ) => {
      const { payload } = action;
      state.devicePin = payload?.detail || '';
      if (payload.status !== 401) {
        state.errorString =
          payload.status && payload.title
            ? `${payload.status} - ${payload.title}`
            : defaultPinError;
      }
      state.isLoading = false;
      state.isLoaded = true;
    },
    clearAuthState: () => ({ ...initialState, showIntroScreen: false }),
    toggleSubscriptionMode: state => {
      state.fullSubscription = !state.fullSubscription;
    },
    updateSubscriptionMode: (
      state,
      action: PayloadAction<{
        fullSubscription: AuthState['fullSubscription'];
        fullSubscriptionUpdateDate: AuthState['fullSubscriptionUpdateDate'];
      }>,
    ) => {
      const { payload } = action;
      if (state.fullSubscription === payload.fullSubscription) {
        return state;
      }
      state.fullSubscription = payload.fullSubscription;
      state.fullSubscriptionUpdateDate = payload.fullSubscriptionUpdateDate;
    },
  },
});

export const {
  checkDeviceStart,
  checkDeviceSuccess,
  checkDeviceError,
  switchOnIntroScreen,
  switchOffIntroScreen,
  startLoginLoop,
  endLoginLoop,
  clearAuthState,
  toggleSubscriptionMode,
  startFullSubscriptionLoop,
  endFullSubscriptionLoop,
  updateSubscriptionMode,
  turnOffDeepLinkingFlow,
  turnOnDeepLinkingFlow,
} = appSlice.actions;

export const { reducer, name } = appSlice;
