import { Rendition } from "epubjs-myh"
import View from "epubjs-myh/types/managers/view"



// Fixes https://github.com/johnfactotum/epubjs-tips#re-render-annotations
export default (rendition:Rendition)=>{
  const redrawAnnotations = () => rendition.views().forEach((view:View) => view.pane ? view.pane.render() : null)
    
  rendition.on('rendered', redrawAnnotations)
}