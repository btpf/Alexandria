import React, { useState } from 'react'; // we need this to make JSX compile

import styles from './Home.module.css'

type CardProps = {
  title?: string,
  paragraph?: string
}

const home = ({ title, paragraph }: CardProps) =>{
  const [counter, setCounter] = useState(0)

  return (
    <aside>
      {/* <h2>{ title }</h2>
  <p>
    { paragraph }
  </p> */}
      <div id={styles.homeButton} onClick={()=>{console.log("test");setCounter(counter + 1)}}>
      Hello World = {counter}
      </div>
  
    </aside>
  )
} 

export default home

