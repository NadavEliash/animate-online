import { frame } from '@/app/models'
import { useDndMonitor, useDroppable } from '@dnd-kit/core'
import React, { useEffect, useRef } from 'react'
import DisplayCanvas from './display-canvas'
import { horizontalListSortingStrategy, SortableContext } from '@dnd-kit/sortable'


interface FramesProps {
    frames: frame[]
    setFrames: Function
    currentIdx: number
    canvasSize: { width: number, height: number }
    setCurrentIdx: Function
    background: string
    loadImage: Function
    isDrag: boolean
    setIsDrag: Function
}

export default function Frames({
    frames,
    setFrames,
    currentIdx,
    canvasSize,
    setCurrentIdx,
    background,
    loadImage,
    isDrag,
    setIsDrag
}: FramesProps) {

    const currentRef = useRef<HTMLDivElement>(null)
    const framesRef = useRef<HTMLDivElement>(null)

    const { setNodeRef } = useDroppable({
        id: 'droppable',
    })

    useEffect(() => {
        if (isDrag) return

        if (framesRef.current && currentRef.current) {
            framesRef.current.scrollLeft = currentRef.current.offsetLeft - framesRef.current.offsetLeft - 100
        }
    }, [currentIdx])

    useDndMonitor({
        onDragStart(e) { setCurrentIdx(frames.findIndex(frame => frame.id === e.active.id)), setIsDrag(true) }
    })

    return (
        <div ref={setNodeRef} id="frames" className="flex-1">
            <div ref={framesRef} className='p-2 px-8 flex items-center gap-2 md:gap-4 overflow-y-hidden overflow-x-scroll scrollbar-thin scrollbar-thumb-slate-500 scrollbar-track-slate-950'>
                <SortableContext items={frames}
                    strategy={horizontalListSortingStrategy}>
                    {frames.length &&
                        frames.map((frame, idx) =>
                            <div key={idx} ref={idx === currentIdx ? currentRef : null}>
                                <DisplayCanvas
                                    size={"w-36 h-24"}
                                    frames={frames}
                                    setFrames={setFrames}
                                    frame={frame}
                                    idx={idx}
                                    currentIdx={currentIdx}
                                    canvasSize={canvasSize}
                                    setCurrentIdx={setCurrentIdx}
                                    background={background}
                                    loadImage={loadImage}
                                    id={frame.id}
                                />
                            </div>
                        )}
                </SortableContext>
            </div>
        </div>
    )
}
