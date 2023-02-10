import React, { useCallback, useEffect, useState } from 'react'; // we need this to make JSX compile
import { Link } from "react-router-dom";

import styles from './Home.module.scss'
import Test from '@resources/feathericons/more-vertical.svg'
import Search from '@resources/feathericons/search.svg'
import Filter from '@resources/feathericons/filter.svg'
import Settings from '@resources/feathericons/settings.svg'

import Boomark from '@resources/figma/Bookmark.svg'


import moby from "@resources/images/mobydick.jpg"
import martian from "@resources/images/martian.jpg"
import four from "@resources/images/451.jpg"
import thousand from "@resources/images/1001.jpg"
import onenine from "@resources/images/1984.webp"
import af from "@resources/images/af.jpg"
import tcr6 from "@resources/images/tcr6.jpg"
import gg from "@resources/images/gg.jpg"
import jah from "@resources/images/jah.jpg"


import { convertFileSrc, invoke } from '@tauri-apps/api/tauri'
import {useDropzone, Accept} from 'react-dropzone'
import Epub from 'epubjs-myh';
import { BookOptions } from 'epubjs-myh/types/book';

const books = [
  {BookUrl: moby,
    title:"Moby Dick",
    percent: "54%"},
  {BookUrl: martian,
    title:"The Martian",
    percent: "100%"},
  {BookUrl: four,
    title:"Farhenheight 451",
    percent: "78%"},
  {BookUrl: thousand,
    title:"1001 Arabian Nights",
    percent: "0%"},
  {BookUrl: onenine,
    title:"1984",
    percent: "77%"},
  {BookUrl: af,
    title:"Animal Farm",
    percent: "2%"},
  {BookUrl: tcr6,
    title:"Tom Clancy's Rainbow Six",
    percent: "63%"},
  {BookUrl: gg,
    title:"The Great Gatsby",
    percent: "4%"},
  {BookUrl: jah,
    title:"Jeckyl and Hyde",
    percent: "43%"},
  {BookUrl: "None",
    title:"Placeholder",
    percent: "43%"},
]

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
  const [counter, setCounter] = useState(0)
  const [myBooks, setBooks] = useState<BookData[]>([])
  const onDrop = useCallback((acceptedFiles:File[]) => {
    console.log("ON DROP CALLED")
    // Do something with the files
    acceptedFiles.forEach(file => {
      if(file.type == "application/epub+zip"){
        console.log("COPYING", file.name)
        const fileReader = new FileReader();
        fileReader.onload = ()=>{
          console.log("Done Loading")

          if(!(fileReader.result instanceof ArrayBuffer)){
            console.log("Non ArrayBuffer Returned")
            return
          }

          const data = new Uint8Array(fileReader.result)
          const tt = Array.from(data)

          // The proper way of doing this is to pass Array.from(new Uint8Array(fileReader.result))
          // Then on the back end, set the type as vec<u8>
          console.log("Done Converting")
          if(window.__TAURI__){
            // https://github.com/tauri-apps/tauri/discussions/3208
            // https://github.com/tauri-apps/tauri/issues/1817
            // JSON serialization is unneccesary for binary and also slow
            // Let's convert the array into a string to avoid this
            const payload = {
              title: "",
              book: {
                name: file.name,
                data: tt
              },
              cover: {
                name: "",
                data: [0]
              }
            }


            const book = Epub(fileReader.result);
            book.ready.then(() => {
              book.coverUrl().then(async (url) => {
                if(url == null){
                  console.log("Error: No Cover Found For Book")
                  return
                }
                const response = await fetch(url);
                const data = await response.blob();
                console.log("COVER TOO")
                payload.title = book.packaging.metadata.title
                payload.cover.data = Array.from(new Uint8Array(await data.arrayBuffer()))
                invoke('import_book', {payload})
                console.log(url)

                // Todo, make setBooks contain the hash that is returned by import_book, this way the book will load properly.
                
                setBooks([...myBooks, {title: book.packaging.metadata.title, cover_url: url, progress: 0, hash:"Placeholder"}])
              });
            })

            
            
          }
        }

        fileReader.readAsArrayBuffer(file)
      }
    });
  }, [myBooks])


  useEffect(()=>{
    console.log("Home Page Loaded")
    if(window.__TAURI__){
      invoke("get_books").then((data)=>{
        setBooks((data as BookData[]))
      })
    }

  }, [])

  const {getRootProps, getInputProps, isDragActive} = useDropzone(
    {
      onDrop,
      // Disable click and keydown behavior
      noClick: true,
      noKeyboard: true
    })


  return (
    <>
      <div className={styles.titleBar}>
        <div>Alexandria</div>
        <Search/>
        <Filter/>
        <Settings/>
      </div>
      <div >
        

      </div>
      <div {...getRootProps()}
        className={styles.bookCase}>
        <input {...getInputProps()} />
        {
          isDragActive && <p> Add book to library...</p> 
        }
        {books.map((book)=>{
          return (
            <Link key={book.title} to="/reader">
              <div className={styles.boxPlaceholder}>

                {/* This container is used to handle top bar in CSS in case where book is a short height */}
                <div className={styles.bookImageContainer}>
                  <div className={styles.boxTopBar}>
                    <Boomark/>
                    <div>{book.percent}</div>
                    <Test onClick={(e: React.MouseEvent<HTMLElement>)=>{
                      e.preventDefault()
                    }}/>
                  </div>
                  <img className={styles.bookImage} src={book.BookUrl}/>
                </div>
              
                <div className={styles.boxBottomBar} >
                  <div>{book.title}</div>

                </div>
              </div>
            </Link>
          )
        })}


        {myBooks.map((book)=>{
          return (
            <Link key={book.hash} to={"/reader/" + book.hash}>
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
                  <img className={styles.bookImage} src={book.cover_url.includes("blob:")? book.cover_url: convertFileSrc(book.cover_url)}/>
                </div>
              
                <div className={styles.boxBottomBar} >
                  <div>{book.title}</div>

                </div>
              </div>
            </Link>
          )
        })}
        <button onClick={async ()=>{
          invoke("get_books").then((data)=>{
            console.log(data)
          })
        }}/>
      </div>
      
    </>

  )
}

export default Home

