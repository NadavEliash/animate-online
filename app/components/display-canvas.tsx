import { useEffect, useRef, useState } from "react"
import { drawingAction, frame, layer } from "../models"

interface DisplayCanvasProps {
    size: string
    frames?: frame[]
    setFrames?: Function
    frame?: frame
    layers?: layer[]
    setLayers?: Function
    layer?: layer
    idx: number
    currentIdx: number
    canvasSize: { width: number, height: number }
    setCurrentIdx?: Function
    background: string
    loadImage: Function
}

export default function DisplayCanvas({
    size,
    canvasSize,
    frames,
    setFrames,
    frame,
    layers,
    setLayers,
    layer,
    idx,
    currentIdx,
    setCurrentIdx,
    background,
    loadImage,
}: DisplayCanvasProps) {

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [currentFrame, setCurrentFrame] = useState(null)

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current
            canvas.width = canvasSize.width
            canvas.height = canvasSize.height
            const ctx = canvas.getContext('2d')
            setContext(ctx)
            if (ctx) {
                if (frame || (layer && idx === 0)) {
                    ctx.fillStyle = background
                    ctx.fillRect(0, 0, canvas.width, canvas.height)
                } else if (layer) {
                    drawTransparentGrid()
                }
            }
        }
    }, [])

    useEffect(() => {
        if (frame && frame.layers) {
            const ctx = canvasRef.current?.getContext('2d', { willReadFrequently: true })
            if (ctx) {
                ctx.fillStyle = background
                ctx.fillRect(0, 0, canvasSize.width, canvasSize.height)

                if (frame.layers.length) {
                    for (let i = 1; i < frame.layers.length; i++) {
                        if (frame.layers[i].drawingActions?.length) {
                            drawLayer(ctx, frame.layers[i].drawingActions, i === frame.layers.length - 1 ? true : false)
                        }
                    }
                }
            }
        }
    }, [frame])

    useEffect(() => {
        if (layer) {
            const ctx = canvasRef.current?.getContext('2d')
            if (ctx) {
                ctx.clearRect(0, 0, canvasSize.width, canvasSize.height)
                if (idx !== 0) drawTransparentGrid()

                if (layer.drawingActions && layer.drawingActions.length) {
                    drawLayer(ctx, layer.drawingActions)
                }
            }
        }
    }, [layers])

    const drawTransparentGrid = async () => {
        if (context) {
            const image = await loadImage("https://www.svgrepo.com/show/351866/chess-board.svg")
            context.globalAlpha = 0.2
            context.drawImage(image, 0, 0, canvasSize.width, canvasSize.height)
        }
    }

    const drawLayer = async (ctx: CanvasRenderingContext2D, actions: drawingAction[], last?: boolean) => {
        for (const action of actions) {
            try {
                const image = await loadImage(action.url)
                ctx.globalAlpha = 1
                ctx.drawImage(image, 0, 0)
            } catch (error) {
                console.error('Error loading image', error)
            }
            if (!action.isPath) {
                break
            }
        }

        if (frames && setFrames && last) {
            const imageData = ctx.getImageData(0, 0, canvasSize.width, canvasSize.height)
            frames[idx].imageData = imageData
            setFrames((prev: frame[]) => [...prev])
        }
    }

    const handleClick = () => {
            if (layer && idx === 0) return
            if (setCurrentIdx) setCurrentIdx(idx)
    }

    const index = frame
        ? idx + 1 < 10 ? '0' + (idx + 1) : (idx + 1)
        : idx === 0 ? 'BG' : '0' + idx

    return (
        <div className="flex flex-col items-center justify-center" onClick={handleClick}>
            <canvas ref={canvasRef} width={500} height={500}
                className={`${size} rounded-md pointer-events-none bg-white ${idx === currentIdx ? 'border-4 border-purple-500' : ''}`}>
            </canvas>
            <h1 className="text-white">{index}</h1>
        </div>
    )
}