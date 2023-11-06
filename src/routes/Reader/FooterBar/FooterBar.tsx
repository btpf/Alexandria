import React, { useEffect, useRef, useState } from 'react'
import styles from './FooterBar.module.scss'


import { useAppDispatch, useAppSelector } from '@store/hooks'

import { useNavigate } from 'react-router-dom'
import LeftArrow from '@resources/feathericons/arrow-left.svg'
import { HideFootnote } from '@store/slices/appState'
import { handleLinkClick } from '@shared/scripts/handleLinkClick'


const FooterBar = ()=>{
  const dispatch = useAppDispatch()
  const [menu, setMenu] = useState("Fonts")
  const footnoteActive = useAppSelector((state) => state?.appState?.state?.footnote.active)
  const footnoteLink = useAppSelector((state) => state?.appState?.state?.footnote.link)
  const footnoteText = useAppSelector((state) => state?.appState?.state?.footnote.text)
  const selectedRendition = useAppSelector((state) => state.appState.state.selectedRendition)
  const renditionInstance = useAppSelector((state) => state.bookState[selectedRendition]?.instance)
  const footerContentRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(()=>{
    console.log("FOOTNOTE LINK")
  }, [footnoteLink])


  useEffect(()=>{
    console.log("Dictionary Mounted")
    const t = footerContentRef.current
    if(t == null){
      console.log("dictionaryContainerRef does not exist")
      return
    }
    t.scrollTop = 0;
    const query = t.querySelectorAll<HTMLElement>("*")
    /* console.log(query) */
    query.forEach((item)=>{
      /* console.log(item.tagName) */
      if(item.tagName == "A"){

        const replacement = document.createElement("div");
        // replacement.style = "display:inline; color:red; text-decoration:underline; cursor:pointer;"
        // lightblue for dark theme, blue for light theme
        replacement.style.cssText = "display:inline; color:var(--link); cursor:pointer;"
        replacement.innerHTML = item.innerHTML
        const href = (item as HTMLAnchorElement).getAttribute("href")
        replacement.onclick = () =>{

          handleLinkClick(renditionInstance, href)

        }

        item.replaceWith(replacement)

      }
    })
  },[footnoteLink])


  return (
    <div className={styles.sideBarContainer}>
      <div className={`${styles.sideBar} ${footnoteActive && styles.sideBarActive}`}>
        <div className={styles.sideBarNav}>
          
          <div className={styles.navBack} onClick={()=>dispatch(HideFootnote())}>
            <LeftArrow/> 
            <div>
            Return
            </div>
          </div>

          <div onClick={()=>{
            renditionInstance.display(footnoteLink)
            dispatch(HideFootnote())
          }} className={styles.gotoFoot}>
            Navigate To Footnote
          </div>
        
        </div>

        <div className={styles.footnoteBody} style={{flexGrow:1, overflowY:"auto"}}
          dangerouslySetInnerHTML={{__html:footnoteText}}
          ref={footerContentRef}
        />

      </div>
    </div>

  )
}


export default FooterBar