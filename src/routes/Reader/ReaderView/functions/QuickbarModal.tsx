import React from 'react'; // we need this to make JSX compile


import {
  AddHighlight, 
  SkipMouseEvent,
  
} from '@store/slices/bookState'

// Transferred Imports
import styles from './DialogPopup.module.scss'
import Copy from '@resources/iconmonstr/iconmonstr-copy-9.svg'
import Book from '@resources/iconmonstr/iconmonstr-book-26.svg'
import Search from '@resources/iconmonstr/iconmonstr-magnifier-2.svg'

import { useAppSelector, useAppDispatch } from '@store/hooks';
import { CalculateBoxPosition, NOTE_MODAL_HEIGHT, NOTE_MODAL_WIDTH, QUICKBAR_MODAL_HEIGHT, QUICKBAR_MODAL_WIDTH } from './ModalUtility';
import { Rendition } from 'epubjs';
import toast from 'react-hot-toast';
import { writeText } from '@tauri-apps/api/clipboard';
import { MoveNoteModal, MoveQuickbarModal, SelectSidebarMenu, SetDictionaryWord, SetModalCFI, ShowNoteModal } from '@store/slices/appState';


const COLORS = ['#FFD600', 'red', 'orange','#00FF29', 'cyan']


const QuickbarModal = () =>{
  const selectedRendition = useAppSelector((state) => state.appState.state.selectedRendition)
  const quickbarModalVisible = useAppSelector((state) => state?.appState?.state?.modals.quickbarModal.visible)
  const modalX = useAppSelector((state) => state?.appState?.state?.modals.quickbarModal.x)
  const modalY = useAppSelector((state) => state?.appState?.state?.modals.quickbarModal.y)
  const selectedCFI = useAppSelector((state) => state?.appState?.state?.modals.selectedCFI)
  const renditionInstance:Rendition = useAppSelector((state) => state.bookState[selectedRendition]?.instance)


  function getEpubBounds(){
    return renditionInstance?.manager?.container?.getBoundingClientRect();
  }



  const dispatch = useAppDispatch()
  if(quickbarModalVisible){
    let result:any = renditionInstance.getRange(selectedCFI)
    type EpubJSContainer = Node & {data: string}
    result = (result.endContainer as EpubJSContainer).data.substring(result.startOffset, result.endOffset).trim()
    const showDict = !result.includes(" ")
    return(
      <>
        <div className={styles.container} style={{top:modalY, left: modalX, width: QUICKBAR_MODAL_WIDTH, height: QUICKBAR_MODAL_HEIGHT}}>
          <div className={styles.actionContainer}>
            <div onClick={async ()=>{
              renditionInstance.annotations.remove(selectedCFI, "highlight")
              dispatch(MoveQuickbarModal({
                x:0,
                y:0,
                visible: false
              }))
              await writeText(result);
              toast.success('Text Copied',
                {
                  icon: '📋',
                })
                          
            }}><Copy/></div>
            <div style={!showDict?{display:"none"}:{}}><Book onClick={()=>{
              console.log("About to set word", result)
              dispatch(SetDictionaryWord(result))
              renditionInstance.annotations.remove(selectedCFI, "highlight")
              dispatch(MoveQuickbarModal({
                view: 0,
                x:0,
                y:0,
                visible: false
              }))

            }}/></div>
            <div onClick={()=>{
              dispatch(SelectSidebarMenu("Search#" + result))
              renditionInstance.annotations.remove(selectedCFI, "highlight")
              dispatch(MoveQuickbarModal({
                view: 0,
                x:0,
                y:0,
                visible: false
              }))
            }}><Search/></div>
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
        

                  const {x, y} = CalculateBoxPosition(renditionInstance, cfiRangeClosure, NOTE_MODAL_WIDTH, NOTE_MODAL_HEIGHT)

                  dispatch(SetModalCFI(cfiRangeClosure))
                  dispatch(MoveNoteModal({
                    x,
                    y,
                    visible: true
                  }))

                  
                }, '', {fill:item});


                dispatch(MoveQuickbarModal({
                  x:0,
                  y:0,
                  visible: false
                }))

                dispatch(ShowNoteModal())
                
                dispatch(AddHighlight({highlightRange:selectedCFI, color:item, note:"", view:selectedRendition}))
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

