import React, { FC, useState } from 'react';
import FastImage, { ResizeMode, Source } from 'react-native-fast-image';

type TRohImageProps = {
  resizeMode: ResizeMode;
  style: any;
  source: string;
};

const RohImage: FC<TRohImageProps> = ({ resizeMode, style, source }) => {
  const [imageSource, setDefaultImageSource] = useState<Source>({
    uri: source,
  });
  const placeholderImage = require('@assets/image-placeholder.png');

  return (
    <FastImage
      resizeMode={resizeMode}
      style={style}
      source={imageSource}
      onError={() => setDefaultImageSource(placeholderImage)}
    />
  );
};
export default RohImage;
