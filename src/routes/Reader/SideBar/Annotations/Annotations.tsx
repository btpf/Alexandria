import styles from './Chapters.module.scss'
import React, { useState } from 'react'

import { useAppDispatch, useAppSelector } from '@store/hooks'


const Annotations = ()=>{
  const dispatch = useAppDispatch()
  
  const annotations = useAppSelector((state) => state.bookState[0]?.data.highlights)

  return (
    <div>
      {Object.keys(annotations).map((key)=>{
        return (
          <div key={key}> {key} </div>
        )
      })}
    </div>
  )
}

export default Annotations