//
//  ViewController.swift
//  RohTVApp
//
//  Created by User on 25.10.2022.
//

import UIKit
import BitmovinPlayer
import BitmovinAnalyticsCollector

final class ViewController: UIView {

  var player: Player?
  var nextCallback: Bool = false
  var heartbeat: Int = 10
  var currentTime: Double = 0.0
  var duration: Double = 0.0
  var analyticsCollector: BitmovinPlayerCollector? = nil

  let playerConfig = PlayerConfig()
  let playbackConfig = PlaybackConfig()

  let maxDepth = 2

  @objc var hasZoom: Bool = false
  @objc var autoPlay: Bool = false
  @objc var title: String? = nil
  @objc var configuration: NSDictionary? = nil
  @objc var analytics: NSDictionary? = nil

  @objc var onReady:RCTDirectEventBlock? = nil
  @objc var onAirPlay:RCTDirectEventBlock? = nil
  @objc var onPlay:RCTDirectEventBlock? = nil
  @objc var onPause:RCTDirectEventBlock? = nil
  @objc var onEvent:RCTDirectEventBlock? = nil
  @objc var onError:RCTDirectEventBlock? = nil
  @objc var onSeek:RCTDirectEventBlock? = nil
  @objc var onForward:RCTDirectEventBlock? = nil
  @objc var onRewind:RCTDirectEventBlock? = nil
  @objc var onDestroy:RCTDirectEventBlock? = nil

  required init?(coder aDecoder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  override init(frame: CGRect) {
    super.init(frame: frame)
    print("initting!")
  }

  deinit {
      player?.destroy()
  }

  override func didSetProps(_ changedProps: [String]!) {
    print("changed props: ", changedProps!)
    guard let streamUrl = URL.init(string: self.configuration!["url"] as! String) else {
        return
    }
    let sourceConfig = SourceConfig(url: streamUrl, type: .hls)

      if((self.configuration!["poster"]) != nil) {
          sourceConfig.posterSource = URL.init(string: self.configuration!["poster"] as! String)!
      }
      if((self.configuration!["subtitles"]) != nil) {
        let subtitleTrack = SubtitleTrack(url: URL(string: self.configuration!["subtitles"] as! String),
          label: "en",
          identifier: "en",
          isDefaultTrack: false,
          language: "en")
        sourceConfig.add(subtitleTrack: subtitleTrack)
      }
      if((self.configuration!["thumbnails"]) != nil) {
        let thumbnailsTrack = ThumbnailTrack(url: URL(string: self.configuration!["thumbnails"] as! String)!, label: "thumbnails", identifier: "thumbnails", isDefaultTrack: true)
        sourceConfig.thumbnailTrack = thumbnailsTrack
      }

      if((self.configuration!["offset"]) != nil) {
        //self.configuration!["offset"] as! TimeInterval
        sourceConfig.options.startOffset = self.configuration!["offset"] as! TimeInterval
      }

      if((self.configuration!["heartbeat"]) != nil) {
        heartbeat = self.configuration!["heartbeat"] as! Int
      }

      if(self.title != nil) {
        sourceConfig.title = self.title;
      }

      if((self.configuration!["hasNextEpisode"]) != nil) {
          sourceConfig.metadata.addEntries(from: ["hasNextEpisode": self.configuration!["hasNextEpisode"] as! Bool])
      }

      if((self.configuration!["advisory"]) != nil) {
          sourceConfig.metadata.addEntries(from: ["advisory": self.configuration!["advisory"] as Any])
      }

      if((self.configuration!["subtitle"]) != nil) {
        sourceConfig.sourceDescription = self.configuration!["subtitle"] as? String;
      }

      if (self.hasZoom == true){
        //sourceConfig.metadata.addEntries(from: ["hasZoom": self.hasZoom])
        playerConfig.styleConfig.scalingMode = .zoom
      }

      if (self.autoPlay == true){
        playerConfig.playbackConfig.isAutoplayEnabled = true
      }

    player = PlayerFactory.create(playerConfig: playerConfig)
    nextCallback = false;

      if(self.analytics != nil) {
          var plistDictionary: NSDictionary?
          if let path = Bundle.main.path(forResource: "Info", ofType: "plist") {
              plistDictionary = NSDictionary(contentsOfFile: path)

          }
          // Create a BitmovinAnalyticsConfig using your Bitmovin analytics license key and/or your Bitmovin Player Key
          let configAnalytics:BitmovinAnalyticsConfig = BitmovinAnalyticsConfig(key: plistDictionary!["BitmovinAnalyticsLicenseKey"] as! String, playerKey: plistDictionary!["BitmovinPlayerLicenseKey"] as! String)

          configAnalytics.videoId = self.analytics!["videoId"] as? String;
          configAnalytics.title = self.analytics!["title"] as? String;
          configAnalytics.customerUserId = self.analytics!["userId"] as? String;
          configAnalytics.cdnProvider = self.analytics!["cdnProvider"] as? String;
          configAnalytics.customData1 = self.analytics!["buildInfoForBitmovin"] as? String;
          configAnalytics.customData2 = self.analytics!["userId"] as? String;
          configAnalytics.customData3 = self.analytics!["customData3"] as? String;
          configAnalytics.customData4 = self.analytics!["customData4"] as? String;

          // Create a BitmovinAnalytics object using the config just created
          analyticsCollector = BitmovinAnalytics(config: configAnalytics);

          // Attach your player instance
          analyticsCollector!.attachPlayer(player: player!);
        // Create player view and pass the player instance to it
        let playerView = PlayerView(player: player!, frame: self.bounds)

        // Listen to player events
        player?.add(listener: self)

        playerView.autoresizingMask = [.flexibleHeight, .flexibleWidth]
        playerView.frame = self.bounds

        player?.load(sourceConfig: sourceConfig)
        // Make sure that the correct audio session category is set to allow for background playback.
        handleAudioSessionCategorySetting()

        self.addSubview(playerView)
        self.bringSubviewToFront(playerView)
    }
  }

  func play() -> Void {
      DispatchQueue.main.async { [unowned self] in
          player?.play()
      }
  }

  func seekBackwardCommand() -> Void {
      DispatchQueue.main.async { [unowned self] in
          player?.seek(time: self.player!.currentTime - 10)
      }
  }

  func seekForwardCommand() -> Void {
      DispatchQueue.main.async { [unowned self] in
          player?.seek(time: self.player!.currentTime + 10)
      }
  }

  func pause() -> Void {
      DispatchQueue.main.async { [unowned self] in
          player?.pause()
      }
  }

  func destroy() -> Void {
      DispatchQueue.main.async { [unowned self] in
          player?.destroy()
      }
  }

  func handleAudioSessionCategorySetting() {
      let audioSession = AVAudioSession.sharedInstance()

      // When AVAudioSessionCategoryPlayback is already active, we have nothing to do here
      guard audioSession.category.rawValue != AVAudioSession.Category.playback.rawValue else { return }

      do {
          try audioSession.setCategory(AVAudioSession.Category.playback, mode: AVAudioSession.Mode.moviePlayback)
      } catch {
          print("Setting category to AVAudioSessionCategoryPlayback failed.")
      }
  }
}

extension ViewController: PlayerListener {
    func onEvent(_ event: Event, player: Player) {
        dump(event, name: "[Player Event]", maxDepth: 1)
    }

