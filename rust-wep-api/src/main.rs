mod api;

use actix_web::{middleware::Logger, App, HttpServer};
use api::task::{get_task, get_task2, get_test};
use rand::Rng;
use std::{cmp::Ordering, env, fs, io};

#[actix_web::main]

async fn main() {
    // Get input args. Should probably have some input args
    let args: Vec<_> = env::args().collect();
    if args.len() <= 1 {
        println!("no argument found! Try help");
    } else {
        run().await;
    }
}

async fn run() {
    let args: Vec<_> = env::args().collect();
    println!("The first argument is {}", args[1]);
    if args[1] == "help" {
        println!("web => webserver");
        println!("guess => guessing game");
    } else if args[1] == "web" {
        let _ = bind_web_server("127.0.0.1", 80).await;
        println!("something went horribly wrong!");
    } else if args[1] == "guess" {
        let attempts = guessing_game();
        println!("you finished with {attempts} attempts");
    } else if args[1] == "fs" {
        let _ = find_file("./", &args[2]);
    } else {
        println!("Invalid argument!");
    }
}

async fn bind_web_server(ip: &str, port: u16) -> std::io::Result<()> {
    std::env::set_var("RUST_LOG", "debug");
    std::env::set_var("RUST_BACKTRACE", "1");
    env_logger::init();

    HttpServer::new(move || {
        let logger = Logger::default();
        App::new()
            .wrap(logger)
            .service(get_task)
            .service(get_task2)
            .service(get_test)
    })
    .bind((ip, port))?
    .run()
    .await
}

fn guessing_game() -> u32 {
    let secret_number = rand::thread_rng().gen_range(1..=100);
    println!("Guess the number!");
    println!("the number is {secret_number}");

    let mut attempts = 0;

    loop {
        println!("Please input your guess");

        let mut guess = String::new();

        io::stdin()
            .read_line(&mut guess)
            .expect("Failed to read line");

        attempts += 1;

        let guess: u32 = match guess.trim().parse() {
            Ok(num) => num,
            Err(_) => continue,
        };

        println!("You guessed: {guess}");

        match guess.cmp(&secret_number) {
            Ordering::Less => println!("Too small!"),
            Ordering::Greater => println!("Too high!"),
            Ordering::Equal => {
                println!("Correct!");
                return attempts;
                // break;
            }
        }
    }
}

fn find_file(dir: &str, ff: &str) -> std::io::Result<()> {
    let paths = fs::read_dir(dir)?;

    for path in paths {
        let string_path = &path?.path().display().to_string();
        if is_dir(string_path) {
            let _ = find_file(string_path, ff);
        } else {
            if string_path.contains(ff) {
                println!("{string_path}");
            }
        }
    }

    Ok(())
}

fn is_dir(path: &str) -> bool {
    let metadata = fs::metadata(path);
    let file_type = metadata.unwrap().file_type();

    if file_type.is_dir() {
        return true;
    }
    return false;
}
