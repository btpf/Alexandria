import React, { createRef, ReactPropTypes, RefObject, useEffect, useRef, useState } from 'react'; // we need this to make JSX compile
import styles from './Reader.module.scss'
import epubjs, { Book, Rendition } from 'epubjs-myh'
import bookImport from '@resources/placeholder/courage.epub'

class Reader extends React.Component{
  private renderWindow = createRef<HTMLDivElement>()
  private book!:Book;
  private rendition!:Rendition;

  constructor(props:any){
    super(props)
  }
  updateSize(rendition:Rendition, renderWindow:RefObject<HTMLDivElement>){
    rendition.resize(renderWindow.current?.clientWidth || 0, renderWindow.current?.clientHeight || 0)
  }
  componentDidMount(){
    const book = epubjs(bookImport)
    this.rendition = book.renderTo(this.renderWindow.current?.id || "", 
      {
        width: this.renderWindow.current?.clientWidth, 
        height: this.renderWindow.current?.clientHeight,
        spread: "always"
      });

    this.rendition.on("selected", (cfiRange:any, contents:any) =>{
      this.rendition.annotations.highlight(cfiRange, {}, (e) => {
        console.log("highlight clicked", e.target);
      });
      
      contents.window.getSelection().removeAllRanges();
  
    });

    let timer:any = null;
    let mouseUp = false;
    this.rendition.on("dblclick", (event:any, contents:any) =>{
      // If the mousedown timer has been set
      if (timer != null){
        // Clear the timer
        clearTimeout(timer)
        timer = null
        mouseUp = true
      }
    })
      
    this.rendition.on("mouseup", (event:any, contents:any) =>{
      // Set mouseup, which gives permission for the next page transition
      mouseUp = true
    })
    // Inspired by: https://github.com/pgaskin/ePubViewer/blob/gh-pages/script.js#L365
    this.rendition.on("mousedown", (event:MouseEvent, contents:any) =>{

      // If a triple click, prevent it from going through (As this is a useless feature)
      if (event.detail > 2){
        event.preventDefault()
        return
      }
      
      try {
        // Handle case where an <a> tag is clicked
        if (event?.target?.tagName?.toLowerCase() == "a" && event.target?.href) return;
        if (event.target.parentNode.tagName.toLowerCase() == "a" && event.target.parentNode.href) return;
      } catch {}

      // Prevent the page from transitioning if we are unclicking a highlight
      //   console.log(contents.window.getSelection().toString(), contents.window.getSelection().toString().length)
      if (contents.window.getSelection().toString().length !== 0) return;
      
      // If a single click, and the click timer is null

      const wrapper = this.rendition.manager.container;
      const third = wrapper.clientWidth / 3;
      // event.pageX is where the mouse was on the page
      // wrapper.scrollLeft is how far from the left the wrapper is
      const x = event.pageX - wrapper.scrollLeft;
      if(event.detail == 1 && timer == null){

        mouseUp = false
        timer = setTimeout(()=>{
          if(mouseUp){

            // This will prevent case where text is quickly highlighted causing page to transition
            if (contents.window.getSelection().toString().length == 0) {
              if (x < third*2) {
                this.rendition.prev()
              } else if (x > (third * 2)) {
                this.rendition.next()
              }
            }
          }
          // If mouse mouseup event at least once in this time period, but not double clicked (Would cancel timeout), we want to transition to the next page

          timer = null
          
        }, 250)
      }

    //   try {
    //     if (event?.target?.tagName?.toLowerCase() == "a" && event.target?.href) return;
    //     if (event.target.parentNode.tagName.toLowerCase() == "a" && event.target.parentNode.href) return;
    //     if (contents.window.getSelection().toString().length !== 0) return;
    //     if (this.rendition.manager.getContents()[0].window.getSelection().toString().length !== 0) return;
    //   } catch (err) {}
    });
      
    const displayed = this.rendition.display();
    console.log(displayed)
    window.addEventListener('resize', () => this.updateSize(this.rendition, this.renderWindow));
  }
  componentWillUnmount(){
    window.removeEventListener('resize', ()=> this.updateSize(this.rendition, this.renderWindow));
  }
  render(): React.ReactNode {
    return(
      <div style={{height:"90%", width:"100%"}} onClick={()=>{
        this.rendition.next()
      }}>
        <div> Transition Page</div>
        <div className={styles.epubContainer} id={"BookArea"} ref={this.renderWindow}/>
      </div>

    )
  }

}

export default Reader