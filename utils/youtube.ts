// utils/youtube.ts
import type YT from "types/youtube"

export const getYouTubePlayer = (elementId: string, options: YT.PlayerOptions): YT.Player => {
  return new window.YT.Player(elementId, options)
}
