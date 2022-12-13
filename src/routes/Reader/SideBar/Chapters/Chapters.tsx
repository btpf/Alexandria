import styles from './Chapters.module.scss'
import React, { useState } from 'react'
import { NavItem, Rendition } from 'epubjs-myh';
import produce from 'immer';
import ChevronRight from '@resources/feathericons/chevron-right.svg'
import ChevronDown from '@resources/feathericons/chevron-down.svg'

import { SelectSidebarMenu } from '@store/slices/bookStateSlice'
import { useAppDispatch, useAppSelector } from '@store/hooks'

type SidebarTypes = {
    renditionInstance: Rendition
  };
type ExpandingTree = { [member: string]: any|null }


const Sidebar = (props:SidebarTypes)=>{
  const dispatch = useAppDispatch()
  
  //https://stackoverflow.com/a/59370530
  const [expandableTree, setExpandableTree] = useState<ExpandingTree>({});
  
  const toggleLevel = (level:any)=>{
    const nextState = produce(expandableTree, (draftState:ExpandingTree) => {
      let currentState = draftState

      let index = 0
      for(const chapter of level){
        if (currentState[chapter]){
          if(index + 1 == level.length){
            delete currentState[chapter]
            break
          }
          currentState = currentState[chapter]
        }else{
          currentState[chapter] = {}
          break
        }
        index += 1
      }
    })
    setExpandableTree(nextState)
  }

  const recursiveMap = (chapterList:NavItem[], level:Array<string>, currentTree:ExpandingTree=expandableTree) =>{
    return chapterList.map((item)=>{
      return (
        <div className={styles.TocMapContainer} style={{paddingLeft: 20 * level.length}} key={`${item.href} + ${item.id}`}>
          <div className={styles.rootChapterFlexContainer}>

            <div className={styles.tocChapterTitle}
              onClick={()=>{
                props.renditionInstance?.display(item.href)
                dispatch(SelectSidebarMenu({view:0, state:false}))
              }}>{item.label}</div>

            <div className={styles.tocExpander} onClick={()=>{
              if(item.subitems){
                toggleLevel([...level, item.id])
              }
            }}> 
              {item?.subitems?.length ?currentTree[item.id]?<ChevronDown/>:<ChevronRight/>:""}
            </div>



          </div>
          <div>{item.subitems && currentTree[item.id]? recursiveMap(item.subitems, [...level, item.id], currentTree[item.id]):""}</div>
        </div>
      )
    })
  }

  return (
    <div>
      {recursiveMap(props.renditionInstance?.book.navigation.toc, [])}
    </div>
  )
}

export default Sidebar