export interface highlightData {
    color: string,
    note: string
  }
  
export interface highlightAction extends highlightData {
    view: number,
    highlightRange: string
  }
  
export interface progressUpdate{
    view: number,
    progress: number,
    cfi: string
  }
  
export interface bookmarkAction {
    view: number,
    bookmarkLocation: string
  }