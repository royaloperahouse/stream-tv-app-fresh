#!/bin/bash
cd ..
yarn react-native generate-bootsplash ./src/assets/splashscreen/splashScreenLogo.png \
  --background-color=050F20 \
  --logo-width=100 \
  --assets-path=assets \
  --flavor=main
cd scripts