use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn selected_png_quantizer() -> String {
    "imagequant 4.x via libimagequant, default features disabled for WASM".to_string()
}
