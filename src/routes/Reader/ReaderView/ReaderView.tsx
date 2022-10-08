import React, { createRef, ReactPropTypes, RefObject, useEffect, useRef, useState } from 'react'; // we need this to make JSX compile
import styles from './ReaderView.module.scss'
import epubjs, { Book, Rendition } from 'epubjs-myh'
import bookImport from '@resources/placeholder/courage.epub'
import View, { ViewSettings } from 'epubjs-myh/types/managers/view';
import redrawAnnotations from './functions/redrawAnnotations';

import { readerInstanceVariables } from "./ReaderView.d";
import highlightText from './functions/highlightText';
import mouseEvents from './functions/mouseEvents'


import { connect, ConnectedProps } from 'react-redux'



import store, {RootState} from '@store/store'
import {AddRendition, ToggleMenu} from '@store/slices/bookStateSlice'
const mapState = (state: RootState) => ({
  testState: state.bookState[0],
})

const connector = connect(mapState, {AddRendition, ToggleMenu})

type PropsFromRedux = ConnectedProps<typeof connector>


// https://stackoverflow.com/questions/59072200/useselector-destructuring-vs-multiple-calls

class Reader extends React.Component<PropsFromRedux>{
  private renderWindow = createRef<HTMLDivElement>()
  private book!:Book;
  private rendition!: Rendition;
  private UID!:string;

  constructor(props:PropsFromRedux){
    super(props)

    // This is used to ensure that in the case multiple renditions are on the page, there will not be conflicts
    this.UID = Math.random().toString()
  }

  updateSize(rendition:Rendition, renderWindow:RefObject<HTMLDivElement>){
    rendition.resize(renderWindow.current?.clientWidth || 50, renderWindow.current?.clientHeight || 50)
  }

  componentDidMount(){
    const book = epubjs(bookImport)
    this.rendition = book.renderTo(this.renderWindow.current?.id || "", 
      {
        width: this.renderWindow.current?.clientWidth, 
        height: this.renderWindow.current?.clientHeight,
        spread: "always"
      });
    this.rendition.themes.default({
      body: { "padding-top": "10px !important" },
    })

    console.log(book)

    // store.dispatch(AddRendition(this.rendition))
    
    this.rendition.book.loaded.spine.then((x)=>{
      this.props.AddRendition(this.rendition)
    })
    
    
    // let readerInstanceVariables = require('./ReaderViewTypes.ts').readerInstanceVariables


    const instanceVariables:readerInstanceVariables = {
      timer: null,
      mouseUp: true
    }

    mouseEvents(this.rendition, instanceVariables, ()=> this.props.ToggleMenu(0))
    highlightText(this.rendition, instanceVariables)
    redrawAnnotations(this.rendition)


      
    const displayed = this.rendition.display();
    window.addEventListener('resize', () => this.updateSize(this.rendition, this.renderWindow));
  }
  componentWillUnmount(){
    window.removeEventListener('resize', ()=> this.updateSize(this.rendition, this.renderWindow));
    this.rendition.destroy();
  }
  render(): React.ReactNode {
    return(
      <div className={styles.epubContainer} id={"BookArea" + this.UID} ref={this.renderWindow}/>

    )
  }

}

// https://stackoverflow.com/questions/66277647/how-to-use-redux-toolkit-createslice-with-react-class-components
export default connector(Reader)

