import { useEffect, useRef, useState } from "react"
import { drawingAction, frame, layer } from "../models"

interface OnionSkinProps {
    onionSkin: frame[]
    currentFrameIdx: number
    canvasSize: { width: number, height: number }
    loadImage: Function
}

export default function OnionSkin({
    onionSkin,
    currentFrameIdx,
    canvasSize,
    loadImage,
}: OnionSkinProps) {

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(null)

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current
            canvas.width = canvasSize.width
            canvas.height = canvasSize.height
            const ctx = canvas.getContext('2d')
            setContext(ctx)
        }
    }, [])

    useEffect(() => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d')
            if (ctx) {
                ctx.clearRect(0, 0, canvasSize.width, canvasSize.height)
                if (onionSkin[0].layers && onionSkin[0].layers.length) {
                    drawFrmae(ctx, onionSkin[0].layers)
                }
            }
        }
    }, [onionSkin])

    useEffect(() => {
        if (currentFrameIdx === 0) {
            const ctx = canvasRef.current?.getContext('2d')
            if (ctx) ctx.clearRect(0, 0, canvasSize.width, canvasSize.height)
        }
    }, [currentFrameIdx])

    const drawFrmae = async (ctx: CanvasRenderingContext2D, layers: layer[]) => {
        for (let i = 1; i < layers.length; i++) {
            drawLayer(ctx, layers[i].drawingActions)
        }
    }

    const drawLayer = async (ctx: CanvasRenderingContext2D, actions: drawingAction[]) => {
        for (const action of actions) {
            try {
                const image = await loadImage(action.url)
                ctx.drawImage(image, 0, 0)
            } catch (error) {
                console.error('Error loading image', error)
            }
            if (!action.isPath) {
                break
            }
        }
    }

    return (
        <canvas
            ref={canvasRef}
            className='absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[100%] md:w-fit rounded-md pointer-events-none z-10 opacity-30'
        />)
}