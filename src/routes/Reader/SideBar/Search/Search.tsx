import styles from './Search.module.scss'
import React, { useEffect, useState } from 'react'

import { useAppDispatch, useAppSelector } from '@store/hooks'
import { FindResults } from 'epubjs/types/section';
import { CloseSidebarMenu } from '@store/slices/appState';


const Search = (props:{query:string})=>{
  const dispatch = useAppDispatch()
  const selectedRendition = useAppSelector((state) => state.appState.state.selectedRendition)

  const renditionInstance = useAppSelector((state) => state.bookState[selectedRendition]?.instance)

  const [searchText, setSearchText] = useState(props.query)

  const [results, setResults] = useState<FindResults[]>([])
  const search = async (query: string)=>{
    // return Promise.all(renditionInstance.book.spine.spineItems.map(item => {
    //   return item.load(renditionInstance.book.load.bind(renditionInstance.book)).then(doc => {
    //     const results = item.find(query);
    //     item.unload();
    //     return Promise.resolve(results);
    //   });
    // })).then(results => results.reduce((resultsArray, currentItem)=>{
    //   return [...resultsArray, ...currentItem]
    // }));


    const results = []
    for (const spineSection of renditionInstance.book.spine.spineItems){
      await spineSection.load(renditionInstance.book.load.bind(renditionInstance.book))
      results.push(...spineSection.find(query))
      spineSection.unload()
      // Attempt to limit to 50 results
      if(results.length >= 50){
        break
      }
      
    }
    return results

    

  }

  useEffect(()=>{
    if(props.query){
      setSearchText(props.query)
      search(props.query).then((results)=>{
        if(results.length == 0){
          return setResults([{cfi:"", excerpt:"No results found"}])
        }
        setResults(results)
      })
    }
  },[props.query])


  return (
    <div className={styles.searchContainer}>


      <input autoFocus className={styles.searchbar} placeholder={"Search text"} type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)} onKeyDown={(event)=>{
        if (event.key === 'Enter') {
          if(searchText == ""){
            setResults([])
            return
          }
          search(searchText).then((results)=>{
            if(results.length == 0){
              return setResults([{cfi:"", excerpt:"No results found"}])
            }
            setResults(results)
          })
        }
      }}/>

      <div className={styles.resultsContainer}>
        {results.map((result)=>{ return (
          <div key={result.cfi} className={styles.resultContainer} onClick={()=>{
            renditionInstance.display(result.cfi).then(()=>{
              // This is a hacky workaround to an issue that is as follows
              // If the user in is chapter 1, they make a search, and the result is in chapter 3
              // Additionally, this user also has font-size or line-spacing set, 
              // they will initially simply open chapter 3, and be navigated to the incorrect place.
              // Calling display on a chapter which is opened will navigate to the text accurately.
              // Therefore, calling it twice ensures the chapter is open first, then we are "scrolled" to the text
              renditionInstance.display(result.cfi)
            })

            const highlighter =()=>{

              const increments = (Math.PI/2)/10
              let currentVal = 0
              const totalFrames = 40
              let currentFrame = 0

              const spotlight = setInterval(()=>{
                currentFrame += 1
                renditionInstance.annotations.remove(result.cfi, "highlight")
                if(currentFrame == totalFrames){
                  clearInterval(spotlight)
                }
                currentVal += increments
                renditionInstance.annotations.highlight(result.cfi, {}, (e:MouseEvent) => {
                  console.log("Skip event id: 3")
                  
                  // store.dispatch(SkipMouseEvent(0))
                  
                }, '', {fill:`rgba(0,255,0,${Math.abs(Math.sin(currentVal))})`});
              }, 50)
              
            }
            
            highlighter()

            dispatch(CloseSidebarMenu())
          }}>
            <div className={styles.resultChapter}>{result.cfi}</div>
            <div className={styles.resultTextContainer}>{result.excerpt}</div>
          </div>)
        })}


      </div>
    </div>
  )
}

export default Search