import { Rendition } from "epubjs-myh";
import {readerInstanceVariables} from '../ReaderView.d'


// This will highlight the selected text
export default (rendition:Rendition, instanceVariables:readerInstanceVariables) =>{

  rendition.on("selected", (cfiRange:any, contents:any) =>{
    if (contents.window.getSelection().toString().length > 0){ // If statement will prevent crashing if image is selected
      rendition.annotations.highlight(cfiRange, {}, (e:MouseEvent) => {
        instanceVariables.mouseUp = false // This will prevent page turning when clicking on highlight
      });

    }
        
    contents.window.getSelection().removeAllRanges();
  });
}