'use client'

import { useRef, useEffect, useState } from "react"
import DrawingCanvas from "./components/drawing-canvas"
import PlayingCanvas from "./components/playing-canvas"
import Layers from "./components/layers"
import Frames from "./components/frames"
import OnionSkin from "./components/onion-skin"
import Styles from "./components/styles"
import Backgrounds from "./components/backgrounds"
import { action, drawingAction, frame, layer } from "./models"

import { Sue_Ellen_Francisco } from 'next/font/google'

import {
    Eraser,
    Pencil,
    Expand,
    Move,
    RefreshCw,
    Trash,
    Undo,
    Palette,
    Redo,
    ChevronUp,
    ChevronRight,
    ChevronLeft
} from "lucide-react"

const sue_ellen = Sue_Ellen_Francisco({ subsets: ['latin'], weight: '400' })

export default function Home() {

    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 450 })
    const [action, setAction] = useState<action>({ isDraw: true })
    const [layers, setLayers] = useState<layer[] | []>([])
    const [currentLayerIdx, setCurrentLayerIdx] = useState(1)
    const [frames, setFrames] = useState<frame[] | []>([])
    const [currentFrameIdx, setCurrentFrameIdx] = useState(0)
    const [actionHistory, setActionHistory] = useState([])
    const [undoHistory, setUndoHistory] = useState<drawingAction[] | []>([])
    const [onionSkin, setOnionSkin] = useState<[frame] | []>([])
    const [clear, setClear] = useState(false)
    const [isPlay, setIsPlay] = useState(false)
    const [isDownload, setIsDownload] = useState(false)

    const [showBar, setShowBar] = useState('')

    const [styleBar, setStyleBar] = useState(false)
    const [bgBar, setBgBar] = useState(false)

    const [styles, setStyles] = useState({
        lineWidth: 6,
        strokeStyle: "black"
    })

    const [background, setBackground] = useState("white")

    useEffect(() => {
        document.addEventListener("keydown", (e) => {
            if (e.key === 'z' && e.ctrlKey) {
                console.log('undo')
                undo()
            }
            if (e.key === 'space') toggleAnimation()
        })
    }, [])

    useEffect(() => {
        const width = window.innerWidth
        const height = window.innerHeight

        if (width < 768) setCanvasSize({ width, height })
        if (width > 768) setCanvasSize({ width: 600, height: 450 })
        if (width > 1024) setCanvasSize({ width: 800, height: 450 })

    }, [])

    useEffect(() => {
        setActionHistory([])
        setLayers([{ id: generateId(), drawingActions: [] }, { id: generateId(), drawingActions: [] }])
        setCurrentLayerIdx(1)
        setFrames([{ id: generateId(), layers }])
        setCurrentFrameIdx(0)
    }, [])

    useEffect(() => {
        if (frames[currentFrameIdx]) {
            const id = frames[currentFrameIdx].id
            const newFrame = { id, layers }

            const newFrames = frames.filter(frame => frame.id !== id)
            newFrames.splice(currentFrameIdx, 0, newFrame)
            setFrames(newFrames)
        }
    }, [layers])

    useEffect(() => {
        if (frames[currentFrameIdx]) {
            setLayers([...frames[currentFrameIdx].layers])
            setClear(!clear)
            setCurrentLayerIdx(frames[currentFrameIdx].layers.length - 1)


            if (currentFrameIdx >= 1) {
                setOnionSkin([frames[currentFrameIdx - 1]])
            }
        }
    }, [currentFrameIdx])

    // DRAWING OPTIONS

    const onDraw = () => {
        setAction({ isDraw: true })
    }

    const onErase = () => {
        setAction({ isErase: true })
    }

    const clearCanvas = () => {
        setLayers([{ id: generateId(), drawingActions: [] }, { id: generateId(), drawingActions: [] }])
        setCurrentLayerIdx(1)
        setClear(!clear)
    }

    const undo = () => {
        const actions = layers[currentLayerIdx].drawingActions
        if (actions.length) {
            const cancelled = actions.shift()
            if (cancelled) {
              setUndoHistory(prev=>[cancelled, ...prev])
            }

            const newLayer = layers[currentLayerIdx]
            newLayer.drawingActions = actions
            const newLayers = layers
            newLayers.splice(currentLayerIdx, 1, newLayer)
            setLayers(prev => [...newLayers])
        }
    }

    const redo = () => {
        if (undoHistory!.length) {
            const lastAction = undoHistory!.shift()

            const newLayer = layers[currentLayerIdx]
            newLayer.drawingActions = [lastAction!, ...newLayer.drawingActions]
            const newLayers = layers
            newLayers.splice(currentLayerIdx, 1, newLayer)
            setLayers(prev => [...newLayers])
        }
    }

    // UTILS

    const generateId = () => {
        return Math.floor(Math.random() * 99999) + ''
    }

    const loadImage = (url:string) => {
        return new Promise((resolve, reject) => {
            const image = new Image()
            image.onload = () => resolve(image)
            image.onerror = () => reject(new Error('Failed to load image'))
            image.src = url
        })
    }

    // ANIMATION OPTIONS

    const toggleAnimation = () => {
        setIsPlay(!isPlay)
    }

    const download = () => {
        setIsDownload(true)
    }

    // STYLE CLASSES AND EXPERIENCE FUNCTIONALITY

    const handleBars = (bar:string) => {
        setTimeout(() => {
            showBar === bar
                ? setShowBar('')
                : setShowBar(bar)
        }, 100);
    }

    const framesButtonClass = "w-6 h-6 cursor-pointer hover:scale-110"
    const actionButtonClass = "p-2 md:p-3 rounded-xl cursor-pointer text-black/60 md:text-inherit"

    return (
        <>
            <main className="h-svh bg-white md:bg-transparent">
                <div className="w-full h-16"></div>
                <h1 className={`hidden md:block md:mb-8 text-slate-200 text-center text-5xl ${sue_ellen.className}`}>{`Let's Animate!`}</h1>
                <div id="drawing-bar" className="flex flex-row justify-center md:gap-1 lg:gap-2">
                    <ChevronRight className="md:hidden absolute left-0 top-24 -translate-y-1/2 w-8 h-16 p-1 text-black bg-gray-200/80 rounded-r-2xl z-30" onClick={() => handleBars("actions")} />
                    <div id="action-buttons"
                        className={`absolute top-32 rounded-r-3xl bg-gray-300/60 ${showBar === "actions" ? 'left-0' : '-left-[80px]'} transition-all duration-700 p-2 z-30 
                            md:static md:px-3 lg:px-8 md:py-4 md:bg-white/10 text-white/70 grid grid-cols-1 grid-rows-10 justify-items-center items-center gap-1 md:rounded-2xl`}>
                        <div id="pencil" onClick={onDraw} className={`${actionButtonClass} ${action.isDraw ? 'bg-white/60 md:bg-white/20' : ''}`}>
                            <Pencil />
                        </div>
                        <div id="erase" onClick={onErase} className={`${actionButtonClass} ${action.isErase ? 'bg-white/60 md:bg-white/20' : ''}`}>
                            <Eraser />
                        </div>
                        {styleBar && <div className="absolute left-0 top-0 w-[100vw] h-[100vh] bg-slate-300/10 z-20" onClick={() => setStyleBar(false)}></div>}
                        <div id="styleBar" className={`${actionButtonClass} relative`} onClick={() => setStyleBar(true)}>
                            <Palette />
                            {styleBar && <Styles
                                styleBar={styleBar}
                                setStyleBar={setStyleBar}
                                styles={styles}
                                setStyles={setStyles}
                            />}
                        </div>
                        {bgBar && <div className="absolute left-0 top-0 w-[100vw] h-[100vh] bg-slate-300/10 z-20" onClick={() => setBgBar(false)}></div>}
                        <div id="bgBar" className="rounded-sm w-6 h-6 bg-white relative cursor-pointer text-black text-sm text-center pt-[2px]" onClick={() => setBgBar(true)}>BG
                            {bgBar &&
                                <Backgrounds
                                    bgBar={bgBar}
                                    setBgBar={setBgBar}
                                    background={background}
                                    setBackground={setBackground}
                                />}
                        </div>
                        <div title="Translate" className={`${actionButtonClass} ${action.isTranslate ? 'bg-white/60 md:bg-white/20' : ''}`} onClick={() => setAction({ isTranslate: true })}>
                            <Move />
                        </div>
                        <div title="Rotate" className={`${actionButtonClass}  ${action.isRotate ? 'bg-white/60 md:bg-white/20' : ''}`} onClick={() => setAction({ isRotate: true })}>
                            <RefreshCw />
                        </div>
                        <div title="Scale" className={`${actionButtonClass} ${action.isScale ? 'bg-white/60 md:bg-white/20' : ''}`} onClick={() => setAction({ isScale: true })}>
                            <Expand />
                        </div>
                        <div title="Undo" className={`${actionButtonClass} active:bg-white/60 md:active:bg-white/20`} onClick={undo}>
                            <Undo />
                        </div>
                        <div title="Redo" className={`${actionButtonClass} active:bg-white/60 md:active:bg-white/20`} onClick={redo}>
                            <Redo />
                        </div>
                        <div title="Clear canvas" className={`${actionButtonClass} active:bg-white/60 md:active:bg-white/20`} onClick={clearCanvas}>
                            <Trash />
                        </div>
                    </div>
                    <div id="canvas-container" className="relative w-[100%] md:max-w-[640px] lg:max-w-[840px] bg-white/20 rounded-2xl">
                        {layers && layers.map((layer, idx) =>
                            <div key={idx}>
                                <DrawingCanvas
                                    canvasSize={canvasSize}
                                    layers={layers}
                                    setLayers={setLayers}
                                    layer={layer}
                                    idx={idx}
                                    currentLayerIdx={currentLayerIdx}
                                    action={action}
                                    styles={styles}
                                    background={background}
                                    loadImage={loadImage}
                                    clear={clear}
                                    isPlay={isPlay}
                                    isDownload={isDownload}
                                ></DrawingCanvas>
                            </div>)}
                        {onionSkin.length > 0 && onionSkin.map(((frame, idx) =>
                            <div key={idx}>
                                <OnionSkin
                                    onionSkin={onionSkin}
                                    currentFrameIdx={currentFrameIdx}
                                    canvasSize={canvasSize}
                                    loadImage={loadImage}
                                />
                            </div>
                        ))}
                        {(isPlay || isDownload) && <PlayingCanvas
                            isPlay={isPlay}
                            isDownload={isDownload}
                            setIsDownload={setIsDownload}
                            frames={frames}
                            canvasSize={canvasSize}
                            background={background}
                            loadImage={loadImage}
                        ></PlayingCanvas>}
                    </div>
                    <Layers
                        layers={layers}
                        setLayers={setLayers}
                        canvasSyze={canvasSize}
                        currentLayerIdx={currentLayerIdx}
                        setCurrentLayerIdx={setCurrentLayerIdx}
                        generateId={generateId}
                        background={background}
                        loadImage={loadImage}
                        showBar={showBar}
                    ></Layers>
                    <ChevronLeft className="md:hidden absolute right-0 top-1/3 -translate-y-1/2 w-6 h-20 text-black bg-gray-200 rounded-l-2xl z-20" onClick={() => handleBars("layers")} />
                </div>
                <Frames
                    frames={frames}
                    setFrames={setFrames}
                    currentFrameIdx={currentFrameIdx}
                    setCurrentFrameIdx={setCurrentFrameIdx}
                    canvasSize={canvasSize}
                    background={background}
                    clearCanvas={clearCanvas}
                    generateId={generateId}
                    loadImage={loadImage}
                    isPlay={isPlay}
                    setIsPlay={setIsPlay}
                    isDownload={isDownload}
                    setIsDownload={setIsDownload}
                    showBar={showBar}
                ></Frames>
                <ChevronUp className="md:hidden absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-6 text-black bg-gray-200 rounded-t-2xl z-20" onClick={() => handleBars("frames")} />
            </main>
        </>
    )
}