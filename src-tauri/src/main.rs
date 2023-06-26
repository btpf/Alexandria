#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::{
    collections::HashMap,
    env::{self, current_dir},
    fs::{self, File},
    io::{BufReader, Read},
    path::Path,
};

use serde::{Deserialize, Serialize};
use serde_json::json;


extern crate reqwest;
use std::io;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            println!("Loading Config Directory");
            let config_path = create_or_load_data();
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            import_book,
            get_books,
            get_book_by_hash,
            update_data_by_hash,
            load_book_data,
            get_font_url,
            download_font,
            toggle_font,
            list_fonts,
            get_reader_themes,
            set_reader_themes,
            delete_font,
            set_global_themes,
            get_global_themes,
            set_settings,
            get_settings

        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[derive(PartialEq)]
enum DataExists {
    CREATED,
    LOADED,
}

fn create_or_load_data() -> Option<DataExists> {
    let current_dir = current_dir().unwrap();
    let current_dir = current_dir.as_path().to_str().unwrap();

    let config_path: String = format!("{}/data", current_dir.to_string());

    let data_exists: bool = Path::new(&config_path).exists();
    println!("THIS IS THE CONFIG PATH: {}", config_path);
    if (data_exists) {
        return Some(DataExists::LOADED);
    } else {
        std::fs::create_dir(&config_path).unwrap();

        std::fs::create_dir(format!("{}/books", &config_path.to_string())).unwrap();
        
        std::fs::create_dir(format!("{}/fonts", &config_path.to_string())).unwrap();

        std::fs::write(format!("{}/settings.json", &config_path), "").unwrap();
        std::fs::write(format!("{}/ReaderThemes.json", &config_path), "").unwrap();
        std::fs::write(format!("{}/GlobalThemes.json", &config_path), "").unwrap();

        return Some(DataExists::CREATED);
    }
}

//data: Vec<u8>
#[derive(Deserialize)]
struct FileStruct {
    name: String,
    data: Vec<u8>,
}

#[derive(Deserialize)]
struct ImportBookPayload {
    book: FileStruct,
    title: String,
    cover: FileStruct,
}
#[tauri::command]
fn import_book(payload: ImportBookPayload) {
    // let t = String::from_utf8(data).unwrap();

    println!("Book imported");
    let current_dir = current_dir().unwrap();
    let current_dir = current_dir.as_path().to_str().unwrap();

    let checksum = get_hash(&payload.book.data);

    println!("{}", checksum);

    let hashed_book_folder = format!("{current_dir}/data/books/{checksum}/");
    // format!("{hashedBookFolder}/{}", fromPath.file_name().unwrap().to_str().unwrap()))

    match std::fs::create_dir(&hashed_book_folder) {
        Ok(_file) => println!("Book is Unique, Creating Directory"),
        Err(_error) => {
            println!("Error: Book is duplicate");
            return;
        }
    };

    std::fs::write(
        format!("{hashed_book_folder}/{}", payload.book.name),
        &payload.book.data,
    )
    .unwrap();
    std::fs::write(
        format!("{hashed_book_folder}/{}", "cover.jpg"),
        &payload.cover.data,
    )
    .unwrap();

    // struct InitialDataFormat{
    //   title: String,
    //   progress: u32
    // }

    // let initial_data: InitialDataFormat = InitialDataFormat{
    //   title: payload.bookImport.title,
    //   progress: 0
    // };

    let initial_data = json!({
        "title": payload.title,
        "data":{
            "progress": 0,
            "highlights":{},
            "bookmarks": []
        }
    });

    let initial_data = serde_json::to_string_pretty(&initial_data).unwrap();

    std::fs::write(
        format!("{hashed_book_folder}/{checksum}.json"),
        initial_data,
    )
    .unwrap();
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
}

#[derive(Deserialize)]
struct BookDataStuct {
    // Use the result of a function as the default if "resource" is
    // not included in the input.
    #[serde(default)]
    progress: u64,

    // Use the type's implementation of std::default::Default if
    // "timeout" is not included in the input.
    #[serde(default)]
    title: String,
}

