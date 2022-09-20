import React, { createRef, ReactPropTypes, RefObject, useEffect, useRef, useState } from 'react'; // we need this to make JSX compile
import styles from './ReaderView.module.scss'
import epubjs, { Book, Rendition } from 'epubjs-myh'
import bookImport from '@resources/placeholder/courage.epub'
import View, { ViewSettings } from 'epubjs-myh/types/managers/view';
import redrawAnnotations from './functions/redrawAnnotations';

import { readerInstanceVariables } from "./ReaderView.d";
import highlightText from './functions/highlightText';
import mouseEvents from './functions/mouseEvents'
// Code to make typescript quiet down


interface ReaderProps{
  onToggleState: ()=> void;
  onRenditionInstance: (rendition:Rendition) => void;
}

class Reader extends React.Component<ReaderProps>{
  private renderWindow = createRef<HTMLDivElement>()
  private book!:Book;
  private rendition!: Rendition;

  constructor(props:ReaderProps){
    super(props)
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

    // When Instantiated, pass up rendition instance
    this.props.onRenditionInstance(this.rendition)

    
    
    // let readerInstanceVariables = require('./ReaderViewTypes.ts').readerInstanceVariables


    const instanceVariables:readerInstanceVariables = {
      timer: null,
      mouseUp: true
    }

    mouseEvents(this.rendition, instanceVariables, ()=> this.props.onToggleState())
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
      <div className={styles.epubContainer} id={"BookArea"} ref={this.renderWindow}/>

    )
  }

}

export default Reader