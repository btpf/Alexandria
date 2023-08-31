import React, { useCallback, useEffect, useRef, useState } from 'react'; // we need this to make JSX compile
import { Link, useNavigate } from "react-router-dom";

import styles from './Home.module.scss'
import Test from '@resources/feathericons/more-vertical.svg'
import Search from '@resources/feathericons/search.svg'
import Filter from '@resources/feathericons/filter.svg'
import Settings from '@resources/feathericons/settings.svg'

import Logo from '@resources/logo.svg'

import Font from '@resources/iconmonstr/text-3.svg'
import Article from '@resources/material/article_black_24dp.svg'
import RightArrow from "@resources/feathericons/arrow-right.svg"
import Boomark from '@resources/figma/Bookmark.svg'
import Trash from '@resources/feathericons/trash-2.svg'
import CheckCircle from '@resources/feathericons/check-circle.svg'

import { listen } from '@tauri-apps/api/event'
import { open } from '@tauri-apps/api/dialog';




import { convertFileSrc, invoke } from '@tauri-apps/api/tauri'
import Epub from 'epubjs';
import { BookOptions } from 'epubjs/types/book';
import { useAppDispatch, useAppSelector } from '@store/hooks'

import SortIcon from '@resources/iconmonstr/iconmonstr-sort-25.svg'


import TitleBarButtons  from '@shared/components/TitleBarButtons';
import FakeCover from './FakeCover/FakeCover';
import { SetDualReaderMode, SetSortSettings } from '@store/slices/appState';

import AddFiles from "@resources/feathericons/folder-plus.svg"
import toast from 'react-hot-toast';

import { platform } from '@tauri-apps/api/os';
const SUPPORTED_FORMATS = ['epub','epub3', 'azw3', "azw", "mobi", 'pdb', 'prc']
let IS_LINUX = false
interface BookData {
  author: string;
  title:string,
  progress: number,
  hash: string,
  cover_url: string,
  modified: number
}

const Home = () =>{

  return (
    <>
      <Shelf/>
    </>
  )
} 

