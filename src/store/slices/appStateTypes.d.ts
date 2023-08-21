import { ThemeType } from "./AppState/globalThemes";

  
export interface defaultAppState {
      themes: {[themeName:string]: ThemeType},
      selectedTheme: string,
      sortDirection: string,
      sortBy: string,
      readerMargins: number,
      state:{
        fullscreen: bool,
        selectedRendition: number,
        dualReaderMode: boolean,
        dictionaryWord: string,
        sidebarMenuSelected: boolean|string,
        themeMenuActive: boolean,
        menuToggled: boolean,
        modals:{
          selectedCFI: string,
          quickbarModal: {visible: boolean, x:number, y:number},
          noteModal: {visible: boolean, x:number, y:number}
        },
      }
    
    }