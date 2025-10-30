#[cfg(not(any(target_os = "android", target_os = "ios")))]
use tauri_plugin_window_state::StateFlags;

mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(debug_assertions)]
    let devtools = tauri_plugin_devtools::init();
    let context = tauri::generate_context!();
    let mut builder = tauri::Builder::default();
    #[cfg(debug_assertions)]
    {
        builder = builder.plugin(devtools);
    }

#[cfg(not(any(target_os = "android", target_os = "ios")))]
{
    builder = builder
        .plugin(
            tauri_plugin_window_state::Builder::new()
                .with_state_flags(
                    StateFlags::DECORATIONS
                        | StateFlags::FULLSCREEN
                        | StateFlags::MAXIMIZED
                        | StateFlags::POSITION
                        | StateFlags::SIZE,
                )
                .build(),
        )
}
    builder
        .invoke_handler(tauri::generate_handler![commands::show_main_window])
        .run(context)
        .expect("error while running tauri application");
}
