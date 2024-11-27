'use client'

import { useEffect, useState, KeyboardEvent, useMemo, useRef, MouseEventHandler } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import DrawingCanvas from "@/components/drawing-canvas"
import PlayingCanvas from "@/components/playing-canvas"
import Layers from "@/components/layers"
import BottomBar from "@/components/bottom-bar"
import OnionSkin from "@/components/onion-skin"
import Styles from "@/components/styles"
import Backgrounds from "@/components/backgrounds"
import UserMsg from "@/components/user-msg"
import { action, drawingAction, frame, frameToSave, layer, onDownload, styles, userMsg } from "./models"
import { Sue_Ellen_Francisco } from "next/font/google"
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
    ChevronLeft,
    Type
} from "lucide-react"
import { db, Scene } from "./db/db.model"
import { base64ToUrl, generateId, urlToBase64 } from "./lib/util"

const sue_ellen = Sue_Ellen_Francisco({ subsets: ['latin'], weight: '400' })

export default function Home() {
    const scenes = useLiveQuery(() => db.scenes.toArray())

    const textBox = useRef<HTMLDivElement>(null)

    const [textBoxLocation, setTextBoxLocation] = useState<{ left: number, top: number, offsetX: number, offsetY: number }>({ left: 0, top: 0, offsetX: 0, offsetY: 0 })
    const [textBoxStart, setTextBoxStart] = useState<{ x: number, y: number }>({ x: 0, y: 0 })
    const [textBoxIsMoving, setTextBoxIsMoving] = useState(false)

    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 450 })
    const [action, setAction] = useState<action>({ isDraw: true })
    const [layers, setLayers] = useState<layer[] | []>([])
    const [currentLayerIdx, setCurrentLayerIdx] = useState(1)
    const [frames, setFrames] = useState<frame[] | []>([])
    const [currentFrameIdx, setCurrentFrameIdx] = useState(0)
    const [actionHistory, setActionHistory] = useState([])
    const [undoHistory, setUndoHistory] = useState<drawingAction[] | []>([])
    const [redraw, setRedraw] = useState(false)
    const [onionSkin, setOnionSkin] = useState<[frame] | []>([])
    const [isWriting, setIsWriting] = useState(false)
    const [characters, setCharacters] = useState('')
    const [font, setFont] = useState('')
    const [renderText, setRenderText] = useState(false)
    const [clear, setClear] = useState(false)
    const [removedFrame, setRemovedFrame] = useState<frame | null>(null)
    const [isPlay, setIsPlay] = useState(false)
    const [onDownload, setOnDownload] = useState<onDownload>({ video: true, name: 'animation', on: false })
    const [isOnion, setIsOnion] = useState(true)
    const [onFramesButton, setOnFramesButton] = useState([''])

    const [mobileBars, setMobileBars] = useState('')
    const [userMsg, setUserMsg] = useState<userMsg | null>(null)

    const [styleBar, setStyleBar] = useState(false)
    const [bgBar, setBgBar] = useState(false)
    const [hotKeys, setHotKeys] = useState(false)

    const [styles, setStyles] = useState<styles>({
        lineWidth: 6,
        strokeStyle: "#000000",
        eraserWidth: 6,
        fillMode: false,
        font: 'arial',
        fontSize: 50,
        fontColor: 'black'
    })

    const [background, setBackground] = useState("white")

    const memoizedLayers = useMemo(() => {
        if (frames[currentFrameIdx]) {
            return [...frames[currentFrameIdx].layers]
        }
        return layers
    }, [frames, currentFrameIdx])

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
            const memoizedLayers = [...frames[currentFrameIdx].layers]
            setLayers(memoizedLayers)
            setClear(!clear)
            setCurrentLayerIdx(frames[currentFrameIdx].layers.length - 1)

            if (currentFrameIdx >= 1) {
                setOnionSkin([frames[currentFrameIdx - 1]])
            }
        }
    }, [currentFrameIdx])

    // DRAWING OPTIONS

    const onDraw = () => {
        if (isPlay || onDownload.on) return
        setAction({ isDraw: true })
    }

    const onText = () => {
        if (isPlay || onDownload.on) return
        setAction({ isText: true })
    }

    const onErase = () => {
        if (isPlay || onDownload.on) return
        setAction({ isErase: true })
    }

    const clearCanvas = () => {
        if (isPlay || onDownload.on) return

        setRemovedFrame({ id: frames[currentFrameIdx].id, layers })
        setLayers([{ id: generateId(), drawingActions: [] }, { id: generateId(), drawingActions: [] }])
        setUndoHistory([])
        setCurrentLayerIdx(1)
        setAction({ isDraw: true })
        setClear(!clear)
    }

    const undo = () => {
        if (isPlay || onDownload.on) return
        setRedraw(!redraw)

        const actions = layers[currentLayerIdx].drawingActions
        if (actions.length) {
            const cancelled = actions.shift()
            if (cancelled) {
                setUndoHistory(prev => [cancelled, ...prev])
            }

            const newLayer = layers[currentLayerIdx]
            newLayer.drawingActions = actions
            const newLayers = layers
            newLayers.splice(currentLayerIdx, 1, newLayer)
            setLayers(prev => [...newLayers])
        } else {
            if (removedFrame && removedFrame.id === frames[currentFrameIdx].id) {
                const newLayers = removedFrame.layers
                setLayers(newLayers)
                setCurrentLayerIdx(newLayers.length - 1)
            }
        }
    }

    const redo = () => {
        if (isPlay || onDownload.on) return
        setRedraw(!redraw)

        if (undoHistory!.length) {
            const lastAction = undoHistory!.shift()

            const newLayer = layers[currentLayerIdx]
            newLayer.drawingActions = [lastAction!, ...newLayer.drawingActions]
            const newLayers = layers
            newLayers.splice(currentLayerIdx, 1, newLayer)
            setLayers(prev => [...newLayers])
        }
    }

    // TEXTBOX

    const onTextBoxDown: MouseEventHandler<HTMLDivElement> = (e) => {

        const box = textBox.current?.getBoundingClientRect();
        if (box) {
            setTextBoxStart({ x: e.clientX - box.left, y: e.clientY - box.top });
        }

        setTextBoxIsMoving(true)
    }

    const onTextBoxMove: MouseEventHandler<HTMLDivElement> = (e) => {
        e.preventDefault()
        if (!textBoxIsMoving) return

        const clientX = 'nativeEvent' in e ? e.nativeEvent.clientX : (e as TouchEvent).touches[0].clientX
        const clientY = 'nativeEvent' in e ? e.nativeEvent.clientY : (e as TouchEvent).touches[0].clientY
        const offsetX = 'nativeEvent' in e ? e.nativeEvent.offsetX : (e as TouchEvent).touches[0].clientX
        const offsetY = 'nativeEvent' in e ? e.nativeEvent.offsetY : (e as TouchEvent).touches[0].clientY

        setTextBoxLocation({ left: clientX - textBoxStart.x, top: clientY - textBoxStart.y, offsetX, offsetY })
    }

    const onTextBoxUp: MouseEventHandler<HTMLDivElement> = (e) => {
        e.preventDefault()
        setTextBoxIsMoving(false)
    }


    // UTILS

    const loadImage = (url: string) => {
        return new Promise((resolve, reject) => {
            const image = new Image()
            image.onload = () => resolve(image)
            image.onerror = () => reject(new Error('Failed to load image'))
            image.src = url
        })
    }

    // STORAGE

    const saveAnimation = async (name: string) => {

        let framesToSave: frameToSave[] = []

        for (let i = 0; i < frames.length; i++) {
            framesToSave.push({ layers: [] })
            frames[i].layers.forEach(layer => {
                if (layer.drawingActions.length) framesToSave[i].layers.push(layer.drawingActions[0].url)
            })
        }

        for (const frame of framesToSave) {
            for (let i = 0; i < frame.layers.length; i++) {
                const url = await urlToBase64(frame.layers[i])
                frame.layers[i] = url ? url + '' : ''
            }
        }

        await db.scenes.add({
            id: generateId(),
            name,
            frames: framesToSave
        })
    }

    const loadAnimation = async (input = '', name: string) => {

        const scene = scenes?.find(scene => scene.name === name)

        if (scene?.frames.length) {
            setCurrentFrameIdx(scene.frames.length)
            clearCanvas()

            const framesToLoad: frame[] = []

            for (let i = 0; i < scene.frames.length; i++) {
                const loadedUrls = scene.frames[i].layers
                const layersToLoad: layer[] = [{ id: generateId(), drawingActions: [] }]

                for (const url of loadedUrls) {
                    const newLayer = {
                        id: generateId(),
                        drawingActions: [{ url: await base64ToUrl(url), isPath: false }]
                    }
                    layersToLoad.push(newLayer)
                }

                framesToLoad.push({
                    id: generateId(),
                    layers: layersToLoad
                })
            }

            setFrames(framesToLoad)

            setTimeout(() => {
                setCurrentFrameIdx(0)
            }, 100)
        }
    }

    // STYLE CLASSES & UX FUNCTIONALITY

    const handleKeyboard = (e: KeyboardEvent) => {

        if (userMsg?.isDisplay || onDownload.on) return

        if (isWriting) {

            if (e.key === "Backspace") {
                setCharacters(prev => prev = prev.slice(0, prev.length - 1))
                return
            }

            if (e.key === "Enter") {
                setRenderText(true)
                return
            }

            if (e.key.length > 1) return
            setCharacters(prev => prev + e.key)
            return
        }

        if (e.key === ' ') setIsPlay(!isPlay)

        if (isPlay) return

        switch (e.key) {
            case 'p':
                onDraw()
                break;
            case 'e':
                onErase()
                break;
            case 'm':
                setAction({ isTranslate: true })
                break;
            case 'r':
                setAction({ isRotate: true })
                break;
            case 's':
                setAction({ isScale: true })
                break;
            case 'x':
                clearCanvas()
                break;
            case '+':
                setOnFramesButton(prev => ['add', prev[0]])
                break;
            case '-':
                setOnFramesButton(prev => ['remove', prev[0]])
                break;
            case 'ArrowLeft':
                setOnFramesButton(prev => ['left', prev[0]])
                break;
            case 'ArrowRight':
                setOnFramesButton(prev => ['right', prev[0]])
                break;
            default:
                break;
        }

        if (e.key === 'z' && e.ctrlKey) {
            undo()
        }
        if (e.ctrlKey && e.shiftKey && e.key === 'Z') {
            redo()
        }
        if (e.key === 'd' && e.ctrlKey) {
            e.preventDefault()
            setOnFramesButton(prev => ['duplicate', prev[0]])
        }
        if (e.key === 'x' && e.ctrlKey) {
            setOnFramesButton(prev => ['clearAll', prev[0]])
        }
    }

    // const handleBars = (bar: string) => {
    //     setTimeout(() => {
    //         mobileBars === bar
    //             ? setMobileBars('')
    //             : setMobileBars(bar)
    //     }, 100);
    // }

    const framesButtonClass = "w-6 h-6 cursor-pointer hover:scale-110"
    const actionButtonClass = "relative p-2 md:p-3 rounded-xl cursor-pointer text-black/60 md:text-inherit"

    return (
        <main className="h-svh bg-white md:bg-transparent" onKeyDown={handleKeyboard} tabIndex={0}>
            <div className="w-full h-12"></div>
            {userMsg?.isDisplay && <UserMsg
                userMsg={userMsg}
                setUserMsg={setUserMsg}
            />}
            <h1 className={`hidden md:block md:mb-6 text-slate-200 text-center text-5xl ${sue_ellen.className}`}>{`Let's Animate!`}</h1>
            <div className="absolute left-10 top-10 p-3 rounded-lg text-white bg-slate-50/20 cursor-pointer" onClick={() => setHotKeys(!hotKeys)}>Hot-Keys</div>
            <div id="main-flex" className="flex flex-row w-full max-w-[1120px] mx-auto bg-slate-950">
                {/* <ChevronRight 
                className="md:hidden absolute left-0 top-24 -translate-y-1/2 w-8 h-16 p-1 text-black bg-gray-200/80 rounded-r-2xl z-30" 
                onClick={() => handleBars("actions")}>
                </ChevronRight> */}
                <div id="action-buttons"
                    className={`absolute top-32 rounded-r-3xl bg-gray-300/60 ${mobileBars === "actions" ? 'left-0' : '-left-[80px]'} transition-all duration-700 p-2 z-30 
                            md:static md:px-3 lg:px-8 md:py-4 md:bg-slate-950 text-white/70 grid grid-cols-1 grid-rows-10 justify-items-center items-center gap-1 md:rounded-md`}>
                    <div id="pencil" onClick={onDraw} className={`${actionButtonClass} ${action.isDraw ? 'bg-white/60 md:bg-white/20' : ''}`}>
                        <Pencil />
                        {hotKeys && <p className="absolute bottom-0 -right-3 text-sm opacity-50">p</p>}
                    </div>
                    <div id="text" onClick={onText} className={`${actionButtonClass} ${action.isText ? 'bg-white/60 md:bg-white/20' : ''}`}>
                        < Type />
                        {hotKeys && <p className="absolute bottom-0 -right-3 text-sm opacity-50">t</p>}
                    </div>
                    <div id="erase" onClick={onErase} className={`${actionButtonClass} ${action.isErase ? 'bg-white/60 md:bg-white/20' : ''}`}>
                        <Eraser />
                        {hotKeys && <p className="absolute bottom-0 -right-3 text-sm opacity-50">e</p>}
                    </div>
                    {styleBar && <div className="absolute left-0 top-0 w-[100vw] h-[100vh] bg-white/20 z-20" onClick={() => setStyleBar(false)}></div>}
                    <div id="styleBar" className="relative">
                        <div className={`${actionButtonClass}`} onClick={() => setStyleBar(true)}>
                            <Palette />
                        </div>
                        {styleBar && <Styles
                            styleBar={styleBar}
                            setStyleBar={setStyleBar}
                            styles={styles}
                            setStyles={setStyles}
                            font={font}
                            setFont={setFont}
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
                                setLayers={setLayers}
                            />}
                    </div>
                    <div title="Translate" className={`${actionButtonClass} ${action.isTranslate ? 'bg-white/60 md:bg-white/20' : ''}`} onClick={() => setAction({ isTranslate: true })}>
                        <Move />
                        {hotKeys && <p className="absolute bottom-0 -right-4 text-sm opacity-50">m</p>}
                    </div>
                    <div title="Rotate" className={`${actionButtonClass}  ${action.isRotate ? 'bg-white/60 md:bg-white/20' : ''}`} onClick={() => setAction({ isRotate: true })}>
                        <RefreshCw />
                        {hotKeys && <p className="absolute bottom-0 -right-3 text-sm opacity-50">r</p>}
                    </div>
                    <div title="Scale" className={`${actionButtonClass} ${action.isScale ? 'bg-white/60 md:bg-white/20' : ''}`} onClick={() => setAction({ isScale: true })}>
                        <Expand />
                        {hotKeys && <p className="absolute bottom-0 -right-3 text-sm opacity-50">s</p>}
                    </div>
                    <div title="Undo" className={`${actionButtonClass} active:bg-white/60 md:active:bg-white/20`} onClick={undo}>
                        <Undo />
                        {hotKeys && <p className="absolute -bottom-2 -right-3 text-sm opacity-50">ctrl+z</p>}
                    </div>
                    <div title="Redo" className={`${actionButtonClass} active:bg-white/60 md:active:bg-white/20`} onClick={redo}>
                        <Redo />
                        {hotKeys && <p className="absolute -bottom-2 -right-3 text-sm opacity-50">ctrl+shift+z</p>}
                    </div>
                    <div title="Clear canvas" className={`${actionButtonClass} active:bg-white/60 md:active:bg-white/20`} onClick={clearCanvas}>
                        <Trash />
                        {hotKeys && <p className="absolute bottom-0 -right-3 text-sm opacity-50">x</p>}
                    </div>
                </div>
                <div id="canvas-container" className="relative w-full border-x-2 border-x-white/30">
                    {layers.length && layers.map((layer, idx) =>
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
                                isWriting={isWriting}
                                setIsWriting={setIsWriting}
                                characters={characters}
                                setCharacters={setCharacters}
                                onTextBoxMove={onTextBoxMove}
                                textBoxLocation={textBoxLocation}
                                setTextBoxLocation={setTextBoxLocation}
                                renderText={renderText}
                                setRenderText={setRenderText}
                                clear={clear}
                                isPlay={isPlay}
                                onDownload={onDownload}
                                redraw={redraw}
                            ></DrawingCanvas>
                        </div>)}
                    {isOnion && onionSkin.length > 0 && onionSkin.map(((frame, idx) =>
                        <div key={idx}>
                            <OnionSkin
                                onionSkin={onionSkin}
                                currentFrameIdx={currentFrameIdx}
                                canvasSize={canvasSize}
                                loadImage={loadImage}
                            />
                        </div>
                    ))}
                    {(isPlay || onDownload.on) && <PlayingCanvas
                        isPlay={isPlay}
                        onDownload={onDownload}
                        setOnDownload={setOnDownload}
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
                    mobileBars={mobileBars}
                ></Layers>

                {/* <ChevronLeft 
                className="md:hidden absolute right-0 top-1/3 -translate-y-1/2 w-6 h-20 text-black bg-gray-200 rounded-l-2xl z-20" 
                onClick={() => handleBars("layers")} >

                </ChevronLeft> */}
            </div>
            {isWriting && <div ref={textBox}
                onMouseDown={onTextBoxDown}
                onMouseUp={onTextBoxUp}
                style={{
                    position: 'fixed',
                    backgroundColor: 'rgba(255,255,255,.4)',
                    color: styles.fontColor,
                    border: "1px black solid",
                    borderRadius: "5px",
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    left: textBoxLocation.left,
                    top: textBoxLocation.top,
                    font: 'arial',
                    fontSize: styles.fontSize,
                    height: styles.fontSize
                }}>
                {characters}
            </div>}
            <BottomBar
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
                onDownload={onDownload}
                setOnDownload={setOnDownload}
                saveAnimation={saveAnimation}
                loadAnimation={loadAnimation}
                setIsOnion={setIsOnion}
                isOnion={isOnion}
                setOnionSkin={setOnionSkin}
                onFramesButton={onFramesButton}
                mobileBars={mobileBars}
                userMsg={userMsg}
                setUserMsg={setUserMsg}
                setRemovedFrame={setRemovedFrame}
                hotKeys={hotKeys}
            ></BottomBar>
            {/* <ChevronUp className="md:hidden absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-6 text-black bg-gray-200 rounded-t-2xl z-20" onClick={() => handleBars("frames")} /> */}
        </main>
    )
}