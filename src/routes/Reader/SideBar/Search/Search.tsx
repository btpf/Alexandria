import styles from './Search.module.scss'
import React, { useState } from 'react'
import { NavItem, Rendition } from 'epubjs-myh';
import produce from 'immer';
import ChevronRight from '@resources/feathericons/chevron-right.svg'
import ChevronDown from '@resources/feathericons/chevron-down.svg'

import { CloseSidebarMenu } from '@store/slices/bookState'
import { useAppDispatch, useAppSelector } from '@store/hooks'
import { FindResults } from 'epubjs-myh/types/section';


const Search = ()=>{
  const dispatch = useAppDispatch()
  const renditionInstance = useAppSelector((state) => state.bookState[0]?.instance)

  const [searchText, setSearchText] = useState("")

  const [results, setResults] = useState<FindResults[]>([])
  const search = (query: string)=>{
    return Promise.all(renditionInstance.book.spine.spineItems.map(item => {
      return item.load(renditionInstance.book.load.bind(renditionInstance.book)).then(doc => {
        const results = item.find(query);
        item.unload();
        return Promise.resolve(results);
      });
    })).then(results => results.reduce((resultsArray, currentItem)=>{
      return [...resultsArray, ...currentItem]
    }));
  }
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
            renditionInstance.display(result.cfi)
            dispatch(CloseSidebarMenu(0))
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