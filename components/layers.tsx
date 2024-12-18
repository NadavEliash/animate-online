import { Dongle } from 'next/font/google'
import { CopyPlus, Minus, Plus, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import DisplayCanvas from './display-canvas'
import { layer } from '@/app/models'

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

    const layersRef = useRef<HTMLDivElement>(null)
    const currentRef = useRef<HTMLDivElement>(null)
    const [mobileDisplay, setMobileDisplay] = useState(false)

    useEffect(() => {
        mobileBars === "layers" ? setMobileDisplay(true) : setMobileDisplay(false)
    }, [mobileBars])

    useEffect(() => {
        if (layersRef.current && currentRef.current) {
            layersRef.current.scrollTop = currentRef.current.offsetTop - layersRef.current.offsetTop - 100
        }
    }, [currentLayerIdx])

    const addLayer = () => {
        const newLayers = layers
        newLayers.splice(currentLayerIdx + 1, 0, { id: generateId(), drawingActions: [] })
        setLayers([...newLayers])
        setCurrentLayerIdx(currentLayerIdx + 1)
    }

    const copyLayer = () => {
        const newLayers = layers
        newLayers.splice(currentLayerIdx + 1, 0, { id: generateId(), drawingActions: [...layers[currentLayerIdx].drawingActions] })
        setLayers([...newLayers])
        setCurrentLayerIdx(currentLayerIdx + 1)
    }

    const removeLayer = () => {
        const newLayers = layers
        newLayers.splice(currentLayerIdx, 1)

        if (newLayers.length < 2) newLayers.push({ id: generateId(), drawingActions: [] })

        setLayers([...newLayers])

        setCurrentLayerIdx((prev: number) => prev > 1 ? prev - 1 : 1)
    }

    const buttonsClass = "md:bg-white/20 p-1 lg:p-2 rounded-md cursor-pointer hover:scale-110 transition-transform w-6 h-6 lg:w-8 lg:h-8"

    return (
        <div className={`absolute ${mobileDisplay ? 'right-0' : '-right-[100px]'} max-h-[550px] transition-all duration-700 top-20 rounded-l-2xl flex flex-col gap-1 justify-between
        md:relative md:left-0 md:top-0 md:p-1 md:pr-0 md:py-2 lg:p-4 lg:pr-1 md:rounded-md`}>
            <h1 className={`text-center text-xl text-black md:text-3xl md:text-slate-200 ${dongle.className}`}>Layers:</h1>
            <div className="hidden md:block absolute w-full h-6 bg-slate-950 left-0 top-11"></div>
            <div ref={layersRef} className="flex-1 flex flex-col-reverse items-center overflow-y-scroll overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-500 scrollbar-track-slate-950 py-4 md:pr-[1px] lg:pr-1">

                {layers.length && layers.map((layer, idx) =>
                    <div key={idx} ref={idx === currentLayerIdx ? currentRef : null}>
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
                            id={layer.id}
                        />
                    </div>
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