#[tauri::command]
fn get_books() -> Vec<BookHydrate> {
    let current_dir = current_dir().unwrap();
    let current_dir = current_dir.as_path().to_str().unwrap();

    let hashed_book_folders = fs::read_dir(format!("{current_dir}/data/books/")).unwrap();

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
        let mut progress: f64 = 0.0;
        let mut cover_path = String::new();

        for book_file in book_folder {
            let book_file = book_file.unwrap().path().display().to_string();
            let is_epub = book_file.contains(".epub");
            let is_data = book_file.contains(".json");

            if is_epub {
                epub_path.push_str(&book_file);
            } else if is_data {
                println!("PRINTING JSON FILE: {}", &book_file);
                let file = File::open(&book_file).unwrap();
                let reader = BufReader::new(file);

                let json: serde_json::Value =
                    serde_json::from_reader(reader).expect("JSON was not well-formatted");
                title.push_str(json.get("title").unwrap().as_str().unwrap());

                let t = &json["data"]["progress"];

                let t = t.as_f64();
                progress = t.unwrap();

                println!(
                    "{}",
                    format!(
                        "title: {}, progress: {}",
                        json.get("title").unwrap(),
                        progress
                    )
                )
            } else {
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
        };
        hydration_data.push(folderData)
    }

    return hydration_data;
}

#[tauri::command]
fn get_book_by_hash(bookHash: String) -> Vec<u8> {
    let current_dir = current_dir().unwrap();
    let current_dir = current_dir.as_path().to_str().unwrap();

    println!("{}", format!("{current_dir}/data/books/{bookHash}"));
    let hashed_book_folder = fs::read_dir(format!("{current_dir}/data/books/{bookHash}")).unwrap();

    for book_file in hashed_book_folder {
        let book_file = book_file.unwrap().path().display().to_string();
        let is_epub = book_file.contains(".epub");

        if is_epub {
            let mut f = File::open(book_file).unwrap();
            let mut buffer = Vec::new();
            // read the whole file
            f.read_to_end(&mut buffer).unwrap();
            return buffer;
        }
    }

    return Vec::new();
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
    fontSize: u64
}

#[derive(Serialize, Deserialize, Debug, Default)]
struct updateDataPayload {
    progress: f64,
    bookmarks: Vec<String>,
    highlights: HashMap<String, highlightData>,
    #[serde(default)]
    theme: themePayload
}
#[derive(Serialize, Deserialize, Debug)]
struct updateBookPayload {
    title: String,
    data: updateDataPayload,
}

#[tauri::command]
fn update_data_by_hash(payload: updateBookPayload, hash: String) {
    // println!("{:?}", payload);
    println!("{:?}", serde_json::to_string_pretty(&payload).unwrap());

    let current_dir = current_dir().unwrap();
    let current_dir = current_dir.as_path().to_str().unwrap();

    let checksum = hash;

    let hashed_book_folder = format!("{current_dir}/data/books/{checksum}/");

    std::fs::write(
        format!("{hashed_book_folder}/{checksum}.json"),
        serde_json::to_string_pretty(&payload).unwrap(),
    )
    .unwrap();
}

#[tauri::command]
fn load_book_data(checksum: &str) -> updateBookPayload {
    let current_dir = current_dir().unwrap();
    let current_dir = current_dir.as_path().to_str().unwrap();

    let file = File::open(format!(
        "{current_dir}/data/books/{checksum}/{checksum}.json"
    ))
    .unwrap();
    let reader = BufReader::new(file);

    let json: serde_json::Value =
        serde_json::from_reader(reader).expect("JSON was not well-formatted");

    let bookPayload: updateBookPayload = serde_json::from_value(json).unwrap();
    return bookPayload;
    // println!("Data Read: {}","hi")

    // let mut f = File::open(book_file).unwrap();
    // let mut buffer = Vec::new();
    // // read the whole file
    // f.read_to_end(&mut buffer).unwrap();
    // return buffer;
}

#[tauri::command]
fn get_font_url(name: &str) -> Option<String> {
    let current_dir = current_dir().unwrap();
    let current_dir = current_dir.as_path().to_str().unwrap();


    let font_folder = format!("{current_dir}/data/fonts");

    let return_string = format!("{font_folder}/{name}");

    let b = std::path::Path::new(return_string.as_str()).exists();
    if(b){
        return Some(format!("{return_string}"));
    }else{
        return None
    }
}


