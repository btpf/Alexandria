import React, { useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux"
import { RootState } from "@store/store"
import styles from './DialogPopup.module.scss'

import Copy from '@resources/iconmonstr/iconmonstr-copy-9.svg'
import Book from '@resources/iconmonstr/iconmonstr-book-26.svg'
import Search from '@resources/iconmonstr/iconmonstr-magnifier-2.svg'


import Check from '@resources/feathericons/check.svg'
import Trash from '@resources/feathericons/trash-2.svg'

import { useAppDispatch, useAppSelector } from '@store/hooks'
import { AddHighlight } from '@store/slices/bookStateSlice'
import { Contents } from "epubjs-myh"

const COLORS = ['#FFD600', 'red', 'orange','#00FF29', 'cyan']

function DialogPopup(props:{resetMouse: () => void}){
  const renditionInstance = useSelector((state: RootState) => state.bookState[0]?.instance)
  const [bounds, setBounds] = useState({x:0, y: 0, width: 0, height:0})
  const containerWidth = 200
  const containerHeight = 100
  const [visible, setVisible] = useState({current:"", previous:""})
  const refValue = useRef(visible);
  const [noteLocation, setNoteLocation] = useState({visible: false, x:0, y:0})


  const dispatch = useAppDispatch()
  
  useEffect(()=>{
    if (!renditionInstance){
      return
    }
    // TODO: Refactor this code to use an invisible blocking div to cancel the mouse click.
    // Or we can maybe move resetMouse into props?
    const handleClick = (_:MouseEvent, contents:any)=>{
      if(noteLocation.visible){
        props.resetMouse()
        setNoteLocation({...noteLocation, visible:false})
      }
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
  }, [visible,noteLocation])

  useEffect(()=>{
    if (!renditionInstance){
      return
    }
    const handleSelect = (cfiRange:any, contents:Contents) =>{
      // This will set the mouse state to up to prevent the page from flipping on quickly highlighting
      props.resetMouse()
        
      renditionInstance.annotations.highlight(cfiRange, {}, (e:MouseEvent) => {
        props.resetMouse()
      }, '', {fill:"#36454F"});
      setVisible({current:cfiRange, previous:visible.current})
      const selection = contents.window.getSelection()

      if (!selection){
        console.log("selection in DialogPopup is null")
        return null
      }
      const getRange = selection.getRangeAt(0).getBoundingClientRect();

      const {x, y} = calculateBoxPosition(getRange, containerWidth, containerHeight)

      setBounds({x, y, width: getRange.width, height:getRange.height})

      const invisibleNoteLocation = calculateBoxPosition(getRange, 300, 250)
      setNoteLocation({visible: false, x:invisibleNoteLocation.x, y:invisibleNoteLocation.y})
      
          
    }

    renditionInstance.on("selected", handleSelect);

    return ()=>{
      renditionInstance.off("selected", handleSelect);
    }
  }, [renditionInstance, visible])


  useEffect(()=>{
    if (visible.current && noteLocation.visible){
      setNoteLocation({...noteLocation, visible:false})
    }
  }, [visible,noteLocation])

  const calculateBoxPosition = (rangeBox:DOMRect, boxWidth:number, boxHeight:number)=>{
    const wrapper = renditionInstance?.manager?.container?.getBoundingClientRect();

    if (!wrapper){
      console.log("Wrapper not found")
      return {x:0, y:0}
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
    let ypos = rangeBox.y + offsetY + rangeBox.height
      
    if (ypos + boxHeight > yBottomLimit){
      // Subtract the height of the highlight and the height of the rendered dialog
      ypos -= (boxHeight + rangeBox.height)
    }
    ypos = Math.max(ypos, 0)

    const xRightLimit = wrapper?.x + wrapper?.width

    // Fixed bug where once resized, epubjs keep the previously rendered content off screen,
    // Causing the position calculations to mess up. This will mod the x position by the width
    // ensuring the box stays on the screen.
    const trueX = rangeBox.x % wrapper.width

    let xpos = trueX + rangeBox.width /2 - boxWidth/2
    xpos = Math.min(xpos, xRightLimit - boxWidth)
    xpos = Math.max(xpos, 0)

    return {x:xpos, y:ypos}
  }
  
  
  return (
  // Debug square for checking position of bounding box
    <>
      {/* <div style={{position:"absolute", top:bounds.y, left: bounds.x, width: bounds.width, height: bounds.height, border:"1px solid red"}}>
          Debug
      </div> */}
      <div className={styles.noteContainer} style={{display:noteLocation.visible?"":"none", left:noteLocation.x, top:noteLocation.y}}>
        <textarea placeholder="Add Note" className={styles.noteContentContainer}>

        </textarea>

        <div className={styles.annotationActions}>
          <div className={styles.svgSelect}>
            <Trash/>

          </div>
          <div className={styles.colorSelector}>
            {COLORS.map((item)=>{
              return <div key={item} style={{backgroundColor:item}} className={styles.highlightBubble} onClick={()=>{
                console.log(item)
              }}/>

            })}
          </div>
          <div className={styles.svgSelect}>
            <Check/>

          </div>
          
        </div>
        
      </div>
      <div className={styles.container} style={{display:visible.current?"":"none", top:bounds.y, left: bounds.x, width: containerWidth, height: containerHeight}}>
        {/* {visible.current} */}
        <div className={styles.actionContainer}>
          <div><Copy/></div>
          <div><Book/></div>
          <div><Search/></div>
        </div>
        <hr className={styles.divider}/>
        <div className={styles.highlightContainer}>
          {COLORS.map((item)=>{
            return <div key={item} style={{backgroundColor:item}} className={styles.highlightBubble} onClick={()=>{
              setVisible({current:"", previous:""})
              renditionInstance.annotations.remove(visible.current, "highlight")
              renditionInstance.annotations.highlight(visible.current, {test:"TESTDATA"}, (e:MouseEvent, td:any) => {
                // This will prevent page turning when clicking on highlight
                props.resetMouse()
                
                //Returning here will prevent the edgecase & race-condition where highlighting text over an existing annotation
                // Will open both the note and the highlight dialog
                // console.log(visible.current)
                
                console.log(td)
                console.log(refValue.current.current)
                console.log(visible.current)
                // if(contents.window.getSelection().toString().length == 0){
                //   return
                // }
                const boundingBox = renditionInstance.getRange(visible.current).getBoundingClientRect()
                const {x, y} = calculateBoxPosition(boundingBox, 300, 250)

                setNoteLocation({visible: true, x, y})

              }, '', {fill:item});
              setNoteLocation({ ...noteLocation, visible: true})
              dispatch(AddHighlight({highlightRange:visible.current, color:item, note:"", view:0}))
            }}/>
          })}
          
        </div>
      </div>
    </>

  )
}

export default DialogPopup