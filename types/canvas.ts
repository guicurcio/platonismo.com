export interface CanvasObject {
  id: string
  type: 'image' | 'text' | 'rectangle' | 'ellipse' | 'path'
  x: number
  y: number
  width: number
  height: number
  rotation: number
  src?: string
  text?: string
  fill?: string
  stroke?: string
  points?: Array<{ x: number; y: number }>
}

