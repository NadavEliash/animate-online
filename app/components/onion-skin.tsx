import { useEffect, useRef, useState } from "react"

export default function OnionSkin({
    onionSkin,
    currentFrameIdx,
    canvasSize,
    loadImage,
}) {
    const canvasRef = useRef()
    const [context, setContext] = useState(null)

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
            const newContext = canvasRef.current.getContext('2d')
            newContext.clearRect(0, 0, canvasSize.width, canvasSize.height)
            if (onionSkin[0].layers && onionSkin[0].layers.length) {
                drawFrmae(newContext, onionSkin[0].layers)
            }
        }
    }, [onionSkin])

    useEffect(() => {
        if (currentFrameIdx === 0) {
            const newContext = canvasRef.current.getContext('2d')
            newContext.clearRect(0, 0, canvasSize.width, canvasSize.height)
        }
    }, [currentFrameIdx])

    const drawFrmae = async (ctx, layers) => {
        const newContext = canvasRef.current.getContext('2d')
        for (let i = 1; i < layers.length; i++) {
            drawLayer(newContext, layers[i].drawingActions)
        }
    }

    const drawLayer = async (ctx, actions) => {
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
            className='absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[100%] md:w-fit rounded-md pointer-events-none z-10 opacity-20'
        />)
}