import React, { createRef, ReactPropTypes, RefObject, useEffect, useRef, useState } from 'react'; // we need this to make JSX compile
import styles from './ReaderView.module.scss'
import epubjs, { Book, Rendition } from 'epubjs'
// import bookImport from '@resources/placeholder/childrens-literature.epub'

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

import { platform } from '@tauri-apps/api/os';

import store, {RootState} from '@store/store'
import {RemoveRendition, SetLoadState, SyncedAddRendition} from '@store/slices/bookState'
import registerHandlers from './functions/registerHandlers';
import { Unsubscribe } from '@reduxjs/toolkit';
import QuickbarModal from './functions/QuickbarModal';
import NoteModal from './functions/NoteModal';
import { LOADSTATE } from '@store/slices/constants';
import { SyncedAddRenditionPayload } from '@store/slices/EpubJSBackend/epubjsManager';
import { setThemeThunk } from '@store/slices/EpubJSBackend/data/theme/themeManager';
import { bookStateHydrationStructure } from '@store/slices/EpubJSBackend/epubjsManager.d';
import { ToggleMenu } from '@store/slices/appState';
import Epub from 'epubjs';
import parser from './Parser/parser';


const mapState = (state: RootState, ownProps:inheritedProps) => {
  if(Object.keys(state.bookState).includes("0") || Object.keys(state.bookState).includes("1")){
    return {
      LoadState: state.bookState[ownProps.view].loadState,
      UIBackgroundColor: state.appState.themes[state.appState.selectedTheme].ui.primaryBackground,
      ThemeMenuActive: state.bookState[ownProps.view].state.themeMenuActive,
      renderMode:state.bookState[ownProps.view]?.data.theme.renderMode,
      readerMargins: state.appState.readerMargins,
      progress: state.bookState[ownProps.view]?.data?.progress,
      selectedTheme: state.appState.selectedTheme
    }
    
  }else{
    return {LoadState: LOADSTATE.LOADING}
  }

}

const connector = connect(mapState, {ToggleMenu, SetLoadState, RemoveRendition, SyncedAddRendition})

type PropsFromRedux = ConnectedProps<typeof connector>

type inheritedProps = {
  view: number,
  bookHash: string | undefined,
  contributesMountPoint: number
}

