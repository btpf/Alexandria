interface dataInterface{
  highlights:{[cfiRange:string]:highlightData},
  bookmarks:Set<string>,
  progress: number,
  cfi: string,
  theme:{
    font: string,
    fontCache: string,
    fontSize: number,
    fontWeight: number,
    wordSpacing: number,
    lineHeight: number,
    renderMode: string
  }
}

export interface bookStateHydrationStructure{
  title: string,
  author: string,
  modified: number,
  data:dataInterface
}

export interface bookStateStructure extends bookStateHydrationStructure{
    instance: Rendition,
    UID: number,
    hash: string
    loadState?: LOADSTATE,
    data?: dataInterface,
    state:{
      isProgrammaticProgressUpdate: boolean,
      skipMouseEvent: boolean,

    },
  }
  


  interface loadProgressUpdate{
    view:number,
    state: LOADSTATE
  }
  
export type epubjs_reducer = (state: WritableDraft<BookInstances>, action: PayloadAction<any>) => any