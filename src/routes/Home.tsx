import React, { useState } from 'react'; // we need this to make JSX compile

import styles from './Home.module.css'


const Home = () =>{

  

  console.log("High level rerender")
  return (
    <>
      <Shelf/>
      Hello World
    </>
  )
} 

const Shelf = () =>{
  return (
    // <div id={styles.bookCase}>
    <div id={styles.libraryShelf}>
      <div id={styles.boxPlaceholder}></div>
      <div id={styles.boxPlaceholder}></div>
      <div id={styles.boxPlaceholder}></div>
      <div id={styles.boxPlaceholder}></div>
      <div id={styles.boxPlaceholder}></div>
      <div id={styles.boxPlaceholder}></div>
      <div id={styles.boxPlaceholder}></div>
      <div id={styles.boxPlaceholder}></div>
    </div>
    // {/* </div> */}

  )
}
const ChildComponent = () =>{
  const [counter, setCounter] = useState(0)
  console.log("Child Render")
  return (
    <div id={styles['home-button']}>
      <span>{counter}</span>
    </div>
  )
}
export default Home

