import { useEffect, useState } from "react"
import { HexColorPicker } from "react-colorful"
import { styles } from "../models"

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

    const [lineWidth, setLineWidth] = useState<number>(6)
    const [strokeStyle, setStrokeStyle] = useState("black")
    const [color, setColor] = useState("#aabbcc")

    useEffect(() => {
        setStyles({
            lineWidth,
            strokeStyle
        })
    }, [(lineWidth), (strokeStyle)])

    return (
        <>
            <div className="absolute left-20 -top-8 w-60 bg-slate-900/95 rounded-2xl z-30 p-4 flex flex-col gap-4 items-center justify-center">
                <div>
                    <HexColorPicker color={strokeStyle} onChange={setStrokeStyle} />
                </div>
                <div className="w-11/12 h-10 cursor-pointer flex justify-between items-center">
                    <div className={`bg-[${strokeStyle}] border-2 rounded-full h-[${lineWidth}px] w-[${lineWidth}px]`}></div>
                    <input className="transition-opacity" type="range" min={1} max={30} step={1} value={lineWidth}
                        onChange={(e) => { setLineWidth(+e.target.value) }} />
                </div>
            </div>
        </>
    )
}