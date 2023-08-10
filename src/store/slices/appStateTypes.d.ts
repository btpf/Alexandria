import { ThemeType } from "./AppState/globalThemes";

  
export interface defaultAppState {
      themes: {[themeName:string]: ThemeType},
      selectedTheme: string,
      sortDirection: string,
      sortBy: string,
      state:{
        fullscreen: bool
      }
    
    }