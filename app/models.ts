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
    isText?: boolean
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

export interface boundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface rotationState {
    initialAngle: number | null;
    currentAngle: number;
    centerX: number;
    centerY: number;
}

export interface scaleState {
    initialDistanceX: number;
    initialDistanceY: number;
    initialScaleX: number;
    initialScaleY: number;
    centerX: number;
    centerY: number;
}

export interface styles {
    lineWidth: number
    strokeStyle: string
    eraserWidth: number
    fillMode: boolean
    font: string
    fontSize: number
    fontColor: string
}

export interface userMsg {
    txt: string
    buttonTxt: string
    input?: boolean
    inputLabel?: string
    options?: string[]
    optionsLabel?: string
    callback: Function
    isDisplay: boolean
}

export interface onDownload {
    video: boolean
    name: string
    on: boolean
}

export interface frameToSave {
    layers: string[]
}