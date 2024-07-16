import { Sketch } from "@uiw/react-color"
import { layer } from "@/app/models"


interface BackgroundProps {
    bgBar: boolean
    setBgBar: Function
    background: string
    setBackground: Function
    setLayers: Function
}

export default function Backgrounds({
    bgBar,
    setBgBar,
    background,
    setBackground,
    setLayers
}: BackgroundProps) {

    return (
        <>
            <div className="absolute left-24 top-2 -translate-y-1/4 bg-slate-950 rounded-xl z-30 p-4">
                <Sketch color={background} onChange={(e) => { setBackground(e.hex), setLayers((prev: layer[]) => [...prev]) }} />
            </div>
        </>
    )
}