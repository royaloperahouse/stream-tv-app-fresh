
package com.rohtvapp.ROHBitMovinPlayerPackage;

import android.media.AudioManager;
import android.content.Context;

import android.view.View;
import android.util.Log;
import com.bitmovin.player.PlayerView;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class ROHBitMovinPlayerModule extends ReactContextBaseJavaModule {

  private final ReactApplicationContext _reactContext;

  public ROHBitMovinPlayerModule(ReactApplicationContext reactContext) {
    super(reactContext);

    _reactContext = reactContext;
  }

  private void gainAudioFocus() {
    AudioManager audioManager = (AudioManager) this._reactContext.getSystemService(Context.AUDIO_SERVICE);
    audioManager.requestAudioFocus(
      null,
      AudioManager.STREAM_MUSIC,
      AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_EXCLUSIVE
    );
  }

  private void releaseAudioFocus() {
    AudioManager audioManager = (AudioManager) this._reactContext.getSystemService(Context.AUDIO_SERVICE);
    audioManager.abandonAudioFocus(null);
  }

  @Override
  public String getName() {
    return "ROHBitMovinPlayerControl";
  }

  @ReactMethod
  public void play(int tag) {
    View playerContainerView = getCurrentActivity().findViewById(tag);
    if (playerContainerView instanceof PlayerContainerView) {
      if (((PlayerContainerView) playerContainerView).getPlayerView().getPlayer().getCurrentTime() < ((PlayerContainerView) playerContainerView).getPlayerView().getPlayer().getDuration()) {
        ((PlayerContainerView) playerContainerView).getPlayerView().getPlayer().play();
        this.gainAudioFocus();
      }
    } else {
      throw new ClassCastException(String.format("Cannot play: view with tag #%d is not a ROHBitMovinPlayer", tag));
    }
  }

  @ReactMethod
  public void pause(int tag) {
    View playerContainerView = getCurrentActivity().findViewById(tag);

    if (playerContainerView instanceof PlayerContainerView) {
      ((PlayerContainerView) playerContainerView).getPlayerView().getPlayer().pause();
      this.releaseAudioFocus();
    } else {
      throw new ClassCastException(String.format("Cannot pause: view with tag #%d is not a ROHBitMovinPlayer", tag));
    }
  }

  @ReactMethod
  public void seek(int tag, double time) {
    View playerContainerView = getCurrentActivity().findViewById(tag);
    if (playerContainerView instanceof PlayerContainerView) {
      ((PlayerContainerView) playerContainerView).getPlayerView().getPlayer().seek(time);
    } else {
      throw new ClassCastException(String.format("Cannot seek: view with tag #%d is not a ROHBitMovinPlayer", tag));
    }
  }

  @ReactMethod
    public void timeShift(int tag, double time) {
      View playerContainerView = getCurrentActivity().findViewById(tag);
      if (playerContainerView instanceof PlayerContainerView) {
        ((PlayerContainerView) playerContainerView).getPlayerView().getPlayer().timeShift(time);
      } else {
        throw new ClassCastException(String.format("Cannot seek: view with timeShift #%d is not a ROHBitMovinPlayer", tag));
      }
    }

  @ReactMethod
  public void getCurrentTime(int tag, Promise promise) {
    View playerContainerView = getCurrentActivity().findViewById(tag);

    if (playerContainerView instanceof PlayerContainerView) {
      double currentTime = ((PlayerContainerView) playerContainerView).getPlayerView().getPlayer().getCurrentTime();

      promise.resolve(currentTime);
    } else {
      throw new ClassCastException(String.format("Cannot getCurrentTime: view with tag #%d is not a ROHBitMovinPlayer", tag));
    }
  }

  @ReactMethod
  public void getDuration(int tag, Promise promise) {
    View playerContainerView = getCurrentActivity().findViewById(tag);

    if (playerContainerView instanceof PlayerContainerView) {
      double duration = ((PlayerContainerView) playerContainerView).getPlayerView().getPlayer().getDuration();

      promise.resolve(duration);
    } else {
      throw new ClassCastException(String.format("Cannot getDuration: view with tag #%d is not a ROHBitMovinPlayer", tag));
    }
  }

  @ReactMethod
  public void isMuted(int tag, Promise promise) {
    View playerContainerView = getCurrentActivity().findViewById(tag);

    if (playerContainerView instanceof PlayerContainerView) {
      boolean isMuted = ((PlayerContainerView) playerContainerView).getPlayerView().getPlayer().isMuted();

      promise.resolve(isMuted);
    } else {
      throw new ClassCastException(String.format("Cannot isMuted: view with tag #%d is not a ROHBitMovinPlayer", tag));
    }
  }

  @ReactMethod
  public void isPaused(int tag, Promise promise) {
    View playerContainerView = getCurrentActivity().findViewById(tag);

    if (playerContainerView instanceof PlayerContainerView) {
      boolean isPaused = ((PlayerContainerView) playerContainerView).getPlayerView().getPlayer().isPaused();

      promise.resolve(isPaused);
    } else {
      throw new ClassCastException(String.format("Cannot isPaused: view with tag #%d is not a ROHBitMovinPlayer", tag));
    }
  }

  @ReactMethod
  public void isStalled(int tag, Promise promise) {
    View playerContainerView = getCurrentActivity().findViewById(tag);

    if (playerContainerView instanceof PlayerContainerView) {
      boolean isStalled = ((PlayerContainerView) playerContainerView).getPlayerView().getPlayer().isStalled();

      promise.resolve(isStalled);
    } else {
      throw new ClassCastException(String.format("Cannot isStalled: view with tag #%d is not a ROHBitMovinPlayer", tag));
    }
  }

  @ReactMethod
  public void isPlaying(int tag, Promise promise) {
    View playerContainerView = getCurrentActivity().findViewById(tag);

    if (playerContainerView instanceof PlayerContainerView) {
      boolean isPlaying = ((PlayerContainerView) playerContainerView).getPlayerView().getPlayer().isPlaying();

      promise.resolve(isPlaying);
    } else {
      throw new ClassCastException(String.format("Cannot isPlaying: view with tag #%d is not a ROHBitMovinPlayer", tag));
    }
  }

  @ReactMethod
  public void destroy(int tag) {
    View playerContainerView = getCurrentActivity().findViewById(tag);

    if (playerContainerView instanceof PlayerContainerView) {
      ((PlayerContainerView) playerContainerView).getPlayerView().getPlayer().destroy();
    } else {
      throw new ClassCastException(String.format("Cannot destroy: view with tag #%d is not a ROHBitMovinPlayer", tag));
    }
  }
  @ReactMethod
  public void restart(int tag) {
    View playerContainerView = getCurrentActivity().findViewById(tag);

    if (playerContainerView instanceof PlayerContainerView) {
      ((PlayerContainerView) playerContainerView).getPlayerView().getPlayer().seek(0.0);
      ((PlayerContainerView) playerContainerView).getPlayerView().getPlayer().play();
    } else {
      throw new ClassCastException(String.format("Cannot seek: view with tag #%d is not a ROHBitMovinPlayer", tag));
    }
  }

  @ReactMethod
  public void setSubtitle(int tag, String trackId) {
    View playerContainerView = getCurrentActivity().findViewById(tag);

    if (playerContainerView instanceof PlayerContainerView) {
      ((PlayerContainerView) playerContainerView).getPlayerView().getPlayer().setSubtitle(trackId);
    } else {
      throw new ClassCastException(String.format("Cannot setSubtitle: view with tag #%d is not a ROHBitMovinPlayer", tag));
    }
  }
}
