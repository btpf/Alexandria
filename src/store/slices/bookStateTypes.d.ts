import { Rendition } from 'epubjs-myh'


interface BackendInstance{
  instance: Rendition
  UID: number,
  hash: string,
  title: string
}

export interface BookInstances {
  [key: string]: bookStateStructure | unknown // some other rendering backend
}