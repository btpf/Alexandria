import ReactDOM from "react-dom/client";
import React, { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Router from "./routes/Router";

import 'sanitize.css';
import 'sanitize.css/forms.css';
import 'sanitize.css/typography.css';
// import './utils/styles/breakpoints.css'

import store from './store/store'
import { Provider } from 'react-redux'

// import bookImport from '@resources/placeholder/courage.epub'

// https://stackoverflow.com/a/63520782
const portalDiv = document.getElementById("root");
if(!portalDiv){
  throw new Error("The element #root wasn't found");
}

const root = ReactDOM.createRoot(
  portalDiv
);
import { listen } from '@tauri-apps/api/event';
import Epub from "epubjs-myh";

function Root() {

  useEffect(()=>{
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    let unlisten = new Promise(()=>{});
    
    if (window.__TAURI__){
      unlisten = listen<BlobPart[]>('test', (event) => {

        const reader = new FileReader();
        reader.addEventListener("load", () => {
          // https://github.com/futurepress/epub.js/issues/436#issuecomment-230175749
          const book = Epub(reader.result);
          book.ready.then(() => {
            book.coverUrl().then(async (url) => {
              const response = await fetch(url);
              const data = await response.blob();
              console.log(data)
            });
          })
          // Book = new ePub(reader.result);
        }, false);
  
        // A lot of conversions
        // https://stackoverflow.com/a/57139182
        const f = new Uint8Array(event.payload).buffer
        const t = new Blob([f])
        reader.readAsArrayBuffer(t);
        console.log(`Got error in window ${event.windowLabel}`);
      });
    }
    

   
    
    return () => {
      if (window.__TAURI__){
        unlisten.then(f => f());
      }
    }
  }, [])


  return (
    <Provider store={store}>
      <RouterProvider router={createBrowserRouter(Router)} />
    </Provider>
  )
}


root.render(
  <Root/>
  // <React.StrictMode>

);