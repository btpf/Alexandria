import React, { useState } from 'react'; // we need this to make JSX compile

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
    title:"Jeckyl and Hyde",
    percent: "43%"},
                  
                
      
]

const Home = () =>{

  return (
    <>
      <Shelf/>
    </>
  )
} 

const Shelf = () =>{
  const [counter, setCounter] = useState(0)

  return (
    <>
      <div className={styles.titleBar}>
        <div>Alexandria</div>
        <Search/>
        <Filter/>
        <Settings/>
      </div>

      <div className={styles.bookCase}>

        {books.map((book)=>{
          return (      
            <div key={book.title} className={styles.boxPlaceholder}>

              {/* This container is used to handle top bar in CSS in case where book is a short height */}
              <div className={styles.bookImageContainer}>
                <div className={styles.boxTopBar}>
                  <Boomark/>
                  <div>{book.percent}</div>
                  <Test onClick={()=>{setCounter(counter + 1)}}/>
                </div>
                <img className={styles.bookImage} src={book.BookUrl}/>
              </div>
              
              <div className={styles.boxBottomBar} >
                <div>{book.title}</div>

              </div>
            </div>
          )
        })}

      </div>
      
    </>

  )
}

export default Home