type ReaderProps = PropsFromRedux & inheritedProps &  {
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
    type bookData = string
    let bookValue: bookData = ""

    // const {params} = this.props.router
    if(window.__TAURI__ && this.props.bookHash){
      bookValue = await invoke("get_book_by_hash",{bookHash: this.props.bookHash})
      if(await platform() == "linux"){
        const splitPath = bookValue.split('/').slice(-4)
        // Main Issue:https://github.com/tauri-apps/tauri/issues/3725
        bookValue = "http://127.0.0.1:16780/" + splitPath.join("/")
      }else{
        bookValue = convertFileSrc(bookValue)
      }
    }
    if(bookValue.endsWith("epub3") || bookValue.endsWith("epub")){
      this.book = epubjs((bookValue as any))

    }else{

      this.book = epubjs()
      const convertedValue = await parser(bookValue, "", "")
      if(convertedValue == "error"){
        console.log("Book loading cancelled")
        return
      }
      console.log(convertedValue)
      // @ts-expect-error need to add typings
      this.book.openJSON(convertedValue)

    }
    

    this.book.ready.then(async ()=>{




      console.log("Book is ready!")

      await this.initializeRendition();

      // This code will handle the edge case where a book is still loading but the user leaves the page, unmounting the component.
      // We use the standard subscribe here since react-redux will not pass the state updates once unmounted.
      let cancel_Load = false
      const unsubscribe = store.subscribe(()=>{
        const load_state = store.getState().bookState[this.props.view].loadState
        if(load_state == LOADSTATE.CANCELED){
          cancel_Load = true
          // unsubscribe immediately
          unsubscribe()
          // unsubscribe from registerHandlers.tsx
          this.unsubscribeHandlers()
          // Remove rendition from state immediately to prevent duplicate removals
          this.props.RemoveRendition(this.props.view)
        }
      })
      const myLocations = await this.book.locations.generate(1000)
      console.log("LOGGING LOCATIONS")
      console.log(myLocations)
      unsubscribe()

      // This will destroy the rendition only once the generations have been generated.
      // This prevents the application from crashing
      if(cancel_Load){
        this.rendition.destroy();
        return
      }
      

      // This is also found in the epubjsManager
      // If loading the data has finished, when we reach this state, the book parsing is complete
      // So set the overall state to complete
      // This allows us to ensure the app is completely loaded before moving forward.
      switch (store.getState().bookState[this.props.view].loadState) {
      case LOADSTATE.DATA_PARSING_COMPLETE:
        this.props.SetLoadState({view:this.props.view, state:LOADSTATE.COMPLETE})
        break;
      case LOADSTATE.LOADING:
        this.props.SetLoadState({view:this.props.view, state:LOADSTATE.BOOK_PARSING_COMPLETE})
        break;
      }
      

      




    })

  }


  render(): React.ReactNode {
    return(
      <>
        {/* This will help prevent flashbang */}
        <div style={{backgroundColor:this.props.UIBackgroundColor, width: `${this.props.readerMargins}%`, marginLeft:"auto", marginRight:"auto"}}
          className={styles.epubContainer} id={"BookArea-" + this.props.contributesMountPoint}
          ref={this.renderWindow}/>
        {/* <DialogPopup resetMouse={()=>this.instanceVariables.mouseUp = false}/> */}
      </>
    )
  }


  componentWillUnmount(){
    console.log("UNMOUNTING")
    // This handles the edgecase where the locations are loading, but the user exits the page.
    if(this.props.LoadState != LOADSTATE.COMPLETE){
      this.props.SetLoadState({view: this.props.view, state:LOADSTATE.CANCELED})
      return
    }
    this.unsubscribeHandlers();

    this.props.RemoveRendition(this.props.view)
    this.rendition.destroy();
  }


  componentDidUpdate(prevProps: any, prevState: any) {
    // Do nothing if the bookstate is not complete
    if(this.props.LoadState != LOADSTATE.COMPLETE) return


    if(this.props.LoadState != prevProps.LoadState){
      const loadedCFI = store.getState().bookState[this.props.view].data.cfi
      // Handle case where book is opened for first time
      if(!loadedCFI){
        this.rendition.display()
      }else{
        this.rendition.display(loadedCFI).then(()=>{
          this.rendition.display(loadedCFI)
        })
      }
    }
   
    if(
      (this.props.renderMode != prevProps.renderMode && prevProps.renderMode)
      || (this.props.view != prevProps.view)
    ){
      this.rendition.destroy();
      this.unsubscribeHandlers()

      // In the case of the dual reader mode, this will work as the two renditions will cross remove eachother
      this.props.RemoveRendition(this.props.view)
      
      this.initializeRendition(this.props.renderMode, LOADSTATE.BOOK_PARSING_COMPLETE);
    }

    if(this.props.readerMargins != prevProps.readerMargins){
      // This will be undefined on the first load.
      // Undefined -> Initial default value -> Value from data
      if(prevProps.readerMargins && this.rendition && this.rendition.currentLocation){
        console.log("2 reset", this.props.readerMargins)
        let currentLocation = 0;

        // // Logic if using [epubjs-myh](MrMYHuang/epub.js)
        // if(this.props.readerMargins < prevProps.readerMargins){
        //   // @ts-expect-error currentLocation has missing typescript definitions
        //   currentLocation = this.rendition.currentLocation().start.cfi
        // }else{
        //   // @ts-expect-error currentLocation has missing typescript definitions
        //   currentLocation = this.rendition.currentLocation().end.cfi
        // }

        // If using [epubjs-myh](MrMYHuang/epub.js), use this instead of clear
        // This will update the injected iframe styles to reflect the new properties of the stage helper
        // This will adjust the formatting of all text, but will not update
        // the side scrolling css trick that is used by epubjs
        // // @ts-expect-error updateLayout has no typescript definition
        // this.rendition.manager.updateLayout();



        /* Begin Logic if using epub-js */

        const result = this.rendition.currentLocation()
        if(!result){
          console.log("Caught set margins crash on initial load")
          return
        }
        if(Object.keys(result).length == 0){
          return
        }
        // @ts-expect-error Missing Definition
        currentLocation = this.rendition.currentLocation().end.cfi



        // Not needed if using [epubjs-myh](MrMYHuang/epub.js)
        // Removing this clear eliminates the flicker. So using this fork may be better.
        this.rendition.clear()

        /* End base epub-js logic */
        
        
        // This will 'scroll' to the correct location
        this.rendition.display(currentLocation)
        //   newState.bookState["0"].instance.clear()
        // 
      }
      console.log("3")
    }
  }


  async initializeRendition(forceRenderMode = undefined, forceLoadState:(LOADSTATE|undefined) = undefined){


    type layoutTypes = keyof typeof layouts
    
    const {params} = this.props.router

    const layouts = {
      'auto': { width: '100%', flow: 'paginated', maxSpreadColumns: 2 },
        
      'single': { width: '100%', flow: 'paginated', spread: 'none' },
        
      'scrolled': { width: '100%', flow: 'scrolled-doc' },
        
      'continuous': { width: '100%', flow: 'scrolled', manager: 'continuous' },  
    }




    let mySettings:any = {
      width: "100%", 
      height: "100%",
      spread: "always",
      allowScriptedContent: true}


    /* Begin Book Load Pattern - Can be extracted into function in future */
    // Param: useRenderMode props (from settings) -> settings (If defined) -> default
    let payload!:SyncedAddRenditionPayload;
    let result!: bookStateHydrationStructure;

    let firstLoad = false;
    if(window.__TAURI__){
      try {
        result = await invoke("load_book_data", {checksum: this.props.bookHash})
      } catch (error) {
        if(error == "First Read"){
          console.log("First Read, Populating with default data")
  
          // return
        }
        firstLoad = true
        console.log("Error Caught in invoke Load_book_data:", error)
        // return 
      }
    }







      

    const renderMode:layoutTypes = forceRenderMode || (result?.data?.theme?.renderMode as layoutTypes) || "single";

    mySettings = {...mySettings, 
      ...layouts[renderMode]
    }


    const mountPoint = "BookArea-" + this.props.view
    this.rendition = this.book.renderTo(mountPoint || "", mySettings);

    this.rendition.themes.default({
      body: { "padding-top": "10px !important" },
    })

    // eslint-disable-next-line prefer-const
    payload = {
      instance: this.rendition,
      UID:this.props.view,
      hash: this.props.bookHash || "hashPlaceholder",
      saveData: result || {},
      initialLoadState: forceLoadState,
      firstLoad: firstLoad
    }


    this.unsubscribeHandlers = registerHandlers(this.rendition, this.props.view)


      
    // const displayed = this.rendition.display();


    await this.props.SyncedAddRendition(payload)

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

