import { X } from "lucide-react"
import { userMsg } from "../models"
import { useState } from "react"

export default function UserMsg({
    userMsg,
    setUserMsg
}: {
    userMsg: userMsg
    setUserMsg: Function
}) {

    const [input, setInput] = useState('')

    const closeMsg = () => {
        setUserMsg((prev: userMsg) => ({
            ...prev,
            isDisplay: false
        }))
    }

    const buttonClass = "bg-black border-[1px] border-white/50 shadow-m shadow-white/10 rounded-2xl w-32 h-10 text-white text-lg flex items-center justify-center cursor-pointer hover:scale-105 active:bg-white/10"

    return (
        <>
            <div className="absolute left-0 top-0 w-full h-svh bg-white/30 z-40" onClick={closeMsg}></div>
            <div className="absolute bg-slate-950 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 rounded-3xl p-6 w-[30vw]">
                <X onClick={closeMsg} className="text-white absolute right-4 top-4 cursor-pointer" />
                {userMsg.txt && <h1 className="text-white text-xl text-center my-16">{userMsg.txt}</h1>}
                {userMsg.input &&
                    <div className="flex my-16 items-center justify-between">
                        <h1 className="text-white">{userMsg.inputLabel}</h1>
                        <input type="text" className="h-10 indent-3" onChange={(e) => setInput(e.target.value)} />
                    </div>
                }
                <div className="flex gap-8 justify-between w-3/4 mx-auto">
                    <div className={`${buttonClass}`} onClick={() => { userMsg.callback(input), closeMsg() }}>
                        <h1>{userMsg.buttonTxt}</h1>
                    </div>
                    <div className={`${buttonClass}`} onClick={closeMsg}>
                        <h1>Cancel</h1>
                    </div>
                </div>
            </div>
        </>
    )
}