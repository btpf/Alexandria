# Build Instructions

Follow the instructions below in order to get a dev environment started. 

Please open an issue if the instructions do not work or require tinkering. Thanks.

 

### 0. Prerequisites

1. Install Tauri Prerequisites https://tauri.app/v1/guides/getting-started/prerequisites/#setting-up-linux
2. Install LLVM  
Windows:
    ```
    winget install LLVM.LLVM
    ```
    Debian:
    ```
    sudo apt-get install clang
    ```
3. Install Node Version: v18
4. Clone the repository with submodules through the following command
    ```
    git clone --recurse-submodules --remote-submodules https://github.com/btpf/Alexandria.git
    
    cd Alexandria
    ```

### 1. Build libmobi (sometimes not required)

Alexandria depends on a library called libmobi. This repository was modified to be a static library and only provide to Alexandria a single function which it supports book conversion. While pre-compiled static builds are provided, Sometimes they will need to be re-compiled in order to link successfully in your environment. 

First make sure dependencies are present:
`sudo apt-get install autoconf libtool`

Then run the install script

1. `cd libmobi-rs`
2. `sh ./build-linux.sh`

The static library will be tested in a minimal rust environment. If this unit test passes, you are clear to proceed with the final step. 

Return back to the base directory

### 2. Run Development Environment

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

