import React, { FC, useLayoutEffect, useRef, useState } from 'react';
import FastImage, { ResizeMode } from 'react-native-fast-image';
import PlaceholderLandscape from '../assets/image-placeholder-landscape.svg';
import PlaceholderPortrait from '../assets/image-placeholder-portrait.svg';
import { StyleSheet, View } from 'react-native';
import { Colors } from 'themes/Styleguide';

type TRohImageProps = {
  resizeMode: ResizeMode;
  style: any;
  source: string;
  isPortrait?: boolean;
};

const RohImage: FC<TRohImageProps> = ({
  resizeMode,
  style,
  source,
  isPortrait = false,
}) => {
  const [isError, setIsError] = useState<boolean>(false);
  const [loaading, setLoading] = useState<boolean>(false);
  const mounted = useRef<boolean>(false);

  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  if (isError) {
    return isPortrait ? (
      <PlaceholderPortrait width={style.width} height={style.height} />
    ) : (
      <PlaceholderLandscape width={style.width} height={style.height} />
    );
  }

  return (
    <View style={style}>
      {loaading ? (
        <View style={styles.loadingPlaceholderContainer}>
          {isPortrait ? (
            <PlaceholderPortrait width={style.width} height={style.height} />
          ) : (
            <PlaceholderLandscape width={style.width} height={style.height} />
          )}
        </View>
      ) : null}

      <FastImage
        resizeMode={resizeMode}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => {
          setLoading(false);
        }}
        style={[style, styles.container]}
        source={{
          uri: source,
        }}
        onError={() => setIsError(true)}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    zIndex: 0,
  },
  loadingPlaceholderContainer: {
    opacity: 1,
  },
});
export default RohImage;
