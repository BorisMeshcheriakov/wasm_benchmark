use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct BufferHandle {
    pointer: *mut u8,
    length: usize,
    capacity: usize,
    tail: Vec<u8>,
    table: Vec<Vec<String>>,
}

#[wasm_bindgen]
impl BufferHandle {
    // Создание буфера
    #[wasm_bindgen(constructor)]
    pub fn new(size: usize) -> BufferHandle {
        let mut buffer = Vec::<u8>::with_capacity(size);
        let tail = Vec::<u8>::new();
        let pointer = buffer.as_mut_ptr();
        std::mem::forget(buffer); // отдаём владение
        BufferHandle {
            pointer,
            length: 0,
            capacity: size,
            tail,
            table: Vec::new(),
        }
    }

    // Получение указателя
    pub fn pointer(&self) -> *mut u8 {
        self.pointer
    }

    // Просмотр содержимого
    pub fn view(&self) -> js_sys::Uint8Array {
        unsafe { js_sys::Uint8Array::view(std::slice::from_raw_parts(self.pointer, self.capacity)) }
    }

    // Установка длины буфера
    pub fn set_length(&mut self, length: usize) {
        assert!(length <= self.capacity);
        self.length = length;
    }

    pub fn process(&mut self) {
        // Собираем данные
        let current = unsafe { std::slice::from_raw_parts(self.pointer, self.length) };
        let mut data: Vec<u8> = Vec::with_capacity(self.tail.len() + current.len());
        data.extend_from_slice(&self.tail);
        data.extend_from_slice(current);

        // Разбиваем строки по '\n'
        let mut start = 0;
        for i in 0..data.len() {
            if data[i] == b'\n' {
                let line = &data[start..i];
                self.parse_line(line);
                start = i + 1
            }
        }

        // Сохраняем неполную строку после последнего \n
        self.tail.clear();
        if start < data.len() {
            self.tail.extend_from_slice(&data[start..]);
        }

        // Сбрасываем длину чанка
        self.length = 0;
    }

    fn parse_line(&mut self, line: &[u8]) {
        if let Ok(s) = std::str::from_utf8(line) {
            let row: Vec<String> = s.split(',').map(|cell| cell.trim().to_string()).collect();
            self.table.push(row);
        }
    }

    // Завершение парсинга (доедаем хвост)
    pub fn finish(&mut self) -> js_sys::Array {
        if !self.tail.is_empty() {
            let leftover = std::mem::take(&mut self.tail);
            self.parse_line(&leftover);
        }
        let outer = js_sys::Array::new();
        for row in &self.table {
            let inner = js_sys::Array::new();
            for cell in row {
                inner.push(&JsValue::from_str(cell));
            }
            outer.push(&inner);
        }

        self.table.clear();
        self.length = 0;

        outer
    }

    // Вывод содержимого буфера в консоль
    pub fn log(&self) {
        let slice = unsafe { std::slice::from_raw_parts(self.pointer, self.length) };
        web_sys::console::log_1(&format!("Bytes: {:?}", slice).into());
    }

    // Освобождение памяти буфера
    pub fn free(&mut self) {
        if !self.pointer.is_null() {
            unsafe {
                drop(Vec::from_raw_parts(self.pointer, 0, self.capacity));
            }
            self.pointer = std::ptr::null_mut();
            self.length = 0;
            self.capacity = 0;
        }
    }
}