const Shelf = () =>{

  const dispatch = useAppDispatch();
  const [searchValue, setSearchValue] = useState("")
  // const [filterValue, setFilterValue] = useState("title")
  // const [sortDirection, setSortDirection] = useState("ASC")

  const [bottomBarActive, setBottomBarActive] = useState(false)
  const sortDirection = useAppSelector((state) => state.appState.sortDirection)
  const sortBy = useAppSelector((state) => state.appState.sortBy)

  const [myBooks, setBooks] = useState<BookData[]>([])

  const [selectedBooks, setSelectedBooks] = useState<Set<string>>(new Set());

  const navigate = useNavigate();

  const importBooks = (files: any) =>{
    let myBooksState = myBooks;
    files.forEach((file:string)=>{

      if(!SUPPORTED_FORMATS.includes(file.split(".").slice(-1)[0])){
        toast.error("Unsupported Filetype: " + file.split("/").slice(-1)[0])
        return
      }

      invoke('import_book', {payload:file}).then((response:any)=>{
        
        if(response){
          myBooksState = [...myBooksState, {title: response.title, modified: response.modified, author: response.author, cover_url: response.cover_url || "", progress: 0, hash:response.hash}]
          setBooks(myBooksState)
    
        }
      }).catch((err)=>{
        console.log(err)
      })
    })
  }

  const fileOpener = async ()=>{
    const files = await open({
      multiple: true,
      filters: [{
        name: `Ebook Formats (${SUPPORTED_FORMATS.join(", ")})`,
        extensions: SUPPORTED_FORMATS
      }]
    });
    if(!files) return
    importBooks(files)
  }

  useEffect(()=>{
    const unmountPointer = {pointer:()=>{return}}
    if(window.__TAURI__){
      listen('tauri://file-drop', event => {
        console.log(event)
        const files:any = event.payload

        importBooks(files)



      }).then((unmount)=>{
        unmountPointer.pointer = unmount
      })
    }

    return ()=> unmountPointer.pointer()

  }, [myBooks])

  useEffect(()=>{
    console.log("Home Page Loaded")
    if(window.__TAURI__){
      platform().then((result)=>{
        if(result == "linux"){
          IS_LINUX = true
        }
        invoke("get_books").then((data)=>{
          setBooks((data as BookData[]))
        })
      })


      
    }
    
    


  }, [])

  // https://stackoverflow.com/a/21002544
  const [isDragActive, setDragActive] = useState(false)
  let mouseDownTime = new Date();
  const [mouseWasHeld, setMouseWasHeld] = useState(false)
  const holdClickTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const titleBarHotTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // This is used to handle a bug where double clicking on the titlebar to maximize it will cause
  // a book to be selected/opened
  const [isTitlebarHot, setHotTitlebar] = useState(false)

  return (
    <>
      <div onMouseDown={()=>{
        setHotTitlebar(true)
        if(titleBarHotTimeout.current){
          clearTimeout(titleBarHotTimeout.current)
        }
        titleBarHotTimeout.current = setTimeout(()=>{
          setHotTitlebar(false)
          titleBarHotTimeout.current = null
        }, 1000)

      }} data-tauri-drag-region className={styles.titleBar}>
        
        <div className={styles.titleBarLogo}>
          <Logo viewBox="0 0 24 24" height={25} />
          <div className={styles.titleBarTitle}>Alexandria</div>
        </div>
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
          <Link state={{ backPath: false }} className={styles.unstyleLink} to="/settings">
            <Settings style={{strokeWidth: 1.5}}/>
          </Link>
          <TitleBarButtons/>
        </div>


        

      </div>

      <div style={(selectedBooks.size > 1)?{}:{display:"none"}} className={styles.multiSelectMenuContainer}>
        
        
        {
          selectedBooks.size == 2? 
       
            <div style={{marginLeft:15, cursor:"pointer"}} onClick={()=>{
              const booksArray = Array.from(selectedBooks)
              const navPath = "/reader/" + booksArray[0] + "/" + booksArray[1]
              dispatch(SetDualReaderMode(true))
              navigate(navPath)
            }}>Dual Reader (Experimental)</div>

            :
            <></>}


        <div onClick={()=>setSelectedBooks(new Set([]))} 
          style={{marginLeft:"auto", height:18, width:18, border:"1px solid var(--text-secondary)", borderRadius:2, marginRight:5, cursor:"pointer"}}></div>
        <Trash
          className={styles.multiSelectDelete} style={{color:"red", cursor:"pointer"}}
          onClick={()=>{
            for(const checksum of selectedBooks){
              console.log(checksum)
              invoke("delete_book",{checksum})
            }
            invoke("get_books").then((data)=>{
              setBooks((data as BookData[]))
            })
            
            setSelectedBooks(new Set([]))
          }}
        />
      </div>


      <div onDragEnter={()=>{
        setDragActive(true)
      }} onDragLeave={()=>{
        setDragActive(false)
      }}
      className={`${styles.bookCase} ${isDragActive && styles.bookCaseDragging}`}
      style={(selectedBooks.size > 1)?{marginTop:35}:{}}
      >
        {
          isDragActive && <div style={{height:"100%", width:"100%", pointerEvents:"none"}}> Add book to library...</div> 
        }
        
        {(myBooks.length==0)&&<div onClick={fileOpener} className={styles.getStarted}>
          <div>
            <AddFiles viewBox="0 0 24 24"/><br/><br/><div>Drag & drop your books to get started</div>
          </div>
          
          
          
        </div>}

        {myBooks
          .filter((bookObj)=> bookObj.title.toLowerCase().includes(searchValue.toLowerCase()))
          .sort((a, b) =>{ 
            if(sortDirection =="ASC"){
              return (a[sortBy] > b[sortBy]) ? 1 : -1
            }else{
              return (a[sortBy] < b[sortBy]) ? 1 : -1
            }
            
          })
          .map((book)=>{

            const isBookSelected = selectedBooks.has(book.hash)
            return (
              <div key={book.hash} className={styles.boxPlaceholder}
                onMouseDown={()=>{
                  if(isTitlebarHot) return
                  clearTimeout((holdClickTimeout.current as NodeJS.Timeout))
                  mouseDownTime = new Date();
                  const timeMs = mouseDownTime.getTime();
                  holdClickTimeout.current = setTimeout(()=>{
                    if(mouseDownTime.getTime() == timeMs){
                      setMouseWasHeld(true)
                      setSelectedBooks(new Set([...selectedBooks, book.hash]))
                    }
                  }, 500)
                }}
                onMouseUp={()=>{
                  if(isTitlebarHot) return


                  clearTimeout((holdClickTimeout.current as NodeJS.Timeout))
                  
                  

                  if(mouseWasHeld){
                    setMouseWasHeld(false)
                    return
                  }

                  if(selectedBooks.size >= 1){
                    if(isBookSelected){
                      setSelectedBooks(new Set([...selectedBooks].filter((item)=> item != book.hash)))
                    }else{
                      setSelectedBooks(new Set([...selectedBooks, book.hash]))
                    }
                    return
                  }
                  const navPath = "/reader/" + book.hash
                  navigate(navPath)
                  
                }}
              >

                {/* This container is used to handle top bar in CSS in case where book is a short height */}
                <div className={styles.bookImageContainer}>
                  <div className={styles.boxTopBar}>
                    <Boomark/>
                    <div>{Math.round(book.progress*100)}%</div>
                    <Test onMouseDown={(e)=>{
                      e.preventDefault()
                      e.stopPropagation()
                    }} onMouseUp={(e: React.MouseEvent<HTMLElement>)=>{
                      clearTimeout((holdClickTimeout.current as NodeJS.Timeout))
                      e.preventDefault()
                      e.stopPropagation()
                      setSelectedBooks(new Set([...selectedBooks, book.hash]))

                        
                    }}/>
                  </div>
                  <div style={(isBookSelected && selectedBooks.size < 2)?{}:{display:"none"}} onClick={(e)=>e.preventDefault()} className={styles.bookOptionsMenu}>

                    <div
                      onMouseDown={(e)=>e.stopPropagation()}
                      onMouseUp={(e)=>{
                        e.preventDefault()
                        e.stopPropagation()
                        
                      }} onClick={()=>{
                        setSelectedBooks(new Set([...selectedBooks].filter((item)=> item != book.hash)))
                      }} className={styles.bookOptionsReturn}><div>Back</div> <div><RightArrow/></div></div>
                    <div onClick={()=> navigate("/info/" + book.hash)} className={styles.bookOptionsInfo}>Info</div>
                    <div onClick={()=>{
                      invoke("delete_book",{checksum:book.hash})
                                  
                      setSelectedBooks(new Set([...selectedBooks].filter((item)=> item != book.hash)))
                      invoke("get_books").then((data)=>{
                        setBooks((data as BookData[]))
                      })
                    }} className={styles.bookOptionsRemove}>Remove Book</div>
                  </div>
                  <div style={(isBookSelected && selectedBooks.size > 1)?{}:{display:"none"}} onClick={(e)=>e.preventDefault()} className={styles.bookOptionsMenu}>

                    <div className={styles.multiSelectCircleContainer}>
                      <CheckCircle viewBox="0 0 24 24"/>
                    </div>
                  </div>

                  {book.cover_url?
                    <img className={styles.bookImage} style={{backgroundColor:"white"}} src={IS_LINUX? "http://127.0.0.1:16780/" + book.cover_url.split('/').slice(-4).join("/"): convertFileSrc(book.cover_url)}/>
                    :
                    <FakeCover title={book.title} author={book.author}/>
                  }
                    
                </div>
              
                <div className={styles.boxBottomBar} >
                  <div>{book.title}</div>

                </div>
              </div>
            )
          })}

        {(myBooks.length>0)&&<div className={styles.placeholderBook} onClick={fileOpener} ><AddFiles viewBox="0 0 24 24"/></div>}
      </div>
      <div style={bottomBarActive?{}:{display:"none"}} className={styles.sortOffOverlay} onClick={()=>{
        setBottomBarActive(false)
      }}/>
      <div style={!bottomBarActive?{transform:"translateY(110%)"}:{}} className={styles.bottomBar}>
        <div className={styles.bottomBarContainer}>
          <div style={{display:"flex", justifyContent: "space-between",fontSize: "14px", marginBottom:0, color:"var(--text-secondary)", fontWeight:'500'}}>
            SORT BY
            <SortIcon className={styles.optionSortButton}
              style={sortDirection=="ASC"?{transform:"scale(1,-1)"}:{}}
              onClick={()=> dispatch(SetSortSettings({sortDirection:(sortDirection=="ASC"?"DESC":"ASC"), sortBy: sortBy}))}/>
          </div>
          
          <div className={styles.optionContainer}>
            {["Title", "Progress", "Recently Opened"].map((item)=>{
              const updateMapping = {
                "Title": "title",
                "Progress": "progress",
                "Recently Opened": "modified"
              }

              return (<div onClick={()=>
              {
                dispatch(SetSortSettings({sortDirection, sortBy: updateMapping[item]}))
              }
              } className={styles.sortOption} style={(updateMapping[item] == sortBy)?{fontWeight:"bold"}:{}} key={item}>{item}</div>)
            })}
          </div>

        </div>




      </div>
    </>

  )
}

export default Home

