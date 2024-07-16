import { useEffect, useRef, useState } from "react"
import { action, drawingAction, layer, onDownload, path, styles } from "@/app/models"

import type { MouseEvent } from 'react'

interface DrawingCanvasProps {
    canvasSize: { width: number, height: number }
    layers: layer[] | []
    setLayers: Function
    layer: layer
    idx: number
    currentLayerIdx: number
    action: action
    styles: styles
    background: string
    loadImage: Function
    clear: boolean
    isPlay: boolean
    onDownload: onDownload
}

export default function DrawingCanvas({
    canvasSize,
    layers,
    setLayers,
    layer,
    idx,
    currentLayerIdx,
    action,
    styles,
    background,
    loadImage,
    clear,
    isPlay,
    onDownload
}: DrawingCanvasProps) {

    const canvasRef = useRef<HTMLCanvasElement>(null)

    const [context, setContext] = useState<CanvasRenderingContext2D | null>(null)
    const [currentPath, setCurrentPath] = useState<path[] | []>([])
    const [currentURL, setCurrentURL] = useState('')
    const [isDrawing, setIsDrawing] = useState(false)
    const [isTransform, setIsTransform] = useState(false)
    const [transformGap, setTransformGap] = useState({ x: 0, y: 0 })
    const [drawingActions, setDrawingActions] = useState<drawingAction[] | []>([])

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current

            canvas.width = canvasSize.width
            canvas.height = canvasSize.height
            const ctx = canvas.getContext('2d')
            setContext(ctx)

            redrawImage(layer.drawingActions)
        }
    }, [])

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current
            canvas.addEventListener('touchstart', (e) => onDown(e), { passive: false })
            canvas.addEventListener('touchmove', (e) => onMove(e), { passive: false })
            canvas.addEventListener('touchend', (e) => onUp(e), { passive: false })
        }
    }, [])

    useEffect(() => {
        if (context && idx === currentLayerIdx) {
            const id = layer.id
            const newLayer = { id, drawingActions }

            const newLayers = layers.filter(frame => frame.id !== id)
            newLayers.splice(currentLayerIdx, 0, newLayer)
            setLayers(newLayers)
        }
    }, [drawingActions])

    useEffect(() => {
        if (context) {
            context.clearRect(0, 0, canvasSize.width, canvasSize.height)
            redrawImage(layer?.drawingActions)
        }
    }, [layers])

    useEffect(() => {
        setDrawingActions(layer.drawingActions)
    }, [clear])

    // EVENT HANDLING

    const onDown = (e: MouseEvent | TouchEvent) => {
        e.preventDefault()
        if (currentLayerIdx !== idx) return
        if (action.isDraw) startDrawing(e)
        if (action.isErase) startErasing(e)
        if (action.isTranslate || action.isRotate || action.isScale) startTransform(e)
    }

    const onMove = (e: MouseEvent | TouchEvent) => {
        e.preventDefault()
        if (currentLayerIdx !== idx) return
        if (action.isDraw) {
            draw(e)
        } else if (action.isErase) {
            erase(e)
        } else if (action.isTranslate) {
            translate(e)
        } else if (action.isRotate) {
            rotate(e)
        } else if (action.isScale) {
            scale(e)
        }
    }

    const onUp = (e: MouseEvent | TouchEvent) => {
        e.preventDefault()
        if (currentLayerIdx !== idx) return
        if (action.isDraw) endDrawing(e)
        if (action.isErase) endErasing(e)
        if (action.isTranslate || action.isRotate || action.isScale) endTransform(e)
    }

    // ACTIONS

    const startDrawing = (e: MouseEvent | TouchEvent) => {
        if (isPlay || onDownload.on) return
        if (canvasRef.current && action.isDraw) {
            const ctx = canvasRef.current.getContext('2d')
            if (ctx) {
                ctx.beginPath()

                if ('nativeEvent' in e && e instanceof MouseEvent) {
                    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                } else if ('touches' in e && e instanceof TouchEvent) {
                    ctx.moveTo(e.touches[0].clientX, e.touches[0].clientY);
                }
                setIsDrawing(true)
            }
        }
    }

    const draw = (e: MouseEvent | TouchEvent) => {
        if (!canvasRef.current || !isDrawing) return
        const ctx = canvasRef.current?.getContext('2d')
        if (ctx) {
            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'
            ctx.lineWidth = styles.fillMode ? 1 : styles.lineWidth
            ctx.strokeStyle = styles.strokeStyle
            ctx.fillStyle = styles.strokeStyle

            if ('nativeEvent' in e) {
                ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
                styles.fillMode ? ctx.fill() : ctx.stroke()
                setCurrentPath([...currentPath, { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }])
            } else if ('touches' in e) {
                ctx.lineTo(e.touches[0].clientX, e.touches[0].clientY)
                styles.fillMode ? ctx.fill() : ctx.stroke()
                setCurrentPath([...currentPath, { x: e.touches[0].clientX, y: e.touches[0].clientY }])
            }
        }
    }

    const endDrawing = (e: MouseEvent | TouchEvent) => {
        if (!isDrawing) return
        setIsDrawing(false)
        const ctx = canvasRef.current?.getContext('2d')
        if (ctx) {
            ctx.closePath()
            if (currentPath.length > 0) {
                drawPath(currentPath)
                canvasRef.current?.toBlob((blob) => {
                    const url = URL.createObjectURL(blob!)
                    if (url) setDrawingActions([{ url, isPath: false }, ...drawingActions])
                })
            }
            setCurrentPath([])
        }
    }

    const startErasing = (e: MouseEvent | TouchEvent) => {
        if (isPlay || onDownload.on) return
        if (context && action.isErase) {
            setIsDrawing(true)
        }
    }

    const erase = (e: MouseEvent | TouchEvent) => {
        if (!context || !isDrawing) return
        const ctx = canvasRef.current?.getContext('2d')
        if (ctx) {

            if ('nativeEvent' in e) {
                ctx.clearRect(e.nativeEvent.offsetX - styles.eraserWidth, e.nativeEvent.offsetY - styles.eraserWidth, styles.eraserWidth * 2, styles.eraserWidth * 2)
            } else if ('touches' in e) {
                ctx.clearRect(e.touches[0].clientX - 6, e.touches[0].clientY - 6, 12, 12)
            }
        }

        // ctx.save()
        // ctx.arc(e.nativeEvent.offsetX, e.nativeEvent.offsetY, 10, 0, Math.PI * 2)
        // ctx.clip()
        // ctx.restore()
    }

    const endErasing = (e: MouseEvent | TouchEvent) => {
        if (!isDrawing || !drawingActions.length) return
        setIsDrawing(false)
        canvasRef.current?.toBlob((blob) => {
            const url = URL.createObjectURL(blob!)
            if (url) setDrawingActions([{ url, isPath: false }, ...drawingActions])
        })
    }

    const startTransform = async (e: MouseEvent | TouchEvent) => {
        if (isPlay || onDownload.on) return

        setIsTransform(true)
        if ('nativeEvent' in e) {
            setTransformGap({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })
        } else if ('touches' in e) {
            setTransformGap({ x: e.touches[0].clientX, y: e.touches[0].clientY })
        }
        
        await redrawImage()
    }

    const translate = async (e: MouseEvent | TouchEvent) => {
        if (!isTransform || !drawingActions.length || !currentURL) return

        let gapX = 0
        let gapY = 0

        if ('nativeEvent' in e) {
            gapX = e.nativeEvent.offsetX - transformGap.x
            gapY = e.nativeEvent.offsetY - transformGap.y
        } else if ('touches' in e) {
            gapX = e.touches[0].clientX - transformGap.x
            gapY = e.touches[0].clientY - transformGap.y
        }


        const ctx = canvasRef.current?.getContext('2d')
        if (ctx)
            try {
                const image = await loadImage(currentURL)
                ctx.clearRect(0, 0, canvasSize.width, canvasSize.height)
                ctx.save()
                ctx.translate(gapX, gapY)
                ctx.drawImage(image, 0, 0)
                ctx.restore()
            } catch (error) {
                console.error("error loading image", error)
            }
    }

    const rotate = async (e: MouseEvent | TouchEvent) => {
        if (!isTransform || !drawingActions.length) return

        let gapX = 0
        let gapY = 0

        if ('nativeEvent' in e) {
            gapX = e.nativeEvent.offsetX - transformGap.x
            gapY = e.nativeEvent.offsetY - transformGap.y
        } else if ('touches' in e) {
            gapX = e.touches[0].clientX - transformGap.x
            gapY = e.touches[0].clientY - transformGap.y
        }

        const ctx = canvasRef.current?.getContext('2d')
        if (ctx)
            try {
                const image = await loadImage(currentURL)
                ctx.clearRect(0, 0, canvasSize.width, canvasSize.height)
                ctx.save()
                ctx.translate(canvasSize.width / 2, canvasSize.height / 2)
                ctx.rotate((gapX) * Math.PI / 180)
                ctx.drawImage(image, -canvasSize.width / 2, -canvasSize.height / 2)
                ctx.restore()
            } catch (error) {
                console.error("error loading image", error)
            }
    }

    const scale = async (e: MouseEvent | TouchEvent) => {
        if (!isTransform || !drawingActions.length) return

        let gapX = 0
        let gapY = 0

        if ('nativeEvent' in e) {
            gapX = e.nativeEvent.offsetX - transformGap.x
            gapY = e.nativeEvent.offsetY - transformGap.y
        } else if ('touches' in e) {
            gapX = e.touches[0].clientX - transformGap.x
            gapY = e.touches[0].clientY - transformGap.y
        }

        const ctx = canvasRef.current?.getContext('2d')
        if (ctx)
            try {
                const image = await loadImage(currentURL)
                ctx.clearRect(0, 0, canvasSize.width, canvasSize.height)
                ctx.save()
                ctx.translate(canvasSize.width / 2, canvasSize.height / 2)
                ctx.scale(1 + (gapX / 100), 1 + (gapY / 100))
                ctx.drawImage(image, -canvasSize.width / 2, -canvasSize.height / 2)
                ctx.restore()
            } catch (error) {
                console.error("error loading image", error)
            }
    }

    const endTransform = (e: MouseEvent | TouchEvent) => {
        if (!isTransform || !drawingActions.length) return
        setIsTransform(false)
        setTransformGap({ x: 0, y: 0 })

        canvasRef.current?.toBlob((blob) => {
            const url = URL.createObjectURL(blob!)
            if (url) setDrawingActions([{ url, isPath: false }, ...drawingActions])
        })
        setCurrentURL('')
    }

    const redrawImage = async (actions: drawingAction[] = drawingActions) => {
        const ctx = canvasRef.current?.getContext('2d')
        if (ctx)
            if (idx === 0) {
                ctx.fillStyle = background
                ctx.fillRect(0, 0, canvasSize.width, canvasSize.height)
            } else {
                let paths = []

                for (const action of actions) {
                    if (action.isPath) {
                        paths.unshift(action)
                        actions.shift()
                    }
                    if (!action.isPath) {
                        break
                    }

                    if (paths.length) {
                        for (const path of paths) {
                            try {
                                const image = await loadImage(action.url)
                                ctx.drawImage(image, 0, 0)
                            } catch (error) {
                                console.error('Error loading image', error)
                            }
                        }
                    }
                }

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


        canvasRef.current?.toBlob((blob) => {
            const url = URL.createObjectURL(blob!)
            if (url) setCurrentURL(url)
        })
    }

    const drawPath = (paths: path[]) => {
        const ctx = canvasRef.current?.getContext('2d')

        if (ctx) {
            ctx.beginPath()
            ctx.lineWidth = styles.fillMode ? 1 : styles.lineWidth
            ctx.strokeStyle = styles.strokeStyle
            ctx.moveTo(paths[0].x, paths[0].y)
            paths.forEach(point => {
                ctx.lineTo(point.x, point.y)
            })
            ctx.stroke()
        }
    }

    return (
        <>
            <canvas
                ref={canvasRef}
                onMouseDown={onDown}
                onMouseMove={onMove}
                onMouseUp={onUp}
                onMouseOut={onUp}
                className={`absolute left-0 top-0 
            md:left-1/2 md:-translate-x-1/2 md:top-1/2 md:-translate-y-1/2 md:rounded-md 
            ${isTransform ? 'cursor-grab' : isDrawing ? 'cursor-crosshair' : ''} 
            ${currentLayerIdx === idx ? '' : 'pointer-events-none'}`}
                width={canvasSize.width}
                height={canvasSize.height}>
            </canvas>
        </>
    )
}