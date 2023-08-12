import React, { useEffect, useRef, useState } from "react"
import { HexColorInput, HexColorPicker } from "react-colorful";

import styles from './ReaderTheme.module.scss'

import UndoButton from '@resources/iconmonstr/iconmonstr-undo-7.svg'
import TrashIcon from '@resources/feathericons/trash-2.svg'
import { useAppSelector } from "@store/hooks";
import {  AddTheme, DeleteTheme, RenameTheme, setSelectedTheme, UpdateTheme } from "@store/slices/appState";
import { useDispatch } from "react-redux";
// import { invoke } from "@tauri-apps/api";

import { ThemeType, uiTheme } from "@store/slices/AppState/globalThemes";
import { GetAllKeys } from "@store/utlity";
import TitleBarButtons from "@shared/components/TitleBarButtons";


import ExitIcon from '@resources/figma/Exit.svg'
import MaximizeIcon from '@resources/figma/Maximize.svg'
import MinimizeIcon from '@resources/figma/Minimize.svg'
import Bookmark from '@resources/feathericons/bookmark.svg'
import List from '@resources/feathericons/list.svg'
import Search from '@resources/feathericons/search.svg'
import Font from '@resources/iconmonstr/text-3.svg'
import ArrowLeft from '@resources/feathericons/arrow-left.svg'
import ArrowRight from '@resources/feathericons/arrow-right.svg'
import HomeIcon from '@resources/feathericons/home.svg'
import PreviewWidget from "./PreviewWidget/PreviewWidget";
import Copy from '@resources/iconmonstr/iconmonstr-copy-9.svg'

// import styles from './Settings.module.scss'

// import BackArrow from '@resources/feathericons/arrow-left.svg'
// import { Link } from "react-router-dom"
const uiOptions = [
  {path:["ui","primaryBackground"], label: "Primary Background"},
  {path:["ui","secondaryBackground"], label: "Secondary Background"},
  {path:["ui","tertiaryBackground"], label: "Tertiary Background"},
  {path:["ui","primaryText"], label: "Primary Text"},
  {path:["ui","secondaryText"], label: "Secondary Text"}
]

const readerOptions = [
  {path:["reader","body", "color"], label: "Color"},
  {path:["reader","body", "background"], label: "Background Color"},
  {path:["reader","body", "link"], label: "Link Color"},
  // {path:["reader","primaryText"], label: "Primary Text"},
  // {path:["reader","secondaryText"], label: "Secondary Text"}
]

