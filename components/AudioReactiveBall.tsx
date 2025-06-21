"use client"

import React, { useEffect, useRef } from "react"

export default function AudioReactiveBall() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const asciiRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()
  const audioContextRef = useRef<AudioContext>()
  const analyserRef = useRef<AnalyserNode>()
  const dataArrayRef = useRef<Uint8Array>()
  const sourceRef = useRef<MediaStreamAudioSourceNode>()
  const streamRef = useRef<MediaStream>()
  const rotationRef = useRef(0)

  // ASCII characters from darkest to lightest
  const asciiChars = " .:-=+*#%@"

  // Ball properties
  const ballRef = useRef({
    x: 0,
    y: 0,
    baseRadius: 100,
    currentRadius: 100,
    targetRadius: 100,
    hue: 200,
    targetHue: 200,
    particles: [] as Array<{
      x: number
      y: number
      vx: number
      vy: number
      life: number
      maxLife: number
      size: number
    }>,
  })

  const addParticles = (intensity: number, canvas: HTMLCanvasElement) => {
    const ball = ballRef.current
    const particleCount = Math.floor(intensity * 5)

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = (2 + Math.random() * 4) * (1 + intensity * 15)
      ball.particles.push({
        x: ball.x + Math.cos(angle) * ball.currentRadius,
        y: ball.y + Math.sin(angle) * ball.currentRadius,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 120,
        maxLife: 120,
        size: 2 + Math.random() * 3,
      })
    }

    if (ball.particles.length > 200) {
      ball.particles.splice(0, ball.particles.length - 200)
    }
  }

  const convertToAscii = () => {
    const canvas = canvasRef.current
    const asciiDiv = asciiRef.current
    if (!canvas || !asciiDiv) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    if (canvas.width <= 0 || canvas.height <= 0) return

    const charWidth = 3
    const charHeight = 6
    const cols = Math.floor(canvas.width / charWidth)
    const rows = Math.floor(canvas.height / charHeight)

    if (cols <= 0 || rows <= 0) return

    let imageData
    try {
      imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    } catch (error) {
      console.warn("Failed to get image data:", error)
      return
    }

    const pixels = imageData.data
    let asciiString = ""

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const pixelX = Math.floor(x * charWidth + charWidth / 2)
        const pixelY = Math.floor(y * charHeight + charHeight / 2)
        if (pixelX >= canvas.width || pixelY >= canvas.height) {
          asciiString += " "
          continue
        }
        const pixelIndex = (pixelY * canvas.width + pixelX) * 4
        if (pixelIndex >= pixels.length) {
          asciiString += " "
          continue
        }
        const r = pixels[pixelIndex] || 0
        const g = pixels[pixelIndex + 1] || 0
        const b = pixels[pixelIndex + 2] || 0
        const brightness = (r + g + b) / 3
        const charIndex = Math.floor((brightness / 255) * (asciiChars.length - 1))
        asciiString += asciiChars[charIndex]
      }
      asciiString += "\n"
    }
    asciiDiv.textContent = asciiString
  }

  const animate = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    if (canvas.width <= 0 || canvas.height <= 0) {
      animationRef.current = requestAnimationFrame(animate)
      return
    }
    const ball = ballRef.current
    ctx.fillStyle = "rgba(0, 0, 0, 1)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    let volume = 0
    let dominantFreq = 0
    if (analyserRef.current && dataArrayRef.current) {
      analyserRef.current.getByteFrequencyData(dataArrayRef.current)
      const sum = dataArrayRef.current.reduce((a: number, b: number) => a + b, 0)
      volume = sum / dataArrayRef.current.length / 255
      volume = Math.min(1, volume * 1.5)
      let maxAmplitude = 0
      let maxIndex = 0
      for (let i = 0; i < dataArrayRef.current.length; i++) {
        if (dataArrayRef.current[i] > maxAmplitude) {
          maxAmplitude = dataArrayRef.current[i]
          maxIndex = i
        }
      }
      dominantFreq = maxIndex / dataArrayRef.current.length
      ball.targetRadius = ball.baseRadius + volume * 120
      ball.targetHue = 200 + dominantFreq * 160
      const particleThreshold = 0.05
      if (volume > particleThreshold) {
        addParticles(volume, canvas)
      }
    } else {
      const time = Date.now() / 1000
      const pulseFactor = Math.sin(time) * 0.1 + 0.9
      ball.targetRadius = ball.baseRadius * pulseFactor
    }
    ball.currentRadius += (ball.targetRadius - ball.currentRadius) * 0.1
    ball.hue += (ball.targetHue - ball.hue) * 0.1
    ball.x = canvas.width / 2
    ball.y = canvas.height / 2

    // Revolve: increment rotation and apply to context
    rotationRef.current += 0.01 // Adjust speed as desired
    ctx.save()
    ctx.translate(ball.x, ball.y)
    ctx.rotate(rotationRef.current)
    ctx.translate(-ball.x, -ball.y)

    // Draw the ball and features as before
    const gradient = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, ball.currentRadius)
    gradient.addColorStop(0, `rgba(255, 255, 255, 1)`)
    gradient.addColorStop(0.7, `rgba(180, 180, 180, 0.8)`)
    gradient.addColorStop(1, `rgba(80, 80, 80, 0.2)`)
    ctx.shadowColor = `rgba(255, 255, 255, 0.8)`
    ctx.shadowBlur = 30
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(ball.x, ball.y, ball.currentRadius, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0
    const coreGradient = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, ball.currentRadius * 0.3)
    coreGradient.addColorStop(0, `rgba(255, 255, 255, 1)`)
    coreGradient.addColorStop(1, `rgba(255, 255, 255, 0.3)`)
    ctx.fillStyle = coreGradient
    ctx.beginPath()
    ctx.arc(ball.x, ball.y, ball.currentRadius * 0.3, 0, Math.PI * 2)
    ctx.fill()
    ball.particles.forEach((particle: typeof ballRef.current.particles[number], index: number) => {
      particle.x += particle.vx
      particle.y += particle.vy
      particle.life--
      const alpha = particle.life / particle.maxLife
      ctx.fillStyle = `rgba(220, 220, 220, ${alpha})`
      ctx.shadowColor = `rgba(255, 255, 255, ${alpha})`
      ctx.shadowBlur = 8
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2)
      ctx.fill()
      if (particle.life <= 0) {
        ball.particles.splice(index, 1)
      }
    })
    if (analyserRef.current && dataArrayRef.current) {
      const barCount = 32
      const angleStep = (Math.PI * 2) / barCount
      for (let i = 0; i < barCount; i++) {
        const angle = i * angleStep
        let amplitude = dataArrayRef.current[i * 4] / 255
        amplitude = Math.min(1, amplitude * 3)
        const barLength = amplitude * 60
        const startX = ball.x + Math.cos(angle) * (ball.currentRadius + 10)
        const startY = ball.y + Math.sin(angle) * (ball.currentRadius + 10)
        const endX = ball.x + Math.cos(angle) * (ball.currentRadius + 10 + barLength)
        const endY = ball.y + Math.sin(angle) * (ball.currentRadius + 10 + barLength)
        const grayValue = Math.floor(200 * amplitude)
        ctx.strokeStyle = `rgba(${grayValue}, ${grayValue}, ${grayValue}, ${amplitude * 1.5})`
        ctx.lineWidth = 3
        ctx.shadowColor = `rgba(255, 255, 255, ${amplitude})`
        ctx.shadowBlur = 4
        ctx.beginPath()
        ctx.moveTo(startX, startY)
        ctx.lineTo(endX, endY)
        ctx.stroke()
      }
    }
    ctx.shadowBlur = 0
    ctx.restore() // Restore context after rotation
    convertToAscii()
    animationRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)
    const initAudio = async () => {
      try {
        const constraints = {
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
            sampleRate: 48000,
            channelCount: 1,
            volume: 1.0,
          },
        }
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        streamRef.current = stream
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 48000,
        })
        const analyser = audioContext.createAnalyser()
        const source = audioContext.createMediaStreamSource(stream)
        analyser.fftSize = 256
        analyser.smoothingTimeConstant = 0.5
        const gainNode = audioContext.createGain()
        gainNode.gain.value = 1.5
        source.connect(gainNode)
        gainNode.connect(analyser)
        audioContextRef.current = audioContext
        analyserRef.current = analyser
        sourceRef.current = source
        dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount)
        console.log("Audio initialized with high sensitivity for all devices")
      } catch (err) {
        console.error("Error accessing microphone:", err)
      }
    }
    initAudio()
    setTimeout(() => {
      animate()
    }, 100)
    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  return (
    <div className="fixed inset-0 z-0" style={{ opacity: 0.5 }}>
      <canvas ref={canvasRef} className="w-full h-full opacity-0"></canvas>
      <div
        ref={asciiRef}
        className="fixed inset-0 font-mono text-white whitespace-pre overflow-hidden pointer-events-none flex items-center justify-center"
        style={{
          fontSize: "5px",
          lineHeight: "5px",
          letterSpacing: "-0.5px",
        }}
      ></div>
    </div>
  )
} 