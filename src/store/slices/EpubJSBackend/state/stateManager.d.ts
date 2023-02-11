export interface Theme{
    body: {
      background?: string,
      color?: string,
    },
    '*'?: {
      color?: string,
      background?: string,
    },
    'a:link'?: {
      color?: string,
      'text-decoration'?: string,
    },
    'a:link:hover'?: {
      background?: string,
    }
  }
  
export interface sideBarUpdate{
    view:number,
    state: string|boolean
  }
  
  
export interface SetThemePayload{
    view: number
    theme:Theme
  }
  