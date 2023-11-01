use std::any;

use actix_web::{
    get,
    web::Json,
};
use mysql_async::prelude::*;
/* 
#[derive(Debug, PartialEq, Eq, Clone)]
struct Users {
    id: i32,
    username: str,
    password: str,
    nickname: str,
    admin: i8,
    last_modified_by: str
} */

#[get("/test")]
pub async fn get_task() -> Json<String>{
    return Json("hello me".to_string());
}
#[get("/test2")]
pub async fn get_task2() -> Json<String>{
    return Json("hello you".to_string());
}
#[get("/api")]
pub async fn get_test() -> Json<String>{
    // let res = SELECT().await;
    return Json("This is a test api".to_string());
}

/* async fn SELECT() -> str {
    
    let database_url = "";

    let pool = mysql_async::Pool::new(database_url);
    let mut conn = pool.get_conn().await?;

    let res = &"SELECT * FROM production.users"
        .with(())
        .map(conn, |(id, username, password, nickname, admin, last_modified_by)| Users {id, username, password, nickname, admin, last_modified_by})
        .await?;

    drop(conn);

    pool.disconnect().await?;

    Ok(())
} */