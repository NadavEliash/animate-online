import { useRef } from "react"


export default function DisplayCanvas(

){

    const canvasRef = useRef<HTMLCanvasElement>(null)
    
    return (
        <canvas ref={canvasRef} width={500} height={500}
            className='absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[100%] md:w-fit rounded-md pointer-events-none z-20'>
        </canvas>
    )
}