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
          '@royaloperahouse/feature-management-internals': './node_modules/@royaloperahouse/feature-management-internals/dist/index.es.js'
        },
      },
    ],
    'react-native-reanimated/plugin',
    ['module:react-native-dotenv']
  ],
};
