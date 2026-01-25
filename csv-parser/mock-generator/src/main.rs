use std::{error::Error, fs::File};

use csv::Writer;
use fake::faker::company::en::CompanyName;
use fake::faker::internet::en::FreeEmail;
use fake::faker::name::en::Name;
use fake::Fake;
use serde::Serialize;

#[derive(Debug, Serialize)]
struct User {
    number: i32,
    name: String,
    email: String,
    company: String,
}

fn main() -> Result<(), Box<dyn Error>> {
    let file = File::create("output.csv")?;
    let mut writer = Writer::from_writer(file);

    for i in 0..1000000 {
        let user = User {
            number: i + 1,
            name: Name().fake(),
            email: FreeEmail().fake(),
            company: CompanyName().fake(),
        };

        writer.serialize(user)?;
    }

    writer.flush()?;

    print!("CSV файл успешно создан");
    Ok(())
}
