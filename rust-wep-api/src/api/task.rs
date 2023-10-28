use actix_web::{
    get,
    post,
    put,
    error::ResponseError,
    web::Path,
    web::Json,
    web::Data,
    HttpResponse,
    http::{header::ContentType, StatusCode}
};
use serde::{Serialize, Deserialize};
use derive_more::{Display}; 

#[get("/test")]
pub async fn get_task() -> Json<String>{
    return Json("hello me".to_string());
}
#[get("/test2")]
pub async fn get_task2() -> Json<String>{
    return Json("hello you".to_string());
}
