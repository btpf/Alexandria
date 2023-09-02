## Build Instructions

I really do not want the barrier for contribution to be high. So I have tried to simplify the process as much as possible. 
Follow the instructions below in order to get a dev environment started. 

Also please open an issue if the instructions do not work or require tinkering. Thanks.

 

### 0. Prerequisites

1. Install Tauri Prerequisites https://tauri.app/v1/guides/getting-started/prerequisites/#setting-up-linux
2. Install Node Version: v16. For this I recommend something like nvm.
3. Clone the repository with submodules through the following command
```
git clone --recurse-submodules --remote-submodules https://github.com/btpf/Alexandria.git 
```
### 1. Assets Extraction

Alexandria depends on fonts and a Google API call's response that I am not sure is a great idea to commit in the repository. These assets must either be downloaded from a drive folder or generated manually with a Google Webfonts API Key.

1. `cd scripts`
2. Populate Assets via method:
   1. Generating Assets:
      `APIKEY=<Google WebFonts Api Key> sh ./Generate_Assets.sh`
   2. Downloading Assets (From Google Drive):
      `sh ./Download\ Assets.sh`

Assets will now be downloaded and ready to use.

Return back to the base directory for next steps.

### 2. Build libmobi (sometimes not required)

Alexandria depends on a library called libmobi. This repository was modified to be a static library and only provide to Alexandria a single function which it supports book conversion. While pre-compiled static builds are provided, Sometimes they will need to be re-compiled in order to link successfully in your environment. This can be a challenging process.
Fortunately I created a build script for Linux developers to make it easy.

1. `cd libmobi-rs`
2. `sh ./build.sh`

The static library will be tested in a minimal rust environment. If this unit test passes, you are clear to proceed with the final step. 

Return back to the base directory

### 3. Run Development Environment

Run the following for a development environment:

Install Dependencies
```
npm i
```
Run Development Environment
```
npm run tauri dev
```

For a production build, run

```
npm run tauri build
```

