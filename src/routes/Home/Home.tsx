import React, { useCallback, useEffect, useState } from 'react'; // we need this to make JSX compile
import { Link } from "react-router-dom";

import styles from './Home.module.scss'
import Test from '@resources/feathericons/more-vertical.svg'
import Search from '@resources/feathericons/search.svg'
import Filter from '@resources/feathericons/filter.svg'
import Settings from '@resources/feathericons/settings.svg'


import Font from '@resources/iconmonstr/text-3.svg'
import Article from '@resources/material/article_black_24dp.svg'

import Boomark from '@resources/figma/Bookmark.svg'

import { listen } from '@tauri-apps/api/event'




import { convertFileSrc, invoke } from '@tauri-apps/api/tauri'
import Epub from 'epubjs';
import { BookOptions } from 'epubjs/types/book';
import { useAppDispatch, useAppSelector } from '@store/hooks'

import SortIcon from '@resources/iconmonstr/iconmonstr-sort-25.svg'



import TitleBarButtons  from '@shared/components/TitleBarButtons';
import FakeCover from './FakeCover/FakeCover';

interface BookData {
  title:string,
  progress: number,
  hash: string,
  cover_url: string
}

const Home = () =>{

  return (
    <>
      <Shelf/>
    </>
  )
} 

const Shelf = () =>{


  const [searchValue, setSearchValue] = useState("")
  const [filterValue, setFilterValue] = useState("Title")
  const [sortDirection, setSortDirection] = useState("ASC")

  const [bottomBarActive, setBottomBarActive] = useState(false)

  const [myBooks, setBooks] = useState<BookData[]>([])


  useEffect(()=>{
    const unmountPointer = {pointer:()=>{return}}
    if(window.__TAURI__){
      let myBooksState = myBooks;
      listen('tauri://file-drop', event => {
        console.log(event)
        const files:any = event.payload

        files.forEach((file:string[])=>{


          invoke('import_book', {payload:file}).then((response:any)=>{
            console.log("IMPORT BOOK RESPONSE", response)
            if(response){
              myBooksState = [...myBooksState, {title: response.title, cover_url: response.cover_url || "", progress: 0, hash:response.hash}]
              setBooks(myBooksState)
        
            }
          }).catch((err)=>{
            console.log(err)
          })
        })


      }).then((unmount)=>{
        unmountPointer.pointer = unmount
      })
    }

    return ()=> unmountPointer.pointer()

  }, [myBooks])

  useEffect(()=>{
    console.log("Home Page Loaded")
    if(window.__TAURI__){

      invoke("get_books").then((data)=>{
        setBooks((data as BookData[]))
      })
      
    }
    
    


  }, [])

  // https://stackoverflow.com/a/21002544
  const [isDragActive, setDragActive] = useState(false)


  return (
    <>
      <div data-tauri-drag-region className={styles.titleBar}>
        <div className={styles.titleBarTitle}>Alexandria</div>
        <div className={styles.searchbarContainer}>
          <Search
            viewBox="0 0 24 24 "
            height={16}
            width={16}
            style={{
              position:"absolute", 
              marginLeft:"5px",
              opacity: 0.6, 
              marginTop:"8px", 
              color:"var(--text-secondary)",
              strokeWidth:"2px"
            }} 
          />
          <input style={{paddingLeft:"26px"}} placeholder={"Search Book Titles"} className={styles.searchbarDesktop}
            onChange={(e)=>setSearchValue(e.target.value)} value={searchValue}/>

        </div>
        <div className={styles.rightContainer}>
          <Filter style={{marginRight:10, strokeWidth: 1.5, cursor:"pointer"}} onClick={()=>setBottomBarActive(!bottomBarActive)}/>
          <Link className={styles.unstyleLink} to="/settings">
            <Settings style={{strokeWidth: 1.5}}/>
          </Link>
          <TitleBarButtons/>
        </div>


        

      </div>
      <div onDragEnter={()=>{
        setDragActive(true)
      }} onDragLeave={()=>{
        setDragActive(false)
      }}
      className={`${styles.bookCase} ${isDragActive && styles.bookCaseDragging}`}>
        {
          isDragActive && <div style={{height:"100%", width:"100%", pointerEvents:"none"}}> Add book to library...</div> 
        }
        

        {myBooks
          .filter((bookObj)=> bookObj.title.toLowerCase().includes(searchValue.toLowerCase()))
          .sort((a, b) =>{ 
            if(sortDirection =="ASC"){
              return (a.title > b.title) ? 1 : -1
            }else{
              return (a.title < b.title) ? 1 : -1
            }
            
          })
          .map((book)=>{
            return (
              <Link className={styles.unstyleLink}  key={book.hash} to={"/reader/" + book.hash}>
                <div className={styles.boxPlaceholder}>

                  {/* This container is used to handle top bar in CSS in case where book is a short height */}
                  <div className={styles.bookImageContainer}>
                    <div className={styles.boxTopBar}>
                      <Boomark/>
                      <div>{Math.round(book.progress*100)}%</div>
                      <Test onClick={(e: React.MouseEvent<HTMLElement>)=>{
                        e.preventDefault()
                      }}/>
                    </div>
                    {book.cover_url?
                      <img className={styles.bookImage} style={{backgroundColor:"white"}} src={book.cover_url.startsWith("blob:")? book.cover_url: convertFileSrc(book.cover_url)}/>
                      :
                      <FakeCover title={book.title} author="author"/>
                    }
                  </div>
              
                  <div className={styles.boxBottomBar} >
                    <div>{book.title}</div>

                  </div>
                </div>
              </Link>
            )
          })}
      </div>
      <div style={!bottomBarActive?{transform:"translateY(110%)"}:{}} className={styles.bottomBar}>
        <div className={styles.bottomBarContainer}>
          <div style={{display:"flex", justifyContent: "space-between",fontSize: "14px", marginBottom:0, color:"var(--text-secondary)", fontWeight:'500'}}>
            SORT BY
            <SortIcon className={styles.optionSortButton}
              style={sortDirection=="ASC"?{transform:"scale(1,-1)"}:{}}
              onClick={()=>setSortDirection((sortDirection=="ASC"?"DESC":"ASC"))}/>
          </div>
          <div className={styles.optionContainer}>
            {["Title", "Progress", "Recently Updated"].map((item)=>{
              return (<div onClick={()=>setFilterValue(item)} className={styles.sortOption} key={item}>{item} {(item == filterValue)?<input checked readOnly type="radio"/>:<div/>}</div>)
            })}
          </div>

        </div>




      </div>
    </>

  )
}

export default Home

