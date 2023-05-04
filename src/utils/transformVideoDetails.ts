export function transformVideoDetails(videoDetails) {
  return {
    id: videoDetails.id,
    type: 'digital_event_video',
    href: videoDetails.href,
    slugs: videoDetails.slugs,
    data: {
      vs_title: videoDetails.data.video_title,
      vs_videos: [videoDetails.data.video],
      vs_carousel_description: videoDetails.data.video_title,
      vs_short_description: videoDetails.data.video_title,
      vs_description: videoDetails.data.video_title,
      vs_event_image: {
        dimensions: videoDetails.data.preview_image.dimensions,
        url: videoDetails.data.preview_image.url,
        wide_event_image: {
          dimensions: videoDetails.data.preview_image.tray.dimensions,
          url: videoDetails.data.preview_image.tray.url,
        },
      },
    },
  };
}
