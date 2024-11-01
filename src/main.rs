use axum::{
	extract::{DefaultBodyLimit, Multipart},
	response::Html,
	routing::{get, post},
	Json, Router,
};
use tokio::{fs::File, io::AsyncWriteExt};

const HTML: &str = include_str!("../web/front-end/dist/index.html");

const DOWNLOADS_DIR: &str = concat!(env!("HOME"), "/Downloads");

const PORT: &str = env!("LOADUP_PORT");

#[tokio::main]
async fn main() {
	let app = Router::new()
		.route("/", get(serve_website))
		.route("/", post(handle_upload))
		.layer(DefaultBodyLimit::max(usize::MAX));

	let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{PORT}")).await.unwrap();

	axum::serve(listener, app).await.unwrap();
}

async fn serve_website() -> Html<&'static str> {
	Html(HTML)
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct ErrorWithReason {
	field_name: Option<String>,
	file_name: Option<String>,
	reason: String,
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct Response {
	error_files: Vec<ErrorWithReason>,
	success_files: Vec<String>,
}

async fn handle_upload(mut multipart: Multipart) -> Json<Response> {
	let mut success_files = vec![];
	let mut error_files = vec![];
	while let Ok(Some(mut field)) = multipart.next_field().await {
		let file_name = field.file_name().map(ToString::to_string);
		let field_name = field.name().map(ToString::to_string);
		if let Some(ref name) = file_name {
			let file_path = format!("{DOWNLOADS_DIR}/{name}");
			let mut should_remove = false;
			match File::create_new(&file_path).await {
				Ok(mut fd) => loop {
					let Ok(chunk_option) = field.chunk().await else {
						should_remove = true;
						break;
					};
					if let Some(bytes) = chunk_option {
						if let Err(why) = fd.write_all(&bytes).await {
							error_files.push(ErrorWithReason {
								file_name: file_name.clone(),
								reason: why.to_string(),
								field_name: field_name.clone(),
							});
							should_remove = true;
							break;
						}
					} else {
						// file received
						if let Err(why) = fd.flush().await {
							error_files.push(ErrorWithReason {
								field_name: field_name.clone(),
								file_name: file_name.clone(),
								reason: why.to_string(),
							});
							should_remove = true;
						} else {
							success_files.push(name.clone());
						}
						break;
					}
				},
				Err(why) => {
					error_files.push(ErrorWithReason {
						file_name,
						field_name,
						reason: why.to_string(),
					});
					continue;
				}
			}
			if should_remove {
				let _ = tokio::fs::remove_file(file_path).await;
			}
		} else {
			error_files.push(ErrorWithReason {
				reason: "cannot read field/file name".to_string(),
				file_name: None,
				field_name,
			});
		}
	}
	Json::from(Response {
		error_files,
		success_files,
	})
}
