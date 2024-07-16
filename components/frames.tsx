import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, CopyPlus, Download, FolderOpen, Pause, Play, Save, SquareMinusIcon, SquarePlus, Trash } from "lucide-react"
import DisplayCanvas from './display-canvas';
import { frame, onDownload, userMsg } from '@/app/models';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/app/db/db.model';


interface FramesProps {
    frames: frame[] | []
    setFrames: Function
    currentFrameIdx: number
    setCurrentFrameIdx: Function
    canvasSize: { width: number, height: number }
    background: string
    clearCanvas: Function
    generateId: Function
    loadImage: Function
    isPlay: boolean
    setIsPlay: Function
    onDownload: onDownload
    setOnDownload: Function
    saveAnimation: Function
    loadAnimation: Function
    setIsOnion: Function
    isOnion: boolean
    setOnionSkin: Function
    onFramesButton: string[]
    mobileBars: string
    userMsg: userMsg | null
    setUserMsg: Function
}

export default function Frames({
    frames,
    setFrames,
    currentFrameIdx,
    setCurrentFrameIdx,
    canvasSize,
    background,
    clearCanvas,
    generateId,
    loadImage,
    isPlay,
    setIsPlay,
    onDownload,
    setOnDownload,
    saveAnimation,
    loadAnimation,
    setIsOnion,
    isOnion,
    setOnionSkin,
    onFramesButton,
    mobileBars,
    userMsg,
    setUserMsg
}: FramesProps) {

    const framesRef = useRef<HTMLDivElement>(null)
    const currentRef = useRef<HTMLDivElement>(null)
    const [mobileDisplay, setMobileDisplay] = useState(false)

    const scenes = useLiveQuery(() => db.scenes.toArray())

    useEffect(() => {
        mobileBars === "frames" ? setMobileDisplay(true) : setMobileDisplay(false)
    }, [mobileBars])

    useEffect(() => {
        if (framesRef.current && currentRef.current) {
            framesRef.current.scrollLeft = currentRef.current.offsetLeft - framesRef.current.offsetLeft - 50
        }
    }, [currentFrameIdx])

    useEffect(() => {
        switch (onFramesButton[0]) {
            case 'add':
                addFrame()
                break;
            case 'remove':
                removeFrame()
                break;
            case 'duplicate':
                duplicateFrame()
                break;
            case 'left':
                switchFrame('left')
                break;
            case 'right':
                switchFrame('right')
                break;

            default:
                break;
        }

    }, [onFramesButton])

    const addFrame = () => {
        if (isPlay) return

        const newFrame = { id: generateId(), layers: [{ id: generateId(), drawingActions: [] }, { id: generateId(), drawingActions: [] }] }
        frames.splice(currentFrameIdx + 1, 0, newFrame)
        setFrames((prev: frame[]) => [...prev])
        setCurrentFrameIdx(currentFrameIdx + 1)
    }

    const switchFrame = (toFrame: string | number) => {
        if (isPlay) return
        let newCurrentFrameIdx

        if (toFrame === 'left') {
            currentFrameIdx > 0
                ? newCurrentFrameIdx = currentFrameIdx - 1
                : newCurrentFrameIdx = frames.length - 1
        } else if (toFrame === 'right') {
            currentFrameIdx < frames.length - 1
                ? newCurrentFrameIdx = currentFrameIdx + 1
                : newCurrentFrameIdx = 0
        } else {
            newCurrentFrameIdx = toFrame
        }

        setCurrentFrameIdx(newCurrentFrameIdx)
    }

    const removeFrame = () => {
        if (isPlay) return

        if (!frames.length) {
            return
        } else if (frames.length === 1) {
            clearAll()
        } else {
            frames.splice(currentFrameIdx, 1)
            setFrames((prev: frame[]) => [...prev])
            setCurrentFrameIdx(currentFrameIdx > 0 ? currentFrameIdx - 1 : 0)
        }
    }

    const duplicateFrame = () => {
        if (isPlay) return

        const newFrame = { id: generateId(), layers: frames[currentFrameIdx].layers }
        frames.splice(currentFrameIdx, 0, newFrame)
        setFrames((prev: frame[]) => [...prev])
        switchFrame('right')
    }

    const clearAll = () => {
        if (isPlay) return

        const callback = () => {
            setFrames([{ id: generateId(), layers: [{ id: generateId(), drawingActions: [] }, { id: generateId(), drawingActions: [] }] }])
            setCurrentFrameIdx(0)
            setOnionSkin([])
            clearCanvas()
        }

        const newUserMsg = {
            txt: 'Are you sure you want to remove the entire scene?',
            buttonTxt: 'Yes',
            input: false,
            callback,
            isDisplay: true
        }

        setUserMsg(newUserMsg)
    }

    const save = () => {
        const newUserMsg = {
            txt: '',
            buttonTxt: 'Save',
            input: true,
            inputLabel: 'Scene name: ',
            callback: saveAnimation,
            isDisplay: true
        }

        setUserMsg(newUserMsg)
    }

    const load = async () => {
        const options = scenes?.map(scene => scene.name)
        let newUserMsg

        if (options?.length) {
            newUserMsg = {
                txt: '',
                buttonTxt: 'Load',
                input: false,
                options,
                optionsLabel: 'select a file name',
                callback: loadAnimation,
                isDisplay: true
            }
        } else {
            newUserMsg = {
                txt: 'There is no saved animations',
                buttonTxt: 'Okay',
                callback: () => { },
                input: false,
                isDisplay: true
            }
        }
        setUserMsg(newUserMsg)
    }

    const download = () => {
        const newUserMsg = {
            txt: '',
            buttonTxt: 'Download',
            input: true,
            inputLabel: 'File name: ',
            options: ['.mp4 Video', '.png Image'],
            optionsLabel: 'Select file format',
            callback: (fileName: string, option: string) => setOnDownload({ video: option === '.mp4 Video' ? true : false, name: fileName, on: true }),
            isDisplay: true
        }

        setUserMsg(newUserMsg)
    }

    const getStorageFiles = async () => {
        return Object.keys(localStorage)
    }


    const framesButtonClass = "w-6 h-6 cursor-pointer hover:scale-110 text-black md:text-inherit"

    return (
        <div id="frames-bar" className={`absolute md:static ${mobileDisplay ? 'bottom-2' : '-bottom-[250px]'} transition-all duration-700 left-1/2 -translate-x-1/2 
        md:translate-x-0 md:max-w-[820px] lg:max-w-[1120px] flex flex-col gap-1 md:mx-auto z-20`}>
            <div id="frames-buttons" className="w-full bg-slate-950 py-2 mt-4 text-white/70 flex gap-6 items-center rounded-t-2xl justify-center">
                <div title="Add a blank frame" className={framesButtonClass} onClick={addFrame}>
                    <SquarePlus />
                </div>
                <div title="Duplicate frame" className={framesButtonClass} onClick={duplicateFrame} >
                    <CopyPlus />
                </div>
                <div title="Remove frame" className={framesButtonClass} onClick={removeFrame}>
                    <SquareMinusIcon />
                </div>
                <div title="Clear scene" className={`${framesButtonClass} md:bg-gray-500/40 rounded-full w-8 h-8 text-black/70 flex items-center justify-center`} onClick={clearAll}>
                    <Trash className='w-6 h-6' />
                </div>
                <div id='animation-options' className='ml-6 flex gap-6 items-center justify-center'>
                    <div title="Onion skin" className={`${framesButtonClass} ${isOnion ? 'bg-white/20' : ''} rounded-full w-8 h-8 text-black/70 flex items-center justify-center`} onClick={() => setIsOnion(!isOnion)}>
                        <img src='/onion.svg' alt='onion' className='w-6 h-6' />
                    </div>
                    <div title="Play / Pause" className={framesButtonClass} onClick={() => setIsPlay(!isPlay)}>
                        {isPlay ? <Pause /> : <Play />}
                    </div>
                    <div title="Download" className={framesButtonClass} onClick={download}>
                        <Download />
                    </div>
                    <div title="Save" className={framesButtonClass} onClick={save}>
                        <Save />
                    </div>
                    <div title="Load" className={framesButtonClass} onClick={load}>
                        <FolderOpen />
                    </div>
                </div>
            </div>
            <div id="frames-container" className="relative w-full md:bg-slate-950 p-4 pb-2 rounded-b-2xl">
                <div className="hidden absolute top-0 left-0 h-full md:flex flex-col w-12 bg-gradient-to-r from-slate-950 from-80% to-transparent rounded-lg items-start justify-between py-2"
                    onClick={() => switchFrame('left')}>
                    <ChevronLeft className="mt-10 w-8 h-16 text-white cursor-pointer" />
                    <div className="bg-slate-950 w-full h-[11px]"></div>
                </div>
                <div ref={framesRef} id="frames" className="p-2 px-8 flex-1 gap-2 md:gap-4 flex justify-start items-center overflow-x-scroll scrollbar-thin scrollbar-thumb-slate-500 scrollbar-track-slate-950">
                    {frames.length &&
                        frames.map((frame, idx) =>
                            <div key={idx} ref={idx === currentFrameIdx ? currentRef : null}>
                                <DisplayCanvas
                                    size={"w-36 h-24"}
                                    frames={frames}
                                    setFrames={setFrames}
                                    frame={frame}
                                    idx={idx}
                                    currentIdx={currentFrameIdx}
                                    canvasSize={canvasSize}
                                    setCurrentIdx={setCurrentFrameIdx}
                                    background={background}
                                    loadImage={loadImage}
                                />
                            </div>
                        )}
                </div>
                <div className="hidden absolute top-0 right-0 h-full md:flex flex-col w-12 bg-gradient-to-l from-slate-950 from-70% to-transparent rounded-b-lg items-end justify-between py-2"
                    onClick={() => switchFrame('right')}>
                    <ChevronRight className="mt-10 w-8 h-16 text-white cursor-pointer" />
                    <div className="bg-slate-950 w-full h-[11px]"></div>
                </div>
            </div>
        </div>
    )
}