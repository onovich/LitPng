use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct QuantizedPng {
    png_bytes: Vec<u8>,
    palette_rgba: Vec<u8>,
    indexed_pixels: Vec<u8>,
    palette_size: usize,
    width: usize,
    height: usize,
    quality: u8,
}

#[wasm_bindgen]
impl QuantizedPng {
    #[wasm_bindgen(getter)]
    pub fn png_bytes(&self) -> Vec<u8> {
        self.png_bytes.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn palette_rgba(&self) -> Vec<u8> {
        self.palette_rgba.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn indexed_pixels(&self) -> Vec<u8> {
        self.indexed_pixels.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn palette_size(&self) -> usize {
        self.palette_size
    }

    #[wasm_bindgen(getter)]
    pub fn width(&self) -> usize {
        self.width
    }

    #[wasm_bindgen(getter)]
    pub fn height(&self) -> usize {
        self.height
    }

    #[wasm_bindgen(getter)]
    pub fn quality(&self) -> u8 {
        self.quality
    }
}

#[wasm_bindgen]
pub fn selected_png_quantizer() -> String {
    "imagequant 4.x via libimagequant, default features disabled for WASM".to_string()
}

#[wasm_bindgen]
pub fn quantize_rgba(
    rgba_pixels: &[u8],
    width: usize,
    height: usize,
    min_quality: u8,
    target_quality: u8,
    speed: i32,
) -> Result<QuantizedPng, JsValue> {
    quantize_rgba_core(
        rgba_pixels,
        width,
        height,
        min_quality,
        target_quality,
        speed,
    )
    .map_err(|error| JsValue::from_str(&error))
}

fn quantize_rgba_core(
    rgba_pixels: &[u8],
    width: usize,
    height: usize,
    min_quality: u8,
    target_quality: u8,
    speed: i32,
) -> Result<QuantizedPng, String> {
    if rgba_pixels.len() != width.saturating_mul(height).saturating_mul(4) {
        return Err("RGBA buffer length does not match width * height * 4.".to_string());
    }

    let pixels = rgba_pixels
        .chunks_exact(4)
        .map(|chunk| imagequant::RGBA::new(chunk[0], chunk[1], chunk[2], chunk[3]))
        .collect::<Vec<_>>();

    let mut attributes = imagequant::new();
    attributes
        .set_quality(min_quality, target_quality)
        .map_err(|error| format!("Failed to set quality: {error:?}"))?;
    attributes
        .set_speed(speed)
        .map_err(|error| format!("Failed to set speed: {error:?}"))?;

    let mut image = attributes
        .new_image(pixels, width, height, 0.0)
        .map_err(|error| format!("Failed to create imagequant image: {error:?}"))?;
    let mut result = attributes
        .quantize(&mut image)
        .map_err(|error| format!("Failed to quantize image: {error:?}"))?;
    result
        .set_dithering_level(1.0)
        .map_err(|error| format!("Failed to set dithering: {error:?}"))?;
    let quality = result.quantization_quality().unwrap_or(0);
    let (palette, indexed_pixels) = result
        .remapped(&mut image)
        .map_err(|error| format!("Failed to remap image: {error:?}"))?;
    let palette_size = palette.len();
    let palette_rgba = palette
        .into_iter()
        .flat_map(|color| [color.r, color.g, color.b, color.a])
        .collect::<Vec<_>>();
    let png_bytes = encode_indexed_png(width, height, &palette_rgba, &indexed_pixels)?;

    Ok(QuantizedPng {
        png_bytes,
        palette_rgba,
        indexed_pixels,
        palette_size,
        width,
        height,
        quality,
    })
}

fn encode_indexed_png(
    width: usize,
    height: usize,
    palette_rgba: &[u8],
    indexed_pixels: &[u8],
) -> Result<Vec<u8>, String> {
    let palette_rgb = palette_rgba
        .chunks_exact(4)
        .flat_map(|color| [color[0], color[1], color[2]])
        .collect::<Vec<_>>();
    let palette_alpha = palette_rgba
        .chunks_exact(4)
        .map(|color| color[3])
        .collect::<Vec<_>>();
    let mut output = Vec::new();

    {
        let mut encoder = png::Encoder::new(&mut output, width as u32, height as u32);
        encoder.set_color(png::ColorType::Indexed);
        encoder.set_depth(png::BitDepth::Eight);
        encoder.set_palette(palette_rgb);
        encoder.set_trns(palette_alpha);
        encoder.set_compression(png::Compression::Best);
        let mut writer = encoder
            .write_header()
            .map_err(|error| format!("Failed to write PNG header: {error}"))?;
        writer
            .write_image_data(indexed_pixels)
            .map_err(|error| format!("Failed to write PNG pixels: {error}"))?;
        writer
            .finish()
            .map_err(|error| format!("Failed to finish PNG: {error}"))?;
    }

    Ok(output)
}

#[cfg(test)]
mod tests {
    use super::quantize_rgba_core;

    #[test]
    fn quantizes_rgba_pixels_to_palette_indices() {
        let pixels = [
            255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 255, 0, 0, 255,
        ];

        let result =
            quantize_rgba_core(&pixels, 2, 2, 0, 90, 10).expect("quantization should succeed");

        assert_eq!(result.width, 2);
        assert_eq!(result.height, 2);
        assert_eq!(result.indexed_pixels.len(), 4);
        assert!(result.palette_size > 0);
        assert_eq!(result.palette_rgba.len(), result.palette_size * 4);
        assert_eq!(&result.png_bytes[..8], b"\x89PNG\r\n\x1a\n");
    }

    #[test]
    fn rejects_mismatched_rgba_buffer_lengths() {
        let result = quantize_rgba_core(&[255, 0, 0], 2, 2, 0, 90, 10);
        assert!(result.is_err());
    }
}
