module.exports = {
  project: {
    ios: {},
    android: {}, // grouped into "project"
  },
  assets: ['./src/assets/fonts/'],
  'react-native-flipper': {
    platforms: {
      android: null,
      ios: null,
      macos: null,
    },
  },
  dependencies: {
    // Required for Expo CLI to be used with platforms (such as Apple TV) that are not supported in Expo SDK
    expo: {
      platforms: {
        android: null,
        ios: null,
        macos: null,
      },
    },
  },
};
