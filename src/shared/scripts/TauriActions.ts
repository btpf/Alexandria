import { invoke } from "@tauri-apps/api"
import { platform } from "@tauri-apps/api/os"
import { convertFileSrc } from "@tauri-apps/api/tauri"
import parser from "@shared/scripts/Parser/parser"
import epubjs from 'epubjs'

export const getBookUrlByHash = async (bookHash:string)=>{
  let bookUrl:string = await invoke("get_book_by_hash",{bookHash})
  if(await platform() == "linux"){
    const splitPath = bookUrl.split('/').slice(-4)
    // Main Issue:https://github.com/tauri-apps/tauri/issues/3725
    bookUrl = "http://127.0.0.1:16780/" + splitPath.join("/")
  }else{
    bookUrl = convertFileSrc(bookUrl)
  }
  return bookUrl
}

export const createBookInstance = async (bookUrl:string, bookHash:string, cbzLayout?:string)=>{
  
  if(bookUrl.endsWith("epub3") || bookUrl.endsWith("epub")){
    return epubjs((bookUrl as any))
  
  }else{
  
    const book = epubjs()

    // Decodes in the case that the convertFileSrc was used
    // But also works otherwise
    const fileName = (decodeURI((new URL(bookUrl.startsWith("http")? bookUrl:"file://" + bookUrl).pathname))
      .replaceAll("\\","/") // make windows paths work
      .split("/").pop() as string) // Pop the file stem
      .split(".")[0] // Get the file name without the extension
    
    const convertedValue = await parser(bookUrl, bookHash, fileName, cbzLayout)
    if(convertedValue == "error"){
      console.log("Book loading cancelled")
      return
    }
    console.log(convertedValue)
    // @ts-expect-error need to add typings
    book.openJSON(convertedValue)
    return book
  
  }
}