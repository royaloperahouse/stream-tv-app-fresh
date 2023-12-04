export const prismicApiEndpoint =
  'https://royal-opera-house.cdn.prismic.io/api/v2';
// endpoint for staging 'https://royal-opera-house-staging.cdn.prismic.io/api/v2';
export const prismicApiAccessToken =
  'MC5XNnVzSnhNQUFDWFc5TS1n.77-9bhQ1OO-_ve-_ve-_ve-_vQ05MUzvv73vv70bN--_ve-_vT_vv73vv71p77-977-977-9Blnvv73vv70I77-9';
// token for staging  'MC5ZOXVyYVJFQUFDY0ExZkhT.YO-_vQNtYO-_vV9777-9Se-_ve-_ve-_vT4v77-977-977-977-9Qu-_vUgTNlsH77-9K--_vVgiDg';

type TDocumentTypeList = {
  digitalEventDetails: string;
  digitalEventVideo: string;
  prismicisedRails: string;
  featureFlags: string;
};
export const documentTypes: TDocumentTypeList = Object.freeze({
  digitalEventDetails: 'digital_event_details',
  digitalEventVideo: 'digital_event_video',
  prismicisedRails: 'stream_home_page',
  featureFlags: 'feature_flags',
});

export const getRefLabelOfPublishing = (isProductionEnv: boolean) =>
  isProductionEnv ? 'Master Ref' : 'Staging';
