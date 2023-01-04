// Definition for css module imports

// declare module '*.module.css' {
//     const classes: { [key: string]: string };
//     export default classes;
//   }


//   declare module '*.module.scss' {
//     const classes: { [key: string]: string };
//     export default classes;
//   }

//   declare module '*.module.sass' {
//     const classes: { [key: string]: string };
//     export default classes;
//   }

// Simplified typings
declare module "*.module.css";
declare module "*.module.scss";

declare module "*.svg" {
    const content: any;
    export default content;
}

declare module "*.jpg" {
    const content: any;
    export default content;
}
declare module "*.webp" {
    const content: any;
    export default content;
}


declare module "*.epub" {
    const content: any;
    export default content;
}

// https://stackoverflow.com/questions/47130406/extending-global-types-e-g-window-inside-a-typescript-module#comment120678060_47130953
// https://stackoverflow.com/questions/47130406/extending-global-types-e-g-window-inside-a-typescript-module#comment125203797_47130953
// We define __TAURI__ since it will be used throughout the project
// declare global {
interface Window { __TAURI__: boolean; }
// }

// export {}