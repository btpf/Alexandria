import { Rendition } from 'epubjs'
import { bookStateStructure } from "./EpubJSBackend/epubjsManager.d.ts"

interface BackendInstance{
  instance: Rendition
  UID: number,
  hash: string,
  title: string,
  renderMode?: string,
  readerMargins?: number,
}

export interface BookInstances {
  [key: string]: bookStateStructure | unknown // some other rendering backend
}