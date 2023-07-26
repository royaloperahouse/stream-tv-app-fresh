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

  let vs_running_time_summary = '';
  let seconds = videoDetails.data.video ? videoDetails.data.video.duration : 0;
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);

  if (seconds > 0 && minutes < 1) {
    vs_running_time_summary = `${seconds} seconds`;
  }

  if (minutes > 0 && hours < 1) {
    seconds = seconds - minutes * 60;
    if (minutes === 1) {
      if (seconds > 0) {
        vs_running_time_summary = `${minutes} minute and ${seconds} seconds`;
      } else {
        vs_running_time_summary = `${minutes} minute`;
      }
    } else {
      if (seconds > 0) {
        vs_running_time_summary = `${minutes} minutes and ${seconds} seconds`;
      } else {
        vs_running_time_summary = `${minutes} minutes`;
      }
    }
  }

  if (hours > 0) {
    minutes = minutes - hours * 60;
    if (hours === 1) {
      if (minutes > 0) {
        vs_running_time_summary = `${hours} hour and ${minutes} minutes`;
      } else {
        vs_running_time_summary = `${hours} hour`;
      }
    } else {
      if (minutes > 0) {
        vs_running_time_summary = `${hours} hours and ${minutes} minutes`;
      } else {
        vs_running_time_summary = `${hours} hours`;
      }
    }
  }

  return {
    id: videoDetails.id,
    type: 'digital_event_video',
    href: videoDetails.href,
    slugs: videoDetails.slugs,
    data: {
      vs_title: videoDetails.data.video_title,
      vs_videos: [{ video: videoDetails.data.video }],
      vs_carousel_description: videoDetails.data.short_description,
      vs_short_description: videoDetails.data.short_description,
      vs_description: videoDetails.data.short_description,
      vs_running_time_summary,
      extra_video_type: videoDetails.data.extra_video_type,
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
