
import { webpubFromComicBookArchive } from "./formats/comicbook"
import { webpubFromFB2, webpubFromFB2Zip } from "./formats/fb2"
import { webpubFromText } from "./formats/plaintext";

export default async (uri:string, checksum:string, filename:string) =>{
  const filestem = uri.split('/').pop();
  if(!filestem){
    console.log("filestem parsing error", filestem)
    return "error"
  }
  const fileExtension = filestem.split('.').pop()

  switch(fileExtension){
  case "txt":
    return await webpubFromText(uri, filename, checksum)
  case "fb2":
    return await webpubFromFB2(uri, filename, checksum)
  case "fb2.zip":
  case "fbz":
    return await webpubFromFB2Zip(uri, filename, checksum)
  case "cbz":
    return await webpubFromComicBookArchive(uri, fileExtension, "single-column", "epubtest", checksum)
  }
}