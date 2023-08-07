import { ThemeType } from "./AppState/globalThemes";

  
export interface defaultAppState {
      themes: {[themeName:string]: ThemeType},
      selectedTheme: string,
      state:{
        fullscreen: bool
      }
    
    }