import { AllowMouseEvent, HideNoteModal, HideQuickbarModal, MoveNoteModal, MoveQuickbarModal, SetModalCFI, ToggleMenu, ToggleThemeMenu } from "@store/slices/bookState";
import store from "@store/store";
import { Contents, EpubCFI, Rendition } from "epubjs-myh";
import View from "epubjs-myh/types/managers/view";
import { 
  CalculateBoxPosition, 
  NOTE_MODAL_HEIGHT, 
  NOTE_MODAL_WIDTH,
  QUICKBAR_MODAL_HEIGHT, 
  QUICKBAR_MODAL_WIDTH 
} from "./ModalUtility";


export default (renditionInstance:Rendition)=>{

  // const renditionInstance = initialState.bookState["0"].instance;
  let NoteModalVisible!:boolean;
  let QuickbarModalVisible!:boolean;
  let selectedCFI!:string;
  let ThemeMenuActive!:boolean;
  let skipMouseEvent!:boolean

  let timer:any = null;

  // https://stackoverflow.com/questions/22266826/how-can-i-do-a-shallow-comparison-of-the-properties-of-two-objects-with-javascri
  const shallowCompareEqual = (obj1:any, obj2:any) =>
    Object.keys(obj1).length === Object.keys(obj2).length &&
  Object.keys(obj1).every(key => obj1[key] === obj2[key]);


  let oldThemeState = {};
  const unsubscribe = store.subscribe(()=>{
    const newState = store.getState()
    NoteModalVisible = newState.bookState["0"].state.modals.noteModal.visible
    QuickbarModalVisible = newState.bookState["0"].state.modals.quickbarModal.visible;
    selectedCFI = newState.bookState["0"].state.modals.selectedCFI;
    ThemeMenuActive = newState.bookState["0"].state.themeMenuActive;
    skipMouseEvent = newState.bookState["0"].state.skipMouseEvent


    if(!shallowCompareEqual(newState.bookState["0"].data.theme, oldThemeState)){
      oldThemeState = newState.bookState["0"].data.theme
      redrawAnnotations()
    }
  })




  renditionInstance.on("dblclick", (event:any, contents:any) =>{
    console.log("Double click event")
    // If the mousedown timer has been set
    if (timer != null){
      // Clear the timer
      clearTimeout(timer)
      timer = null
    }
  })

  renditionInstance.on("click", (event:any, contents:any) =>{
    console.log("click event")


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
    // if (contents.window.getSelection().toString().length !== 0) return;
      
    // If a single click, and the click timer is null




    if(event.detail == 1 && timer == null){
    // If text is current selected and the quickbar is visible
    // This is important because when selecting text, a click event will register. 
    // However, in this state, text will be selected. If we are in this state, we know we can invalidate it. 
      if(NoteModalVisible || QuickbarModalVisible){

        // If the note popup is visible
        if(NoteModalVisible){
          store.dispatch(HideNoteModal(0))


          // If clicking off of the noteModal, the selectedCFI Must be removed
          store.dispatch(SetModalCFI({
            view: 0,
            selectedCFI: ""
          }))

        }

        // If text is current selected and the quickbar is visible
        if(QuickbarModalVisible && contents.window.getSelection().toString().length == 0){


          // Deselect the text
          renditionInstance.annotations.remove(selectedCFI, "highlight")

          // hide quickbarModal
          store.dispatch(HideQuickbarModal(0))
        }

        console.log("Contents remove all ranges")
        contents.window.getSelection().removeAllRanges();
      }else{
        
        const wrapper = renditionInstance?.manager?.container;
        console.log(renditionInstance)
        if (wrapper == undefined){
          console.error("Safely caught error. Wrapper Undefined")
          return
        }

        const third = wrapper.clientWidth / 3;
        // event.pageX is where the mouse was on the page
        // wrapper.scrollLeft is how far from the left the wrapper is
        const x = event.pageX - wrapper.scrollLeft;

        timer = setTimeout(()=>{

          if(!skipMouseEvent){

        
            // This will prevent a crash.
            // Found in f914e547, When clicking from TOC, app will crash.
            if(contents.window.getSelection() == null){
              console.log("Crash Prevented")
              timer = null
              return
            }
            // This will prevent case where text is quickly highlighted causing page to transition
            if (contents.window.getSelection().toString().length == 0) {
              if (x < third) {
                renditionInstance.prev()
              } else if (x > (third * 2)) {
                renditionInstance.next()    
              }else{
          
                store.dispatch(ToggleMenu(0))
                if(ThemeMenuActive){
                  store.dispatch(ToggleThemeMenu(0))
                }

              }
            }
          }else{
            store.dispatch(AllowMouseEvent(0))
          }
      
          // If mouse mouseup event at least once in this time period, but not double clicked (Would cancel timeout), we want to transition to the next page

          timer = null
          
        }, 250)

      }
    }

  });


  renditionInstance.on("selected", (cfiRange:any, contents:Contents)=>{

    // store.dispatch(SkipMouseEvent(0))
    renditionInstance.annotations.highlight(cfiRange, {}, (e:MouseEvent) => {
      console.log("Skip event id: 3")
      // store.dispatch(SkipMouseEvent(0))
    }, '', {fill:"#36454F"});
    


    // If the noteModal is open, meaning the selectedCFI is a real note, do not remove the highlight
    if(!NoteModalVisible){
      renditionInstance.annotations.remove(selectedCFI, "highlight")
    }


    const {x, y} = CalculateBoxPosition(
      renditionInstance,cfiRange,
      QUICKBAR_MODAL_WIDTH, 
      QUICKBAR_MODAL_HEIGHT
    )

    const invisiblenoteModal = CalculateBoxPosition(renditionInstance,cfiRange, NOTE_MODAL_WIDTH, NOTE_MODAL_HEIGHT)

  


    store.dispatch(MoveQuickbarModal({
      view: 0,
      x,
      y,
      visible: true
    }))

    store.dispatch(SetModalCFI({
      view: 0,
      selectedCFI: cfiRange
    }))

    store.dispatch(MoveNoteModal({
      view: 0,
      x: invisiblenoteModal.x,
      y: invisiblenoteModal.y,
      visible: false
    }))
        
  });
  

  const redrawAnnotations = () => renditionInstance.views().forEach((view:View) => view.pane ? view.pane.render() : null)
    
  renditionInstance.on('rendered', redrawAnnotations)



  return unsubscribe
}