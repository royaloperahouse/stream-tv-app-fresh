module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: [
          '.ios.js',
          '.android.js',
          '.js',
          '.ts',
          '.tsx',
          '.json',
          '.ios.tsx',
          '.android.tsx',
        ],
        alias: {
          tests: ['./tests/'],
          '@components': './src/components',
          '@configs': './src/configs',
          '@screens': './src/screens',
          '@services': './src/services',
          '@layouts': './src/layouts',
          '@assets': './src/assets',
          '@hooks': './src/hooks',
          '@themes': './src/themes/',
          '@utils': './src/utils/',
          '@navigations': './src/navigations/',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