#[derive(Serialize, Deserialize, Debug)]
struct fontStatus {
    fontMap: HashMap<String, bool>
}


#[derive(Serialize, Deserialize, Debug)]
struct fontsJSON {
    fonts: fontStatus,
}

#[tauri::command]
fn download_font(url: &str, name: &str, weight: &str){
    let current_dir = current_dir().unwrap();
    let current_dir = current_dir.as_path().to_str().unwrap();
    let font_folder = format!("{current_dir}/data/fonts");

    let resp = reqwest::blocking::get(url).expect("request failed");
    let body = resp.bytes().expect("body invalid");
    std::fs::write(format!("{font_folder}/{name} - {weight}.ttf"), &body);




    let file = File::open(format!("{font_folder}/fonts.json")).unwrap();

    let reader = BufReader::new(file);

    let json: serde_json::Value =
        serde_json::from_reader(reader).expect("JSON was not well-formatted");

    let mut fontsPayload: fontsJSON = serde_json::from_value(json).unwrap();
    // println!("File Hash: {}", &fontsPayload);
    println!("{:?}", serde_json::to_string_pretty(&fontsPayload).unwrap());

    fontsPayload.fonts.fontMap.insert(format!("{name} - {weight}.ttf"), true);


    std::fs::write(
        format!("{font_folder}/fonts.json"),
        serde_json::to_string_pretty(&fontsPayload).unwrap(),
    );

}

#[tauri::command]
fn delete_font(name: &str){
    let current_dir = current_dir().unwrap();
    let current_dir = current_dir.as_path().to_str().unwrap();
    let font_folder = format!("{current_dir}/data/fonts");


    std::fs::remove_file(format!("{font_folder}/{name}"));




    let file = File::open(format!("{font_folder}/fonts.json")).unwrap();

    let reader = BufReader::new(file);

    let json: serde_json::Value =
        serde_json::from_reader(reader).expect("JSON was not well-formatted");

    let mut fontsPayload: fontsJSON = serde_json::from_value(json).unwrap();

    fontsPayload.fonts.fontMap.remove(name).unwrap();

    std::fs::write(
        format!("{font_folder}/fonts.json"),
        serde_json::to_string_pretty(&fontsPayload).unwrap(),
    );

}

#[tauri::command]
fn toggle_font(name: &str){
    let current_dir = current_dir().unwrap();
    let current_dir = current_dir.as_path().to_str().unwrap();
    let font_folder = format!("{current_dir}/data/fonts");


    let file = File::open(format!("{font_folder}/fonts.json")).unwrap();

    let reader = BufReader::new(file);

    let json: serde_json::Value =
        serde_json::from_reader(reader).expect("JSON was not well-formatted");

    let mut fontsPayload: fontsJSON = serde_json::from_value(json).unwrap();
    // println!("File Hash: {}", &fontsPayload);
    println!("{:?}", serde_json::to_string_pretty(&fontsPayload).unwrap());

    *fontsPayload.fonts.fontMap.get_mut(name).unwrap() = !fontsPayload.fonts.fontMap[name];


    std::fs::write(
        format!("{font_folder}/fonts.json"),
        serde_json::to_string_pretty(&fontsPayload).unwrap(),
    );

}

#[tauri::command]
fn list_fonts() -> fontStatus{
    let current_dir = current_dir().unwrap();
    let current_dir = current_dir.as_path().to_str().unwrap();
    let font_folder = format!("{current_dir}/data/fonts");


    let file = File::open(format!("{font_folder}/fonts.json")).unwrap();

    let reader = BufReader::new(file);

    let json: serde_json::Value =
        serde_json::from_reader(reader).expect("JSON was not well-formatted");

    let mut fontsPayload: fontsJSON = serde_json::from_value(json).unwrap();

    return fontsPayload.fonts

}

#[derive(Serialize, Deserialize, Debug, Default)]
struct ReaderThemeBody {
    #[serde(default)]
    background: String,
    #[serde(default)]
    color: String

}

