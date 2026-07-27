/* tslint:disable */
/* eslint-disable */

export class QuantizedPng {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    readonly height: number;
    readonly indexed_pixels: Uint8Array;
    readonly palette_rgba: Uint8Array;
    readonly palette_size: number;
    readonly png_bytes: Uint8Array;
    readonly quality: number;
    readonly width: number;
}

export function quantize_rgba(rgba_pixels: Uint8Array, width: number, height: number, min_quality: number, target_quality: number, speed: number): QuantizedPng;

export function selected_png_quantizer(): string;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_quantizedpng_free: (a: number, b: number) => void;
    readonly quantize_rgba: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number, number];
    readonly quantizedpng_height: (a: number) => number;
    readonly quantizedpng_indexed_pixels: (a: number) => [number, number];
    readonly quantizedpng_palette_rgba: (a: number) => [number, number];
    readonly quantizedpng_palette_size: (a: number) => number;
    readonly quantizedpng_png_bytes: (a: number) => [number, number];
    readonly quantizedpng_quality: (a: number) => number;
    readonly quantizedpng_width: (a: number) => number;
    readonly selected_png_quantizer: () => [number, number];
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
