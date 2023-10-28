mod api;
use actix_web::{middleware::Logger, web::Data, App, HttpServer};
use api::task::{get_task, get_task2};
use rand::Rng;
use std::{cmp::Ordering, io};

#[actix_web::main]

async fn main() -> std::io::Result<()> {
    let secret_number = rand::thread_rng().gen_range(1..=100);

    println!("Guess the number!");
    // println!("The secret number is :{secret_number}");

    loop {
        println!("Please input your guess");

        let mut guess = String::new();

        io::stdin()
            .read_line(&mut guess)
            .expect("Failed to read line");

        let guess: u32 = match guess.trim().parse() {
            Ok(num) => num,
            Err(err) => continue,
        };

        println!("You guessed: {guess}");

        match guess.cmp(&secret_number) {
            Ordering::Less => println!("Too small!"),
            Ordering::Greater => println!("Too high!"),
            Ordering::Equal => {
                println!("Correct!");
                break;
            },
        }
    }

    std::env::set_var("RUST_LOG", "debug");
    std::env::set_var("RUST_BACKTRACE", "1");
    env_logger::init();

    HttpServer::new(move || {
        let logger = Logger::default();
        App::new().wrap(logger).service(get_task).service(get_task2)
    })
    .bind(("127.0.0.1", 80))?
    .run()
    .await
}
