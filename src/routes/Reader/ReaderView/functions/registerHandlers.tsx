import { AllowMouseEvent, HideNoteModal, HideQuickbarModal, MoveNoteModal, MoveQuickbarModal, SetDictionaryWord, SetLoadState, SetModalCFI, setProgrammaticProgressUpdate, SetProgress, ToggleMenu, ToggleThemeMenu } from "@store/slices/bookState";
import { LOADSTATE } from "@store/slices/constants";
import store from "@store/store";
import { invoke } from "@tauri-apps/api";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { Contents, EpubCFI, Rendition } from "epubjs";
import View from "epubjs/types/managers/view";
import { 
  CalculateBoxPosition, 
  NOTE_MODAL_HEIGHT, 
  NOTE_MODAL_WIDTH,
  QUICKBAR_MODAL_HEIGHT, 
  QUICKBAR_MODAL_WIDTH 
} from "./ModalUtility";

// import {bookStateStructure} from 'src/store/slices/EpubJSBackend/epubjsManager.d'

export default (renditionInstance:Rendition)=>{

  // const renditionInstance = initialState.bookState["0"].instance;
  let NoteModalVisible!:boolean;
  let QuickbarModalVisible!:boolean;
  let selectedCFI!:string;
  let ThemeMenuActive!:boolean;
  let skipMouseEvent!:boolean
  let fontName!:string
  let DictionaryWord!:string
  let isProgrammaticProgressUpdate!:boolean
  let loadState!:LOADSTATE

  let timer:any = null;

  let flexContainer:(HTMLElement | null | undefined) = null;

  // https://stackoverflow.com/questions/22266826/how-can-i-do-a-shallow-comparison-of-the-properties-of-two-objects-with-javascri
  const shallowCompareEqual = (obj1:any, obj2:any) =>
    Object.keys(obj1).length === Object.keys(obj2).length &&
  Object.keys(obj1).every(key => obj1[key] === obj2[key]);

  // type themeStateType = bookStateStructure["data"]["theme"]
  
  let oldThemeState = {};
  const unsubscribeRedux = store.subscribe(()=>{
    const newState = store.getState()
    NoteModalVisible = newState.bookState["0"]?.state.modals?.noteModal?.visible
    QuickbarModalVisible = newState.bookState["0"]?.state?.modals?.quickbarModal?.visible;
    selectedCFI = newState.bookState["0"]?.state?.modals?.selectedCFI;
    ThemeMenuActive = newState.bookState["0"]?.state?.themeMenuActive;
    skipMouseEvent = newState.bookState["0"]?.state?.skipMouseEvent
    DictionaryWord = newState.bookState["0"]?.state?.dictionaryWord
    fontName = newState.bookState["0"]?.data?.theme?.font
    isProgrammaticProgressUpdate = newState.bookState['0']?.state?.isProgrammaticProgressUpdate
    loadState = newState.bookState['0']?.loadState

    const theme = newState.bookState["0"]?.data?.theme
    if(theme && !shallowCompareEqual(theme, oldThemeState)){
      oldThemeState = newState.bookState["0"].data.theme
      redrawAnnotations()
    }
  })

  const unsubscribe = ()=>{
    unsubscribeRedux()
    flexContainer?.removeEventListener("click", flexClickHandler)
  }



  renditionInstance.on("dblclick", (event:any, contents:any) =>{
    console.log("Double click event")
    // If the mousedown timer has been set
    if (timer != null){
      // Clear the timer
      clearTimeout(timer)
      timer = null
    }
  })
  console.log("REGISTERING HANDLER FOR HANDLER")

  

  const clickHandler = (event:any) =>{
    
    // If the element clicked was the 'reader-flex' container,
    // then the epub iframe was not clicked (Margins were set and click landed outside of epubjs width)

    const whitespaceClicked = event.target.id == "reader-flex"

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

    // If the dictionary is open and the book is clicked, close the dictionary
    if(DictionaryWord){
      store.dispatch(SetDictionaryWord({view:0, word:""}))
      return
    }

    // Prevent the page from transitioning if we are unclicking a highlight
    //   console.log(contents.window.getSelection().toString(), contents.window.getSelection().toString().length)
    // if (contents.window.getSelection().toString().length !== 0) return;
      
    // If a single click, and the click timer is null




    if(event.detail == 1 && timer == null){
      // Helper functions courtesy of https://github.com/johnfactotum/epubjs-tips
      const getSelections = () => renditionInstance.getContents().map(contents => contents.window.getSelection())
      const clearSelection = () => getSelections().forEach(s => s.removeAllRanges())
        
      const getSelectedText = () => getSelections().reduce((acc, cur) => acc+cur, "")


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

        //If text is current selected and the quickbar is visible
        // Selected will trigger first. When text is selected, the quickbar will show
        // However, if this passes, then it will immediately unshow, without having the change to deselect (As it should)
        console.log("GETTING ALL SELECTIONS")


        if(QuickbarModalVisible && getSelectedText().length == 0){
          console.log("QUICKBAR CLICK ACTIVATED")
          console.log(renditionInstance.manager?.container)

          // Deselect the text
          renditionInstance.annotations.remove(selectedCFI, "highlight")

          // hide quickbarModal
          store.dispatch(HideQuickbarModal(0))
        }

        console.log("Contents remove all ranges")
        clearSelection()
      }else{
        
        const wrapper = renditionInstance?.manager?.container;
        console.log(renditionInstance)
        if (wrapper == undefined){
          console.error("Safely caught error. Wrapper Undefined")
          return
        }

        let totalMargins = 0
        let third = 0
        let x = 0

        // If the epubjs iframe was clicked
        if(!whitespaceClicked){
        // Here, the X is how far away from the left side of the screen the wrapper is.
        // This will be affected by the reader margins in settings.
          totalMargins = (wrapper.getBoundingClientRect().x * 2)

          third = (wrapper.clientWidth + totalMargins) / 3;
          // event.pageX is where the mouse was on the page
          // wrapper.scrollLeft is how far from the left the wrapper is
          // wrapper here refers to the css epub.js uses to hide loaded, but not visible pages.
          x = (event.pageX + totalMargins/2) - wrapper.scrollLeft;
        }else{
          third = event.target.getBoundingClientRect().width / 3
          x = event.pageX
        }



        timer = setTimeout(()=>{

          if(!skipMouseEvent){

        
            // This will prevent a crash.
            // Found in f914e547, When clicking from TOC, app will crash.
            if(getSelectedText() == null){
              console.log("Crash Prevented")
              timer = null
              return
            }
            // This will prevent case where text is quickly highlighted causing page to transition
            if (getSelectedText().length == 0) {
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

  }
  renditionInstance.on("click", clickHandler);




  renditionInstance.on("selected", (cfiRange:any, contents:Contents)=>{
    console.log("SELECTED ACTIVATED")
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

  const flexClickHandler = (e)=>{
    if(e.target == flexContainer){
      clickHandler(e)
    }
  }
  renditionInstance.on("attached",()=>{
    flexContainer = renditionInstance.manager?.container.parentElement?.parentElement
    if(flexContainer != null){
      flexContainer.addEventListener("click", flexClickHandler)
    }


      
  })

  // Handle case where epubJS dispatches it's own event (Like if the user scrolled onto a new page)
  const pageTurnHandler = (e:any)=>{
    if(loadState != LOADSTATE.COMPLETE) return
    if(isProgrammaticProgressUpdate){
      store.dispatch(setProgrammaticProgressUpdate({view:0, state:false}))
      return
    }
    // On the event from epubjs, set the epubNavigate to true
    // This will cancel out a loop of the epub reader changing
    store.dispatch(setProgrammaticProgressUpdate({view:0, state:true}))

    // This may be preventing a race condition with setEpubNavigate
    setTimeout(()=>{
      store.dispatch(SetProgress({view: 0, cfi: e.start,  progress: renditionInstance.book.locations.percentageFromCfi(e.start)}))
    }, 1)
  }


  renditionInstance.on("locationChanged", pageTurnHandler)


  renditionInstance.on("started", ()=>{
    console.log("Book started")
  })

  // renditionInstance.on("displayed", ()=>{

  // })


  return unsubscribe
}

