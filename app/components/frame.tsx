import { useEffect, useRef, useState } from "react"

export default function Frame({
    frame,
    idx,
    currentFrameIdx,
    canvasSize,
    background,
    frames,
    setFrames,
    switchFrame,
    loadImage,
}) {
    const canvasRef = useRef(null)
    const [context, setContext] = useState(null)
    const [isDragging, setIsDragging] = useState(false)
    const [currentFrame, setCurrentFrame] = useState(null)

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current
            canvas.width = canvasSize.width
            canvas.height = canvasSize.height
            const ctx = canvas.getContext('2d')
            setContext(ctx)
            ctx.fillStyle = background
            ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
    }, [])

    useEffect(() => {
        if (frame.layers) {
            const newContext = canvasRef.current.getContext('2d', { willReadFrequently: true })
            newContext.fillStyle = background
            newContext.fillRect(0, 0, canvasSize.width, canvasSize.height)

            if (frame.layers.length) {
                for (let i = 1; i < frame.layers.length; i++) {
                    if (frame.layers[i].drawingActions?.length) {
                        drawLayer(newContext, frame.layers[i].drawingActions, i === frame.layers.length - 1 ? true : false)
                    }
                }
            }
        }
    }, [frame])

    const drawLayer = async (ctx, actions, last) => {
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

        if (last) {
            const imageData = ctx.getImageData(0, 0, canvasSize.width, canvasSize.height)
            frames[idx].imageData = imageData
            setFrames(prev => [...prev])
        }
    }

    const onDrag = (idx) => {
        if (!isDragging) {
            setIsDragging(true)
            if (frames.length > 1) {
                setCurrentFrame(frames[idx])
            }
        }
    }

    const onDragEnd = (e, idx) => {
        setIsDragging(false)
        frames.splice(idx, 1)
        let newIdx = Math.floor(e.clientX / 100) - 2
        if (newIdx > frames.length) newIdx = frames.length
        frames.splice(newIdx, 0, currentFrame)
        setFrames(prev => [...prev])
    }

    return (
        <div>
            <div key={frame} className="text-black">
                <canvas ref={canvasRef} width={canvasSize.width} height={canvasSize.height}
                    className={`bg-white w-32 h-24 cursor-pointer rounded-lg hover:scale-105
                                ${currentFrameIdx === idx ? 'border-4 border-pink-300 scale-105' : 'border-2 border-black/60'}`}
                    onClick={() => switchFrame(idx)}
                    draggable
                    onDrag={() => onDrag(idx)}
                    onDragEnd={(e) => onDragEnd(e, idx)}>
                </canvas>
                <h1 className="md:text-white text-sm text-center pt-2">
                    {idx + 1}
                </h1>
            </div>
        </div>
    )
}