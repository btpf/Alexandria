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

    let hashedBookFolder = format!("{current_dir}/data/books/{checksum}/");
    // format!("{hashedBookFolder}/{}", fromPath.file_name().unwrap().to_str().unwrap()))

    match std::fs::create_dir(&hashedBookFolder) {
        Ok(file) => println!("Book is Unique, Creating Directory"),
        Err(error) => {
            println!("Error: Book is duplicate");
            return;
        }
    };

    std::fs::write(
        format!("{hashedBookFolder}/{}", payload.book.name),
        &payload.book.data,
    )
    .unwrap();
    std::fs::write(
        format!("{hashedBookFolder}/{}", "cover.jpg"),
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

    std::fs::write(format!("{hashedBookFolder}/{checksum}.json"), initial_data).unwrap();
}

fn get_hash(data: &Vec<u8>) -> String {
    let c: &[u8] = &data;
    let checksum = crc32fast::hash(c);

    return format!("{:x}", checksum);
}

#[derive(Deserialize, Serialize)]
struct BookHydrate {
    coverUrl: String,
    bookUrl: String,
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

    let hashedBookFolders = fs::read_dir(format!("{current_dir}/data/books/")).unwrap();

    let mut hydrationData: Vec<BookHydrate> = Vec::new();
    for hashedBookFolder in hashedBookFolders {
        let hashedBookFolder = &hashedBookFolder.unwrap();

        let fileHash = &hashedBookFolder.path();
        let fileHash = fileHash.file_name().unwrap();
        let fileHash = fileHash.to_str().unwrap();

        println!("File Hash: {}", &fileHash);

        let bookFolder = fs::read_dir(&hashedBookFolder.path()).unwrap();

        let mut epubPath = String::new();
        let mut title = String::new();
        let mut progress: f64 = 0.0;
        let mut coverPath = String::new();

        for bookFile in bookFolder {
            let bookFile = bookFile.unwrap().path().display().to_string();
            let isEpub = bookFile.contains(".epub");
            let isData = bookFile.contains(".json");
            // match isEpub{
            //   true => {
            //     epubPath.push_str(&bookFile);
            //   },
            //   false =>{
            //     coverPath.push_str(&bookFile);
            //   }
            // }

            if isEpub {
                epubPath.push_str(&bookFile);
            } else if isData {
                println!("PRINTING JSON FILE: {}", &bookFile);
                let file = File::open(&bookFile).unwrap();
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
                coverPath.push_str(&bookFile);
            }
        }
        println!("BOOK PATH: {}", epubPath);
        println!("Cover PATH: {}", coverPath);

        let folderData: BookHydrate = BookHydrate {
            coverUrl: coverPath,
            bookUrl: epubPath,
            hash: String::from(fileHash),
            progress,
            title,
        };
        hydrationData.push(folderData)
    }

    return hydrationData;
}

#[tauri::command]
fn get_book_by_hash(bookHash: String) -> Vec<u8> {
    let current_dir = current_dir().unwrap();
    let current_dir = current_dir.as_path().to_str().unwrap();

    let hashedBookFolder = fs::read_dir(format!("{current_dir}/data/books/{bookHash}")).unwrap();

    for bookFile in hashedBookFolder {
        let bookFile = bookFile.unwrap().path().display().to_string();
        let isEpub = bookFile.contains(".epub");

        if isEpub {
            let mut f = File::open(bookFile).unwrap();
            let mut buffer = Vec::new();
            // read the whole file
            f.read_to_end(&mut buffer).unwrap();
            return buffer;
        }
    }

    return Vec::new();
}
