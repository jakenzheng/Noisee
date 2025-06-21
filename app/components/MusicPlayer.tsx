"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, SkipForward, SkipBack, Trash2, Plus, Music, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { getYouTubePlayer } from "@/utils/youtube"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

// Promise to ensure the YouTube API is loaded
const youtubeApiPromise = new Promise<void>((resolve) => {
  if (typeof window !== 'undefined') {
    if (window.YT && window.YT.Player) {
      return resolve();
    }
    window.onYouTubeIframeAPIReady = () => {
      resolve();
    };
  }
});

interface Track {
  id: string
  title: string
  url: string
}

interface MusicPlayerProps {
  showPlaylist?: boolean;
}

export default function MusicPlayer({ showPlaylist = true }: MusicPlayerProps) {
  const [playlist, setPlaylist] = useState<Track[]>([])
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [newTrackUrl, setNewTrackUrl] = useState("")
  const [volume, setVolume] = useState(70)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlayerReady, setIsPlayerReady] = useState(false)
  const playerRef = useRef<any>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)

  // Load playlist from localStorage on initial render
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPlaylist = localStorage.getItem("musicPlaylist")
      if (savedPlaylist) {
        setPlaylist(JSON.parse(savedPlaylist))
      }
    }
  }, [])

  // Save playlist to localStorage when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("musicPlaylist", JSON.stringify(playlist))
    }
  }, [playlist])

  // Initialize YouTube API
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://www.youtube.com/iframe_api"
    document.head.appendChild(script)

    youtubeApiPromise.then(() => {
      if (!playerContainerRef.current) return

      const playerDiv = document.createElement("div")
      playerDiv.id = "youtube-player"
      playerContainerRef.current.appendChild(playerDiv)

      playerRef.current = getYouTubePlayer("youtube-player", {
        height: "0",
        width: "0",
        playerVars: {
          playsinline: 1,
          controls: 0,
          disablekb: 1,
        },
        events: {
          onReady: () => setIsPlayerReady(true),
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              playNextTrack()
            }
          },
          onError: (event: any) => {
            console.error("YouTube player error:", event.data)
            playNextTrack()
          },
        },
      })
    })

    return () => {
      playerRef.current?.destroy()
      document.head.removeChild(script)
    }
  }, [])

  // Extract YouTube video ID from URL
  const extractVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  // Add a new track to the playlist
  const addTrack = async () => {
    if (!newTrackUrl.trim()) return

    const trackId = extractVideoId(newTrackUrl)
    if (!trackId) {
      alert("Invalid YouTube URL")
      return
    }

    try {
      const response = await fetch(`/api/oembed?url=${encodeURIComponent(newTrackUrl)}`)
      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }
      
      const title = data.title || "Unknown Title"

      const newTrack: Track = {
        id: trackId,
        title,
        url: newTrackUrl,
      }

      setPlaylist([...playlist, newTrack])
      setNewTrackUrl("")

      if (playlist.length === 0) {
        setCurrentTrackIndex(0)
      }
    } catch (error) {
      console.error("Error fetching track title:", error)
      alert("Could not fetch track information.")
    }
  }

  // Remove a track from the playlist
  const removeTrack = (index: number) => {
    const newPlaylist = [...playlist]
    newPlaylist.splice(index, 1)
    setPlaylist(newPlaylist)

    // Adjust currentTrackIndex if necessary
    if (index === currentTrackIndex) {
      if (isPlaying) {
        playerRef.current?.stopVideo()
        setIsPlaying(false)
      }
      if (newPlaylist.length > 0) {
        setCurrentTrackIndex(0)
      } else {
        setCurrentTrackIndex(-1)
      }
    } else if (index < currentTrackIndex) {
      setCurrentTrackIndex(currentTrackIndex - 1)
    }
  }

  // Play/pause the current track
  const togglePlay = () => {
    if (currentTrackIndex === -1 && playlist.length > 0) {
      setCurrentTrackIndex(0)
      loadAndPlayTrack(0)
      return
    }

    if (!playlist[currentTrackIndex]) return

    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo()
      } else {
        playerRef.current.playVideo()
      }
    }

    setIsPlaying(!isPlaying)
  }

  // Load and play a specific track
  const loadAndPlayTrack = (index: number) => {
    if (!playlist[index] || !isPlayerReady) return

    const track = playlist[index]

    if (playerRef.current) {
      const videoId = extractVideoId(track.url)
      if (videoId) {
        playerRef.current.loadVideoById(videoId)
        playerRef.current.setVolume(volume)
        setIsPlaying(true)
      }
    }
  }

  // Play the previous track
  const playPreviousTrack = () => {
    if (playlist.length === 0) return

    const newIndex = currentTrackIndex <= 0 ? playlist.length - 1 : currentTrackIndex - 1
    setCurrentTrackIndex(newIndex)
    loadAndPlayTrack(newIndex)
  }

  // Play the next track
  const playNextTrack = () => {
    if (playlist.length === 0) return

    const newIndex = (currentTrackIndex + 1) % playlist.length
    setCurrentTrackIndex(newIndex)
    loadAndPlayTrack(newIndex)
  }

  // Update volume
  useEffect(() => {
    if (playerRef.current && isPlayerReady) {
      playerRef.current.setVolume(volume)
    }
  }, [volume, isPlayerReady])

  // Update progress bar
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying && playerRef.current?.getCurrentTime) {
        const currentTime = playerRef.current.getCurrentTime()
        const currentDuration = playerRef.current.getDuration()
        setProgress(currentTime)
        setDuration(currentDuration)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isPlaying])

  // Load and play track when currentTrackIndex changes
  useEffect(() => {
    if (currentTrackIndex >= 0 && isPlayerReady) {
      loadAndPlayTrack(currentTrackIndex)
    }
  }, [currentTrackIndex, isPlayerReady, playlist])

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === 0) return "00:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const PlayerControls = (
    <div className="flex flex-col space-y-4 p-6 bg-background/30 rounded-lg border border-primary/20 shadow-sm w-full">
      <h2 className="text-lg font-medium text-primary/80 text-center">(music)</h2>
      <div ref={playerContainerRef} className="hidden"></div>
      
      <div className="flex-grow flex flex-col justify-between">
        <p className="text-sm text-primary truncate h-5">
          {currentTrackIndex !== -1 ? playlist[currentTrackIndex]?.title : "No song selected"}
        </p>

        <div className="space-y-3">
            <div className="flex items-center justify-center gap-3">
              <Button
                onClick={playPreviousTrack}
                variant="outline"
                size="icon"
                className="rounded-full border border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary w-7 h-7"
                disabled={playlist.length < 2}
              >
                <SkipBack className="h-3 w-3" />
              </Button>
              <Button
                onClick={togglePlay}
                variant="outline"
                size="icon"
                className="rounded-full border-primary/30 text-primary/80 hover:bg-primary/20 hover:text-primary w-10 h-10"
                disabled={playlist.length === 0}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              <Button
                onClick={playNextTrack}
                variant="outline"
                size="icon"
                className="rounded-full border border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary w-7 h-7"
                disabled={playlist.length < 2}
              >
                <SkipForward className="h-3 w-3" />
              </Button>
            </div>

            <div className="w-full space-y-1">
              <Slider
                value={[progress]}
                max={duration}
                step={1}
                onValueChange={(value) => playerRef.current?.seekTo(value[0])}
                disabled={currentTrackIndex === -1}
              />
              <div className="flex justify-between text-xs text-primary/60 font-mono">
                <span suppressHydrationWarning>{formatTime(progress)}</span>
                <span suppressHydrationWarning>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full">
              <Volume2 className="h-4 w-4 text-primary/60" />
              <Slider value={[volume]} onValueChange={(value) => setVolume(value[0])} />
              <span className="text-xs w-12 text-right text-primary/60 font-mono">Vol: {volume}%</span>
            </div>
        </div>
      </div>
    </div>
  );

  const Playlist = (
    <div className="flex flex-col space-y-2 p-6 bg-background/30 rounded-lg border border-primary/20 shadow-sm w-full">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-primary/80">(playlist)</h3>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="text-primary/70 hover:text-primary">
              <Plus className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-background/80 backdrop-blur-sm border-primary/30">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none text-primary">Add Song</h4>
                <p className="text-sm text-primary/60">Paste a YouTube URL to add a new song.</p>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  value={newTrackUrl}
                  onChange={(e) => setNewTrackUrl(e.target.value)}
                  placeholder="YouTube URL"
                  className="flex-grow border-primary/20 bg-background/50 text-primary placeholder:text-primary/40 h-8 text-xs"
                />
                <Button onClick={addTrack} size="sm" className="h-8">
                  Add
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="space-y-2 overflow-auto max-h-32 thin-scrollbar pr-1 flex-grow">
        {playlist.length > 0 ? (
          playlist.map((track, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
                index === currentTrackIndex ? "bg-primary/20" : "hover:bg-primary/10"
              }`}
              onClick={() => setCurrentTrackIndex(index)}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <Music className="h-4 w-4 text-primary/70 flex-shrink-0" />
                <span className="text-sm text-primary/90 truncate">{track.title}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-primary/50 hover:text-primary flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTrack(index);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))
        ) : (
          <div className="text-center text-primary/40 text-sm py-6 h-full flex items-center justify-center">No tracks added</div>
        )}
      </div>
    </div>
  );

  if (!showPlaylist) {
    return PlayerControls;
  }

  return (
    <>
      {PlayerControls}
      {Playlist}
    </>
  );
}
