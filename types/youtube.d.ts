// Type definitions for YouTube IFrame API
declare namespace YT {
  export enum PlayerState {
    UNSTARTED = -1,
    ENDED = 0,
    PLAYING = 1,
    PAUSED = 2,
    BUFFERING = 3,
    CUED = 5,
  }

  export interface PlayerOptions {
    width?: string | number
    height?: string | number
    videoId?: string
    playerVars?: {
      autoplay?: 0 | 1
      controls?: 0 | 1
      disablekb?: 0 | 1
      enablejsapi?: 0 | 1
      fs?: 0 | 1
      iv_load_policy?: 1 | 3
      modestbranding?: 0 | 1
      playsinline?: 0 | 1
      rel?: 0 | 1
      showinfo?: 0 | 1
      loop?: 0 | 1
      [key: string]: any
    }
    events?: {
      onReady?: (event: Event) => void
      onStateChange?: (event: OnStateChangeEvent) => void
      onPlaybackQualityChange?: (event: Event) => void
      onPlaybackRateChange?: (event: Event) => void
      onError?: (event: OnErrorEvent) => void
      onApiChange?: (event: Event) => void
    }
  }

  export interface Player {
    playVideo(): void
    pauseVideo(): void
    stopVideo(): void
    seekTo(seconds: number, allowSeekAhead?: boolean): void
    loadVideoById(videoId: string, startSeconds?: number): void
    cueVideoById(videoId: string, startSeconds?: number): void
    loadVideoById(options: { videoId: string; startSeconds?: number; endSeconds?: number }): void
    cueVideoById(options: { videoId: string; startSeconds?: number; endSeconds?: number }): void
    loadPlaylist(playlist: string | string[], index?: number, startSeconds?: number): void
    cuePlaylist(playlist: string | string[], index?: number, startSeconds?: number): void
    mute(): void
    unMute(): void
    isMuted(): boolean
    setVolume(volume: number): void
    getVolume(): number
    getVideoLoadedFraction(): number
    getPlayerState(): number
    getCurrentTime(): number
    getDuration(): number
    getVideoUrl(): string
    getVideoEmbedCode(): string
    getPlaylist(): string[]
    getPlaylistIndex(): number
    destroy(): void
  }

  export interface OnStateChangeEvent {
    data: PlayerState
    target: Player
  }

  export interface OnErrorEvent {
    data: number
    target: Player
  }

  export interface Event {
    target: Player
    data: any
  }

  export function Player(elementId: string | HTMLElement, options: PlayerOptions): Player
}

interface Window {
  onYouTubeIframeAPIReady: () => void
  YT: typeof YT
  onSpotifyWebPlaybackSDKReady: () => void
  Spotify: any
}