const GlobalTheme = ()=>{
  // const sidebarOpen = useAppSelector((state) => state.bookState[0]?.state?.sidebarMenuSelected)
  // const renditionInstance = useAppSelector((state) => state.bookState[0]?.instance)
  // const dispatch = useAppDispatch()
  
  
  const [selectedTheme, changeTheme] = useState("Default Light")

  const [color, setIntialColor] = useState("#000000");
  const [pickerPosition, setPosition] = useState({x:-500, y:-500})

  const appThemes = useAppSelector((state) => state.appState.themes)
  const defaultSelectedTheme = useAppSelector((state) => state.appState.selectedTheme)

  // This will keep track of the current state of the theme
  const prevAppThemes = useRef({appThemes}).current;


  // Error Catching
  const [displayError, toggleError] = useState(false)
  const [lastValidTheme, setLastValidTheme] = useState("Default Light")

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [colorUpdater, setColorUpdater] = useState(() => () => console.log("default ooops"))


  const dispatch = useDispatch()

  useEffect(()=>{
    changeTheme(defaultSelectedTheme)
    setLastValidTheme(defaultSelectedTheme)
  },[])

  // This is all to switch to the new theme
  // Clarity: This function should make it so the selected theme changes to the new theme upon creation
  useEffect(() => {
    const newThemesKeys = Object.keys(appThemes)
    const prevThemesKeys = Object.keys(prevAppThemes.appThemes)
    if(newThemesKeys.length > prevThemesKeys.length){
      const filteredArr = newThemesKeys.filter(x => !prevThemesKeys.includes(x));
      changeTheme(filteredArr[0])
      setLastValidTheme(filteredArr[0])
      dispatch(setSelectedTheme(filteredArr[0]))
    }
    return () =>{
      prevAppThemes.appThemes = appThemes
    }
  }, [appThemes])

  const readerColor = (readerOptions[0].path as GetAllKeys<ThemeType>[]).reduce((themeObjLevel:any, pathNavigate) => themeObjLevel[pathNavigate], appThemes[lastValidTheme])
  const readerBackgroundColor = (readerOptions[1].path as GetAllKeys<ThemeType>[]).reduce((themeObjLevel:any, pathNavigate) => themeObjLevel[pathNavigate], appThemes[lastValidTheme])


  const isDefaultTheme = lastValidTheme == "Default Light" || lastValidTheme == "Default Dark"


  const OrderedAppThemeKeys = Object.keys(appThemes);
  const idxoflight = OrderedAppThemeKeys.indexOf("Default Light");
  [ OrderedAppThemeKeys[0], OrderedAppThemeKeys[idxoflight] ] = [ OrderedAppThemeKeys[idxoflight],OrderedAppThemeKeys[0] ];
  const idxofdark = OrderedAppThemeKeys.indexOf("Default Dark");
  [ OrderedAppThemeKeys[1], OrderedAppThemeKeys[idxofdark] ] = [ OrderedAppThemeKeys[idxofdark], OrderedAppThemeKeys[1] ];

  let ignoreMouseUp = false
  return (
    <div className={styles.themeContainer} onClick={()=>{
      if(ignoreMouseUp){
        ignoreMouseUp = false
        return
      }
      if(pickerPosition.x != -500){
        setPosition({x:-500, y:-500})
      }
    }}>

      <div onMouseDown={()=>{
        ignoreMouseUp = true
      }} onMouseUp={()=>ignoreMouseUp=false} onClick={(e)=>{
        e.stopPropagation()
      }} className={styles.colorPickerContainer} style={{left:pickerPosition.x, top:pickerPosition.y}}>
        <HexColorPicker onClick={(e)=>{
        // If the color picker is clicked, prevent the event from being propagated up to the themeContainer and the position being set offscreen
          e.stopPropagation()
        }}  color={color} onChange={(color)=>{

          // @ts-expect-error: This is some typescript + React wierdness. I don't think I can fix this.
          colorUpdater(color)
          setIntialColor(color)
        }} />
        <HexColorInput color={color} onClick={(e)=>{
        // If the color picker is clicked, prevent the event from being propagated up to the themeContainer and the position being set offscreen
          e.stopPropagation()
        }}  onChange={(color)=>{

          // @ts-expect-error: This is some typescript + React wierdness. I don't think I can fix this.
          colorUpdater(color)
          setIntialColor(color)
        }} />
      </div>

      <PreviewWidget readerOptions={readerOptions}/>






      <div className={styles.comboContainer}>



        <div style={!isDefaultTheme?{marginLeft: "calc(55px + 16px - 1px)"}:{}} className={styles.comboContainerText}>Selected Theme</div>


        <div onClick={()=>{
          console.log("Delete button pressed")
          const AppThemesList = Object.keys(appThemes)
          const themeBefore = AppThemesList.at( AppThemesList.indexOf(selectedTheme) - 1)
          if(themeBefore == undefined){
            console.log("Undefined Error In Delete Theme Button")
            return
          }
          changeTheme(themeBefore)
          setLastValidTheme(themeBefore)
        
          dispatch(DeleteTheme(selectedTheme))
          dispatch(setSelectedTheme(themeBefore))
          // changeTheme(Object.keys(appThemes).filter((key) => key == selectedTheme)[0])

        }} style={{display: isDefaultTheme?"none":""}} 
        className={styles.deleteButton}>
          <TrashIcon/>
        </div>

        <select value={selectedTheme} onChange={(e)=>{
          changeTheme(e.target.value)
          setLastValidTheme(e.target.value)
          dispatch(setSelectedTheme(e.target.value))
        }} className={styles.comboBox}>
          {OrderedAppThemeKeys.map((themeName, index)=>{
            return <option key={index} value={themeName}>{themeName}</option>
          })}
          
        </select>
        <div onClick={()=>{
          dispatch(AddTheme())
        }} className={styles.newCombo} style={isDefaultTheme?{marginRight:"calc(-55px - 16px + 1px)"}:{}}><Copy/></div>
      </div>

      <div className={styles.comboContainer}>
        <div className={styles.comboContainerText}>Theme Name</div>
        <input disabled={isDefaultTheme} onChange={(e)=>{
          console.log(e.target.value,e.target.value.length, selectedTheme)
          console.log(appThemes)
          // TODO: FIX 0 length erorr
          if((appThemes[e.target.value] == undefined && e.target.value != selectedTheme) && e.target.value.length != 0){
            console.log("Name does not exist", e.target.value.length)
            toggleError(false)
            dispatch(RenameTheme({
              oldThemeName: lastValidTheme, newThemeName: e.target.value
            }))
            dispatch(setSelectedTheme(e.target.value))
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
            UI Theme Settings
          </div>


          {uiOptions.map((item)=>{
            const currentThemeColor = (item.path as GetAllKeys<ThemeType>[]).reduce((themeObjLevel:any, pathNavigate) => themeObjLevel[pathNavigate], appThemes[lastValidTheme])
            return (
              <div key={item.path.reduce((a, c) => a + c)} className={styles.themePropertyRow}>
                <div className={styles.themePropertyName}>
                  {item.label}
                </div>
                <button disabled={isDefaultTheme} onClick={(e)=>{
                  type GuaranteeKeySafety = keyof uiTheme

                  const bounds = e.currentTarget.getBoundingClientRect()
                  setPosition({x:bounds.x - 90, y:bounds.y - (250 + 5)})
                  setColorUpdater(()=>(color:string) => {
                    dispatch(UpdateTheme({
                      themeName: lastValidTheme,
                      newColor: color,
                      path: item.path
                    })
                    )})
                  const newInitialColor = currentThemeColor
                  if(newInitialColor !== undefined){
                    setIntialColor(newInitialColor)
                  }
                }} style={{backgroundColor:currentThemeColor}} className={styles.themeColor}/>
                <UndoButton onClick={()=>{
                  if(isDefaultTheme){
                    return 
                  }

                  const defaultValue = (item.path as GetAllKeys<ThemeType>[]).reduce((themeObjLevel:any, pathNavigate) => themeObjLevel[pathNavigate], appThemes["Default Light"])
                  dispatch(UpdateTheme({
                    themeName: lastValidTheme,
                    newColor: defaultValue,
                    path: item.path
                  }))
                }} className={styles.resetButton}/>
              </div>
            )
          })}
          

          

          
        </div>




        <div className={styles.themeTargetContainer}>
          <div className={styles.themeTarget}>
            Book Theme Settings
          </div>


          {readerOptions.map((item)=>{
            const currentThemeColor = (item.path as GetAllKeys<ThemeType>[]).reduce((themeObjLevel:any, pathNavigate) => themeObjLevel[pathNavigate], appThemes[lastValidTheme])
            return (
              <div key={item.path.reduce((a, c) => a + c)} className={styles.themePropertyRow}>
                <div className={styles.themePropertyName}>
                  {item.label}
                </div>
                <button disabled={isDefaultTheme} onClick={(e)=>{
                  type GuaranteeKeySafety = keyof uiTheme

                  const bounds = e.currentTarget.getBoundingClientRect()
                  setPosition({x:bounds.x - 90, y:bounds.y - (250 + 5)})
                  setColorUpdater(()=>(color:string) => {
                    dispatch(UpdateTheme({
                      themeName: lastValidTheme,
                      newColor: color,
                      path: item.path
                    })
                    )})
                  const newInitialColor = currentThemeColor
                  if(newInitialColor !== undefined){
                    setIntialColor(newInitialColor)
                  }
                }} style={{backgroundColor:currentThemeColor}} className={styles.themeColor}/>
                <UndoButton onClick={()=>{
                  if(isDefaultTheme){
                    return 
                  }

                  const defaultValue = (item.path as GetAllKeys<ThemeType>[]).reduce((themeObjLevel:any, pathNavigate) => themeObjLevel[pathNavigate], appThemes["Default Light"])
                  dispatch(UpdateTheme({
                    themeName: lastValidTheme,
                    newColor: defaultValue,
                    path: item.path
                  }))
                }} className={styles.resetButton}/>
              </div>
            )
          })}

          <div style={{marginLeft:10}}>Image Settings</div>
          <div className={styles.themePropertyRow}>
            <div className={styles.themePropertyName}>
            Invert Images 
            </div>
            <input disabled={isDefaultTheme} type="radio" onChange={()=>null} onClick={()=>{
              const checkValue = appThemes[lastValidTheme]?.reader?.image?.invert || false
              dispatch(UpdateTheme({
                themeName: lastValidTheme,
                newColor: !checkValue,
                path: ["reader","image","invert"]
              }))
            }} checked={appThemes[lastValidTheme]?.reader?.image?.invert || false} style={{width:"25px", height:"25px"}} />
          </div>
          
          
          <div className={styles.themePropertyRow}>
            <div style={{width:"auto"}} className={styles.themePropertyName}>
            Mix-blend mode
            </div>
            <select disabled={isDefaultTheme} onChange={(e)=>{
              const val = e.target.value
              dispatch(UpdateTheme({
                themeName: lastValidTheme,
                newColor: val,
                path: ["reader","image","mixBlendMode"]
              }))
            }} value={appThemes[lastValidTheme]?.reader?.image?.mixBlendMode} style={{width:"auto", marginLeft:"auto"}} className={styles.comboBox}>
              <option value={""}>None</option>
              <option value={"difference"}>Difference</option>
              <option value={"screen"}>Screen</option>
              <option value={"color-dodge"}>Color-Dodge</option>
              <option value={"exclusion"}>Exclusion</option>
              <option value={"lighten"}>lighten</option>
              <option value={"multiply"}>Multiply</option>
          
            </select>
          </div>
          

          
        </div>
      </div>



      
    </div>

  )
}


export default GlobalTheme