import React, { createRef, ReactPropTypes, RefObject, useEffect, useRef, useState } from 'react'; // we need this to make JSX compile
import styles from './ReaderView.module.scss'
import epubjs, { Book, Rendition } from 'epubjs'
import bookImport from '@resources/placeholder/childrens-literature.epub'

import {
  Location,
  NavigateFunction,
  Params,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { convertFileSrc, invoke } from '@tauri-apps/api/tauri';


import { connect, ConnectedProps } from 'react-redux'



import store, {RootState} from '@store/store'
import {RemoveRendition, ToggleMenu, SetLoadState, ToggleThemeMenu, SyncedAddRendition} from '@store/slices/bookState'
import registerHandlers from './functions/registerHandlers';
import { Unsubscribe } from '@reduxjs/toolkit';
import QuickbarModal from './functions/QuickbarModal';
import NoteModal from './functions/NoteModal';
import { LOADSTATE } from '@store/slices/constants';
const mapState = (state: RootState) => {
  if(Object.keys(state.bookState).includes("0")){
    return {
      LoadState: state.bookState[0].loadState,
      UIBackgroundColor: state.bookState[0].data.theme.backgroundColor,
      ThemeMenuActive: state.bookState[0].state.themeMenuActive,
      renderMode:state.bookState[0]?.data.theme.renderMode,
      readerMargins: state.bookState[0]?.data.theme.readerMargins
    }
    
  }else{
    return {LoadState: LOADSTATE.LOADING}
  }

}

const connector = connect(mapState, {ToggleMenu, SetLoadState, RemoveRendition, ToggleThemeMenu, SyncedAddRendition})

type PropsFromRedux = ConnectedProps<typeof connector>


type ReaderProps = PropsFromRedux & {
  router:{
    location: Location
    navigate: NavigateFunction 
    params: Readonly<Params<string>>
  }

}

// https://stackoverflow.com/questions/59072200/useselector-destructuring-vs-multiple-calls

class Reader extends React.Component<ReaderProps>{
  private renderWindow = createRef<HTMLDivElement>()
  private book!:Book;
  private rendition!: Rendition;
  private UID!:string;

  private unsubscribeHandlers!:Unsubscribe;

  constructor(props:ReaderProps){
    super(props)

    // This is used to ensure that in the case multiple renditions are on the page, there will not be conflicts
    this.UID = Math.random().toString()
  }

  async componentDidMount(){
    console.log("DID MOUNT")
    type bookData = string | ArrayBuffer
    let bookUrl: bookData = ""

    const {params} = this.props.router
    if(window.__TAURI__ && params.bookHash){
      const bookBytes:ArrayBuffer = await invoke("get_book_by_hash",{bookHash: params.bookHash})
      // bookUrl = convertFileSrc(bookUrl);
      bookUrl = new Uint8Array(bookBytes).buffer
      // console.log("BOOK URL LOADED", bookUrl)
    }else{
      bookUrl = bookImport
    }

    const book = epubjs((bookUrl as any))




    this.rendition = book.renderTo(this.renderWindow.current?.id || "", 
      {
        width: "100%", 
        height: "100%",
        spread: "always",
        allowScriptedContent: true
        // manager: "continuous",
        // flow: "scrolled",
      });
    this.rendition.themes.default({
      body: { "padding-top": "10px !important" },
    })

    console.log(book)


    
    this.rendition.book.loaded.spine.then(async (x)=>{
      this.props.SyncedAddRendition({instance:this.rendition, UID:0, hash: params.bookHash || "hashPlaceholder", title: this.rendition?.book?.packaging?.metadata?.title })
    



      // AddHighlight


      // this.props.populateRendition({UID:0, data})
    
    })

    book.ready.then(async ()=>{

      // This code will handle the edge case where a book is still loading but the user leaves the page, unmounting the component.
      // We use the standard subscribe here since react-redux will not pass the state updates once unmounted.
      let cancel_Load = false
      const unsubscribe = store.subscribe(()=>{
        const load_state = store.getState().bookState["0"].loadState
        if(load_state == LOADSTATE.CANCELED){
          cancel_Load = true
          // unsubscribe immediately
          unsubscribe()
          // unsubscribe from registerHandlers.tsx
          this.unsubscribeHandlers()
          // Remove rendition from state immediately to prevent duplicate removals
          this.props.RemoveRendition(0)
        }
      })
      await book.locations.generate(1000)
      unsubscribe()

      // This will destroy the rendition only once the generations have been generated.
      // This prevents the application from crashing
      if(cancel_Load){
        this.rendition.destroy();
        return
      }
      
      // This is needed because it can cause the first page of the book to be skipped when opening
      // Since cfiFromPercentage is not always accurate.
      if(store.getState().bookState["0"].data.progress != 0){
        this.rendition.display(this.rendition.book.locations.cfiFromPercentage(store.getState().bookState["0"].data.progress))
      }

      // This is also found in the epubjsManager
      // If loading the data has finished, when we reach this state, the book parsing is complete
      // So set the overall state to complete
      // This allows us to ensure the app is completely loaded before moving forward.
      switch (store.getState().bookState["0"].loadState) {
      case LOADSTATE.DATA_PARSING_COMPLETE:
        this.props.SetLoadState({view:0, state:LOADSTATE.COMPLETE})
        break;
      case LOADSTATE.LOADING:
        this.props.SetLoadState({view:0, state:LOADSTATE.BOOK_PARSING_COMPLETE})
        break;
      }
      

      
    })
 


      
    // .then(
    //   (value) => {
    //     console.log(value); // Success!
    //   },
    //   (reason) => {
    //     console.error(reason); // Error!
    //   },


      

    
    
    
    // let readerInstanceVariables = require('./ReaderViewTypes.ts').readerInstanceVariables

    this.rendition.on("started", ()=>{
      console.log("Book started")
    })

    this.unsubscribeHandlers = registerHandlers(this.rendition)


      
    const displayed = this.rendition.display();
  }


  render(): React.ReactNode {
    return(
      <>
      
        <div style={{backgroundColor:this.props.UIBackgroundColor, width: `${this.props.readerMargins}%`, marginLeft:"auto", marginRight:"auto"}} className={styles.epubContainer} id={"BookArea" + this.UID} ref={this.renderWindow}/>
        {/* <DialogPopup resetMouse={()=>this.instanceVariables.mouseUp = false}/> */}
        <QuickbarModal/>
        <NoteModal/>
      </>
    )
  }


  componentWillUnmount(){
    console.log("UNMOUNTING")
    // This handles the edgecase where the locations are loading, but the user exits the page.
    if(this.props.LoadState == LOADSTATE.LOADING){
      this.props.SetLoadState({view: 0, state:LOADSTATE.CANCELED})
      return
    }
    this.unsubscribeHandlers();

    this.props.RemoveRendition(0)
    this.rendition.destroy();
  }


  componentDidUpdate(prevProps: any, prevState: any) {
    if(this.props.renderMode != prevProps.renderMode){
      if(this.props.renderMode == "continuous"){
        const bookInstance = this.rendition.book
        this.rendition.destroy();
        this.unsubscribeHandlers()
        this.props.RemoveRendition(0)


        // Time to re-create the rendition
        this.rendition = bookInstance.renderTo(this.renderWindow.current?.id || "", 
          {
            width: "95%", 
            height: "100%",
            spread: "always",
            manager: "continuous",
            flow: "scrolled",
          });
        this.rendition.themes.default({
          body: { "padding-top": "10px !important" },
        })
        const {params} = this.props.router
        this.props.SyncedAddRendition({instance:this.rendition, UID:0, hash: params.bookHash || "hashPlaceholder", title: this.rendition?.book?.packaging?.metadata?.title })
        
        this.unsubscribeHandlers = registerHandlers(this.rendition)
        this.rendition.display();
      }
    }
    if(this.props.readerMargins != prevProps.readerMargins){
      // This will be undefined on the first load.
      // Undefined -> Initial default value -> Value from data
      if(prevProps.readerMargins && this.rendition && this.rendition.currentLocation){
        let currentLocation = 0;

        // // Logic if using [epubjs-myh](MrMYHuang/epub.js)
        // if(this.props.readerMargins < prevProps.readerMargins){
        //   // @ts-expect-error currentLocation has missing typescript definitions
        //   currentLocation = this.rendition.currentLocation().start.cfi
        // }else{
        //   // @ts-expect-error currentLocation has missing typescript definitions
        //   currentLocation = this.rendition.currentLocation().end.cfi
        // }

        // Logic if using epub-js
        currentLocation = this.rendition.currentLocation().end.cfi


        // This will update the injected iframe styles to reflect the new properties of the stage helper
        // This will adjust the formatting of all text, but will not update
        // the side scrolling css trick that is used by epubjs
        // @ts-expect-error updateLayout has no typescript definition
        this.rendition.manager.updateLayout();
        
        // Not needed if using [epubjs-myh](MrMYHuang/epub.js)
        // Removing this clear eliminates the flicker. So using this fork may be better.
        this.rendition.clear()
        // This will 'scroll' to the correct location
        this.rendition.display(currentLocation)
        //   newState.bookState["0"].instance.clear()
        // 
      }
    }
  }

}

// https://stackoverflow.com/questions/66277647/how-to-use-redux-toolkit-createslice-with-react-class-components




function withRouter(Component: React.ComponentClass<ReaderProps>) {
  function ComponentWithRouterProp(props: any) {
    const location: Location = useLocation();
    const navigate: NavigateFunction = useNavigate();
    const params: Readonly<Params<string>> = useParams();
    return (
      <Component
        {...props}
        router={{ location, navigate, params }}
      />


    );
  }

  return ComponentWithRouterProp;
}

export default connector( withRouter(Reader))

