interface dataInterface{
  highlights:{[cfiRange:string]:highlightData},
  bookmarks:Set<string>,
  progress: number,
  theme:{
    font: string,
    fontSize: number,
    themeName: string
  }
}


export interface bookStateStructure{
    title: string,
    instance: Rendition,
    UID: number,
    hash: string
    loadState: LOADSTATE,
    state:{
      sidebarMenuSelected: boolean|string,
      menuToggled: boolean,
      themeMenuActive: boolean,
      skipMouseEvent: boolean,
      modals:{
        selectedCFI: string,
        quickbarModal: {visible: boolean, x:number, y:number},
        noteModal: {visible: boolean, x:number, y:number}
      },
    },
    data:dataInterface
  }
  


  interface loadProgressUpdate{
    view:number,
    state: LOADSTATE
  }
  
export type epubjs_reducer = (state: WritableDraft<BookInstances>, action: PayloadAction<any>) => any