import { Rendition } from 'epubjs-myh'
import {readerInstanceVariables} from '../ReaderView.d'



export default (rendition:Rendition, instanceVariables:readerInstanceVariables, toggleState:()=> void)=>{
  
  rendition.on("dblclick", (event:any, contents:any) =>{
    // If the mousedown timer has been set
    if (instanceVariables.timer != null){
      // Clear the timer
      clearTimeout(instanceVariables.timer)
      instanceVariables.timer = null
      instanceVariables.mouseUp = true
    }
  })
        
  rendition.on("mouseup", (event:any, contents:any) =>{
    // Set mouseup, which gives permission for the next page transition
    console.log("MOUSE UP")
    instanceVariables.mouseUp = true
  })
  
  // Inspired by: https://github.com/pgaskin/ePubViewer/blob/gh-pages/script.js#L365
  rendition.on("mousedown", (event:MouseEvent, contents:any) =>{
  
    // If a triple click, prevent it from going through (As this is a useless feature)
    if (event.detail > 2){
      event.preventDefault()
      return
    }
        
    try {
      // Handle case where an <a> tag is clicked
      const target = event.target as HTMLAnchorElement;
      const parentNode = target?.parentNode as HTMLAnchorElement
      console.log(parentNode)
      if (target?.tagName?.toLowerCase() == "a" && target?.href) return;
      if (parentNode?.tagName.toLowerCase() == "a" && parentNode.href || null) return;
      // eslint-disable-next-line no-empty
    } catch {}
  
    // Prevent the page from transitioning if we are unclicking a highlight
    //   console.log(contents.window.getSelection().toString(), contents.window.getSelection().toString().length)
    if (contents.window.getSelection().toString().length !== 0) return;
        
    // If a single click, and the click timer is null
  
  
    const wrapper = rendition?.manager?.container;
    console.log(rendition)
    if (wrapper == undefined){
      console.error("Safely caught error. Wrapper Undefined")
      return
    }
    const third = wrapper.clientWidth / 3;
    // event.pageX is where the mouse was on the page
    // wrapper.scrollLeft is how far from the left the wrapper is
    const x = event.pageX - wrapper.scrollLeft;
    if(event.detail == 1 && instanceVariables.timer == null){
  
      instanceVariables.mouseUp = false
      instanceVariables.timer = setTimeout(()=>{
        if(instanceVariables.mouseUp){
  
          // This will prevent case where text is quickly highlighted causing page to transition
          if (contents.window.getSelection().toString().length == 0) {
            if (x < third) {
              rendition.prev()
            } else if (x > (third * 2)) {
              rendition.next()    
            }else{
              toggleState()

            }
          }
        }
        // If mouse mouseup event at least once in this time period, but not double clicked (Would cancel timeout), we want to transition to the next page
  
        instanceVariables.timer = null
            
      }, 250)
    }
  });
}



//   try {
//     if (event?.target?.tagName?.toLowerCase() == "a" && event.target?.href) return;
//     if (event.target.parentNode.tagName.toLowerCase() == "a" && event.target.parentNode.href) return;
//     if (contents.window.getSelection().toString().length !== 0) return;
//     if (rendition.manager.getContents()[0].window.getSelection().toString().length !== 0) return;
//   } catch (err) {}