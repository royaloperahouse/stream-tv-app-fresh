package com.rohtvapp.ROHBitMovinPlayerPackage;

import android.content.Context;
import android.util.ArrayMap;
import android.util.Log;
import android.view.Choreographer;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewTreeObserver;
import android.widget.RelativeLayout;

import com.bitmovin.analytics.BitmovinAnalyticsConfig;
import com.bitmovin.analytics.bitmovin.player.BitmovinPlayerCollector;
import com.bitmovin.player.PlayerView;
import com.bitmovin.player.SubtitleView;
import com.bitmovin.player.api.Player;
import com.bitmovin.player.api.deficiency.SourceWarningCode;
import com.bitmovin.player.api.event.SourceEvent;
import com.bitmovin.player.api.media.audio.AudioTrack;
import com.bitmovin.player.api.media.audio.quality.AudioQuality;
import com.bitmovin.player.api.source.Source;
import com.bitmovin.player.api.media.subtitle.SubtitleTrack;
import com.bitmovin.player.api.event.PlayerEvent;
import com.bitmovin.player.api.ui.StyleConfig;
import com.bitmovin.player.api.PlayerConfig;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.uimanager.ThemedReactContext;
import com.rohtvapp.R;
import com.bitmovin.player.api.deficiency.ErrorEvent;
import com.bitmovin.player.api.PlaybackConfig;
import com.bitmovin.player.api.SeekMode;
import com.bitmovin.player.api.media.MediaFilter;
import com.bitmovin.player.api.media.AdaptationConfig;
import com.bitmovin.player.api.media.video.quality.VideoAdaptation;
import com.bitmovin.player.api.media.video.quality.VideoAdaptationData;
import com.bitmovin.player.api.media.video.quality.VideoQuality;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public class PlayerContainerView extends RelativeLayout {
    private Context context;
    private Player player;
    private PlayerView playerView;
    private SubtitleView subtitleView;
    private SubtitleTrack subtitleTrack;
    private int heartbeat = 10;
    private boolean nextCallback = false;
    private boolean customSeek = false;
    private double stoppedTime = 0.0;
    private double duration = 0.0;
    private boolean mustAutoPlay = false;
    private int initBitrateValue = Integer.MAX_VALUE;

    public PlayerContainerView(ThemedReactContext context) {
        super(context);
        this.context = context;
        this.init();
    }

    public void init() {
        inflate(context, R.layout.player_container, this);

        StyleConfig styleConfig = new StyleConfig();
        styleConfig.setUiEnabled(false);

        PlayerConfig playerConfig = new PlayerConfig();
        playerConfig.setStyleConfig(styleConfig);
        ArrayList<String> videoCodecPriority = new ArrayList<String>();
        videoCodecPriority.add("h264");
        videoCodecPriority.add("av1");
        videoCodecPriority.add("hevc");
        videoCodecPriority.add("hvc");
        videoCodecPriority.add("vp9");
        videoCodecPriority.add("avc");
        ArrayList<String> audioCodecPriority = new ArrayList<String>();
        audioCodecPriority.add("mp3");
        audioCodecPriority.add("aac");
        audioCodecPriority.add("ec-3");
        audioCodecPriority.add("mp4a.a6");
        audioCodecPriority.add("ac-3");
        audioCodecPriority.add("mp4a.a5");
        audioCodecPriority.add("mp4a.40");

        PlaybackConfig playbackConfig = new PlaybackConfig(
            false,
            false,
            true,
            videoCodecPriority,
            audioCodecPriority,
            false,
            SeekMode.Exact,
            null,
            MediaFilter.Strict,
            MediaFilter.Loose
        );
        //playbackConfig.setTunneledPlaybackEnabled(true);
        playerConfig.setPlaybackConfig(playbackConfig);

        playerView = findViewById(R.id.bitmovinPlayerView);
        player = Player.create(context, playerConfig);
        playerView.setPlayer(player);

        player.on(SourceEvent.Loaded.class, this::onLoad);
        player.on(PlayerEvent.Playing.class, this::onPlay);
        player.on(PlayerEvent.Paused.class, this::onPause);
        player.on(PlayerEvent.Seek.class, this::onSeek);
        player.on(PlayerEvent.TimeChanged.class, this::onTimeChanged);
        player.on(PlayerEvent.Destroy.class, this::onDestroy);
        player.on(PlayerEvent.Seeked.class, this::onSeeked);
        player.on(PlayerEvent.PlaybackFinished.class, this::onPlaybackFinished);
        player.on(PlayerEvent.Ready.class, this::onReady);
        player.on(SourceEvent.Error.class, this::onError);
        player.on(SourceEvent.SubtitleChanged.class, this::onSubtitleChanged);
        player.on(PlayerEvent.Error.class, this::onError);
        player.on(PlayerEvent.CueEnter.class, this::onCueEnter);
        player.on(PlayerEvent.CueExit.class, this::onCueExit);
        player.on(PlayerEvent.VideoPlaybackQualityChanged.class, this::onVideoPlaybackQualityChanged);
        player.on(SourceEvent.VideoQualityChanged.class, this::onVideoQualityChanged);
        player.on(SourceEvent.VideoQualitiesChanged.class, this::onVideoQualitiesChanged);
        player.on(SourceEvent.AudioTrackChanged.class, this::onAudioTrackChanged);
        player.on(SourceEvent.Warning.class, this::onWarning);
        player.on(PlayerEvent.AudioPlaybackQualityChanged.class, this::onAudioPlaybackQualityChanged);
        player.setVolume(100);
    }

    public void configure(Source source) {
        player.load(source);
    }

    public void setAutoPlay(Boolean autoplay) {
        mustAutoPlay = autoplay;
    }

    public void setInitBitrate(Integer initBitrate) {
        initBitrateValue = initBitrate;
    }

    public void setAnalytics(BitmovinAnalyticsConfig bitmovinAnalyticsConfig, ThemedReactContext reactContext) {
        BitmovinPlayerCollector analyticsCollector = new BitmovinPlayerCollector(bitmovinAnalyticsConfig, reactContext);
        analyticsCollector.attachPlayer(player);
    }

    public PlayerView getPlayerView() {
        return playerView;
    }

    private void onPlay(PlayerEvent event) {
        WritableMap map = Arguments.createMap();
        map.putString("message", "play");
        map.putString("time", String.valueOf(stoppedTime));
        map.putString("duration", String.valueOf(duration));
        Log.i("msg", player.getSource().getSelectedVideoQuality().getLabel());
        ReactContext reactContext = (ReactContext)context;
        try {
            reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("onPlay", map);

        } catch (Exception e) {
            Log.e("ReactNative", "Caught Exception: " + e.getMessage());
        }
    }

    private void onTimeChanged(PlayerEvent.TimeChanged event) {
        WritableMap map = Arguments.createMap();
        stoppedTime = Double.valueOf(player.getCurrentTime());
        map.putString("message", "timeChanged");
        map.putString("time", String.valueOf(stoppedTime));
        map.putString("duration", String.valueOf(duration));
        stoppedTime = Double.valueOf(player.getCurrentTime());
        ReactContext reactContext = (ReactContext)context;
        try {
            reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("onTimeChanged", map);

        } catch (Exception e) {
            Log.e("ReactNative", "Caught Exception: " + e.getMessage());
        }
    }

    private void onWarning(SourceEvent.Warning event) {
        SourceWarningCode code = event.getCode();
        String message = event.getMessage();
        Log.d("msg", code + "  " + message);
    }

    private void onAudioPlaybackQualityChanged(PlayerEvent.AudioPlaybackQualityChanged event) {
        AudioQuality newAudioQuality = event.getNewAudioQuality();
        AudioQuality oldAudioQuality = event.getOldAudioQuality();
        if (oldAudioQuality != null) {
            Log.i("msg",oldAudioQuality + " oldAudioPlaybackQuality");
        }
        Log.i("msg",newAudioQuality + " newAudioPlaybackQuality");
    }

    private void onPause(PlayerEvent.Paused event) {
        WritableMap map = Arguments.createMap();
        stoppedTime = Double.valueOf(player.getCurrentTime());
        map.putString("message", "pause");
        map.putString("time", String.valueOf(stoppedTime));
        map.putString("duration", String.valueOf(duration));
        ReactContext reactContext = (ReactContext)context;
        try {
            reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("onPause", map);

        } catch (Exception e) {
            Log.e("ReactNative", "Caught Exception: " + e.getMessage());
        }
    }

    private void onLoad(SourceEvent.Loaded event) {
        WritableMap map = Arguments.createMap();
        duration = Double.valueOf(player.getDuration());
        map.putString("message", "load");
        map.putString("duration", String.valueOf(duration));
        ReactContext reactContext = (ReactContext)context;
        Log.i("msg", "playerLoaded");
        try {
            reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("onLoad", map);

        } catch (Exception e) {
            Log.e("ReactNative", "Caught Exception: " + e.getMessage());
        }
    }

    private void onVideoPlaybackQualityChanged(PlayerEvent.VideoPlaybackQualityChanged event) {
        try {
            VideoQuality oldVideoQuality = event.getOldVideoQuality();
            VideoQuality newVideoQuality = event.getNewVideoQuality();
            WritableMap map = Arguments.createMap();
            WritableNativeMap oldVQuality = new WritableNativeMap();
            WritableNativeMap newVQuality = new WritableNativeMap();
            if (oldVideoQuality != null) {
                oldVQuality.putString("id", oldVideoQuality.getId());
                oldVQuality.putString("codec", oldVideoQuality.getCodec());
                oldVQuality.putString("label", oldVideoQuality.getLabel());
                oldVQuality.putString("bitrate", String.valueOf(oldVideoQuality.getBitrate()));
                oldVQuality.putString("frameRate", String.valueOf(oldVideoQuality.getFrameRate()));
                oldVQuality.putString("width", String.valueOf(oldVideoQuality.getWidth()));
                oldVQuality.putString("height", String.valueOf(oldVideoQuality.getHeight()));
            }
            if (newVideoQuality != null) {
                newVQuality.putString("id", newVideoQuality.getId());
                newVQuality.putString("codec", newVideoQuality.getCodec());
                newVQuality.putString("label", newVideoQuality.getLabel());
                newVQuality.putString("bitrate", String.valueOf(newVideoQuality.getBitrate()));
                newVQuality.putString("frameRate", String.valueOf(newVideoQuality.getFrameRate()));
                newVQuality.putString("width", String.valueOf(newVideoQuality.getWidth()));
                newVQuality.putString("height", String.valueOf(newVideoQuality.getHeight()));
            }
            ReactContext reactContext = (ReactContext)context;
            map.putString("message", "videoPlaybackQualityChanged");
            map.putMap("newVideoPlaybackQuality", newVQuality);
            map.putMap("oldVideoPlaybackQuality", oldVQuality);
            Log.i("msg", oldVideoQuality + " oldVideoPlaybackQuality");
            Log.i("msg", newVideoQuality + " newVideoPlaybackQuality");
            reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onVideoPlaybackQualityChanged", map);
        } catch (Exception e) {
            Log.e("ReactNative", "Caught Exception: " + e.getMessage());
        }
    }

    private void onAudioTrackChanged(SourceEvent.AudioTrackChanged event) {
        AudioTrack newAudioTrack = event.getNewAudioTrack();
        AudioTrack oldAudioTrack = event.getOldAudioTrack();
        if (oldAudioTrack != null) {
            Log.i("msg", oldAudioTrack + " oldAudioTrack");
        }
        Log.i("msg", newAudioTrack + " newAudioTrack");
    }

    private void onVideoQualityChanged(SourceEvent.VideoQualityChanged event) {
        VideoQuality oldVideoQuality = event.getOldVideoQuality();
        VideoQuality newVideoQuality = event.getNewVideoQuality();
        WritableMap map = Arguments.createMap();
        WritableNativeMap oldVQuality = new WritableNativeMap();
        WritableNativeMap newVQuality = new WritableNativeMap();
        oldVQuality.putString("id", oldVideoQuality.getId());
        oldVQuality.putString("codec", oldVideoQuality.getCodec());
        oldVQuality.putString("label", oldVideoQuality.getLabel());
        oldVQuality.putString("bitrate", String.valueOf(oldVideoQuality.getBitrate()));
        oldVQuality.putString("frameRate", String.valueOf(oldVideoQuality.getFrameRate()));
        newVQuality.putString("id", newVideoQuality.getId());
        newVQuality.putString("codec", newVideoQuality.getCodec());
        newVQuality.putString("label", newVideoQuality.getLabel());
        newVQuality.putString("bitrate", String.valueOf(newVideoQuality.getBitrate()));
        newVQuality.putString("frameRate", String.valueOf(newVideoQuality.getFrameRate()));
        ReactContext reactContext = (ReactContext)context;
        map.putMap("newVideoQuality", newVQuality);
        map.putMap("oldVideoQuality", oldVQuality);
        Log.i("msg", oldVideoQuality + " oldVideoQualityy");
        Log.i("msg", newVideoQuality + " newVideoQuality");
        try {
            reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onVideoQualityChanged", map);
        } catch (Exception e) {
            Log.e("ReactNative", "Caught Exception: " + e.getMessage());
        }
    }

    private void onVideoQualitiesChanged(SourceEvent.VideoQualitiesChanged event) {
        List<VideoQuality> oldVideoQualities = event.getOldVideoQualities();
        List<VideoQuality> newVideoQualities = event.getNewVideoQualities();
        WritableMap map = Arguments.createMap();
        WritableArray oldVQualities = new WritableNativeArray();
        WritableArray newVQualities = new WritableNativeArray();
        for (VideoQuality videoQuality : oldVideoQualities) {
            WritableMap oldQuality = new WritableNativeMap();
            oldQuality.putString("id", videoQuality.getId());
            oldQuality.putString("codec", videoQuality.getCodec());
            oldQuality.putString("label", videoQuality.getLabel());
            oldQuality.putString("bitrate", String.valueOf(videoQuality.getBitrate()));
            oldQuality.putString("frameRate", String.valueOf(videoQuality.getFrameRate()));
            oldVQualities.pushMap(oldQuality);
        }
        for (VideoQuality videoQuality : newVideoQualities) {
            WritableMap newQuality = new WritableNativeMap();
            newQuality.putString("id", videoQuality.getId());
            newQuality.putString("codec", videoQuality.getCodec());
            newQuality.putString("label", videoQuality.getLabel());
            newQuality.putString("bitrate", String.valueOf(videoQuality.getBitrate()));
            newQuality.putString("frameRate", String.valueOf(videoQuality.getFrameRate()));
            newVQualities.pushMap(newQuality);
        }
        map.putArray("oldVideoQualities", oldVQualities);
        map.putArray("newVideoQualities", newVQualities);
        Log.i("msg", oldVideoQualities + " oldVideoQualities");
        Log.i("msg", newVideoQualities + " newVideoQualities");
        ReactContext reactContext = (ReactContext)context;
        try {
            reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onVideoQualitiesChanged", map);
        } catch (Exception e) {
            Log.e("ReactNative", "Caught Exception: " + e.getMessage());
        }
    }

    private void onSeek(PlayerEvent.Seek event) {
        WritableMap map = Arguments.createMap();
        map.putString("message", "seek");
        map.putString("time", Double.valueOf(player.getCurrentTime()).toString());
        map.putString("duration", Double.valueOf(player.getDuration()).toString());
        ReactContext reactContext = (ReactContext)context;
        try {
            reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("onSeek", map);

        } catch (Exception e) {
            Log.e("ReactNative", "Caught Exception: " + e.getMessage());
        }
    }

    private void onSeeked(PlayerEvent.Seeked event) {
        WritableMap map = Arguments.createMap();
        stoppedTime = Double.valueOf(player.getCurrentTime());
        map.putString("message", "seeked");
        map.putString("time", String.valueOf(stoppedTime));
        map.putString("duration", String.valueOf(duration));
        ReactContext reactContext = (ReactContext)context;
        try {
            reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("onSeeked", map);
        } catch (Exception e) {
            Log.e("ReactNative", "Caught Exception: " + e.getMessage());
        }
    }

    private void onDestroy(PlayerEvent.Destroy event) {
        WritableMap map = Arguments.createMap();
        map.putString("message", "destroy");
        map.putString("time", String.valueOf(stoppedTime));
        map.putString("duration", String.valueOf(duration));
        ReactContext reactContext = (ReactContext)context;
        Log.i("msg", "playerDestroyet");
        try {
            reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("onDestroy", map);

        } catch (Exception e) {
            Log.e("ReactNative", "Caught Exception: " + e.getMessage());
        }
    }

    private void onPlaybackFinished(PlayerEvent.PlaybackFinished event) {
        WritableMap map = Arguments.createMap();
        map.putString("message", "onPlaybackFinished");
        map.putString("time", Double.valueOf(player.getCurrentTime()).toString());
        map.putString("duration", Double.valueOf(player.getDuration()).toString());
        ReactContext reactContext = (ReactContext)context;
        try {
            reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("onPlaybackFinished", map);

        } catch (Exception e) {
            Log.e("ReactNative", "Caught Exception: " + e.getMessage());
        }
    }

    private void onReady(PlayerEvent.Ready event) {
        WritableMap map = Arguments.createMap();
        Source source = player.getSource();
        WritableNativeMap selectedVQuolity = new WritableNativeMap();
        WritableArray quolity_list = new WritableNativeArray();
        if (source != null && source.isAttachedToPlayer()) {
            List<VideoQuality> videoQualities = source.getAvailableVideoQualities();
            Comparator<VideoQuality> compareByBitrateMin = (VideoQuality q1, VideoQuality q2) ->
                    q1.getBitrate() - q2.getBitrate();
            Comparator<VideoQuality> compareByBitrateMax = (VideoQuality q1, VideoQuality q2) ->
                     q2.getBitrate() - q1.getBitrate();
            Collections.sort(videoQualities, compareByBitrateMin);
            player.setMaxSelectableVideoBitrate(initBitrateValue);
            /*
            for (int i = 0; i < videoQualities.size(); i++) {
                VideoQuality vq = videoQualities.get(i);
                if (i == (videoQualities.size() - 1)) {
                    source.setVideoQuality(String.valueOf(vq.getId()));
                    break;
                }
                if (vq.getBitrate() < initBitrateValue) {
                    continue;
                }
                if (i == 0) {
                    source.setVideoQuality(String.valueOf(vq.getId()));
                } else {
                    VideoQuality prevVq = videoQualities.get(i - 1);
                    source.setVideoQuality(String.valueOf(prevVq.getId()));
                }
                break;
            };
            */
            VideoQuality selectedVideoQuality = source.getSelectedVideoQuality();
            if (selectedVideoQuality != null) {
                selectedVQuolity.putString("id", selectedVideoQuality.getId());
                selectedVQuolity.putString("label", selectedVideoQuality.getLabel());
                selectedVQuolity.putString("bitrate", String.valueOf(selectedVideoQuality.getBitrate()));
                selectedVQuolity.putString("codec", selectedVideoQuality.getCodec());
                selectedVQuolity.putString("frameRate", Double.valueOf(selectedVideoQuality.getFrameRate()).toString());
                map.putMap("selectedVideoQuality", selectedVQuolity);
            }
            Collections.sort(videoQualities, compareByBitrateMax);
            for (VideoQuality videoQuality : videoQualities) {
                try {
                    WritableMap quolity = new WritableNativeMap();
                    quolity.putString("id", videoQuality.getId());
                    quolity.putString("label", videoQuality.getLabel());
                    quolity.putString("bitrate", String.valueOf(videoQuality.getBitrate()));
                    quolity.putString("codec", videoQuality.getCodec());
                    quolity.putString("frameRate", Double.valueOf(videoQuality.getFrameRate()).toString());
                    quolity_list.pushMap(quolity);
                } catch (Exception ex) {
                    System.err.println("Exception: " + ex.getMessage());
                }
            }
            List<AudioQuality> availableAudioQualities = source.getAvailableAudioQualities();
            Log.i("msg", availableAudioQualities + " availableAudioQualities");
        }

        List<SubtitleTrack> subtitles = player.getAvailableSubtitles();
        WritableArray app_list = new WritableNativeArray();
        for (SubtitleTrack subtitleTrack : subtitles) {
            try {
                WritableMap track = new WritableNativeMap();
                track.putString("id", subtitleTrack.getId());
                track.putString("label", subtitleTrack.getLabel());
                track.putString("url", subtitleTrack.getUrl());
                app_list.pushMap(track);
            } catch (Exception ex) {
                System.err.println("Exception: " + ex.getMessage());
            }
        }
        duration = Double.valueOf(player.getDuration());
        map.putString("message", "ready");
        map.putString("duration", String.valueOf(duration));
        map.putArray("subtitles", app_list);
        map.putArray("availableVideoQualities", quolity_list);
        Log.i("msg", "playerReady");
        if (mustAutoPlay) {
            player.play();
            Log.i("msg", "playerAutoplay");
        }
        ReactContext reactContext = (ReactContext)context;
        try {
            reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("onReady", map);
        } catch (Exception e) {
            Log.e("ReactNative", "Caught Exception: " + e.getMessage());
        }
    }

    private void onError(ErrorEvent event) {
        WritableMap map = Arguments.createMap();
        map.putString("message", "error");
        map.putString("errMessage", event.getMessage());
        map.putString("errCode", String.valueOf(event.getCode().getValue()));
        ReactContext reactContext = (ReactContext)context;
        try {
            reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("onError", map);

        } catch (Exception e) {
            Log.e("ReactNative", "Caught Exception: " + e.getMessage());
        }
    }

    private void onSubtitleChanged(SourceEvent.SubtitleChanged event) {
        WritableMap map = Arguments.createMap();
        SubtitleTrack newSubtitleTrack = event.getNewSubtitleTrack();
        SubtitleTrack oldSubtitleTrack = event.getOldSubtitleTrack();
        map.putString("message", "subtitleChanged");
        if (newSubtitleTrack != null) {
            map.putString("newSubtitleId", newSubtitleTrack.getId());
        }
        if (oldSubtitleTrack != null) {
            map.putString("oldSubtitleId", oldSubtitleTrack.getId());
        }
        ReactContext reactContext = (ReactContext)context;
        try {
            reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("onSubtitleChanged", map);

        } catch (Exception e) {
            Log.e("ReactNative", "Caught Exception: " + e.getMessage());
        }
    }

    private void onCueEnter(PlayerEvent.CueEnter event) {
        Log.d("onCue enter",  event.getText());
        WritableMap map = Arguments.createMap();

        map.putString("message", "cueEnter");
        String cueText = event.getText();
        if (cueText != null) {
            map.putString("cueText", cueText);
        }
        ReactContext reactContext = (ReactContext)context;
        try {
            reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("onCueEnter", map);

        } catch (Exception e) {
            Log.e("ReactNative", "Caught Exception: " + e.getMessage());
        }
    }

    private void onCueExit(PlayerEvent.CueExit event) {
        Log.d("onCue exit",  event.getText());
        WritableMap map = Arguments.createMap();

        map.putString("message", "cueExit");
        String cueText = event.getText();
        if (cueText != null) {
            map.putString("cueText", cueText);
        }
        ReactContext reactContext = (ReactContext)context;
        try {
            reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("onCueExit", map);

        } catch (Exception e) {
            Log.e("ReactNative", "Caught Exception: " + e.getMessage());
        }
    }

}
