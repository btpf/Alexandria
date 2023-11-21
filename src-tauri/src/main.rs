#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
// Added feature gate, needed to compile flatpaks
// #![feature(once_cell)]
// https://users.rust-lang.org/t/conditional-compilation-of-feature-gates/4765
// https://users.rust-lang.org/t/add-unstable-feature-only-if-compiled-on-nightly/27886
#![cfg_attr(feature = "opt_once_cell", feature(once_cell))]
use std::{
    collections::{HashMap, HashSet},
    env::{self, current_dir},
    fs::{self, File},
    io::{BufReader, Read, Write},
    path::{Path, PathBuf},
};

use epub::doc::EpubDoc;
use libmobi_rs::convertToEpubWrapper;
use serde::{Deserialize, Serialize};
use serde_json::json;

use axum::{
    http::{HeaderValue, Method},
    routing::get,
    Router,
};
use tower_http::cors::CorsLayer;
use tower_http::services::{ServeDir, ServeFile};

extern crate reqwest;

use font_kit::source::SystemSource;


use std::io;
use tauri::{api::path::app_data_dir, Manager};

use std::sync::OnceLock;
use std::time::{SystemTime, UNIX_EPOCH};

    static app_data_platform_dir: OnceLock<PathBuf> = OnceLock::new();
    static config_path: OnceLock<PathBuf> = OnceLock::new();
    static font_folder: OnceLock<PathBuf> = OnceLock::new();

    fn get_config_path() -> PathBuf{
        return config_path.get().unwrap().clone();
    }
    fn get_font_folder_path() -> PathBuf{
        return font_folder.get().unwrap().clone();
    }


    
