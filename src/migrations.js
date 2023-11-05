/* eslint-disable no-fallthrough */
import {readTextFile, writeTextFile } from '@tauri-apps/api/fs';
import {invoke} from '@tauri-apps/api'
let config_path = undefined
export default async function performMigrations(){
  config_path = await invoke("get_config_path_js")
  await migrateFonts()

}


const migrateFonts = async ()=>{
  const json_path = config_path + "/fonts/fonts.json"
  let jsonText = await readTextFile(json_path)

  //Handle case where we have only empty brackets
  if(jsonText.length < 2) return 
  let json = JSON.parse(jsonText);
  console.log(jsonText)
  const version = json?.version

  switch(version){

  case undefined:
  // This is initial case where the version is undefined
    {
      let jsonNew = {fonts:{}}

      if(json.fonts && json.fonts.fontMap){
        jsonNew.fonts = json.fonts.fontMap
      }
  
      jsonNew.version = "0.11"
      json = jsonNew
    }
    console.log("Migrating fonts.json: 0.10 -> 0.11")
  case "0.11":
    // case 0.11 means we are catching this case, and converting it to the next version.
    console.log("json is up to date")
      
  }

  // If no changes were made, return
  if(json.version == version){
    return 
  }
  await writeTextFile(json_path, JSON.stringify(json, null, 2))
}