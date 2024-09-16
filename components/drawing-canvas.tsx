import { useEffect, useRef, useState } from "react"
import { action, boundingBox, drawingAction, layer, onDownload, path, rotationState, scaleState, styles } from "@/app/models"

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
    redraw: boolean
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
    onDownload,
    redraw
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
    }, [layers[1].id])

    useEffect(() => {
        if (context) {
            context.clearRect(0, 0, canvasSize.width, canvasSize.height)
            redrawImage(layer?.drawingActions)
        }
    }, [redraw])

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

    let rotationState: rotationState = {
        initialAngle: null,
        currentAngle: 0,
        centerX: 0,
        centerY: 0
    }

    const rotate = async (e: MouseEvent | TouchEvent) => {
        if (!isTransform || !drawingActions.length || !currentURL) return

        let mouseX = 0
        let mouseY = 0

        if ('nativeEvent' in e) {
            mouseX = e.nativeEvent.offsetX
            mouseY = e.nativeEvent.offsetY
        } else if ('touches' in e) {
            mouseX = e.touches[0].clientX
            mouseY = e.touches[0].clientY
        }

        const ctx = canvasRef.current?.getContext('2d')
        if (ctx) {
            try {
                const image = await loadImage(currentURL)
                const boundingBox = await calculateBoundingBox(currentURL)

                const centerX = boundingBox.x + boundingBox.width / 2
                const centerY = boundingBox.y + boundingBox.height / 2

                const dx = mouseX - centerX
                const dy = mouseY - centerY
                const currentAngle = Math.atan2(dy, dx)

                if (rotationState.initialAngle === null) {
                    rotationState = {
                        initialAngle: currentAngle,
                        currentAngle: 0,
                        centerX,
                        centerY
                    };
                }

                const relativeAngle = currentAngle - rotationState.initialAngle!
                rotationState.currentAngle = relativeAngle

                ctx.clearRect(0, 0, canvasSize.width, canvasSize.height)
                ctx.save()

                ctx.translate(centerX, centerY)
                ctx.rotate(relativeAngle)

                ctx.drawImage(
                    image,
                    boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height,
                    -boundingBox.width / 2, -boundingBox.height / 2, boundingBox.width, boundingBox.height
                )

                ctx.restore()
            } catch (error) {
                console.error("error processing image", error)
            }
        }
    }

    let scaleState: scaleState = {
        initialDistanceX: 0,
        initialDistanceY: 0,
        initialScaleX: 1,
        initialScaleY: 1,
        centerX: 0,
        centerY: 0
    }

    const scale = async (e: MouseEvent | TouchEvent) => {
        if (!isTransform || !drawingActions.length || !currentURL) return

        let mouseX = 0
        let mouseY = 0

        if ('nativeEvent' in e) {
            mouseX = e.nativeEvent.offsetX
            mouseY = e.nativeEvent.offsetY
        } else if ('touches' in e) {
            mouseX = e.touches[0].clientX
            mouseY = e.touches[0].clientY
        }

        const ctx = canvasRef.current?.getContext('2d')
        if (ctx) {
            try {
                const image = await loadImage(currentURL)
                const boundingBox = await calculateBoundingBox(currentURL)

                const centerX = boundingBox.x + boundingBox.width / 2
                const centerY = boundingBox.y + boundingBox.height / 2

                const distanceX = Math.abs(mouseX - centerX)
                const distanceY = Math.abs(mouseY - centerY)

                // Initialize scale state if it's the first move
                if (scaleState.initialDistanceX === 0 && scaleState.initialDistanceY === 0) {
                    scaleState = {
                        initialDistanceX: distanceX,
                        initialDistanceY: distanceY,
                        initialScaleX: 1,
                        initialScaleY: 1,
                        centerX,
                        centerY
                    };
                }

                const scaleFactorX = distanceX / scaleState.initialDistanceX
                const scaleFactorY = distanceY / scaleState.initialDistanceY

                const newScaleX = scaleState.initialScaleX * scaleFactorX
                const newScaleY = scaleState.initialScaleY * scaleFactorY

                ctx.clearRect(0, 0, canvasSize.width, canvasSize.height)
                ctx.save()

                // Translate to the center of the bounding box
                ctx.translate(centerX, centerY)
                ctx.scale(newScaleX, newScaleY)

                // Draw only the portion of the image within the bounding box
                ctx.drawImage(
                    image,
                    boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height,
                    -boundingBox.width / 2, -boundingBox.height / 2, boundingBox.width, boundingBox.height
                )

                ctx.restore()
            } catch (error) {
                console.error("error processing image", error)
            }
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

    const calculateBoundingBox = async (url: string): Promise<boundingBox> => {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = () => {
                const canvas = document.createElement('canvas')
                canvas.width = img.width
                canvas.height = img.height
                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    reject(new Error("Could not get canvas context"))
                    return
                }
                ctx.drawImage(img, 0, 0)
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                const data = imageData.data

                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

                for (let y = 0; y < canvas.height; y++) {
                    for (let x = 0; x < canvas.width; x++) {
                        const alpha = data[(y * canvas.width + x) * 4 + 3]
                        if (alpha > 0) {
                            minX = Math.min(minX, x)
                            minY = Math.min(minY, y)
                            maxX = Math.max(maxX, x)
                            maxY = Math.max(maxY, y)
                        }
                    }
                }

                resolve({
                    x: minX,
                    y: minY,
                    width: maxX - minX + 1,
                    height: maxY - minY + 1
                })
            }
            img.onerror = () => reject(new Error("Failed to load image"))
            img.src = url
        })
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