#[derive(Serialize, Deserialize, Debug)]
struct ReaderTheme {
    #[serde(default)]
    body: ReaderThemeBody,
    #[serde(default)]
    color: String
}

#[derive(Serialize, Deserialize, Debug)]
struct ReaderThemes {
    #[serde(default)]
    themes: HashMap<String, ReaderTheme>
}

#[tauri::command]
fn get_reader_themes() -> ReaderThemes{
    let current_dir = current_dir().unwrap();
    let current_dir = current_dir.as_path().to_str().unwrap();
    let font_folder = format!("{current_dir}/data/");


    let file = File::open(format!("{font_folder}/ReaderThemes.json")).unwrap();

    let reader = BufReader::new(file);

    let json: serde_json::Value =
        serde_json::from_reader(reader).expect("JSON was not well-formatted");

    let mut themesPayload: ReaderThemes = serde_json::from_value(json).unwrap();

    return themesPayload

}

#[tauri::command]
fn set_reader_themes(payload: HashMap<String, ReaderTheme>){
    println!("{:?}", payload);
    let current_dir = current_dir().unwrap();
    let current_dir = current_dir.as_path().to_str().unwrap();
    let font_folder = format!("{current_dir}/data/");

    let t = ReaderThemes{
        themes: payload
    };

    std::fs::write(
        format!("{font_folder}/ReaderThemes.json"),
        serde_json::to_string_pretty(&t).unwrap(),
    )
    .unwrap();

    // return themesPayload

}


#[derive(Serialize, Deserialize, Debug)]
struct GlobalTheme {
    #[serde(default)]
    primaryBackground: String,
    #[serde(default)]
    secondaryBackground: String,
    #[serde(default)]
    primaryText : String,
    #[serde(default)]
    secondaryText: String 
}

#[derive(Serialize, Deserialize, Debug)]
struct GlobalThemes {
    #[serde(default)]
    themes: HashMap<String, GlobalTheme>
}


#[tauri::command]
fn set_global_themes(payload: HashMap<String, GlobalTheme>){
    println!("{:?}", payload);
    let current_dir = current_dir().unwrap();
    let current_dir = current_dir.as_path().to_str().unwrap();
    let font_folder = format!("{current_dir}/data/");

    let t = GlobalThemes{
        themes: payload
    };

    
    std::fs::write(
        format!("{font_folder}/GlobalThemes.json"),
        serde_json::to_string_pretty(&t).unwrap(),
    )
    .unwrap();

    // return themesPayload

}


#[tauri::command]
fn get_global_themes() -> GlobalThemes{
    let current_dir = current_dir().unwrap();
    let current_dir = current_dir.as_path().to_str().unwrap();
    let font_folder = format!("{current_dir}/data/");


    let file = File::open(format!("{font_folder}/GlobalThemes.json")).unwrap();

    let reader = BufReader::new(file);

    let json: serde_json::Value =
        serde_json::from_reader(reader).expect("JSON was not well-formatted");

    let mut themesPayload: GlobalThemes = serde_json::from_value(json).unwrap();

    return themesPayload

}

#[derive(Serialize, Deserialize, Debug)]
struct SettingsConfig {
    #[serde(default)]
    selectedGlobalTheme: String
}

#[tauri::command]
fn set_settings(payload: HashMap<String, String>){
    println!("{:?}", payload);
    let current_dir = current_dir().unwrap();
    let current_dir = current_dir.as_path().to_str().unwrap();
    let font_folder = format!("{current_dir}/data/");

    
    std::fs::write(
        format!("{font_folder}/settings.json"),
        serde_json::to_string_pretty(&payload).unwrap(),
    )
    .unwrap();

    // return themesPayload

}

#[tauri::command]
fn get_settings() -> SettingsConfig{
    let current_dir = current_dir().unwrap();
    let current_dir = current_dir.as_path().to_str().unwrap();
    let font_folder = format!("{current_dir}/data/");


    let file = File::open(format!("{font_folder}/settings.json")).unwrap();

    let reader = BufReader::new(file);

    let json: serde_json::Value =
        serde_json::from_reader(reader).expect("JSON was not well-formatted");

    let mut payload: SettingsConfig = serde_json::from_value(json).unwrap();

    return payload

}