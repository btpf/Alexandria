import React, { useEffect, useState } from "react"
import { Virtuoso } from 'react-virtuoso'

import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import styles from './../FontsTheme.module.scss'

import SaveIcon from '@resources/iconmonstr/iconmonstr-save-14.svg'
import TashIcon from '@resources/feathericons/trash-2.svg'
import { invoke } from "@tauri-apps/api";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import toast, { Toaster } from 'react-hot-toast';

import webfonts from '../../../../../../public/resources/webfonts.json'
const myStyle = webfonts.items.map((item) => { return {name:item.family, link:item.files.regular,menu:item.menu, files: item.files}})

// import styles from './Settings.module.scss'

// import BackArrow from '@resources/feathericons/arrow-left.svg'
// import { Link } from "react-router-dom"
const defaultMarks = [100,200,300,400,500,600,700,800].reduce((a, v)=>{
  
  return {...a, ...{
    [v]:{label: <div style={{fontWeight:v}}>{v}</div>}
  }}
  
},{})

const Downloader = (props:any)=>{
  const [textFiltered, setTextFilter] = useState("")
  const [currentDataList, setCurrentDataList] = useState(myStyle)
  const [selectedFont, setSelectedFont] = useState("Roboto")
  const [selectedWeight, setSelectedWeight] = useState(500)
  const [availableMarks, setAvailableMarks] = useState(defaultMarks)
  return (
    <>
      <div className={styles.pageTitle}>Font Downloader</div>
      <div className={styles.fontPreviewText}>Font Preview: </div>
      <div className={styles.fontRow}>
        <div></div>
        <div style={{fontFamily:selectedFont, fontWeight: selectedWeight}}>{selectedFont}</div> <SaveIcon onClick={async ()=>{

          const found = currentDataList.find(element => element.name == selectedFont);
          console.log("Hi")
          const myFiles = found.files;
          if (myFiles["regular"] != undefined){
            myFiles["400"] = myFiles["regular"]
            delete myFiles["regular"]
          }

          console.log(myFiles)
          let promiseResolve:any, promiseReject:any;

          const toastPromise = new Promise(function(resolve, reject){
            promiseResolve = resolve;
            promiseReject = reject;
          });
          toast.promise(toastPromise, {
            loading: 'Downloading Font',
            success: 'Font Downloaded Successfully',
            error: 'Error occurred when fetching',
          });
          const myFileKeys = Object.keys(myFiles)
          let myFileCount = myFileKeys.filter((item)=> !item.includes("italic")).length;

          myFileKeys.forEach((weight)=>{
            if(weight.includes("italic")) {return}

            invoke("download_font", {url:myFiles[weight], name: selectedFont, weight: "" + weight}).then(()=>{
              console.log("Font Download Success", myFileCount)
              
              myFileCount -= 1
              if(myFileCount == 0){
                promiseResolve()
              }
            }).catch((e)=>{
              console.log("Font Download Failed:", e)
              promiseReject()
            })
          })



          // invoke("download_font", {url:fontUrl, name: selectedFont, weight: "" + selectedWeight})

        }}/>
      </div>
      <div className={styles.sliderContainer}>
      
        <link href={`https://fonts.googleapis.com/css2?family=${selectedFont}:wght@${Object.keys(availableMarks).reduce((a, v)=>{return (a==""? a + v: a + ";" + v)},"")}&display=swap`} rel="stylesheet"></link>
        
        <div style={{height:25, "visibility":Object.keys(availableMarks).length == 1?"hidden":"visible"}}>
          <Slider
            marks={availableMarks}
            min={Math.min(...Object.keys(availableMarks).map((item)=> parseInt(item)))}
            className={styles.slider}
            step={null}
            onChange={(e)=>{
              if(typeof e === "number"){
                // dispatch(SetProgress({view: 0, progress: e/1000}))
                setSelectedWeight(e)
              }

            }}
            value={selectedWeight}
            max={Math.max(...Object.keys(availableMarks).map((item)=> parseInt(item)))}/>
        </div>

      </div>

      {/* </div> */}
      <div className={styles.comboContainer}>
        <div className={styles.comboContainerText}>Font Name</div>
        <input onChange={(e)=>{
          console.log(e.target.value,e.target.value.length)
          setTextFilter(e.target.value)
          setCurrentDataList(myStyle.filter((item)=>item.name.toLowerCase().includes(e.target.value.toLowerCase())))
        }} value={textFiltered} style={{display:"block"}} className={styles.comboTextBox}/>
      </div>


      <div className={styles.listContainer}>

        <Virtuoso style={{ height: '100%' }} totalCount={currentDataList.length} itemContent={index => {
          return (<div>
            <div onClick={()=> {
              setSelectedFont(currentDataList[index].name)
              console.log(Object.keys(currentDataList[index].files))
              const mapped = Object.keys(currentDataList[index].files).reduce((a, v)=>{
                if(v.includes("italic")){
                  return a
                }
                return {...a, ...{
                  [v=="regular"?400:v]:{label: <div style={{fontWeight:v}}>{v}</div>}
                }}
                
              },{})
              console.log(mapped)
              setAvailableMarks(mapped)
              setSelectedWeight(400)
            }}
            style={
              {textAlign:"center",
                fontWeight:(selectedFont == currentDataList[index].name? "bold":""), 
                backgroundColor:(selectedFont == currentDataList[index].name? "var(--background-secondary)":""), 
                border:(selectedFont == currentDataList[index].name? "2px solid var(--background-primary)":""), 
                fontFamily:currentDataList[index].name}
              
            }>{currentDataList[index].name}
              <style>
                {`@font-face {
    font-family: ${currentDataList[index].name};
    src: url(${currentDataList[index].menu.replace("http","https")});
}`}
              </style>
              {/* <link href={`https://fonts.googleapis.com/css2?family=${currentDataList[index].name.replace(" ","+")}&display=swap`} rel="stylesheet"></link> */}
            </div>
            
          </div>)}} />

        
      </div>
      <div onClick={()=>props.changePage()} className={styles.fontDownloaderButton}>Installed Fonts</div>
    </>
  )
}


export default Downloader