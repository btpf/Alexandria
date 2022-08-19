import React, { useState } from 'react'; // we need this to make JSX compile

import styles from './Home.module.scss'

const Home = () =>{

  return (
    <>
      <Shelf/>
      Hello World
    </>
  )
} 

const Shelf = () =>{
  return (
    <div className={styles.bookCase}>
      hi
      <div className={styles.boxPlaceholder}></div>
      <div className={styles.boxPlaceholder}></div>
      <div className={styles.boxPlaceholder}></div>
      <div className={styles.boxPlaceholder}></div>
      <div className={styles.boxPlaceholder}></div>
    </div>
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

