


export default  (wrapperBounds:DOMRect|undefined, rangeBoxBounds:DOMRect, boxWidth:number, boxHeight:number)=>{
//   const wrapperBounds = this.props.renditionInstance?.manager?.container?.getBoundingClientRect();

  if (!wrapperBounds){
    console.log("Wrapper not found")
    return {x:0, y:0}
  }

  // Since the position is absolute inside the container, by getting the wrapper and the bounding rect,
  // We can add how far from the top the actual render of the ReaderView is
  const offsetY = wrapperBounds?.y
      
  // The bottom limit is the wrappers distance from the top + the height of the render wrapper
  const yBottomLimit = wrapperBounds?.y + wrapperBounds?.height
  // The default position will be the position of the highlight + the offsetY + the height of the highlight
  let ypos = rangeBoxBounds.y + offsetY + rangeBoxBounds.height
      
  if (ypos + boxHeight > yBottomLimit){
    // Subtract the height of the highlight and the height of the rendered dialog
    ypos -= (boxHeight + rangeBoxBounds.height)
  }
  ypos = Math.max(ypos, 0)

  const xRightLimit = wrapperBounds?.x + wrapperBounds?.width

  // Fixed bug where once resized, epubjs keep the previously rendered content off screen,
  // Causing the position calculations to mess up. This will mod the x position by the width
  // ensuring the box stays on the screen.
  const trueX = rangeBoxBounds.x % wrapperBounds.width

  let xpos = trueX + rangeBoxBounds.width /2 - boxWidth/2
  xpos = Math.min(xpos, xRightLimit - boxWidth)
  xpos = Math.max(xpos, 0)

  return {x:xpos, y:ypos}
}