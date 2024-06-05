interface BackgroundProps {
    bgBar: boolean
    setBgBar: Function
    background: string
    setBackground: Function
}

export default function Backgrounds({
    bgBar,
    setBgBar,
    background,
    setBackground
}: BackgroundProps) {

    return (
        <>
            <div className="absolute left-16 -top-6 bg-slate-900/60 rounded-xl z-30 p-4">
                <div className="relative">
                    <div className="w-8 h-8 rounded-lg border-2 border-black overflow-hidden">
                        <input type="color" onChange={(e) => setBackground(e.target.value)} defaultValue="#ffffff" className="-ml-3 -mt-2 h-10 bg-transparent cursor-pointer" />
                    </div>
                </div>
            </div>
        </>
    )
}