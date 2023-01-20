#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::{
    env::{self, current_dir},
    fs::{self, File},
    io::{BufReader, Read},
    path::Path,
};

use serde::{Deserialize, Serialize};
use serde_json::json;

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
            get_book_by_hash
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

        std::fs::write(format!("{}/settings.json", &config_path), "").unwrap();
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
        "progress": 0
    });

    let initial_data = serde_json::to_string_pretty(&initial_data).unwrap();

    std::fs::write(format!("{hashed_book_folder}/{checksum}.json"), initial_data).unwrap();
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

                let t = json.get("progress").unwrap();
                let t = t.as_f64();
                progress = t.unwrap();

                println!(
                    "{}",
                    format!(
                        "title: {}, progress: {}",
                        json.get("title").unwrap(),
                        json.get("progress").unwrap()
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
