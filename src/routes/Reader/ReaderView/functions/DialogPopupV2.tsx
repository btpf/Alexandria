import React from 'react'; // we need this to make JSX compile


import { connect, ConnectedProps } from 'react-redux'



import store, {RootState} from '@store/store'
import {AddHighlight, ChangeHighlightColor, DeleteHighlight, ChangeHighlightNote} from '@store/slices/bookStateSlice'

// Transferred Imports
import styles from './DialogPopup.module.scss'
import Copy from '@resources/iconmonstr/iconmonstr-copy-9.svg'
import Book from '@resources/iconmonstr/iconmonstr-book-26.svg'
import Search from '@resources/iconmonstr/iconmonstr-magnifier-2.svg'


import Check from '@resources/feathericons/check.svg'
import Trash from '@resources/feathericons/trash-2.svg'
import { Contents, Rendition } from 'epubjs-myh';
const COLORS = ['#FFD600', 'red', 'orange','#00FF29', 'cyan']
const containerWidth = 200
const containerHeight = 100

const mapState = (state: RootState) => ({
  renditionInstance: state.bookState[0]?.instance,
  completeState: state.bookState[0],
  annotations: state.bookState[0]?.data?.highlights
})

const connector = connect(mapState, {AddHighlight, ChangeHighlightColor, DeleteHighlight, ChangeHighlightNote})

type PropsFromRedux = ConnectedProps<typeof connector>

interface Props extends PropsFromRedux{
  resetMouse: () => void
}


// https://stackoverflow.com/questions/59072200/useselector-destructuring-vs-multiple-calls

class DialogPopup extends React.Component<Props>{
  // const renditionInstance = useSelector((state: RootState) => state.bookState[0]?.instance)
  // const [bounds, setBounds] = useState({x:0, y: 0, width: 0, height:0})
  containerWidth = 200
  containerHeight = 100
  // const [visible, setVisible] = useState({current:"", previous:""})
  // const [noteModal, setnoteModal] = useState({visible: false, x:0, y:0})
  state = {
    selectedCFI: "",
    quickbarModal: {visible: false, x:0, y:0},
    noteModal: {visible: false, x:0, y:0},
    renditionHandlers: {click:null, select:null}}

  constructor(props:Props){
    super(props)
  }
  componentDidUpdate(){
    if(this.state.renditionHandlers.click || !this.props.renditionInstance){
      return
    }

    const handleClick = (_:MouseEvent, contents:any)=>{
      const newState = {...this.state}

      // If the note popup is visible
      if(this.state.noteModal.visible){
        this.props.resetMouse()
        newState.noteModal = {...this.state.noteModal, visible: false}

        // If clicking off of the noteModal, the selectedCFI Must be removed
        newState.selectedCFI = ""
      }

      // If text is current selected and the quickbar is visible
      if(contents.window.getSelection().toString().length == 0 && this.state.quickbarModal.visible){
        this.props.resetMouse()
        
        // Deselect the text
        this.props.renditionInstance.annotations.remove(this.state.selectedCFI, "highlight")

        // hide quickbarModal
        newState.quickbarModal = {...newState.quickbarModal, visible: false}
      }


      this.setState(newState)
      contents.window.getSelection().removeAllRanges();
    }
    
    this.props.renditionInstance.on("click",handleClick )






    const handleSelect = (cfiRange:any, contents:Contents) =>{
      console.log("Select handled")
      // This will set the mouse state to up to prevent the page from flipping on quickly highlighting
      this.props.resetMouse()
      this.props.renditionInstance.annotations.highlight(cfiRange, {}, (e:MouseEvent) => {
        this.props.resetMouse()
      }, '', {fill:"#36454F"});
      // setVisible({current:cfiRange, previous:this.state.quickbarModal.location})
      const newState = {...this.state}


      // If the noteModal is open, meaning the selectedCFI is a real note, do not remove the highlight
      if(!this.state.noteModal.visible){
        this.props.renditionInstance.annotations.remove(this.state.selectedCFI, "highlight")
      }

      const selection = contents.window.getSelection()

      if (!selection){
        console.log("selection in DialogPopup is null")
        return null
      }
      const getRange = selection.getRangeAt(0).getBoundingClientRect();

      const {x, y} = this.calculateBoxPosition(getRange, containerWidth, containerHeight)

      // setBounds({x, y, width: getRange.width, height:getRange.height})

      
      const invisiblenoteModal = this.calculateBoxPosition(getRange, 300, 250)

      newState.quickbarModal ={x, y, visible: true}
      newState.selectedCFI = cfiRange
      newState.noteModal = {x:invisiblenoteModal.x, y:invisiblenoteModal.y, visible: false}

      this.setState(newState)
        
          
    }

    this.props.renditionInstance.on("selected", handleSelect);


    this.setState({...this.state, renditionHandlers: {click:handleClick, select:handleSelect}})
  }

  componentWillUnmount(){
    if(this.state.renditionHandlers.click){
      this.props.renditionInstance.off("click", this.state.renditionHandlers.click)
      this.props.renditionInstance.off("selected", this.state.renditionHandlers.select)
    }

  }

