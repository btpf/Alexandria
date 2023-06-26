export type GlobalThemeDict = {[themeName:string]: {
    primaryBackground: string,
    secondaryBackground: string,
    primaryText: string,
    secondaryText: string
  }}
  
export interface defaultAppState {
      themes: ThemeDict,
      globalThemes: GlobalThemeDict,
      selectedGlobalTheme: string
    
    }