import React, { useEffect, useRef, useState } from 'react'
import styles from './Dictionary.module.scss'


import { useAppDispatch, useAppSelector } from '@store/hooks'



const Dictionary = ()=>{
  const DictionaryWord = useAppSelector((state) => state.bookState[0]?.state.dictionaryWord)
  const dispatch = useAppDispatch()
  const dictionaryContainerRef = useRef<HTMLInputElement>(null);
  
  const displayString = `<span class="form-of-definition use-with-mention" about="#mwt28" typeof="mw:Transclusion"><a rel="mw:WikiLink" href="/wiki/Appendix:Glossary#present_tense" title="Appendix:Glossary">present</a> <a rel="mw:WikiLink" href="/wiki/Appendix:Glossary#participle" title="Appendix:Glossary">participle</a> of <span class="form-of-definition-link"><i class="Latn mention" lang="en"><a rel="mw:WikiLink" href="/wiki/test#English" title="test">test</a></i></span></span>`
  const [response, setResponse] = useState(displayString)

  const requestWord = (redirect:string)=>{
    const template = "https://en.wiktionary.org/api/rest_v1/page/definition/"
    fetch(template + redirect.toLowerCase()).then((response)=>{
      response.json().then((js)=>{
        if(!Object.keys(js).includes("en")){
          console.log("Error Caught, no definition found")
          setResponse("<h1> Definition Not Found </h1>")
          return
        }
        const capitalized = redirect.charAt(0).toUpperCase() + redirect.slice(1)
        let finalStr = `<div style="font-weight:bold;font-size:24px;margin-top:10px; color: var(--text-primary)">${capitalized}</div>`;
        for(let i = 0; i < js.en.length; i++){
          finalStr += `<div  style="font-weight:bold;font-size:18px; opacity:0.8;margin-top:10px; color: var(--text-primary)"> ${js.en[i].partOfSpeech} </div>`
          for(let j = 0; j < js.en[i].definitions.length; j++){
            if(js.en[i].definitions[j].definition == ""){
              continue
            }
            finalStr += `<b style="color: var(--text-primary)">-</b> <div style="display:inline; color: var(--text-primary)">` + js.en[i].definitions[j].definition + `<br></div>`
          }
        }

        setResponse(finalStr)
      })
    });
  }
  useEffect(()=>{
    console.log("Dictionary Mounted")
    const t = dictionaryContainerRef.current
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
        replacement.onclick = () =>{
          let redirect = item.title
          if(redirect == "Appendix:Glossary"){
            redirect = (item as HTMLAnchorElement).href.split("#")[1]
          }
          console.log(redirect)
          requestWord(redirect)
        }

        item.replaceWith(replacement)

      }
    })
  },[response])

  useEffect(()=>{
    if(!DictionaryWord){
      return
    }
    
    requestWord(DictionaryWord)
  },[DictionaryWord])

  return (
    <div className={`${styles.DictionaryScrollContainer} ${!DictionaryWord && styles.DictionaryScrollContainerCollapsed}`} >
      <div ref={dictionaryContainerRef} className={styles.DictionaryContainer} dangerouslySetInnerHTML={{__html: response}}/>
    </div>
  )
}

export default Dictionary