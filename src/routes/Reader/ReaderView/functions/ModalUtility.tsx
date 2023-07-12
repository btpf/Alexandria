import { Contents, EpubCFI, Rendition } from "epubjs";


export const QUICKBAR_MODAL_WIDTH = 200
export const QUICKBAR_MODAL_HEIGHT = 100

export const NOTE_MODAL_WIDTH = 300;
export const NOTE_MODAL_HEIGHT = 250;


export const CalculateBoxPosition = (renditionInstance:Rendition, cfiRange:string,boxWidth:number, boxHeight:number)=>{
  //   const wrapperBounds = this.props.renditionInstance?.manager?.container?.getBoundingClientRect();
  const wrapperBounds = renditionInstance?.manager?.container?.getBoundingClientRect()
  const rangeBoxBounds = renditionInstance.getRange(cfiRange).getBoundingClientRect();
  
  if (!wrapperBounds){
    console.log("Wrapper not found")
    return {x:0, y:0}
  }

  // Since the position is absolute inside the container, by getting the wrapper and the bounding rect,
  // We can add how far from the top the actual render of the ReaderView is
  // We also subtract wrapperBounds.top for the continuous scroll since our offset
  // is our y position - how far from the top we are
  const offsetY = wrapperBounds?.y - wrapperBounds.top

  
          
  // The bottom limit is the wrappers distance from the top + the height of the render wrapper
  const yBottomLimit = wrapperBounds?.y + wrapperBounds?.height
  // The default position will be the position of the highlight + the offsetY + the height of the highlight
  let ypos = rangeBoxBounds.y + offsetY + rangeBoxBounds.height
          
  if (ypos + boxHeight > yBottomLimit){
    // Subtract the height of the highlight and the height of the rendered dialog
    ypos -= (boxHeight + rangeBoxBounds.height)
  }
  ypos = Math.max(ypos, 0)


  const cfi = new EpubCFI(cfiRange);
  const sectionIndex = cfi.spinePos
  const views = renditionInstance.views();
  // We are finding the current view we are on in the case there are multiple on screen (Continuous)
  let correctView;
  views.forEach( (view) => {
    if (sectionIndex === view.index) {
      correctView = view;
    }
  });

  const correctViewBounds = correctView.iframe.getBoundingClientRect();
  // We are adding the amount from the top we are in the current selected view
  ypos += correctViewBounds.top
    
  const xRightLimit = wrapperBounds?.x + wrapperBounds?.width
    
  // Fixed bug where once resized, epubjs keep the previously rendered content off screen,
  // Causing the position calculations to mess up. This will mod the x position by the width
  // ensuring the box stays on the screen.
  const trueX = rangeBoxBounds.x % wrapperBounds.width
    
  let xpos = trueX + rangeBoxBounds.width /2 - boxWidth/2
  
  // This will handle the case where Reader Margins are set.
  // In this case, the xposition will need to be offset by the amount that there is margins
  // on the left side of the parent container
  const element = renditionInstance?.manager?.container?.parentElement
  if(element){
    const marginLeftValue = window.getComputedStyle(element).marginLeft
    xpos += Number(marginLeftValue.replace("px", ""))
  }



  xpos = Math.min(xpos, xRightLimit - boxWidth)
  xpos = Math.max(xpos, 0)
    
  return {x:xpos, y:ypos}
}