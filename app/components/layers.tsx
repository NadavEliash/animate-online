import Layer from './layer'
import { Dongle } from 'next/font/google'
import { CopyPlus, Minus, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { layer } from '../models'

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
    showBar: string
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
    showBar
}: LayersProps) {

    const [mobileDisplay, setMobileDisplay] = useState(false)

    useEffect(() => {
        showBar === "layers" ? setMobileDisplay(true) : setMobileDisplay(false)
    }, [showBar])

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
        if (currentLayerIdx === 1 && layers.length === 2) {
            layers.splice(currentLayerIdx, 1, { id: generateId(), drawingActions: [] })
            setLayers(...layers)
        } else {
            layers.splice(currentLayerIdx, 1)
            setLayers(...layers)
        }
        setCurrentLayerIdx((prev: number) => prev > 1 ? prev - 1 : 1)
    }

    const buttonsClass = "md:bg-white/20 p-1 lg:p-2 rounded-md cursor-pointer hover:scale-110 transition-transform w-6 h-6 lg:w-8 lg:h-8"

    return (
        <div className={`absolute ${mobileDisplay ? 'right-0' : '-right-[100px]'} transition-all duration-700 top-20 bg-gray-300/60 rounded-l-2xl flex flex-col gap-2 justify-between max-h-[550px]
        md:static md:p-1 md:py-2 lg:p-4 md:bg-white/20 md:rounded-2xl`}>
            <h1 className={`text-center text-xl text-black md:text-3xl md:text-slate-200 ${dongle.className}`}>Layers:</h1>
            <div className="flex-1 flex flex-col-reverse items-center overflow-y-auto overflow-x-hidden">
                {layers && layers.map((layer, idx) =>
                    <Layer
                        key={idx}
                        layer={layer}
                        idx={idx}
                        layers={layers}
                        setLayers={setLayers}
                        currentLayerIdx={currentLayerIdx}
                        setCurrentLayerIdx={setCurrentLayerIdx}
                        canvasSize={canvasSyze}
                        background={background}
                        loadImage={loadImage}
                    />
                )}
            </div>
            <div className="text-black md:text-white flex justify-around md:gap-2">
                <Plus className={buttonsClass} onClick={addLayer} />
                <CopyPlus className={buttonsClass} onClick={copyLayer} />
                <Trash2 className={buttonsClass} onClick={removeLayer} />
            </div>
        </div>
    )
}