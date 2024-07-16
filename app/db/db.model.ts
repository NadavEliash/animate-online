import Dexie, { Table } from 'dexie'
import { frameToSave } from '../models'

export interface Scene {
    id?: string
    name: string
    frames: frameToSave[]
}

export class DB extends Dexie {
  scenes!: Table<Scene>; 
  constructor() {
    super('myDatabase')
    this.version(1).stores({
      scenes: '++id, name, frames'  
    })
  }
}

export const db = new DB(); // export the db