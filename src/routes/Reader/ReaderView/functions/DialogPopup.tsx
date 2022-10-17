import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { RootState } from "@store/store"
import styles from './DialogPopup.module.scss'

import Copy from '@resources/iconmonstr/iconmonstr-copy-9.svg'
import Book from '@resources/iconmonstr/iconmonstr-book-26.svg'
import Search from '@resources/iconmonstr/iconmonstr-magnifier-2.svg'

import { useAppDispatch, useAppSelector } from '@store/hooks'
import { AddHighlight } from '@store/slices/bookStateSlice'

function DialogPopup(props:{resetMouse: () => void}){
  const renditionInstance = useSelector((state: RootState) => state.bookState[0]?.instance)
  const [bounds, setBounds] = useState({x:0, y: 0, width: 0, height:0})
  const containerWidth = 200
  const containerHeight = 100
  const [visible, setVisible] = useState({current:"", previous:""})

  const dispatch = useAppDispatch()
  
  useEffect(()=>{
    if (!renditionInstance){
      return
    }
    const handleClick = (_:MouseEvent, contents:any)=>{
      if (contents.window.getSelection().toString().length == 0 && visible.current){
        props.resetMouse()
        renditionInstance.annotations.remove(visible.current, "highlight")
        setVisible({current:"", previous:""})
      }else if (visible.previous){
        props.resetMouse()
        renditionInstance.annotations.remove(visible.previous, "highlight")
        setVisible({current:visible.current, previous:""})
        
      }
      contents.window.getSelection().removeAllRanges();
    }
    
    renditionInstance.on("click",handleClick )
    return ()=>{
      renditionInstance.off("click",handleClick )
    }
  }, [visible])

  useEffect(()=>{
    if (!renditionInstance){
      return
    }
    const handleSelect = (cfiRange:any, contents:any) =>{
      if (contents.window.getSelection().toString().length > 0){ // If statement will prevent crashing if image is selected
        // This will set the mouse state to up to prevent the page from flipping on quickly highlighting
        props.resetMouse()
        
        renditionInstance.annotations.highlight(cfiRange, {}, (e:MouseEvent) => {
          props.resetMouse()
        }, '', {fill:"#36454F"});
        setVisible({current:cfiRange, previous:visible.current})
        const selection = contents.window.getSelection()
        const getRange = selection.getRangeAt(0).getBoundingClientRect();

        const wrapper = renditionInstance?.manager?.container?.getBoundingClientRect();

        if (!wrapper){
          return 
        }

        // Since the position is absolute inside the container, by getting the wrapper and the bounding rect,
        // We can add how far from the top the actual render of the ReaderView is
        const offsetY = wrapper?.y
        // Used for debugging
        // setBounds({x:getRange.x, y: getRange.y + offsetY, width: getRange.width, height:getRange.height})

        //Production
        
        // The bottom limit is the wrappers distance from the top + the height of the render wrapper
        const yBottomLimit = wrapper?.y + wrapper?.height
        // The default position will be the position of the highlight + the offsetY + the height of the highlight
        let ypos = getRange.y + offsetY + getRange.height
        
        if (ypos + containerHeight > yBottomLimit){
          // Subtract the height of the highlight and the height of the rendered dialog
          ypos -= (containerHeight + getRange.height)
        }
        ypos = Math.max(ypos, 0)

        const xRightLimit = wrapper?.x + wrapper?.width

        // Fixed bug where once resized, epubjs keep the previously rendered content off screen,
        // Causing the position calculations to mess up. This will mod the x position by the width
        // ensuring the box stays on the screen.
        const trueX = getRange.x % wrapper.width

        let xpos = trueX + getRange.width /2 - containerWidth/2
        xpos = Math.min(xpos, xRightLimit - containerWidth)
        xpos = Math.max(xpos, 0)

        setBounds({x:xpos, y: ypos, width: getRange.width, height:getRange.height})
      }
          
    }

    renditionInstance.on("selected", handleSelect);

    return ()=>{
      renditionInstance.off("selected", handleSelect);
    }
  }, [renditionInstance, visible])

  
  
  return (
  // Debug square for checking position of bounding box
    <>
      {/* <div style={{position:"absolute", top:bounds.y, left: bounds.x, width: bounds.width, height: bounds.height, border:"1px solid red"}}>
          Debug
      </div> */}

      <div className={styles.container} style={{display:visible.current?"":"none", top:bounds.y, left: bounds.x, width: containerWidth, height: containerHeight}}>
        {/* {visible.current} */}
        <div className={styles.actionContainer}>
          <div><Copy/></div>
          <div><Book/></div>
          <div><Search/></div>
        </div>
        <hr className={styles.divider}/>
        <div className={styles.highlightContainer}>
          {['yellow', 'red', 'orange','green', 'blue'].map((item)=>{
            return <div key={item} style={{backgroundColor:item}} className={styles.highlightBubble} onClick={()=>{
              setVisible({current:"", previous:""})
              renditionInstance.annotations.remove(visible.current, "highlight")
              renditionInstance.annotations.highlight(visible.current, {}, (e:MouseEvent) => {
                // This will prevent page turning when clicking on highlight
                props.resetMouse()
              }, '', {fill:item});
              dispatch(AddHighlight({highlightRange:visible.current, color:item, note:"", view:0}))
            }}/>
          })}
          
        </div>
      </div>
    </>

  )
}

export default DialogPopup