import { useEffect, useState } from "react"
import { styles } from "../models"
import { Eraser, Pencil, X } from "lucide-react"
import { Sketch } from "@uiw/react-color"
import { Sue_Ellen_Francisco } from "next/font/google"

const sue_ellen = Sue_Ellen_Francisco({ subsets: ['latin'], weight: '400' })

interface StyleProps {
    styleBar: boolean
    setStyleBar: Function
    styles: styles
    setStyles: Function
}

export default function Styles({
    styleBar,
    setStyleBar,
    styles,
    setStyles
}: StyleProps) {

    const [strokeStyle, setStrokeStyle] = useState(styles.strokeStyle)
    const [lineWidth, setLineWidth] = useState<number>(styles.lineWidth)
    const [fillMode, setFillMode] = useState<boolean>(styles.fillMode)
    const [eraserWidth, setEraserWidth] = useState<number>(styles.eraserWidth)
    const [animation, setAnimation] = useState<string>('scale-x-0')

    useEffect(() => {
        setTimeout(() => {
            setAnimation('scale-x-1')
        }, 10);
    })

    const handleChanges = (key: string, value: number | string | boolean) => {
        setStyles((prev: styles) => ({
            ...prev,
            [key]: value
        }))
    }

    return (
        <>
            <div className={`absolute left-24 top-2 -translate-y-1/4  bg-slate-950 rounded-2xl z-30 p-2 flex flex-col ${animation} transition-all duration-[.3s] origin-left p-4`}>
                <X className="absolute right-4 top-4 cursor-pointer" onClick={() => setStyleBar(false)} />
                <h1 className={`${sue_ellen.className} text-[2rem] text-slate-300 tracking-wider my-2 text-center`}>Styles</h1>
                <div className="flex p-4 gap-8">
                    <div>
                        <Sketch color={strokeStyle} onChange={(e) => handleChanges('strokeStyle', e.hex)} />
                    </div>
                    <div className="flex flex-col gap-6 mt-8 w-[20vw]">
                        <div>
                            <div className="flex gap-4">
                                <Pencil />
                                {lineWidth}
                            </div>
                            <input type="range" min="1" max="20" defaultValue={lineWidth} className="h-1 w-full" onChange={(e) => { handleChanges('lineWidth', e.target.valueAsNumber), setLineWidth(e.target.valueAsNumber) }} />
                        </div>
                        <div>
                            <div className="flex gap-4">
                                <Eraser />
                                {eraserWidth/3}
                            </div>
                            <input type="range" min="3" max="21" step={3} defaultValue={eraserWidth} className="h-1 w-full" onChange={(e) => { handleChanges('eraserWidth', e.target.valueAsNumber), setEraserWidth(e.target.valueAsNumber) }} />
                        </div>
                        <div className="flex gap-8">
                            <h1>Fill mode:</h1>
                            <input type="checkbox" checked={fillMode} onChange={() => { handleChanges('fillMode', !fillMode), setFillMode(!fillMode) }} className="mt-1 w-10" />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}