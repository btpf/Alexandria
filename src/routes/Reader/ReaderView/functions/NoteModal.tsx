import React from 'react'; // we need this to make JSX compile


import {
  ChangeHighlightColor, 
  DeleteHighlight, 
  ChangeHighlightNote,
  SkipMouseEvent,
} from '@store/slices/bookState'

// Transferred Imports
import styles from './DialogPopup.module.scss'


import Check from '@resources/feathericons/check.svg'
import Trash from '@resources/feathericons/trash-2.svg'
import { useAppSelector, useAppDispatch } from '@store/hooks';
import { CalculateBoxPosition } from './ModalUtility';
import { HideNoteModal, MoveNoteModal, SetModalCFI } from '@store/slices/appState';



const COLORS = ['#FFD600', 'red', 'orange','#00FF29', 'cyan']


const NoteModal = () =>{
  const selectedRendition = useAppSelector((state) => state.appState.state.selectedRendition)
  const noteModalVisible = useAppSelector((state) => state?.appState?.state?.modals.noteModal.visible)
  const modalX = useAppSelector((state) => state?.appState?.state?.modals.noteModal.x)
  const modalY = useAppSelector((state) => state?.appState?.state?.modals.noteModal.y)
  const selectedCFI = useAppSelector((state) => state?.appState?.state?.modals.selectedCFI)
  const renditionInstance = useAppSelector((state) => state.bookState[selectedRendition]?.instance)
  const annotations = useAppSelector((state) => state.bookState[selectedRendition]?.data.highlights)
  

  

  function getEpubBounds(){
    return renditionInstance?.manager?.container?.getBoundingClientRect();
  }



  const dispatch = useAppDispatch()
  if(noteModalVisible){
    return(
      <div className={styles.noteContainer} style={{left:modalX, top:modalY}}>
        <textarea placeholder="Add Note" value={annotations? annotations[selectedCFI]?.note:""} 
          onChange={(event)=>{
            console.log("Changehighlightnotepayload", {highlightRange:selectedCFI, color:"any", note:event.target.value, view:selectedRendition})
            dispatch(ChangeHighlightNote({highlightRange:selectedCFI, color:"any", note:event.target.value, view:selectedRendition}))
          }}
          className={styles.noteContentContainer}>
        </textarea>

        <div className={styles.annotationActions}>
          <div className={styles.svgSelect}>
            <Trash onClick={()=>{
              renditionInstance.annotations.remove(selectedCFI, "highlight")
              dispatch(DeleteHighlight({highlightRange:selectedCFI, color:"any", note:"", view:selectedRendition}))
              dispatch(SetModalCFI(""))
              dispatch(HideNoteModal())
            }}/>

          </div>
          <div className={styles.colorSelector}>
            {COLORS.map((item)=>{
              return <div key={item} style={{backgroundColor:item}} className={styles.highlightBubble} onClick={()=>{
                renditionInstance.annotations.remove(selectedCFI, "highlight")
                dispatch(ChangeHighlightColor({highlightRange:selectedCFI, color:item, note:"", view:selectedRendition}))
                const cfiRangeClosure = selectedCFI
                renditionInstance.annotations.highlight(selectedCFI,{}, (e:MouseEvent) => {
                  // This will prevent page turning when clicking on highlight
                  dispatch(SkipMouseEvent(0))
            
                  const {x, y} = CalculateBoxPosition(renditionInstance,cfiRangeClosure, 300, 250)

                  
                  dispatch(SetModalCFI(cfiRangeClosure))
                  dispatch(MoveNoteModal({
                    x,
                    y,
                    visible: true
                  }))
  
                }, '', {fill:item});

                console.log("Making note visible")
                console.log(item)
              }}/>

            })}
          </div>
          <div className={styles.svgSelect}>
            <Check onClick={()=>{
              dispatch(SetModalCFI(''))

              dispatch(HideNoteModal())
            }}/>

          </div>
    
        </div>
  
      </div>
    )
  }
  
  return null
}

export default NoteModal