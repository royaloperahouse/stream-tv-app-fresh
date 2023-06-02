export function transformVideoDetails(videoDetails) {
  if (videoDetails.data.video) {
    videoDetails.data.video.isBroken = false;
  }
  const thumbnail = {
    dimensions: videoDetails.data.preview_image.tv_app_extras_thumbnail
      ? videoDetails.data.preview_image.tv_app_extras_thumbnail.dimensions
      : videoDetails.data.preview_image.tray.dimensions,
    url: videoDetails.data.preview_image.tv_app_extras_thumbnail
      ? videoDetails.data.preview_image.tv_app_extras_thumbnail.url
      : videoDetails.data.preview_image.tray.url,
  };
  return {
    id: videoDetails.id,
    type: 'digital_event_video',
    href: videoDetails.href,
    slugs: videoDetails.slugs,
    data: {
      vs_title: videoDetails.data.video_title,
      vs_videos: [{ video: videoDetails.data.video }],
      vs_carousel_description: videoDetails.data.video_title,
      vs_short_description: videoDetails.data.video_title,
      vs_description: videoDetails.data.video_title,
      vs_event_image: {
        dimensions: videoDetails.data.preview_image.dimensions,
        url: videoDetails.data.preview_image.url,
        tv_app_preview_image_selected: {
          dimensions: videoDetails.data.preview_image.tray.dimensions,
          url: videoDetails.data.preview_image.tray.url,
        },
        tv_app_rail_thumbnail: thumbnail,
      },
    },
  };
}
