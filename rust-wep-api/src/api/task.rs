use actix_web::{
    get,
    web::Json,
};

#[get("/test")]
pub async fn get_task() -> Json<String>{
    return Json("hello me".to_string());
}
#[get("/test2")]
pub async fn get_task2() -> Json<String>{
    return Json("hello you".to_string());
}
