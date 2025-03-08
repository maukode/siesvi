import { Transform, TransformCallback } from "stream";

interface CsvParserConfig<T> {
    delimiter: string;
    headers?: string[];
}

type AllowedType = string | number | boolean | Date

class CsvParser<T extends Record<string, AllowedType>> extends Transform {
    private config: CsvParserConfig<T>;

    constructor(config: CsvParserConfig<T> = { delimiter: "," }) {
        super({ objectMode: true });
        this.config = config;
    }

    _transform(
        chunk: Buffer,
        encoding: BufferEncoding,
        callback: TransformCallback
    ) {
        try {
            const lines = chunk.toString(encoding).split("\n");

            if (this.config.headers === undefined) {
                if (lines.length > 0 && lines[0].trim() !== "") {
                    this.config.headers = lines[0].split(this.config.delimiter).map(header => header.trim());
                    lines.shift(); // Remove the header line from the data lines
                } else {
                    //if first line is empty, skip and wait for next chunk, or if no data, just return
                    if (lines.length === 1 && lines[0].trim() === "") {
                        return callback(null);
                    }
                    if (lines.length === 0) {
                        return callback(null);
                    }
                }
            }

            if (this.config.headers) {
                // Process data rows
                for (const line of lines) {
                    if (line.trim() === "") {
                        continue; // Skip empty lines
                    }
                    const data = line.split(this.config.delimiter).map(item => item.trim());
                    let obj: Record<string, AllowedType> = {};
                    for (let j = 0; j < this.config.headers.length; j++) {
                        const key = this.config.headers[j]
                        const value = data[j]

                        if (!isNaN(Number(value))) {
                            if (value.includes(".")) {
                                obj[key] = parseFloat(value);
                            } else {
                                obj[key] = parseInt(value, 10);
                            }
                        }
                        else if (value === 'true') {
                            obj[key] = true
                        }
                        else if (value === 'false') {
                            obj[key] = false
                        }
                        else {
                            try {
                                obj[key] = new Date(value);
                                if (isNaN(obj[key].getTime())) {
                                    obj[key] = value;
                                }

                            } catch (e) {
                                obj[key] = value;
                            }
                        }
                    }
                    this.push(obj);
                }
            }

            callback(null);
        } catch (error: any) {
            callback(error);
        }
    }
}


export { CsvParser, CsvParserConfig };