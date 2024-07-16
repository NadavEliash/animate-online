import { useEffect, useRef, useState } from "react"
import { frame, onDownload } from "@/app/models"

interface PlayingCanvasProps {
    isPlay: boolean
    onDownload: onDownload
    setOnDownload: Function
    frames: frame[]
    canvasSize: { width: number, height: number }
    background: string
    loadImage: Function
}

export default function PlayingCanvas({
    isPlay,
    onDownload,
    setOnDownload,
    frames,
    canvasSize,
    background,
    loadImage
}: PlayingCanvasProps) {

    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(null)

    let frameIdx = 0
    let mediaRecorder: MediaRecorder

    useEffect(() => {
        frameIdx = 0

        if (canvasRef.current) {
            const canvas = canvasRef.current
            canvas.width = canvasSize.width
            canvas.height = canvasSize.height
            const ctx = canvas.getContext('2d')
            if (ctx) setContext(ctx)
        }
    })

    useEffect(() => {
        if (isPlay && !onDownload.on) {
            const id = setInterval(() => {
                frameIdx < frames.length ? frameIdx++ : frameIdx = 0
                drawFrame(frames[frameIdx])
            }, 83.33)

            return () => {
                clearInterval(id)
            }
        }
    }, [isPlay])

    useEffect(() => {
        if (!isPlay && onDownload.on) {
            if (onDownload.video) {
                recordVideo()
                const id = setInterval(() => {
                    if (frameIdx < frames.length) {
                        drawFrame(frames[frameIdx])
                        frameIdx++
                    } else {
                        clearInterval(id)
                        mediaRecorder.stop()
                    }
                }, 83.33)

                return () => {
                    clearInterval(id)
                }

            } else {
                downloadImages()
            }
        }
    }, [onDownload])

    const drawFrame = async (frame: frame) => {
        const ctx = canvasRef.current?.getContext('2d')

        if (frame?.frameUrl) {
            const image = await loadImage(frame.frameUrl)
            ctx?.drawImage(image, 0, 0, canvasSize.width, canvasSize.height)
        } else if (ctx && frame && !frame.frameUrl) {
            ctx.fillStyle = background
            ctx.fillRect(0, 0, canvasSize.width, canvasSize.height)
        }
    }

    const recordVideo = () => {
        if (onDownload.on) {
            const ctx = canvasRef.current?.getContext('2d')
            const videoStream = canvasRef.current?.captureStream(30)
            mediaRecorder = new MediaRecorder(videoStream!)
            let chunks: Blob[] = []
            let videoURL

            mediaRecorder.ondataavailable = (e) => {
                chunks.push(e.data)
            }

            mediaRecorder.onstop = (e) => {
                const blob = new Blob(chunks, { 'type': 'video/mp4' })
                videoURL = URL.createObjectURL(blob)
                download(videoURL)
            }

            mediaRecorder.start()

            const download = (dataURL: string) => {
                const link = document.createElement('a')
                link.href = dataURL
                link.download = `${onDownload.name}.mp4`
                link.click()
                setOnDownload({ video: true, name: '', on: false })
            }
        }
    }

    const downloadImages = () => {
        if (onDownload.on) {
            for (let i = 0; i < frames.length; i++) {
                const link = document.createElement('a')
                link.href = frames[i].frameUrl!
                link.download = `${onDownload.name}_${i < 10 ? '0' + (i + 1) : i + 1}`
                link.click()
            }
            setOnDownload({ video: true, name: '', on: false })
        }
    }

    return (
        <canvas ref={canvasRef} width={500} height={500}
            className='absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[100%] md:w-fit rounded-md pointer-events-none z-20'>
        </canvas>
    )
}