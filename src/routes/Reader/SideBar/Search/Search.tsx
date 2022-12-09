import styles from './Chapters.module.scss'
import React, { useState } from 'react'
import { NavItem, Rendition } from 'epubjs-myh';
import produce from 'immer';
import ChevronRight from '@resources/feathericons/chevron-right.svg'
import ChevronDown from '@resources/feathericons/chevron-down.svg'

import { ToggleSidebar } from '@store/slices/bookStateSlice'
import { useAppDispatch, useAppSelector } from '@store/hooks'




const Search = ()=>{
  const dispatch = useAppDispatch()
  const renditionInstance = useAppSelector((state) => state.bookState[0]?.instance)

  return (
    <div>
      <input placeholder={"Search text"} type="text" id="fname" name="fname"/>
    </div>
  )
}

export default Search