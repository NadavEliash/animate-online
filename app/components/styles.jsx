import { useEffect, useState } from "react"
import { HexColorPicker } from "react-colorful" 

export default function Styles({
    styleBox,
    setStyleBox,
    styles,
    setStyles
}) {

    const [lineWidth, setLineWidth] = useState(6)
    const [strokeStyle, setStrokeStyle] = useState("black")
    const [dotSize, setDotSize] = useState(3)
    const [color, setColor] = useState("#aabbcc")

    useEffect(() => {
        setStyles({
            lineWidth,
            strokeStyle
        })
    }, [(lineWidth), (strokeStyle)])
    
    useEffect(() => {
        const newDotSize = lineWidth > 22 ? 6
            : lineWidth > 14 ? 4
                : lineWidth > 8 ? 3
                    : lineWidth > 4 ? 2
                        : 1
        setDotSize(newDotSize)
    }, [lineWidth])

    return (
        <>
            <div className="absolute left-20 -top-8 w-60 bg-slate-900/95 rounded-2xl z-30 p-4 flex flex-col gap-4 items-center justify-center">
                <div>
                    <HexColorPicker color={strokeStyle} onChange={setStrokeStyle} />
                </div>
                <div className="w-11/12 h-10 cursor-pointer flex justify-between items-center">
                    <div className="w-6 flex justify-center items-center">
                        <div className={`bg-[${strokeStyle}] border-2 rounded-full h-${dotSize} w-${dotSize}`}></div>
                    </div>
                    <input className="transition-opacity" type="range" min={1} max={30} step={1} value={lineWidth}
                        onChange={(e) => setLineWidth(e.target.value)} />
                </div>
            </div>
        </>
    )
}