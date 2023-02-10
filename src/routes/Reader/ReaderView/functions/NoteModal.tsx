import React from 'react'; // we need this to make JSX compile


import {
  ChangeHighlightColor, 
  DeleteHighlight, 
  ChangeHighlightNote,
  SetModalCFI,
  MoveNoteModal,
  SkipMouseEvent,
  HideNoteModal,
} from '@store/slices/bookStateSlice'

// Transferred Imports
import styles from './DialogPopup.module.scss'


import Check from '@resources/feathericons/check.svg'
import Trash from '@resources/feathericons/trash-2.svg'
import { useAppSelector, useAppDispatch } from '@store/hooks';
import { CalculateBoxPosition } from './ModalUtility';



const COLORS = ['#FFD600', 'red', 'orange','#00FF29', 'cyan']


const NoteModal = () =>{

  const noteModalVisible = useAppSelector((state) => state.bookState[0]?.state?.modals.noteModal.visible)
  const modalX = useAppSelector((state) => state.bookState[0]?.state?.modals.noteModal.x)
  const modalY = useAppSelector((state) => state.bookState[0]?.state?.modals.noteModal.y)
  const selectedCFI = useAppSelector((state) => state.bookState[0]?.state?.modals.selectedCFI)
  const renditionInstance = useAppSelector((state) => state.bookState[0]?.instance)
  const annotations = useAppSelector((state) => state.bookState[0]?.data.highlights)
  

  

  function getEpubBounds(){
    return renditionInstance?.manager?.container?.getBoundingClientRect();
  }



  const dispatch = useAppDispatch()
  if(noteModalVisible){
    return(
      <div className={styles.noteContainer} style={{left:modalX, top:modalY}}>
        <textarea placeholder="Add Note" value={annotations? annotations[selectedCFI]?.note:""} 
          onChange={(event)=>{
            dispatch(ChangeHighlightNote({highlightRange:selectedCFI, color:"any", note:event.target.value, view:0}))
          }}
          className={styles.noteContentContainer}>
        </textarea>

        <div className={styles.annotationActions}>
          <div className={styles.svgSelect}>
            <Trash onClick={()=>{
              renditionInstance.annotations.remove(selectedCFI, "highlight")
              dispatch(DeleteHighlight({highlightRange:selectedCFI, color:"any", note:"", view:0}))
              dispatch(SetModalCFI({
                view: 0,
                selectedCFI: ''
              }))
              dispatch(HideNoteModal(0))
            }}/>

          </div>
          <div className={styles.colorSelector}>
            {COLORS.map((item)=>{
              return <div key={item} style={{backgroundColor:item}} className={styles.highlightBubble} onClick={()=>{
                renditionInstance.annotations.remove(selectedCFI, "highlight")
                dispatch(ChangeHighlightColor({highlightRange:selectedCFI, color:item, note:"", view:0}))
                const cfiRangeClosure = selectedCFI
                renditionInstance.annotations.highlight(selectedCFI,{}, (e:MouseEvent) => {
                  // This will prevent page turning when clicking on highlight
                  dispatch(SkipMouseEvent(0))
            
                  const boundingBox = renditionInstance.getRange(cfiRangeClosure).getBoundingClientRect()
                  const {x, y} = CalculateBoxPosition(getEpubBounds(),boundingBox, 300, 250)

                  
                  dispatch(SetModalCFI({
                    view: 0,
                    selectedCFI: cfiRangeClosure
                  }))
                  dispatch(MoveNoteModal({
                    view: 0,
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
              dispatch(SetModalCFI({
                view: 0,
                selectedCFI: ''
              }))

              dispatch(HideNoteModal(0))
            }}/>

          </div>
    
        </div>
  
      </div>
    )
  }
  
  return null
}

export default NoteModal