  calculateBoxPosition = (rangeBox:DOMRect, boxWidth:number, boxHeight:number)=>{
    const wrapper = this.props.renditionInstance?.manager?.container?.getBoundingClientRect();

    if (!wrapper){
      console.log("Wrapper not found")
      return {x:0, y:0}
    }

    // Since the position is absolute inside the container, by getting the wrapper and the bounding rect,
    // We can add how far from the top the actual render of the ReaderView is
    const offsetY = wrapper?.y
      
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
  render(): React.ReactNode {
    if(this.state.noteModal.visible){
      return(
        <div className={styles.noteContainer} style={{display:this.state.noteModal.visible?"":"none", left:this.state.noteModal.x, top:this.state.noteModal.y}}>
          <textarea placeholder="Add Note" value={this.props.annotations? this.props.annotations[this.state.selectedCFI]?.note:""} 
            onChange={(event)=>{
              this.props.ChangeHighlightNote({highlightRange:this.state.selectedCFI, color:"any", note:event.target.value, view:0})
            }}
            className={styles.noteContentContainer}>
          </textarea>
  
          <div className={styles.annotationActions}>
            <div className={styles.svgSelect}>
              <Trash onClick={()=>{
                this.props.renditionInstance.annotations.remove(this.state.selectedCFI, "highlight")
                this.props.DeleteHighlight({highlightRange:this.state.selectedCFI, color:"any", note:"", view:0})


                this.setState({...this.state, selectedCFI: "", noteModal:{...this.state.noteModal, visible: false}})
              }}/>
  
            </div>
            <div className={styles.colorSelector}>
              {COLORS.map((item)=>{
                return <div key={item} style={{backgroundColor:item}} className={styles.highlightBubble} onClick={()=>{
                  this.props.renditionInstance.annotations.remove(this.state.selectedCFI, "highlight")
                  this.props.ChangeHighlightColor({highlightRange:this.state.selectedCFI, color:item, note:"", view:0})
                  const cfiRangeClosure = this.state.selectedCFI
                  this.props.renditionInstance.annotations.highlight(this.state.selectedCFI,{}, (e:MouseEvent) => {
                    // This will prevent page turning when clicking on highlight
                    this.props.resetMouse()
              
                    //Returning here will prevent the edgecase & race-condition where highlighting text over an existing annotation
                    // Will open both the note and the highlight dialog
                    if(this.state.quickbarModal.visible){
                      // console.log("Race Condition Prevented")
                      return
                    }
                    const boundingBox = this.props.renditionInstance.getRange(cfiRangeClosure).getBoundingClientRect()
                    const {x, y} = this.calculateBoxPosition(boundingBox, 300, 250)
                    this.setState({...this.state, selectedCFI: cfiRangeClosure, noteModal:{visible: true, x, y}})
    
                  }, '', {fill:item});
  
  
                  console.log(item)
                }}/>
  
              })}
            </div>
            <div className={styles.svgSelect}>
              <Check onClick={()=>{
                this.setState({...this.state, selectedCFI: "", noteModal:{...this.state.noteModal, visible: false}})
              }}/>
  
            </div>
      
          </div>
    
        </div>
      )
    }else if(this.state.quickbarModal.visible){
      return(
        <>
          <div className={styles.container} style={{top:this.state.quickbarModal.y, left: this.state.quickbarModal.x, width: containerWidth, height: containerHeight}}>
            <div className={styles.actionContainer}>
              <div><Copy/></div>
              <div><Book/></div>
              <div><Search/></div>
            </div>
            <hr className={styles.divider}/>
            <div className={styles.highlightContainer}>
              {COLORS.map((item)=>{
                return <div key={item} style={{backgroundColor:item}} className={styles.highlightBubble} onClick={()=>{
                  this.props.renditionInstance.annotations.remove(this.state.selectedCFI, "highlight")

                  const cfiRangeClosure = this.state.selectedCFI
                  this.props.renditionInstance.annotations.highlight(this.state.selectedCFI,{}, (e:MouseEvent) => {

                    // This will prevent page turning when clicking on highlight
                    this.props.resetMouse()
          
                    //Returning here will prevent the edgecase & race-condition where highlighting text over an existing annotation
                    // Will open both the note and the highlight dialog
                    if(this.state.quickbarModal.visible){
                    // console.log("Race Condition Prevented")
                      return
                    }
                    const boundingBox = this.props.renditionInstance.getRange(cfiRangeClosure).getBoundingClientRect()
                    const {x, y} = this.calculateBoxPosition(boundingBox, 300, 250)
                    this.setState({...this.state, noteModal:{visible: true, x, y}, selectedCFI: cfiRangeClosure})

                  }, '', {fill:item});
                  this.setState({...this.state, quickbarModal:{visible:false}, noteModal:{...this.state.noteModal, visible: true}})
                  this.props.AddHighlight({highlightRange:this.state.selectedCFI, color:item, note:"", view:0})
                  console.log(AddHighlight)
                }}/>
              })}
    
            </div>
          </div>
        </>

      )
    }
  }

}

// https://stackoverflow.com/questions/66277647/how-to-use-redux-toolkit-createslice-with-react-class-components
export default connector(DialogPopup)

