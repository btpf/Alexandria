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