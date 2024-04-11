import { HideNoteModal, HideQuickbarModal, MoveNoteModal, MoveQuickbarModal, SelectSidebarMenu, SetDictionaryWord, SetModalCFI, SetSelectedRendition, ToggleMenu, ToggleThemeMenu } from "@store/slices/appState";
import { AllowMouseEvent, setProgrammaticProgressUpdate, SetProgress, SkipMouseEvent, ToggleBookmark } from "@store/slices/bookState";
import { LOADSTATE } from "@store/slices/constants";
import { bookStateStructure } from "@store/slices/EpubJSBackend/epubjsManager.d";
import store from "@store/store";
import { Contents, EpubCFI, Rendition } from '@btpf/epubjs';
import View from "epubjs/types/managers/view";
import { 
  CalculateBoxPosition, 
  NOTE_MODAL_HEIGHT, 
  NOTE_MODAL_WIDTH,
  QUICKBAR_MODAL_HEIGHT, 
  QUICKBAR_MODAL_WIDTH 
} from "./ModalUtility";
import { handleLinkClick } from "@shared/scripts/handleLinkClick";

// import {bookStateStructure} from 'src/store/slices/EpubJSBackend/epubjsManager.d'

export default (renditionInstance:Rendition, view:number)=>{

  // const renditionInstance = initialState.bookState["0"].instance;
  let NoteModalVisible!:boolean;
  let QuickbarModalVisible!:boolean;
  let selectedCFI!:string;
  let ThemeMenuActive!:boolean;
  let menuActive!:boolean;
  let skipMouseEvent!:boolean
  let fontName!:string
  let DictionaryWord!:string
  let isProgrammaticProgressUpdate!:boolean
  let loadState!:LOADSTATE
  let selectedRendition!:number
  let isDualReaderMode!:boolean
  let footnoteActive!:boolean
  let lineHeight!:number
  let fontSize!:number

  let timer:any = null;

  let backgroundElement:(Element | null | undefined) = null;

  let sidebarOpen!: boolean|string;

  let viewMode!: string;


  let oldThemeState = {};
  let oldHighlightsLength = 0
  const unsubscribeRedux = store.subscribe(()=>{
    const newState = store.getState()
    const bookState:bookStateStructure = newState.bookState[view]

    NoteModalVisible = newState.appState.state.modals?.noteModal?.visible
    // QuickbarModalVisible = newState.bookState[view]?.state?.modals?.quickbarModal?.visible;
    QuickbarModalVisible = newState?.appState?.state?.modals?.quickbarModal?.visible
    selectedCFI = newState.appState.state?.modals?.selectedCFI;
    ThemeMenuActive = newState.appState.state?.themeMenuActive;
    menuActive = newState.appState.state.menuToggled
    skipMouseEvent = bookState?.state?.skipMouseEvent
    DictionaryWord = newState.appState.state?.dictionaryWord
    fontName = bookState?.data?.theme?.font
    isProgrammaticProgressUpdate = bookState?.state?.isProgrammaticProgressUpdate
    loadState = bookState?.loadState
    sidebarOpen = newState?.appState?.state?.sidebarMenuSelected
    viewMode = bookState?.data?.theme?.renderMode
    footnoteActive = newState.appState.state.footnote.active

    lineHeight = bookState?.data?.theme?.lineHeight
    fontSize = bookState?.data?.theme?.fontSize


    if(selectedRendition != newState.appState.state.selectedRendition && QuickbarModalVisible){
      // If anything is highlighted, remove it.
      // This handles the case when changing to another rendition while something is highlighted
      // in dual reader mode.
      // Text must be unhighlighted before the rendition switches
      renditionInstance.annotations.remove(selectedCFI, "highlight")
    }
    selectedRendition = newState.appState.state.selectedRendition
    isDualReaderMode = newState.appState.state.dualReaderMode

    const theme = newState.bookState[view]?.data?.theme
    if(theme && JSON.stringify(theme) !== JSON.stringify(oldThemeState)){
      oldThemeState = newState.bookState[view].data.theme

      // Timeout to allow epubjs rerender first
      setTimeout(()=>[
        redrawAnnotations()

      ],1)

      return
    }

    // Correct annotation height when a new annotation is created
    const newHighlightLength = Object.keys(bookState.data?.highlights || []).length
    if(oldHighlightsLength < newHighlightLength) correctHighlightHeight()
    oldHighlightsLength = newHighlightLength


  })

  const scrollEventsHandler = (event) =>{
    // Prevent flipping pages when scrolling on valid elements
    if(sidebarOpen || ThemeMenuActive || NoteModalVisible || DictionaryWord || (viewMode == "continuous") || footnoteActive) return

    if(selectedRendition != view) return

    
    if(checkScrollDirectionIsUp(event)){
      renditionInstance.prev()
    }else{
      renditionInstance.next()
    }
  }
  function checkScrollDirectionIsUp(event) {
    if (event.wheelDelta) {
      return event.wheelDelta > 0;
    }
    return event.deltaY < 0;
  }
  
  

  const keyboardEventsHandler = (event) =>{
    if(view != selectedRendition) return

    if(NoteModalVisible){
      if(event.keyCode == 27){
        store.dispatch(HideNoteModal())
      }
      
      return
    }

    if (event.keyCode == 40 || event.keyCode == 39) {
      renditionInstance.next()
    }
    if (event.keyCode == 37 || event.keyCode == 38) {
      renditionInstance.prev()
    }
    if(event.ctrlKey && event.keyCode == 66){
      if(!menuActive){
        store.dispatch(ToggleMenu())
      }
      if(sidebarOpen != "Bookmarks"){
        store.dispatch(SelectSidebarMenu("Bookmarks"))
      }else{
        store.dispatch(ToggleBookmark({view:selectedRendition, bookmarkLocation:renditionInstance.location.end.cfi}))
      }
       
    }
    if(event.keyCode === 114 || (event.ctrlKey && event.keyCode === 70)){
      // This will prevent the native browser searchbar from showing when
      // the user presses ctrl + f
      event.preventDefault();
      event.stopPropagation()
      
      if(sidebarOpen){
        if(sidebarOpen == "Search"){
          store.dispatch(SelectSidebarMenu(false))
        }else{
          store.dispatch(SelectSidebarMenu("Search"))
        }
      }else{
        store.dispatch(SelectSidebarMenu("Search"))
      }
    }
  }

  const unsubscribe = ()=>{
    unsubscribeRedux()
    backgroundElement?.removeEventListener("click", clickHandler)
    window.removeEventListener("keydown", keyboardEventsHandler)
    window.removeEventListener("wheel", scrollEventsHandler);
    renditionInstance.off("keydown", keyboardEventsHandler)
    renditionInstance.off("dblclick", doubleClickHandler)
    renditionInstance.off("click", clickHandler);
    renditionInstance.off("selected", selectionHandler);
    renditionInstance.off('rendered', redrawAnnotations)
    renditionInstance.off("attached", renditionAttachmentHandler)
    renditionInstance.off("locationChanged", pageTurnHandler)
  }


  const doubleClickHandler = (event:any, contents:any) =>{
    console.log("Double click event")
    // If the mousedown timer has been set
    if (timer != null){
    // Clear the timer
      clearTimeout(timer)
      timer = null
    }
  }

  console.log("REGISTERING HANDLER FOR HANDLER")

  
  // Helper functions courtesy of https://github.com/johnfactotum/epubjs-tips
  const getSelections = () => renditionInstance.getContents().map(contents => contents.window.getSelection())
  const clearSelection = () => getSelections().forEach(s => s.removeAllRanges())
        
  const getSelectedText = () => getSelections().reduce((acc, cur) => acc+cur, "")
      
  const clickHandler = (event:any) =>{

    // If the element clicked was the 'reader-background' container,
    // then the epub iframe was not clicked (Margins were set and click landed outside of epubjs width)
    const whitespaceClicked = event.target.id == "reader-background"

    
    if(view != selectedRendition && !whitespaceClicked){
      store.dispatch(SetSelectedRendition(view))
      return
    }



    // If a triple click, prevent it from going through (As this is a useless feature)
    if (event.detail > 2){
      event.preventDefault()
      return
    }
      
    try {
    // Handle case where an <a> tag is clicked
      const target = event.target as HTMLAnchorElement;
      const parentNode = target?.parentNode as HTMLAnchorElement
      if (target?.tagName?.toLowerCase() == "a" && target?.href) return;
      if (parentNode?.tagName.toLowerCase() == "a" && parentNode.href || null) return;
      // eslint-disable-next-line no-empty
    } catch {}

    // If the dictionary is open and the book is clicked, close the dictionary
    if(DictionaryWord){
      store.dispatch(SetDictionaryWord(""))
      return
    }

    // Prevent the page from transitioning if we are unclicking a highlight
    //   console.log(contents.window.getSelection().toString(), contents.window.getSelection().toString().length)
    // if (contents.window.getSelection().toString().length !== 0) return;
      
    // If a single click, and the click timer is null




    if(event.detail == 1 && timer == null){



      if(NoteModalVisible || QuickbarModalVisible){
        // If the note popup is visible
        if(NoteModalVisible){
          store.dispatch(HideNoteModal())


          // If clicking off of the noteModal, the selectedCFI Must be removed
          store.dispatch(SetModalCFI(
            ""
          ))

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
          store.dispatch(HideQuickbarModal())
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
          const parentElement = wrapper.parentElement
          if(!parentElement) return
          // This code will handle the case where the user is using a dual reader
          // In which case, the x will be offset. For the first view, 0
          // for the second view, it will be 50% of the width. So this x
          // Should be the pixels = 50%
          const dualReaderOffset = wrapper.parentElement.getBoundingClientRect().x
          // Here, the X is how far away from the left side of the screen the wrapper is.
          // This will be affected by the reader margins in settings.
          // Since our margins are calculated by how far from the left side of the screen
          // our wrapper is, our total margins calculation must deduct how far it is offset
          // due to being in a dual reader mode
          totalMargins = ((wrapper.getBoundingClientRect().x - dualReaderOffset) * 2)

          third = (wrapper.clientWidth + totalMargins) / 3;
          
          
          // Edge case where theres more than one iframe displaying the book
          // This happens when reading CBZ files
          const readerViews = renditionInstance.views()
          let currentIframeOffset = 0
          if(readerViews.length > 1){
            let correctView = null
            // List out all of the iframe views in the current rendition
            for(const view of readerViews._views){
              // If this iframe view's document is equal to the target document
              if(view.window.document == event.target.ownerDocument){
                correctView = view
                break
              }
            }
            // Get the element of corresponding IframeView, and calculate how far from the left it is 
            currentIframeOffset = correctView.element.getBoundingClientRect().x

            // Subtract the totalMargins section since we should cancel them out
            // in the case where we are using iframe based calculations
            // We subtract the amount of space offset to cancel out readermargins
            currentIframeOffset -= wrapper.getBoundingClientRect().x
          }
          
          
          // event.pageX is where the mouse was on the iframe page
          // wrapper.scrollLeft is how far from the left the wrapper is
          // wrapper here refers to the css epub.js uses to hide loaded, but not visible pages.
          x = currentIframeOffset + (event.pageX + totalMargins/2) - wrapper.scrollLeft ;
        }else{
          console.log("Handling whitespace logic")
          // get the width of the background whitespace element
          let whitespaceWidth = event.target.getBoundingClientRect().width
          // Get the position of the click
          x = event.pageX
          // If dual reader mode is true, divide the whitespace width by 2
          if(isDualReaderMode){
            whitespaceWidth /= 2
            
            // If x is in the left half of the screen
            if(x <= whitespaceWidth){
              // since this evenhandler is added twice for the left and right renditions
              // cancel the one which is not the click handled by this handler.

              // In this case, we will stop the event logic if we are on the left side of the screen
              // and the handler is for the right side rendition
              if(view == 1){
                return
              }
            }else{

              if(view == 0){
                return
              }

              // if we are on the rightside, then we will make our x -= whitespaceWidth
              // Since this logic will be used to see if we clicked on the left or right half
              // of the right side

              x-= whitespaceWidth
            }
          }

          third = whitespaceWidth / 3


          
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
                console.log("left")
                renditionInstance.prev().then(()=>{
                  console.log("Prev done")
                })
              } else if (x > (third * 2)) {
                console.log("right")
                renditionInstance.next()    
              }else{
                console.log("middle")
                store.dispatch(ToggleMenu())
                if(ThemeMenuActive){
                  store.dispatch(ToggleThemeMenu())
                }

              }
            }
          }else{
            store.dispatch(AllowMouseEvent(view))
          }
      
          // If mouse mouseup event at least once in this time period, but not double clicked (Would cancel timeout), we want to transition to the next page

          timer = null
          
        }, 250)

      }
    }
    clearSelection()

  }



  const selectionHandler = (cfiRange:any, contents:Contents)=>{

    // This code will check whether or not there are any img inside of the cfi range.
    // We prevent this because the underlying library will crash in the event that an image is selected
    const clonedContents = renditionInstance?.getRange(cfiRange)?.cloneContents()
    if(!clonedContents || clonedContents.querySelectorAll("img").length > 0){
      clearSelection()
      store.dispatch(SkipMouseEvent(view))
      return
    }
   
    try {
      renditionInstance.annotations.highlight(cfiRange, {}, (e:MouseEvent) => {
        console.log("Skip event id: 3")
        
        // store.dispatch(SkipMouseEvent(0))
      }, '', {fill:"#36454F"});
    } catch (error) {
      console.log("Error Caught: Image Selected")
      return
    }

    


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
      x,
      y,
      visible: true
    }))
    store.dispatch(SetModalCFI(
      cfiRange
    ))

    store.dispatch(MoveNoteModal({
      x: invisiblenoteModal.x,
      y: invisiblenoteModal.y,
      visible: false
    }))
        
  }


  const redrawAnnotations = () => {
    // This will reposition the annotations
    renditionInstance.views().forEach((view:View) => view.pane ? view.pane.render() : null)
  

    correctHighlightHeight()

  }
    
  const correctHighlightHeight = ()=>{
    // This will correct the heights of the annotations
    const AnnotationKeys = Object.keys(renditionInstance.annotations._annotations)

    for (const annotationKey of AnnotationKeys){
      // For each of the annotations in the book
      const annotation = renditionInstance.annotations._annotations[annotationKey]

      // If the mark is currently rendered
      const mark = annotation.mark
      if(!mark) continue

      // Get the container element of the highlights
      const containerHighlight = mark.element
      if(!containerHighlight) continue

      // Get the the highlight for each line
      const highlightLines = containerHighlight.childNodes

      for (const highlightLine of highlightLines){
        // Recalculate the highlight size
        // https://stackoverflow.com/a/47327417
        const baseFontSize = 16;

        const calculatedLineHeight = (lineHeight/100) * (fontSize/100) * baseFontSize
        highlightLine.style.height = calculatedLineHeight
      }



    }
  }


  // Handle case where epubJS dispatches it's own event (Like if the user scrolled onto a new page)
  const pageTurnHandler = (e:any)=>{
    if(loadState != LOADSTATE.COMPLETE) return
    if(isProgrammaticProgressUpdate){
      store.dispatch(setProgrammaticProgressUpdate({view:view, state:false}))
      return
    }
    // On the event from epubjs, set the epubNavigate to true
    // This will cancel out a loop of the epub reader changing
    store.dispatch(setProgrammaticProgressUpdate({view:view, state:true}))

    // This may be preventing a race condition with setEpubNavigate
    setTimeout(()=>{
      store.dispatch(SetProgress({view: view, cfi: e.start,  progress: renditionInstance.book.locations.percentageFromCfi(e.start, e.index)}))
    }, 1)
  }


  


  renditionInstance.on("started", ()=>{
    console.log("Book started")
  })

  // Each time a new section/chapter is opened (Which employs the scroll trick), this hook will run.
  renditionInstance.hooks.content.register((contents, /*view*/) => {
    //   // Adding windows tablet support
    let prevSelection:string;

    // We will override the window.oncontextmenu to prevent memory leaks
    contents.window.oncontextmenu = ((event:PointerEvent) => {

      // very first thing we do is prevent the event since this will allow submenus to appear
      // (Though the main mini-menu will still appear no matter what on windows)
      event.preventDefault();
      event.stopPropagation();
  
      const cfiBase = contents.cfiBase
      const contentsWindow = contents.window
  
      // We are now using the code from contents.js from epub.js to fit the arguemnts of the selectionHandler
  
      // We will add this functionality. On a windows surface, this represents
      // when the edge mini-menu is closed using the three dots. Not the best,
      // but the best that can be done it seems

      // PointerID 1 is reserved for when the menu closes it seems. Lets use this.
      if(event.pointerId != 1){
        return
      }
  
      const selection = contentsWindow.getSelection();
      // Prevents case where text is still selected from before and one clicks on the text
      if(selection.toString() == prevSelection || selection.toString() == '') return
      prevSelection = selection.toString()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if(!range.collapsed) {
          // cfirange = this.section.cfiFromRange(range);
          const cfirange = new EpubCFI(range, cfiBase).toString();
          selectionHandler(cfirange, contentsWindow)
        }
      }
      return false;
    });



    const links = contents.document.querySelectorAll('a:link')
    // const links = []
    Array.from(links).forEach(link => link.addEventListener('click', async e => {
      e.stopPropagation()
      e.preventDefault()


      // console.log("CKLDSFS", contents.sectionIndex)
      // console.log(renditionInstance.book.spine.spineItems)
      const href = link.getAttribute('href')
      handleLinkClick(renditionInstance, href)
      // const resolveURL = (url, relativeTo) => {
      //   // HACK-ish: abuse the URL API a little to resolve the path
      //   // the base needs to be a valid URL, or it will throw a TypeError,
      //   // so we just set a random base URI and remove it later
      //   const base = 'https://example.invalid/'
      //   return new URL(url, base + relativeTo).href.replace(base, '')
      // }
      // console.log(contents.sectionIndex, renditionInstance.location.start.index)
      // console.log(href, resolveURL(href,
      //   // From contents.sectionIndex -> id
      //   renditionInstance.book.spine.spineItems[contents.sectionIndex].href))



      
    }, true))


    // https://stackoverflow.com/a/60516136
    // This fixes a bug where if custom fonts are injected using
    // @font-face, the annotation calculations are performed on the default font
    // and are offset. This redraws once all fonts finish loading.
    contents.document.fonts.onloadingdone = () =>{
      redrawAnnotations()
    }

  })

  const renditionAttachmentHandler = ()=>{
    backgroundElement = window.document.getElementById("reader-background")
    if(backgroundElement){
      // Simply remove the click listener, which will fix issue in case of 
      // backgroundElement.removeEventListener("click", clickHandler)
      console.log("Background element found")
      backgroundElement.addEventListener("click", clickHandler)
    }else{
      console.log("Error: Background container not found")
    }
    
      
  }
  
  
  renditionInstance.on("attached", renditionAttachmentHandler)
  renditionInstance.on("locationChanged", pageTurnHandler)
  renditionInstance.on("keydown", keyboardEventsHandler)
  renditionInstance.on("dblclick", doubleClickHandler)
  renditionInstance.on("click", clickHandler);
  renditionInstance.on("selected", selectionHandler);
  renditionInstance.on('rendered', redrawAnnotations)
  window.addEventListener('keydown', keyboardEventsHandler)
  window.addEventListener("wheel", scrollEventsHandler);


  // renditionInstance.on("displayed", ()=>{

  // })


  return unsubscribe
}

