import React, { useEffect, useRef, useState } from "react"
import { HexColorPicker } from "react-colorful";

import styles from './ReaderTheme.module.scss'

import UndoButton from '@resources/iconmonstr/iconmonstr-undo-7.svg'
import TrashIcon from '@resources/feathericons/trash-2.svg'
import { useAppSelector } from "@store/hooks";
import { AddReaderTheme, DeleteReaderTheme, RenameReaderTheme, UpdateReaderTheme } from "@store/slices/appState";
import { useDispatch } from "react-redux";
import { invoke } from "@tauri-apps/api";

// import styles from './Settings.module.scss'

// import BackArrow from '@resources/feathericons/arrow-left.svg'
// import { Link } from "react-router-dom"


const ReaderTheme = ()=>{
  // const sidebarOpen = useAppSelector((state) => state.bookState[0]?.state?.sidebarMenuSelected)
  // const renditionInstance = useAppSelector((state) => state.bookState[0]?.instance)
  // const dispatch = useAppDispatch()
  
  
  const [selectedTheme, changeTheme] = useState("Default Light")

  const [color, setIntialColor] = useState("#000000");
  const [pickerPosition, setPosition] = useState({x:-500, y:-500})

  const appThemes = useAppSelector((state) => state.appState.themes)

  // This will keep track of the current state of the theme
  const prevAppThemes = useRef({appThemes}).current;


  // Error Catching
  const [displayError, toggleError] = useState(false)
  const [lastValidTheme, setLastValidTheme] = useState("Default Light")

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [colorUpdater, setColorUpdater] = useState(() => () => console.log("default ooops"))


  const dispatch = useDispatch()

  // This is all to switch to the new theme
  // Clarity: This function should make it so the selected theme changes to the new theme upon creation
  useEffect(() => {
    const newThemesKeys = Object.keys(appThemes)
    const prevThemesKeys = Object.keys(prevAppThemes.appThemes)
    if(newThemesKeys.length > prevThemesKeys.length){
      const filteredArr = newThemesKeys.filter(x => !prevThemesKeys.includes(x));
      changeTheme(filteredArr[0])
      setLastValidTheme(filteredArr[0])
      return () =>{
        prevAppThemes.appThemes = appThemes
      }
    }
  }, [appThemes])

  return (
    <div className={styles.themeContainer} onClick={()=>{
      if(pickerPosition.x != -500){
        setPosition({x:-500, y:-500})
      }
    }}>
      <HexColorPicker onClick={(e)=>{
        // If the color picker is clicked, prevent the event from being propagated up to the themeContainer and the position being set offscreen
        e.stopPropagation()
      }} style={{position:"absolute", left:pickerPosition.x, top:pickerPosition.y}} color={color} onChange={(color)=>{

        // @ts-expect-error: This is some typescript + React wierdness. I don't think I can fix this.
        colorUpdater(color)
      }} />

      <div className={styles.comboContainer}>
        <div className={styles.comboContainerText}>Select Theme</div>
        <select value={selectedTheme} onChange={(e)=>{
          changeTheme(e.target.value)
          setLastValidTheme(e.target.value)
        }} className={styles.comboBox}>
          {Object.keys(appThemes).map((themeName, index)=>{
            return <option key={index} value={themeName}>{themeName}</option>
          })}
          
        </select>
        <div onClick={()=>{
          dispatch(AddReaderTheme())
          
        }} className={styles.newCombo}>New</div>
      </div>

      <div className={styles.comboContainer}>
        <div className={styles.comboContainerText}>Theme Name</div>
        <input disabled={lastValidTheme =="Default Light" || lastValidTheme == "Default Dark"} onChange={(e)=>{
          console.log(e.target.value,e.target.value.length, selectedTheme)
          console.log(appThemes)
          // TODO: FIX 0 length erorr
          if((appThemes[e.target.value] == undefined && e.target.value != selectedTheme) && e.target.value.length != 0){
            console.log("Name does not exist", e.target.value.length)
            toggleError(false)
            dispatch(RenameReaderTheme({
              oldThemeName: lastValidTheme, newThemeName: e.target.value
            }))
            setLastValidTheme(e.target.value)
          }else{
            toggleError(true)
          }
          changeTheme(e.target.value)
          
          
  
          

          
        }} value={selectedTheme} style={{display:"block"}} className={styles.comboTextBox}/>
        <div style={{color:"red", display:(displayError?"block":"none")}}>Theme name already in use !</div>
      </div>

      <div className={styles.themePropertyContainer}>
        <div className={styles.themeTargetContainer}>
          <div className={styles.themeTarget}>
            Body
          </div>
          <div className={styles.themePropertyRow}>
            <div className={styles.themePropertyName}>
              Background
            </div>
            <button disabled={lastValidTheme =="Default Light" || lastValidTheme == "Default Dark"} onClick={(e)=>{
              const bounds = e.currentTarget.getBoundingClientRect()
              setPosition({x:bounds.x - 100, y:bounds.y - (200 + 20)})
              setColorUpdater(()=>(color:string) => {
                dispatch(UpdateReaderTheme({
                  themeName: lastValidTheme,
                  theme: {body:{background:color}}
                })
                )})
              const newInitialColor = appThemes[lastValidTheme].body.background
              if(newInitialColor !== undefined){
                setIntialColor(newInitialColor)
              }
            }} style={{backgroundColor:appThemes[lastValidTheme].body.background}} className={styles.themeColor}/>
            <UndoButton onClick={()=>{
              if(lastValidTheme =="Default Light" || lastValidTheme == "Default Dark"){
                return 
              }
              dispatch(UpdateReaderTheme({
                themeName: lastValidTheme,
                theme: {body:{background:appThemes["Default Light"].body.background}}
              }))
            }} className={styles.resetButton}/>
          </div>

          <div className={styles.themePropertyRow}>
            <div className={styles.themePropertyName}>
              Color
            </div>
            <button disabled={lastValidTheme =="Default Light" || lastValidTheme == "Default Dark"} onClick={(e)=>{
              const bounds = e.currentTarget.getBoundingClientRect()
              setPosition({x:bounds.x - 100, y:bounds.y - (200 + 20)})
              setColorUpdater(()=>(color:string) => {
                dispatch(UpdateReaderTheme({
                  themeName: lastValidTheme,
                  theme: {body:{color}}
                })
                )})
              const newInitialColor = appThemes[lastValidTheme].body.color
              if(newInitialColor !== undefined){
                setIntialColor(newInitialColor)
              }
            }} style={{backgroundColor:appThemes[lastValidTheme].body.color}} className={styles.themeColor}/>
            <UndoButton onClick={()=>{
              if(lastValidTheme =="Default Light" || lastValidTheme == "Default Dark"){
                return 
              }
              dispatch(UpdateReaderTheme({
                themeName: lastValidTheme,
                theme: {body:{color:appThemes["Default Light"].body.color}}
              }))
            }} className={styles.resetButton}/>
          </div>

          
        </div>


      </div>


      <div onClick={()=>{
        console.log("Delete button pressed")
        // console.log(Object.keys(appThemes).filter((key) => key != selectedTheme)[0])
        changeTheme("Default Light")
        setLastValidTheme("Default Light")
        
        dispatch(DeleteReaderTheme(selectedTheme))
        // changeTheme(Object.keys(appThemes).filter((key) => key == selectedTheme)[0])

      }} style={{display: lastValidTheme == "Default Light" || lastValidTheme == "Default Dark"?"none":""}} className={styles.deleteButton}><TrashIcon style={{transform:"scale(1.2)", marginRight:10}}/> Delete Theme</div>
      
    </div>

  )
}


export default ReaderTheme