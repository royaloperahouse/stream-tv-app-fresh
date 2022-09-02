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

  return (
    <FastImage
      resizeMode={resizeMode}
      style={style}
      source={imageSource}
      onError={() =>
        setDefaultImageSource(require('@assets/image-placeholder.png'))
      }
    />
  );
};
export default RohImage;
