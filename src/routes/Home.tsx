import React, { useState } from 'react'; // we need this to make JSX compile

import styles from './Home.module.css'


const Home = () =>{

  

  console.log("High level rerender")
  return (
    <div>
      <Shelf/>
      Hello World
    </div>
  )
} 

const Shelf = () =>{
  return (
    <div id={styles.libraryShelf}>
      shelf
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

