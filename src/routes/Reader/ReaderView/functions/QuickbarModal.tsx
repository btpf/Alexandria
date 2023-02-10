import React from 'react'; // we need this to make JSX compile


import CalculateBoxPosition from './CalculateBoxPosition';

import {
  AddHighlight, 
  SetModalCFI,
  MoveQuickbarModal,
  SkipMouseEvent,
  ShowNoteModal,
  MoveNoteModal,
  
} from '@store/slices/bookStateSlice'

// Transferred Imports
import styles from './DialogPopup.module.scss'
import Copy from '@resources/iconmonstr/iconmonstr-copy-9.svg'
import Book from '@resources/iconmonstr/iconmonstr-book-26.svg'
import Search from '@resources/iconmonstr/iconmonstr-magnifier-2.svg'

import { useAppSelector, useAppDispatch } from '@store/hooks';
import { quickbarModalHeight, quickbarModalWidth } from './ModalUtility';


const COLORS = ['#FFD600', 'red', 'orange','#00FF29', 'cyan']


const QuickbarModal = () =>{

  const quickbarModalVisible = useAppSelector((state) => state.bookState[0]?.state?.modals.quickbarModal.visible)
  const modalX = useAppSelector((state) => state.bookState[0]?.state?.modals.quickbarModal.x)
  const modalY = useAppSelector((state) => state.bookState[0]?.state?.modals.quickbarModal.y)
  const selectedCFI = useAppSelector((state) => state.bookState[0]?.state?.modals.selectedCFI)
  const renditionInstance = useAppSelector((state) => state.bookState[0]?.instance)


  function getEpubBounds(){
    return renditionInstance?.manager?.container?.getBoundingClientRect();
  }



  const dispatch = useAppDispatch()
  if(quickbarModalVisible){
    return(
      <>
        <div className={styles.container} style={{top:modalY, left: modalX, width: quickbarModalWidth, height: quickbarModalHeight}}>
          <div className={styles.actionContainer}>
            <div><Copy/></div>
            <div><Book/></div>
            <div><Search/></div>
          </div>
          <hr className={styles.divider}/>
          <div className={styles.highlightContainer}>
            {COLORS.map((item)=>{

              return <div key={item} style={{backgroundColor:item}} className={styles.highlightBubble} onClick={()=>{
                renditionInstance.annotations.remove(selectedCFI, "highlight")

                const cfiRangeClosure = selectedCFI
                console.log("ANNOTATION MADE", cfiRangeClosure)
                renditionInstance.annotations.highlight(selectedCFI,{}, (e:MouseEvent) => {
                  console.log("ANNOTATION CLICKED", cfiRangeClosure)

                  // This will prevent page turning when clicking on highlight
                  dispatch(SkipMouseEvent(0))
        

                  const boundingBox = renditionInstance.getRange(cfiRangeClosure).getBoundingClientRect()
                  const {x, y} = CalculateBoxPosition(getEpubBounds(),boundingBox, 300, 250)

                  dispatch(SetModalCFI({view:0,selectedCFI:cfiRangeClosure}))
                  dispatch(MoveNoteModal({
                    view: 0,
                    x,
                    y,
                    visible: true
                  }))

                  
                }, '', {fill:item});


                dispatch(MoveQuickbarModal({
                  view: 0,
                  x:0,
                  y:0,
                  visible: false
                }))

                dispatch(ShowNoteModal(0))
                
                dispatch(AddHighlight({highlightRange:selectedCFI, color:item, note:"", view:0}))
              }}/>


            })}
  
          </div>
        </div>
      </>

    )
  }
  return null
} 


export default QuickbarModal

