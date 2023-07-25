
import styles from './FakeCover.module.scss'
import React from 'react'

type props = {
    title: string,
    author: string
}
const FakeCover = (props:props)=>{

  return (
    <div className={styles.bookContainer}>
      <div className={styles.content}>
        <div className={styles.title}>
          {props.title}
        </div>
        <div className={styles.author}>
Author
        </div>

      </div>

    </div>
  )
}


export default FakeCover