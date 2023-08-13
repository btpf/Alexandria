import React, { useEffect, useRef, useState } from "react"
import { HexColorInput, HexColorPicker } from "react-colorful";

import styles from './PreviewWidget.module.scss'

import UndoButton from '@resources/iconmonstr/iconmonstr-undo-7.svg'
import TrashIcon from '@resources/feathericons/trash-2.svg'
import { useAppSelector } from "@store/hooks";
import {  AddTheme, DeleteTheme, RenameTheme, setSelectedTheme, UpdateTheme } from "@store/slices/appState";
import { useDispatch } from "react-redux";
import { invoke } from "@tauri-apps/api";
import { open } from '@tauri-apps/api/shell'

import { ThemeType, uiTheme } from "@store/slices/AppState/globalThemes";
import { GetAllKeys } from "@store/utlity";
import packageInfo from '../../../../package.json';
import Logo from '@resources/logo.svg'


const About = ()=>{
  



  return (

    <div style={{marginTop:"200px", display:"flex", alignItems:"center", justifyContent:"center"}}>
      <div style={{display:"flex", gap:20}}>
        <Logo viewBox="0 0 24 24" height={115} width={115}/>
        <div style={{marginTop:0,display:"flex", flexDirection:'column', justifyContent:"center", alignItems:"middle"}}>
          <div style={{fontSize:34, fontWeight:700}}>Alexandria</div>
          <div style={{display:"flex", width:"100%", justifyContent:"space-around"}}>
            <div style={{color:"blue",cursor:"pointer", fontSize:14, marginTop:-10, textAlign:"left"}}
              onClick={()=>{open("https://github.com/btpf/Alexandria")}}
            >Github</div>

            <div style={{fontSize:14, marginTop:-10, textAlign:"left"}}>Website</div>

          </div>
          <div style={{textAlign:"center"}}> Version {packageInfo.version}</div>
          <div style={{marginTop:0}}>Created By Bret Papkoff</div>
        </div>
        <Logo viewBox="0 0 24 24" height={115} width={115}/>
      </div>
        

    </div>


   
  )
}


export default About