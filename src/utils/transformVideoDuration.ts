function transformVideoDuration(duration: number): string {
  if (duration === 0) {
    return '';
  }
  let vs_running_time_summary = '';
  let seconds = duration;
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

  return vs_running_time_summary;
}

export default transformVideoDuration;
