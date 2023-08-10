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
    readerMargins: number,
    renderMode: string
  }
}

export interface bookStateHydrationStructure{
  title: string,
  author: string,
  data:dataInterface
}

export interface bookStateStructure extends bookStateHydrationStructure{
    instance: Rendition,
    UID: number,
    hash: string
    loadState?: LOADSTATE,
    state:{
      isProgrammaticProgressUpdate: boolean,
      sidebarMenuSelected: boolean|string,
      menuToggled: boolean,
      themeMenuActive: boolean,
      skipMouseEvent: boolean,
      dictionaryWord: string,
      modals:{
        selectedCFI: string,
        quickbarModal: {visible: boolean, x:number, y:number},
        noteModal: {visible: boolean, x:number, y:number}
      },
    },
  }
  


  interface loadProgressUpdate{
    view:number,
    state: LOADSTATE
  }
  
export type epubjs_reducer = (state: WritableDraft<BookInstances>, action: PayloadAction<any>) => any