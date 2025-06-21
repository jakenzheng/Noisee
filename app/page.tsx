"use client"

import DigitalClock from "./components/DigitalClock"
import PomodoroTimer from "./components/PomodoroTimer"
import MusicPlayer from "./components/MusicPlayer"
import TaskList from "./components/TaskList"
import ThemeSelector from "./components/ThemeSelector"
import { Settings, Linkedin, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"

type DatePosition = "above" | "below" | "hidden"
type Language = "en" | "jp" | "es" | "fr" | "de" | "it" | "pt" | "zh"

export default function Home() {
  const [datePosition, setDatePosition] = useState<DatePosition>("below")
  const [language, setLanguage] = useState<Language>("jp")

  const updateDatePosition = (position: DatePosition) => {
    setDatePosition(position)
    if (typeof window !== "undefined") {
      localStorage.setItem("datePosition", position)
    }
  }

  const updateLanguage = (lang: Language) => {
    setLanguage(lang)
    if (typeof window !== "undefined") {
      localStorage.setItem("dateLanguage", lang)
    }
  }

  return (
    <main className="flex flex-col justify-center items-center min-h-screen bg-background p-4 gap-6">
      <div className="absolute top-4 right-4 flex items-center gap-4">
        <ThemeSelector />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-primary/80 hover:bg-transparent hover:text-primary w-12 h-12 transition-colors"
            >
              <Settings className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-background border-primary/30">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="text-primary/70 cursor-pointer">
                <span>Date Display</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="bg-background border-primary/30">
                <DropdownMenuItem className="text-primary/70 cursor-pointer" onClick={() => updateDatePosition("above")}>
                  Above Time
                </DropdownMenuItem>
                <DropdownMenuItem className="text-primary/70 cursor-pointer" onClick={() => updateDatePosition("below")}>
                  Below Time
                </DropdownMenuItem>
                <DropdownMenuItem className="text-primary/70 cursor-pointer" onClick={() => updateDatePosition("hidden")}>
                  Hidden
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="text-primary/70 cursor-pointer">
                <span>Date Language</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="bg-background border-primary/30">
                <DropdownMenuItem className="text-primary/70 cursor-pointer" onClick={() => updateLanguage("en")}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem className="text-primary/70 cursor-pointer" onClick={() => updateLanguage("jp")}>
                  Japanese
                </DropdownMenuItem>
                <DropdownMenuItem className="text-primary/70 cursor-pointer" onClick={() => updateLanguage("es")}>
                  Spanish
                </DropdownMenuItem>
                <DropdownMenuItem className="text-primary/70 cursor-pointer" onClick={() => updateLanguage("fr")}>
                  French
                </DropdownMenuItem>
                <DropdownMenuItem className="text-primary/70 cursor-pointer" onClick={() => updateLanguage("de")}>
                  German
                </DropdownMenuItem>
                <DropdownMenuItem className="text-primary/70 cursor-pointer" onClick={() => updateLanguage("it")}>
                  Italian
                </DropdownMenuItem>
                <DropdownMenuItem className="text-primary/70 cursor-pointer" onClick={() => updateLanguage("pt")}>
                  Portuguese
                </DropdownMenuItem>
                <DropdownMenuItem className="text-primary/70 cursor-pointer" onClick={() => updateLanguage("zh")}>
                  Chinese
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col items-center justify-center gap-1 mt-8">
        <DigitalClock datePosition={datePosition} language={language} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mt-4">
        <div className="flex flex-col space-y-6">
          <PomodoroTimer />
          <TaskList />
        </div>
        <div className="space-y-6">
          <MusicPlayer />
        </div>
      </div>

      <div className="absolute bottom-4 right-4 flex items-center gap-3 text-primary/70">
        <span className="text-sm font-medium font-['Space_Mono']">(built by jake zheng)</span>
        <a
          href="https://www.linkedin.com/in/jakenzheng"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors"
        >
          <Linkedin className="h-5 w-5" />
        </a>
        <a
          href="https://www.instagram.com/jake_zhengg/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors"
        >
          <Instagram className="h-5 w-5" />
        </a>
      </div>
    </main>
  )
}
