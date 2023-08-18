import store from "@store/store";


export default  (bookMeta, annotations)=>{
  const storeSnap = store.getState()
  const selectedTheme = storeSnap.appState.selectedTheme
  const currentTheme = storeSnap.appState.themes[selectedTheme]

  const bg = currentTheme.ui.tertiaryBackground
  const tc = currentTheme.ui.primaryText 
  const tc2 = currentTheme.ui.secondaryText 

  const exportHtml = 
  `<!doctype html>
<html lang=en>
<head>
<style>
.annotationContainer{
  display: flex;
  width: clamp(400px, 80%, 750px);
  height: auto;
  flex-direction: row;
  margin-top: 20px;
}

.AnnotationLeftSubContainer{
  display: flex;
  align-items: center;
  min-width: 50px;
  justify-content: center;
  color: gray;
}
.AnnotationLeftSubContainer:hover{
  color:red;
  cursor:pointer;
}
.AnnotationRightSubContainer{
  display: flex;
  flex-direction: column;
  width: 100%;
}

.AnnotationChapter{
  color: ${tc2};
}

.highlightedTextContainer{
  padding-left:10px;
}

.noteTextContainer{
  white-space: pre-line;
  border-left: 3px solid rgb(0 0 0 / 10%);
  padding-left: 5px;
}

.annotationTitleContainer{
  display: flex;
  width: 50%;
  justify-content: space-around;
  align-items: center;
  > div{
    flex-basis: 33%;
  }

}
hr { width:clamp(400px, 80%, 800px); background: rgba(0, 0, 0, 0.2); }
body {
  background-color: ${bg};
  color: ${tc};
}

.centerWrapper{
  display:flex;
  flex-direction:column;
  width:100%;
  justify-content:center;
  align-items:center;
}

</style>

<meta charset=utf-8>
<title>Annotation Export</title>
</head>
<body>
<div class="centerWrapper">
<h1>${bookMeta["title"]}</h1>
<h2>By ${bookMeta["creator"]}</h2>
<hr>

${annotations.map((item)=>{
    return `
    <div class="annotationContainer">
      <div class="AnnotationRightSubContainer"> 
        <div class="AnnotationChapter">${item.title} - ${item.AnnotationCFI}</div>
      
        <div class="highlightedTextContainer" style="border-left: 10px solid ${item.color}">${item.highlightedText}</div>
        <div class="noteTextContainer">${item.annotation}</div>

      </div>
    </div>
    `
  
  }).join("\n")}
  </div>
</body>
</html>`


  return exportHtml
}