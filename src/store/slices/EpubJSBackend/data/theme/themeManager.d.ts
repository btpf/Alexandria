export interface SetFontPayload{
    view: number
    font?: string
    fontSize?: number
}



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

// export interface SetThemePayload{
//     view: number
//     theme:Theme
// }

export interface SetThemePayload{
  view: number
  themeName: string
}