    public func onMetadata(_ event: MetadataEvent, player: Player) {
        if event.metadataType == .ID3 {
            for entry in event.metadata.entries {
                if let metadataEntry = entry as? AVMetadataItem,
                   let id3Key = metadataEntry.key {
                    print("Received metadata with key: \(id3Key)")
                }
            }
        }
    }

  func onPlay(_ event: PlayEvent, player: Player) {
    if self.onPlay != nil {
      print("sending time \(event.time)")
      onPlay!(["time": event.time])
    }
    // dump(event, name: "** PlayEvent", maxDepth: maxDepth)
  }

  func onReady(_ event: ReadyEvent, player: Player) {
    duration = player.duration
    dump(event, name: "** ReadyEvent", maxDepth: maxDepth)
  }

  func onPaused(_ event: PausedEvent, player: Player) {
    dump(event, name: "** PausedEvent", maxDepth: maxDepth)
  }

  func onTimeChanged(_ event: TimeChangedEvent, player: Player) {
    currentTime = event.currentTime
    dump(event, name: "** TimeChangedEvent", maxDepth: maxDepth)
  }

  func onSeeked(_ event: SeekedEvent, player: Player) {
    dump(event, name: "** SeekedEvent", maxDepth: maxDepth)
  }

  func onDestroy(_ event: DestroyEvent, player: Player) {
    if self.onDestroy != nil {
      onDestroy!(["currentTime": currentTime, "duration": duration])
    }

    dump(event, name: "** DestroyEvent", maxDepth: maxDepth)
  }

  func onPlaybackFinished(_ event: PlaybackFinishedEvent, player: Player) {
    dump(event, name: "** PlaybackFinishedEvent", maxDepth: maxDepth)
  }

  func onPlayerError(_ event: PlayerErrorEvent, player: Player) {
    if self.onError != nil {
      onError!(["code": event.code.rawValue, "message": event.message])
    }
    dump(event, name: "** PlayerErrorEvent", maxDepth: maxDepth)
  }
  
  func onSourceError(_ event: SourceErrorEvent, player: Player) {
    if self.onError != nil {
      onError!(["code": event.code.rawValue, "message": event.message])
    }
    dump(event, name: "** SourceErrorEvent", maxDepth: maxDepth)
  }

  func onSubtitleChanged(_ event: SubtitleChangedEvent, player: Player) {
    dump(event, name: "** SubtitleChangedEvent", maxDepth: maxDepth)
  }
}
