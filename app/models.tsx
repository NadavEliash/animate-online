import { HexColor } from "@uiw/react-color"

export interface drawingAction {
    url: string
    isPath: boolean
}

export interface layer {
    id: string
    drawingActions: drawingAction[]
}

export interface frame {
    id: string
    layers: layer[]
    frameUrl?: string 
}

export interface action {
    isDraw?: boolean
    isErase?: boolean
    isTranslate?: boolean
    isRotate?: boolean
    isScale?: boolean
    isStyle?: boolean
}

export interface path {
    x: number
    y: number
}

export interface styles {
    lineWidth: number
    strokeStyle: string
    eraserWidth: number
    fillMode: boolean
}

export interface userMsg {
    txt: string
    buttonTxt: string
    input: boolean
    inputLabel?: string
    callback: Function
    isDisplay: boolean
}