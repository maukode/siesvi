# siesvi (CSV) Library  

`siesvi` is a lightweight yet powerful CSV processing library designed for Node.js. It provides essential functionalities for handling CSV files efficiently by leveraging the power of Node.js streams. This makes it suitable for processing large datasets without excessive memory consumption.  

The library offers a high-level wrapper class for ease of use, as well as lower-level stream-based classes for more advanced or customized processing pipelines.  

## Core Components  

`siesvi` consists of two main types of components:  

1. **Wrapper Class** – A high-level abstraction that simplifies working with CSV files by managing the entire lifecycle, from loading to writing.  
2. **Stream-Based Classes** – Individual stream components that allow fine-grained control over CSV processing, useful for building custom pipelines.  

---

## Wrapper Class (High-Level API)  

### `Csv` (Recommended for General Use)  
The `Csv` class provides a simple and convenient way to handle CSV files. It acts as a wrapper around the available stream-based classes, managing the entire workflow from reading a CSV file to processing and writing it back.  

If you need a straightforward approach to handling CSV files, this class is the best choice. However, if you require more flexibility or need to build a custom pipeline, you can use the stream-based classes directly.  

---

## Stream-Based Classes (Low-Level API)  

These classes extend Node.js stream modules and are designed for handling specific stages of CSV processing. They can be used individually or combined in a pipeline for greater control.  

### `FileLoader` (Reading CSV as a Stream)  
- This class reads a CSV file and converts it into a stream.  
- It is the entry point for most CSV processing pipelines in `siesvi`.  

### `CsvValidator` (Validation of CSV Data)  
- Performs validation on the incoming CSV stream.  
- Helps ensure that data meets the expected format before further processing.  

### `CsvParser` (Parsing CSV Data to JavaScript Objects)  
- Converts a validated CSV stream into structured JavaScript objects with the format:  
  ```ts
  { [key: string]: number | string | boolean | Date }
  ```
- **Important:** This class does **not** perform CSV format validation. To avoid processing errors, it is recommended to place `CsvValidator` before `CsvParser` in the processing pipeline.  

### `CsvWriter` (Writing Data to a CSV File)  
- Transforms a processed stream into a CSV-formatted file.  
- Supports two output methods:  
  1. **Writing directly to a file** – Recommended for large datasets.  
  2. **Saving to an internal buffer** – Useful for temporary storage but **not recommended for large data**, as it may cause **out-of-memory errors**.  

---

## Usage Recommendations  
- If you need a simple and efficient way to work with CSV files, use the `Csv` class.  
- If you require more flexibility, build a custom pipeline using `FileLoader`, `CsvValidator`, `CsvParser`, and `CsvWriter` as needed.  
- Always validate CSV files before parsing them to prevent format-related issues.  
- Avoid using an internal buffer for large datasets to prevent memory overflow.  

---