import React, { useEffect, useState } from 'react'
import ReaderView from './ReaderView/ReaderView'
import styles from './Reader.module.scss'

import Bookmark from '@resources/feathericons/bookmark.svg'
import List from '@resources/feathericons/list.svg'
import Search from '@resources/feathericons/search.svg'
import Font from '@resources/iconmonstr/text-3.svg'
import ArrowLeft from '@resources/feathericons/arrow-left.svg'
import ArrowRight from '@resources/feathericons/arrow-right.svg'

import ChevronRight from '@resources/feathericons/chevron-right.svg'
import ChevronDown from '@resources/feathericons/chevron-down.svg'

import { NavItem, Rendition } from 'epubjs-myh'
import produce, { current, Immutable } from 'immer'

const Home = () =>{
  const [menuOpen, toggleMenu] = useState(false);
  const [sidebarOpen, toggleSidebar] = useState(false);
  const [selectedBookmarkTab, selectBookmarkTab] = useState("Chapters");
  const [renditionInstance, setRendition] = useState<undefined|Rendition>(undefined);

  return (
    <div className={styles.readerFlex}>

      <div className={`${styles.readerTitleBar}  ${menuOpen && styles.optionsToggled}`}>
        <div className={`${styles.menuButtonContainer}`}>
          <List onClick={()=>{toggleSidebar(!sidebarOpen)}}/>
          <Bookmark/>
        </div>
        <div>
          {"Charlotte's Web"}
        </div>
        <div className={`${styles.menuButtonContainer}`}>
          <Search/>
          <Font/>
        </div>
      </div>
      <ReaderView
        onToggleState={()=>{
          toggleMenu(!menuOpen)
        }}

        onRenditionInstance={(rendition)=>{
          setRendition(rendition)
        }}
      />

      <div className={`${styles.readerFooterBar}  ${menuOpen && styles.optionsToggled}`}>
        <div onClick={()=>renditionInstance?.prev()} className={`${styles.menuButtonContainer}`}>
          <ArrowLeft/>
        </div>
        <div onClick={()=>renditionInstance?.next()} className={`${styles.menuButtonContainer}`}>
          <ArrowRight/>
        </div>

      </div>



      <div className={styles.sideBarContainer}>
        <div className={`${styles.opaqueScreen} ${sidebarOpen && styles.opaqueScreenActive}`}/>
        <div className={`${styles.sideBar} ${sidebarOpen && styles.sideBarActive}`}>
          <div className={styles.tabSelector}>
            {["Chapters", "Bookmarks", "Annotations"].map((item)=>{
              return (
                <div key={item} onClick={()=>selectBookmarkTab(item)} className={`${selectedBookmarkTab == item && styles.selectedBookmarkTab}`}>
                  {item}
                </div>
              )
            })}
          </div>
          
          <SidebarContent selection={selectedBookmarkTab} renditionInstance={renditionInstance}/>

        </div>
      </div>


    </div>
  )
} 

export default Home

type SidebarContentTypes = {
  selection: string,
  renditionInstance: Rendition|undefined
};

const SidebarContent = (props: SidebarContentTypes)=>{
  
  //https://stackoverflow.com/a/59370530
   type ExpandingTree = { [member: string]: any|null }

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

   const recursiveMap = (chapterList:NavItem[], level:Array<string>, currentTree:ExpandingTree) =>{
     return chapterList.map((item)=>{
       return (
         <div className={styles.TocMapContainer} style={{paddingLeft: 20 * level.length}} key={`${item.href} + ${item.id}`}>
           <div className={styles.rootChapterFlexContainer}>

             <div className={styles.tocChapterTitle} onClick={()=>{props.renditionInstance?.display(item.href)}}>{item.label}</div>

             <div className={styles.tocExpander} onClick={()=>{
               if(item.subitems){
                 toggleLevel([...level, item.id])
               }
             }}> 
               {item?.subitems?.length ?currentTree[item.id]?<ChevronDown className={styles.placeholder}/>:<ChevronRight className={styles.placeholder}/>:""}
             </div>



           </div>
           <div>{item.subitems && currentTree[item.id]? recursiveMap(item.subitems, [...level, item.id], currentTree[item.id]):""}</div>
         </div>
       )
     })
   }
   if(props.selection == "Chapters" && props.renditionInstance?.book?.navigation){
     return (
       <div style={{overflow:"scroll", height:"calc(100% - 36px)"}}>
         {recursiveMap(props.renditionInstance?.book.navigation.toc, [], expandableTree)}
         {/* {props.renditionInstance?.book.navigation.toc.map((item)=>{
          return (
            <div key={`${item.href} + ${item.id}`}>
              {item.label}
            </div>
          )
        })} */}
       </div>
     )
   }


   return (<div></div>)

}