#[tokio::main]
async fn main() {
    tauri::Builder::default()
        .setup(|app| {
            println!("Loading Config Directory");
            let appDataDir = app_data_dir( app.config().as_ref()).unwrap();

            if cfg!(target_os = "windows") || cfg!(dev) {
                let currentDir = env::current_exe().unwrap().parent().unwrap().to_path_buf();
                
                let program_files_path = Path::new("C:\\Program Files");
                // If the parent directory is Program Files, The file was installed
                // Otherwise, Run in portable
                if(currentDir.parent().unwrap() == program_files_path){
                    app_data_platform_dir.set(appDataDir);
                }else{
                    app_data_platform_dir.set(currentDir);
                }
            } else {
                app_data_platform_dir.set(appDataDir);
            }

            config_path.set(app_data_platform_dir.get().unwrap().join("Alexandria_Data"));

            // Required to allow client side to access the config path
            app.fs_scope().allow_directory(get_config_path(), true);
            font_folder.set(get_config_path().join("fonts"));
            


            create_or_load_data();


            // https://github.com/tranxuanthang/lrcget/commit/0a2fe9943e40503a1dc5d9bf291314f31ea66941
            // https://github.com/tauri-apps/tauri/issues/3725#issuecomment-1552804332
            #[cfg(target_os = "linux")]
            tokio::spawn(async move {
                println!("Serving {}", app_data_platform_dir.get().unwrap().display());
                let serve_dir = ServeDir::new(app_data_platform_dir.get().unwrap());

                let axum_app = Router::new().nest_service("/", serve_dir).layer(
                    CorsLayer::new()
                        .allow_origin("*".parse::<HeaderValue>().unwrap())
                        .allow_methods([Method::GET]),
                );
                axum::Server::bind(&"127.0.0.1:16780".parse().unwrap())
                    .serve(axum_app.into_make_service())
                    .await
                    .unwrap();
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            import_book,
            get_books,
            get_book_by_hash,
            update_data_by_hash,
            load_book_data,
            get_font_url,
            get_font_urls,
            download_font,
            list_fonts,
            delete_font,
            set_global_themes,
            get_global_themes,
            set_settings,
            get_settings,
            delete_book,
            get_config_path_js,
            add_system_font,
            list_system_fonts
        ])
        .run(tauri::generate_context!()) // Create a ../dist folder if it there is an error on this line
        .expect("error while running tauri application");
}



#[derive(PartialEq)]
enum DataExists {
    CREATED,
    LOADED,
}

fn create_or_load_data() -> Option<DataExists> {

    let data_exists: bool = config_path.get().unwrap().exists();
    // println!("THIS IS THE CONFIG PATH: {}", config_path.as_str());
    if (data_exists) {
        return Some(DataExists::LOADED);
    } else {
        println!("{:?}",&*config_path.get().unwrap());
        std::fs::create_dir_all(&*config_path.get().unwrap()).unwrap();

        std::fs::create_dir(get_config_path().join("books")).unwrap();

        std::fs::create_dir(get_config_path().join("fonts")).unwrap();

        std::fs::write(get_config_path().join("settings.json"), "{}").unwrap();
        std::fs::write(get_config_path().join("ReaderThemes.json"), "{}").unwrap();
        std::fs::write(get_config_path().join("GlobalThemes.json"), "{}").unwrap();
        std::fs::write(get_config_path().join("fonts").join("fonts.json"), "{}").unwrap();

        return Some(DataExists::CREATED);
    }
}

#[tauri::command]
fn import_book(payload: String) -> Result<BookHydrate, String> {
    let path = Path::new(&payload);
    let mut f = File::open(&path).map_err(|e| format!("Error: Could not access file \"{}\" : {}",path.file_name().unwrap().to_str().unwrap(),  e))?;
    let mut buffer = Vec::new();
    // read the whole file
    f.read_to_end(&mut buffer).unwrap();

    let checksum = get_hash(&buffer);

    println!("{}", checksum);

    // let hashed_book_folder = format!("{current_dir}/data/books/{checksum}/");
    let hashed_book_folder = get_config_path().join("books").join(&checksum);
    // format!("{hashedBookFolder}/{}", fromPath.file_name().unwrap().to_str().unwrap()))

    match std::fs::create_dir(&hashed_book_folder) {
        Ok(_file) => println!("Book is Unique, Creating Directory"),
        Err(_error) => {
            println!("{}", format!("Error: Book is duplicate - {checksum}"));
            return Err(format!("Error: Book is duplicate - {checksum}").to_string());
        }
    };
    let bookFileName = path.file_name().unwrap().to_str().unwrap();
    let bookLocation = hashed_book_folder.join(&bookFileName);
    let hashed_book_folder_unwrapped = hashed_book_folder.to_str().unwrap();
    let file_extension_unwrapped = path.extension().unwrap().to_str().unwrap();
    let file_stem_unwrapped = path.file_stem().unwrap().to_str().unwrap();

    std::fs::write(&bookLocation, &buffer).unwrap();

    // This variable will hold whether or not file processing can be done on the back end
    let mut is_parsable = bookFileName.contains(".epub") || bookFileName.contains(".epub");

    if (bookFileName.contains(".azw") || bookFileName.contains(".azw3") || bookFileName.contains(".mobi")){
        // I cannot get the windows compiled version of libmobi to support unicode file paths.
        // Instead we will work around that issue.

        // An example of an offending character is ’ in "book’s name.azw3"
        // This results in:
        // Error opening file: .\bookΓÇÖs name.azw3 (No such file or directory)

        //  Here are some links I referenced in my efforts.
        // https://superuser.com/a/1451686
        // https://stackoverflow.com/a/30831401
        // https://github.com/bfabiszewski/libmobi/issues/45 - Libmobi seems to work here?
        // https://stackoverflow.com/a/53241054
        // https://learn.microsoft.com/en-us/windows/apps/design/globalizing/use-utf8-code-page
        // https://stackoverflow.com/a/822032
        // https://stackoverflow.com/a/59656245
        // Possible workaround? https://stackoverflow.com/a/2951808
        // https://stackoverflow.com/a/23287508
        // wfopen https://stackoverflow.com/a/35065142
        
        // Workaround for library not supporting windows utf-16 unicode file paths & names
        // First we rename the original in the directory to simply "convert.<ext>"
        std::fs::rename(&bookLocation, format!("{}/convert.{}", hashed_book_folder_unwrapped, file_extension_unwrapped));
        
        // Convert the convert.<ext> to convert.epub
        convertToEpubWrapper(format!("{}/convert.{}", hashed_book_folder_unwrapped, file_extension_unwrapped).as_str(),
        hashed_book_folder_unwrapped);
         // rename convert.<ext> original back to original name
         std::fs::rename(format!("{}/convert.{}", hashed_book_folder_unwrapped, file_extension_unwrapped),
         format!("{}/{}.{}", hashed_book_folder_unwrapped, file_stem_unwrapped, file_extension_unwrapped));
          
          // Rename the converted to the original name
          std::fs::rename(format!("{}/convert.epub", hashed_book_folder_unwrapped),
          format!("{}/{}.epub", hashed_book_folder_unwrapped, file_stem_unwrapped));
          is_parsable = true
    }

    let docLocation = format!("{}/{}.epub", hashed_book_folder_unwrapped, file_stem_unwrapped);

    println!("Printing location {}", docLocation);

    let mut title = bookFileName.to_string();
    let mut author = "".to_string();
    let mut coverExists = false;
    if(is_parsable){
     let mut doc = match EpubDoc::new(&docLocation) {
        Ok(v) => v,
        Err(_error) => {
            delete_book(checksum.as_str());
            return Err(format!("Error: Import of {} Failed", &file_stem_unwrapped));
        }
    };

    // let mut doc = doc.unwrap();
    title = doc.mdata("title").unwrap_or(bookFileName.to_string());
    author = doc.mdata("creator").unwrap_or("".to_string());



    coverExists = true;

    match doc.get_cover() {
        Ok(cover_data) => {
            let f = fs::File::create(hashed_book_folder.join("cover.jpg"));
            let mut f = f.unwrap();
            let resp = f.write_all(&cover_data);
        }
        Err(error) => {
            coverExists = false;
            println!("Error: Book does not have cover");
        }
    }
}

    // }

    // struct InitialDataFormat{
    //   title: String,
    //   progress: u32
    // }

    // let initial_data: InitialDataFormat = InitialDataFormat{
    //   title: payload.bookImport.title,
    //   progress: 0
    // };

    let now = SystemTime::now();
    let since_epoch = now.duration_since(UNIX_EPOCH).expect("Time went backwards");

    let milliseconds_u128 = since_epoch.as_millis();
    let milliseconds_u64 = milliseconds_u128.min(u64::MAX as u128) as u64;

    println!("Milliseconds since the epoch (u128): {}", milliseconds_u128);
    println!("Milliseconds since the epoch (u64): {}", milliseconds_u64);

    let initial_data = json!({
        "title": title,
        "author": author,
        "modified": milliseconds_u64,
        "data":{
            "progress": 0,
            "cfi": "",
        }
    });

    let initial_data = serde_json::to_string_pretty(&initial_data).unwrap();

    std::fs::write(
        hashed_book_folder.join(format!("{checksum}.json")),
        initial_data,
    )
    .unwrap();

    let response = BookHydrate {
        cover_url: if coverExists {
            hashed_book_folder.join("cover.jpg").to_str().unwrap().to_string()
        } else {
            "".to_string()
        },
        book_url: bookLocation.to_str().unwrap().to_string(),
        hash: checksum,
        progress: 0.0,
        title: title,
        author:author,
        modified: milliseconds_u64,
    };

    return Ok(response);
}

fn get_hash(data: &Vec<u8>) -> String {
    let c: &[u8] = &data;
    let checksum = crc32fast::hash(c);

    return format!("{:x}", checksum);
}

#[derive(Deserialize, Serialize)]
struct BookHydrate {
    cover_url: String,
    book_url: String,
    hash: String,
    progress: f64,
    title: String,
    author: String,
    modified: u64
}



#[tauri::command]
fn get_books() -> Vec<BookHydrate> {

    let hashed_book_folders = fs::read_dir(get_config_path().join("books")).unwrap();

    let mut hydration_data: Vec<BookHydrate> = Vec::new();
    for hashed_book_folder in hashed_book_folders {
        let hashed_book_folder = &hashed_book_folder.unwrap();

        let file_hash = &hashed_book_folder.path();
        let file_hash = file_hash.file_name().unwrap();
        let file_hash = file_hash.to_str().unwrap();

        println!("File Hash: {}", &file_hash);

        let book_folder = fs::read_dir(&hashed_book_folder.path()).unwrap();

        let mut epub_path = String::new();
        let mut title = String::new();
        let mut author = String::new();
        let mut progress: f64 = 0.0;
        let mut cover_path = String::new();
        let mut modified:u64 = 0;

        for book_file in book_folder {
            let book_file = book_file.unwrap().path().display().to_string();
            let is_epub = book_file.contains(".epub");
            let is_data = book_file.contains(".json") && !book_file.contains("locations_cache.json");
            let is_cover = book_file.contains(".jpg");

            if is_epub {
                epub_path.push_str(&book_file);
            } else if is_data {
                println!("PRINTING JSON FILE: {}", &book_file);
                let file = File::open(&book_file).unwrap();
                let reader = BufReader::new(file);

                let json: serde_json::Value =
                    serde_json::from_reader(reader).expect("JSON was not well-formatted");
                match json.get("title") {
                    Some(value) => title.push_str(value.as_str().unwrap_or("unknown")),
                    None => title.push_str("unknown"),
                };
                match json.get("author") {
                    Some(value) => author.push_str(value.as_str().unwrap_or("unknown")),
                    None => author.push_str("unknown"),
                };
                // .unwrap_or("default_author")
                let t = &json["data"]["progress"];

                let t = t.as_f64();
                progress = t.unwrap();

                let now = SystemTime::now();
                let since_epoch = now.duration_since(UNIX_EPOCH).expect("Time went backwards");
            
                let milliseconds_u128 = since_epoch.as_millis();
                let milliseconds_u64 = milliseconds_u128.min(u64::MAX as u128) as u64;

                modified = json.get("modified").and_then(serde_json::Value::as_u64).unwrap_or(milliseconds_u64);

            } else if is_cover {
                cover_path.push_str(&book_file);
            }
        }
        println!("BOOK PATH: {}", epub_path);
        println!("Cover PATH: {}", cover_path);

        let folderData: BookHydrate = BookHydrate {
            cover_url: cover_path,
            book_url: epub_path,
            hash: String::from(file_hash),
            progress,
            title,
            author,
            modified
        };
        hydration_data.push(folderData)
    }

    return hydration_data;
}

#[tauri::command]
fn get_book_by_hash(bookHash: String) -> String {

    // println!("{}", format!("{current_dir}/data/books/{bookHash}"));
    let hashed_book_folder = fs::read_dir(get_config_path().join("books").join(format!("{bookHash}"))).unwrap();

    let mut bookFile = "".to_string();
    for book_file in hashed_book_folder {
        let book_file = book_file.unwrap().path().display().to_string();
        let is_book = !(book_file.contains(".json") || book_file.contains(".jpg"));
        let is_epub = (book_file.contains(".epub") || book_file.contains(".epub3"));
        if is_book {
            // Return immediately if the book format is epub, as this is the most compatible format
            if(is_epub){
                return book_file
            }
            bookFile = book_file;
        }
    }
    // Return a book path if one exists
    if(bookFile.len() > 0){
        return bookFile
    }

    return "".to_string();
}

#[derive(Serialize, Deserialize, Debug)]
struct highlightData {
    color: String,
    note: String,
}
#[derive(Serialize, Deserialize, Debug, Default)]
struct themePayload {
    #[serde(default)]
    themeName: String,
    #[serde(default)]
    font: String,
    #[serde(default)]
    fontSize: u64,
    #[serde(default)]
    fontWeight: u64,
    #[serde(default)]
    wordSpacing: i64,
    #[serde(default)]
    lineHeight: i64,
    #[serde(default)]
    renderMode: String,
    #[serde(default)]
    paragraphSpacing: i64,
    #[serde(default)]
    textAlign: String,


}

#[derive(Serialize, Deserialize, Debug, Default)]
struct updateDataPayload {
    progress: f64,
    #[serde(default)]
    cfi: String,
    #[serde(default)]
    bookmarks: Vec<String>,
    #[serde(default)]
    highlights: HashMap<String, highlightData>,
    #[serde(default)]
    theme: themePayload,
}
#[derive(Serialize, Deserialize, Debug)]
struct updateBookPayload {
    #[serde(default)]
    title: String,
    #[serde(default)]
    author: String,
    #[serde(default)]
    modified: u64,
    #[serde(default)]
    data: updateDataPayload,
}

#[tauri::command]
fn update_data_by_hash(payload: updateBookPayload, hash: String) {
    // println!("{:?}", payload);
    println!("{:?}", serde_json::to_string_pretty(&payload).unwrap());


    let checksum = hash;

    let hashed_book_folder = get_config_path().join("books").join(format!("{checksum}/{checksum}.json"));

    std::fs::write(
        hashed_book_folder,
        serde_json::to_string_pretty(&payload).unwrap(),
    )
    .unwrap();
}

#[tauri::command]
fn load_book_data(checksum: &str) -> Result<updateBookPayload, String> {
    let file_path = get_config_path().join("books").join(checksum).join(format!("{}.json", checksum));
    let file = File::open(&file_path).unwrap();

    let reader = BufReader::new(file);

    let json: serde_json::Value =
        serde_json::from_reader(reader).expect("JSON was not well-formatted");
    println!("About to check malformed");
    let bookPayload: updateBookPayload =
        serde_json::from_value(json).map_err(|e| format!("Malformed Data: {}", e))?;
    if (bookPayload.data.cfi == "") {
        println!("RETURNING FIRST READ");
        return Err(String::from("First Read"));
    }
    println!("About return payload");
    return Ok(bookPayload);
    // println!("Data Read: {}","hi")

    // let mut f = File::open(book_file).unwrap();
    // let mut buffer = Vec::new();
    // // read the whole file
    // f.read_to_end(&mut buffer).unwrap();
    // return buffer;
}

#[tauri::command]
fn delete_book(checksum: &str) {
    let file_path = get_config_path().join("books").join(checksum);
    fs::remove_dir_all(file_path).unwrap();
}

#[tauri::command]
fn get_font_url(name: &str) -> Option<String> {

    let return_string = get_font_folder_path().join(name).join(format!("{name} - 400.ttf"));
    // format!("{font_folder}/{name}/{name} - 400.ttf");

    let b = return_string.exists();
    if (b) {
        return Some(format!("{}",return_string.to_str().unwrap()));
    } else {
        return None;
    }
}

#[tauri::command]
fn get_font_urls(name: &str) -> Option<Vec<String>> {

    let font_folder_path = get_font_folder_path().join(name);
    let b = font_folder_path.exists();
    if (b) {
        let font_folder_dir = fs::read_dir(font_folder_path).unwrap();
        let mut vec = Vec::new();

        for font_file in font_folder_dir {
            let font_file = font_file.unwrap().path().display().to_string();
            vec.push(font_file);
        }
        return Some(vec);
    } else {
        return None;
    }
}

#[tauri::command]
fn list_system_fonts() -> HashMap<String, HashSet<String>> {
    let source = SystemSource::new();
    let fonts = source.all_fonts().unwrap();

    // let mut font_family_set:HashSet<String> = HashSet::new();
    let mut font_family_map = HashMap::<String, HashSet<String>>::new();
    for font in fonts {
        if let Ok(font) = font.load() {
            let properties = font.properties();
            let mut result = font_family_map.entry(font.family_name()).or_insert(HashSet::new());
            result.insert(properties.weight.0.to_string());
        }
    }
    
    return font_family_map;
}

#[derive(Serialize, Deserialize, Debug, Default)]
struct fontsJSON {
    #[serde(default)]
    fonts: HashMap<String, bool>,
    #[serde(default = "fontsJSONVersion")]
    version: String
}
fn fontsJSONVersion() -> String {
    "0.11".to_string()
}

#[tauri::command]
async fn download_font(url: &str, name: &str, weight: &str) -> Result<String, String> {

    let resp = reqwest::get(url).await.map_err(|e| format!("Malformed Data: {}", e))?;
    let body = resp.bytes().await.map_err(|e| format!("Malformed Data: {}", e))?;
    fs::create_dir_all(get_font_folder_path().join(name));

    std::fs::write(get_font_folder_path().join(name).join(format!("{name} - {weight}.ttf")), &body);

    let file = File::open(get_font_folder_path().join("fonts.json")).unwrap();

    let reader = BufReader::new(file);

    let json: serde_json::Value =
        serde_json::from_reader(reader).expect("JSON was not well-formatted");

    let mut fontsPayload: fontsJSON = serde_json::from_value(json).unwrap();
    // println!("File Hash: {}", &fontsPayload);
    println!("{:?}", serde_json::to_string_pretty(&fontsPayload).unwrap());

    fontsPayload.fonts.insert(format!("{name}"), true);

    std::fs::write(
        get_font_folder_path().join("fonts.json"),
        serde_json::to_string_pretty(&fontsPayload).unwrap(),
    );
    return Ok("Ok".to_string());
}

#[tauri::command]
async fn add_system_font(name: &str) -> Result<String, String> {



    let file = File::open(get_font_folder_path().join("fonts.json")).unwrap();

    let reader = BufReader::new(file);

    let json: serde_json::Value =
        serde_json::from_reader(reader).expect("JSON was not well-formatted");

    let mut fontsPayload: fontsJSON = serde_json::from_value(json).unwrap();
    // println!("File Hash: {}", &fontsPayload);
    println!("{:?}", serde_json::to_string_pretty(&fontsPayload).unwrap());

    fontsPayload.fonts.insert(format!("{name}"), false);

    std::fs::write(
        get_font_folder_path().join("fonts.json"),
        serde_json::to_string_pretty(&fontsPayload).unwrap(),
    );
    return Ok("Ok".to_string());
}

#[tauri::command]
fn delete_font(name: &str) {

    let folder_path = get_font_folder_path().join(name);
    if folder_path.exists() {
        std::fs::remove_dir_all(folder_path);
    }
    

    let file = File::open(get_font_folder_path().join("fonts.json")).unwrap();

    let reader = BufReader::new(file);

    let json: serde_json::Value =
        serde_json::from_reader(reader).expect("JSON was not well-formatted");

    let mut fontsPayload: fontsJSON = serde_json::from_value(json).unwrap();

    fontsPayload.fonts.remove(name).unwrap();

    std::fs::write(
        get_font_folder_path().join("fonts.json"),
        serde_json::to_string_pretty(&fontsPayload).unwrap(),
    );
}

#[tauri::command]
fn list_fonts() ->  HashMap<String, bool> {
    let file = File::open(get_font_folder_path().join("fonts.json")).unwrap();
    let reader = BufReader::new(file);
    let json: serde_json::Value =
        serde_json::from_reader(reader).expect("JSON was not well-formatted");

    let mut fontsPayload: fontsJSON = serde_json::from_value(json).unwrap();
    return fontsPayload.fonts;
}

#[derive(Serialize, Deserialize, Debug, Default)]
struct ReaderThemeBody {
    #[serde(default)]
    background: String,
    #[serde(default)]
    color: String,
    #[serde(default)]
    link: String

}

#[derive(Serialize, Deserialize, Debug, Default)]
struct ReaderImages {
    #[serde(default)]
    mixBlendMode: String,
    #[serde(default)]
    invert: bool
}

#[derive(Serialize, Deserialize, Debug, Default)]
struct ReaderTheme {
    #[serde(default)]
    body: ReaderThemeBody,
    #[serde(default)]
    image: ReaderImages
}


#[derive(Serialize, Deserialize, Debug, Default)]
struct uiTheme {
    #[serde(default)]
    primaryBackground: String,
    #[serde(default)]
    secondaryBackground: String,
    #[serde(default)]
    tertiaryBackground: String,
    #[serde(default)]
    primaryText: String,
    #[serde(default)]
    secondaryText: String,
}


#[derive(Serialize, Deserialize, Debug)]
struct AppTheme {
    #[serde(default)]
    ui: uiTheme,
    #[serde(default)]
    reader: ReaderTheme
}

#[derive(Serialize, Deserialize, Debug)]
struct AppThemes {
    #[serde(default)]
    themes: HashMap<String, AppTheme>,
}

#[tauri::command]
fn set_global_themes(payload: HashMap<String, AppTheme>) {
    println!("Themes Set: {:?}", payload);

    let t = AppThemes { themes: payload };

    std::fs::write(
        get_config_path().join("GlobalThemes.json"),
        serde_json::to_string_pretty(&t).unwrap(),
    )
    .unwrap();

    // return themesPayload
}

#[tauri::command]
fn get_global_themes() -> AppThemes {

    let file = File::open(get_config_path().join("GlobalThemes.json")).unwrap();

    let reader = BufReader::new(file);

    let json: serde_json::Value =
        serde_json::from_reader(reader).expect("JSON was not well-formatted");

    let mut themesPayload: AppThemes = serde_json::from_value(json).unwrap();

    return themesPayload;
}

#[derive(Serialize, Deserialize, Debug)]
struct SettingsConfig {
    #[serde(default)]
    selectedTheme: String,
    #[serde(default)]
    sortDirection: String,
    #[serde(default)]
    sortBy: String,
    #[serde(default)]
    readerMargins: i64,
}

#[tauri::command]
fn set_settings(payload: HashMap<String, String>) {
    println!("{:?}", payload);

    std::fs::write(
        get_config_path().join("settings.json"),
        serde_json::to_string_pretty(&payload).unwrap(),
    )
    .unwrap();

    // return themesPayload
}

#[tauri::command]
fn get_settings() -> SettingsConfig {

    let file = File::open(get_config_path().join("settings.json")).unwrap();

    let reader = BufReader::new(file);

    let json: serde_json::Value =
        serde_json::from_reader(reader).expect("JSON was not well-formatted");
        println!("PRINTING GET SETTINGS: {:?}", json);
    let mut payload: SettingsConfig = serde_json::from_value(json).unwrap();

    return payload;
}

#[tauri::command]
fn get_config_path_js() -> String {

    return get_config_path().display().to_string();
}