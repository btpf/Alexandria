import { fs, invoke } from "@tauri-apps/api"
import { platform } from "@tauri-apps/api/os"
import { convertFileSrc } from "@tauri-apps/api/tauri"
import parser from "@shared/scripts/Parser/parser"
import epubjs from '@btpf/epubjs'

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
export const SUPPORTED_FORMATS = [
  'epub','epub3', 'azw3', "azw", "mobi", 'pdb', 'prc',
  "fb2", "fbz",
  "cbz", "cbr", "cb7", "cbt",
  "txt"
]
const BACKEND_MANAGED = [
  'epub','epub3', 'azw3', "azw", "mobi", 'pdb', 'prc'
]
export const importBook = async (file:string)=>{
  const filetype = file.split(".").slice(-1)[0]
  if(!SUPPORTED_FORMATS.includes(filetype)){
    throw "Unsupported Filetype: " + file.split("/").slice(-1)[0]
    return
  }

  try {
    const response:any = await invoke('import_book', {payload:file})
    
    if(response){
      const returnData = {title: response.title, modified: response.modified, author: response.author, cover_url: response.cover_url || "", progress: 0, hash:response.hash}

      
      // If the file is not converted to an epub, we will need to do parsing on the client side
      // Here we will extract any metadata and create the cover if one exists
      if(!BACKEND_MANAGED.includes(filetype) ){



        const bookValue = await getBookUrlByHash(response.hash);
        const book = await createBookInstance(bookValue, response.hash)
        if(book == undefined){
          console.log("Book load cancelled during import")
          return
        }
        const bookData = await book.ready
        const cover = await book.coverUrl()
            
        const config_path = await invoke("get_config_path_js")
        const book_path = config_path + "/books/" + response.hash + "/"
        const coverpath =  book_path + "cover.jpg";
        let author = (book.packaging.metadata.creator as unknown as string)
        author = author? author: "unknown author"
        // console.log( book.packaging.manifest.metadata)
        const newData = {
          "author": author,
          "data": {
            "cfi": "",
            "progress": 0
          },
          "modified": Date.now(),
          "title": book.packaging.metadata.title
        }
        await fs.writeTextFile({ path:book_path + response.hash + ".json", contents:JSON.stringify(newData) });
  
  
        if(cover != null){
          const blob = await fetch(cover).then(r => r.blob());
          const contents = await blob.arrayBuffer();
          console.log("printing cover path", coverpath)
          await fs.writeBinaryFile({ path:coverpath, contents });
        }
  
  
        // Update library before destroying book instance
        returnData.cover_url = coverpath
        book.destroy()

      }

      return returnData
    
    }

    throw "No Response"
  } catch (error: any) {
    
    console.log(error)
    throw error
    // toast.error(error)
  }
}