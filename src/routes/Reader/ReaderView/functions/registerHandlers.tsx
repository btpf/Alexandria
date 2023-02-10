import { AllowMouseEvent, HideNoteModal, HideQuickbarModal, MoveNoteModal, MoveQuickbarModal, SetModalCFI, SkipMouseEvent, ToggleMenu, ToggleThemeMenu } from "@store/slices/bookStateSlice";
import store from "@store/store";
import { Contents, Rendition } from "epubjs-myh";
import CalculateBoxPosition from "./CalculateBoxPosition";
import { quickbarModalHeight, quickbarModalWidth } from "./ModalUtility";


export default (renditionInstance:Rendition)=>{

  // const renditionInstance = initialState.bookState["0"].instance;
  let NoteModalVisible!:boolean;
  let QuickbarModalVisible!:boolean;
  let selectedCFI!:string;
  let ThemeMenuActive!:boolean;
  let skipMouseEvent!:boolean

  let timer:any = null;

  
  const unsubscribe = store.subscribe(()=>{
    NoteModalVisible = store.getState().bookState["0"].state.modals.noteModal.visible
    QuickbarModalVisible = store.getState().bookState["0"].state.modals.quickbarModal.visible;
    selectedCFI = store.getState().bookState["0"].state.modals.selectedCFI;
    ThemeMenuActive = store.getState().bookState["0"].state.themeMenuActive;
    skipMouseEvent = store.getState().bookState["0"].state.skipMouseEvent
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

    const selection = contents.window.getSelection()

    if (!selection){
      console.log("selection in DialogPopup is null")
      return null
    }
    const getRange = selection.getRangeAt(0).getBoundingClientRect();

    const {x, y} = CalculateBoxPosition(
      renditionInstance?.manager?.container?.getBoundingClientRect(),getRange,
      quickbarModalWidth, 
      quickbarModalHeight
    )

      
    const invisiblenoteModal = CalculateBoxPosition(renditionInstance?.manager?.container?.getBoundingClientRect(),getRange, 300, 250)

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

  return unsubscribe
}