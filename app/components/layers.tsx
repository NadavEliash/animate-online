import { Dongle } from 'next/font/google'
import { CopyPlus, Minus, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { layer } from '../models'
import DisplayCanvas from './display-canvas'

const dongle = Dongle({ weight: ["700"], subsets: ["latin"] })

interface LayersProps {
    layers: layer[]
    setLayers: Function
    currentLayerIdx: number
    setCurrentLayerIdx: Function
    canvasSyze: { width: number, height: number }
    generateId: Function
    background: string
    loadImage: Function
    mobileBars: string
}

export default function Layers({
    layers,
    setLayers,
    currentLayerIdx,
    setCurrentLayerIdx,
    canvasSyze,
    generateId,
    background,
    loadImage,
    mobileBars
}: LayersProps) {

    const [mobileDisplay, setMobileDisplay] = useState(false)

    useEffect(() => {
        mobileBars === "layers" ? setMobileDisplay(true) : setMobileDisplay(false)
    }, [mobileBars])

    const addLayer = () => {
        const newLayers = layers
        newLayers.splice(currentLayerIdx + 1, 0, { id: generateId(), drawingActions: [] })
        setLayers(newLayers)
        setCurrentLayerIdx(currentLayerIdx + 1)
    }

    const copyLayer = () => {
        const copiedLayer = { id: generateId(), drawingActions: [...layers[currentLayerIdx].drawingActions] }
        const newLayers = layers
        newLayers.splice(currentLayerIdx + 1, 0, copiedLayer)
        setLayers(newLayers)
        setCurrentLayerIdx(currentLayerIdx + 1)
    }

    const removeLayer = () => {
        const newLayers = layers
        if (currentLayerIdx === 1 && layers.length === 2) {
            newLayers.splice(currentLayerIdx, 1, { id: generateId(), drawingActions: [] })
            setLayers([...newLayers])
        } else {
            newLayers.splice(currentLayerIdx, 1)
            setLayers([...newLayers])
        }
        setCurrentLayerIdx((prev: number) => prev > 1 ? prev - 1 : 1)
    }

    const buttonsClass = "md:bg-white/20 p-1 lg:p-2 rounded-md cursor-pointer hover:scale-110 transition-transform w-6 h-6 lg:w-8 lg:h-8"

    return (
        <div className={`absolute ${mobileDisplay ? 'right-0' : '-right-[100px]'} transition-all duration-700 top-20 bg-gray-300/60 rounded-l-2xl flex flex-col gap-1 justify-between max-h-[550px]
        md:relative md:left-0 md:top-0 md:p-1 md:pr-0 md:py-2 lg:p-4 lg:pr-1 md:bg-slate-950 md:rounded-2xl`}>
            <h1 className={`text-center text-xl text-black md:text-3xl md:text-slate-200 ${dongle.className}`}>Layers:</h1>
            <div className="hidden md:block absolute w-full h-6 bg-slate-950 left-0 top-10"></div>
            <div className="flex-1 flex flex-col-reverse items-center overflow-y-scroll overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-500 scrollbar-track-slate-950 py-4 md:pr-[1px] lg:pr-1">
                {layers.length && layers.map((layer, idx) =>
                    <DisplayCanvas 
                    key={idx}
                    size={"w-28 h-20"}
                    layer={layer}
                    idx={idx}
                    layers={layers}
                    setLayers={setLayers}
                    currentIdx={currentLayerIdx}
                    setCurrentIdx={setCurrentLayerIdx}
                    canvasSize={canvasSyze}
                    background={background}
                    loadImage={loadImage}
                    />
                )}
            </div>
            <div className="hidden md:block absolute w-full h-4 bg-slate-950 left-0 md:bottom-8 lg:bottom-12"></div>
            <div className="text-black md:text-white flex justify-around md:gap-2">
                <Plus className={buttonsClass} onClick={addLayer} />
                <CopyPlus className={buttonsClass} onClick={copyLayer} />
                <Trash2 className={buttonsClass} onClick={removeLayer} />
            </div>
        </div>
    )
}