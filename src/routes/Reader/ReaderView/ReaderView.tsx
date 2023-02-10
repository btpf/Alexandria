import React, { createRef, ReactPropTypes, RefObject, useEffect, useRef, useState } from 'react'; // we need this to make JSX compile
import styles from './ReaderView.module.scss'
import epubjs, { Book, Rendition } from 'epubjs-myh'
import bookImport from '@resources/placeholder/childrens-literature.epub'
import redrawAnnotations from './functions/redrawAnnotations';

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
import {AddRendition, RemoveRendition, ToggleMenu, SetLoadState, LOADSTATE, ToggleThemeMenu, SyncedAddRendition} from '@store/slices/bookStateSlice'
import registerHandlers from './functions/registerHandlers';
import { Unsubscribe } from '@reduxjs/toolkit';
import QuickbarModal from './functions/QuickbarModal';
import NoteModal from './functions/NoteModal';
const mapState = (state: RootState) => {
  if(Object.keys(state.bookState).includes("0")){
    return {
      LoadState: state.bookState[0].loadState,
      UIBackgroundColor: state.bookState[0].data.theme.backgroundColor,
      ThemeMenuActive: state.bookState[0].state.themeMenuActive
    }
    
  }else{
    return {LoadState: LOADSTATE.LOADING}
  }

}

const connector = connect(mapState, {AddRendition, ToggleMenu, SetLoadState, RemoveRendition, ToggleThemeMenu, SyncedAddRendition})

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
        spread: "always"
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
      
      this.rendition.display(this.rendition.book.locations.cfiFromPercentage(store.getState().bookState["0"].data.progress))
      this.props.SetLoadState({view:0, state:LOADSTATE.COMPLETE})
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

    redrawAnnotations(this.rendition)


      
    const displayed = this.rendition.display();
  }

  componentWillUnmount(){
    // This handles the edgecase where the locations are loading, but the user exits the page.
    if(this.props.LoadState == LOADSTATE.LOADING){
      console.log("LOADSTATE SET")
      this.props.SetLoadState({view: 0, state:LOADSTATE.CANCELED})
      return
    }

    console.log("Rendition removed as normal!!!!!!!", this.props.LoadState)
    this.unsubscribeHandlers();

    this.props.RemoveRendition(0)
    this.rendition.destroy();
  }
  render(): React.ReactNode {
    return(
      <>
      
        <div style={{backgroundColor:this.props.UIBackgroundColor}} className={styles.epubContainer} id={"BookArea" + this.UID} ref={this.renderWindow}/>
        {/* <DialogPopup resetMouse={()=>this.instanceVariables.mouseUp = false}/> */}
        <QuickbarModal/>
        <NoteModal/>
      </>
    )
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

