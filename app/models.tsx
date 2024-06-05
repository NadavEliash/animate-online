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
}

export interface action {
    isDraw?: boolean
    isErase?: boolean
    isTranslate?: boolean
    isRotate?: boolean
    isScale?: boolean
}

export interface path {
    x: number
    y: number
}