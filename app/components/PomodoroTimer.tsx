"use client"

import { useState, useEffect } from "react"
import { Play, Pause, RotateCcw, Volume2, VolumeX, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import MoviePlayer from "./MoviePlayer"

type TimerMode = "work" | "break"
type TimerPreset = "25/5" | "50/10" | "90/20" | "custom"

interface TimerSettings {
  workTime: number
  breakTime: number
  preset: TimerPreset
  enableMovieBreaks: boolean
}

const DEFAULT_SETTINGS: TimerSettings = {
  workTime: 50 * 60, // 50 minutes in seconds
  breakTime: 10 * 60, // 10 minutes in seconds
  preset: "50/10",
  enableMovieBreaks: false,
}

export default function PomodoroTimer() {
  const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS)
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.workTime)
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState<TimerMode>("work")
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [customWorkTime, setCustomWorkTime] = useState(DEFAULT_SETTINGS.workTime / 60)
  const [customBreakTime, setCustomBreakTime] = useState(DEFAULT_SETTINGS.breakTime / 60)
  const [showMoviePlayer, setShowMoviePlayer] = useState(false)

  useEffect(() => {
    const savedSettings = localStorage.getItem("pomodoroSettings")
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings)
      setSettings(parsedSettings)
      setTimeLeft(parsedSettings.workTime)
      setCustomWorkTime(Math.floor(parsedSettings.workTime / 60))
      setCustomBreakTime(Math.floor(parsedSettings.breakTime / 60))
    }
  }, [])

  // Save settings when they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pomodoroSettings", JSON.stringify(settings))
    }
  }, [settings])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1)
      }, 1000)
    } else if (isActive && timeLeft === 0) {
      // Play sound if enabled
      if (soundEnabled) {
        const audio = new Audio("/notification.mp3")
        audio.play().catch((err) => console.error("Error playing sound:", err))
      }

      // Switch modes
      if (mode === "work") {
        setMode("break")
        setTimeLeft(settings.breakTime)
      } else {
        setMode("work")
        setTimeLeft(settings.workTime)
      }
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft, mode, soundEnabled, settings])

  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setIsActive(false)
    setMode("work")
    setTimeLeft(settings.workTime)
    setShowMoviePlayer(false)
  }

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const calculateProgress = () => {
    const total = mode === "work" ? settings.workTime : settings.breakTime
    return ((total - timeLeft) / total) * 100
  }

  const applyPreset = (preset: TimerPreset) => {
    let newSettings: TimerSettings

    switch (preset) {
      case "25/5":
        newSettings = {
          workTime: 25 * 60,
          breakTime: 5 * 60,
          preset,
          enableMovieBreaks: false,
        }
        break
      case "50/10":
        newSettings = {
          workTime: 50 * 60,
          breakTime: 10 * 60,
          preset,
          enableMovieBreaks: false,
        }
        break
      case "90/20":
        newSettings = {
          workTime: 90 * 60,
          breakTime: 20 * 60,
          preset,
          enableMovieBreaks: false,
        }
        break
      case "custom":
        newSettings = {
          workTime: customWorkTime * 60,
          breakTime: customBreakTime * 60,
          preset: "custom",
          enableMovieBreaks: false,
        }
        break
      default:
        newSettings = DEFAULT_SETTINGS
    }

    setSettings(newSettings)

    // Reset timer with new settings
    setIsActive(false)
    setMode("work")
    setTimeLeft(newSettings.workTime)
  }

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-background/30 rounded-lg border border-primary/20 shadow-sm max-w-md w-full mx-auto">
      <div className="w-full">
        <div className="relative h-1.5 bg-primary/10 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-primary/60"
            style={{ width: `${calculateProgress()}%` }}
          ></div>
        </div>
      </div>

      <div className="text-center">
        <div className="text-5xl font-medium text-primary font-mono">{formatTime(timeLeft)}</div>
        <div className="text-xs uppercase tracking-wider mt-1 text-primary/50">
          {mode === "work" ? "focus" : "break"}
        </div>
      </div>

      <div className="flex space-x-3">
        <Button
          onClick={toggleTimer}
          variant="outline"
          size="icon"
          className="rounded-full border border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary w-9 h-9"
        >
          {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>

        <Button
          onClick={resetTimer}
          variant="outline"
          size="icon"
          className="rounded-full border border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary w-9 h-9"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        <Button
          onClick={toggleSound}
          variant="outline"
          size="icon"
          className="rounded-full border border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary w-9 h-9"
        >
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border border-primary/30 text-primary/70 hover:bg-primary/10 hover:text-primary w-9 h-9"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-background border-primary/30 text-primary p-6 max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-primary text-2xl mb-4">Timer Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-primary/80">Preset Timers</Label>
                <Select value={settings.preset} onValueChange={(value) => applyPreset(value as TimerPreset)}>
                  <SelectTrigger className="bg-transparent border-primary/30">
                    <SelectValue placeholder="Select a preset" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-primary/30">
                    <SelectItem value="25/5">25/5 (Pomodoro)</SelectItem>
                    <SelectItem value="50/10">50/10 (Extended)</SelectItem>
                    <SelectItem value="90/20">90/20 (Deep Work)</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {settings.preset === "custom" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="custom-work" className="text-primary/80">
                      Work (min)
                    </Label>
                    <Slider
                      id="custom-work"
                      min={1}
                      max={180}
                      step={1}
                      value={[customWorkTime]}
                      onValueChange={(value) => setCustomWorkTime(value[0])}
                    />
                    <div className="text-center text-primary/60">{customWorkTime} min</div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="custom-break" className="text-primary/80">
                      Break (min)
                    </Label>
                    <Slider
                      id="custom-break"
                      min={1}
                      max={60}
                      step={1}
                      value={[customBreakTime]}
                      onValueChange={(value) => setCustomBreakTime(value[0])}
                    />
                    <div className="text-center text-primary/60">{customBreakTime} min</div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
