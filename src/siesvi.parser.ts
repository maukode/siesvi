import { Transform, TransformCallback } from "stream";

interface CsvParserConfig<T> {
    delimiter: string;
    headers?: string[];
    validate?: (row: T) => boolean;
    filter?: (row: T) => boolean;
    transform?: (row: T) => T;
}

class CsvParser<T> extends Transform {
    private config: CsvParserConfig<T>;

    constructor(config: CsvParserConfig<T> = {delimiter: ','}) {
        super({objectMode: true});
        this.config = config;
    }

    _transform(chunk: Buffer, encoding: BufferEncoding, callback: TransformCallback) {
        try {

            const lines = chunk.toString(encoding).split("\n");

            if (this.config.headers === null || this.config.headers === undefined) {
                if (lines.length > 0) {
                    this.config.headers = lines[0].split(this.config.delimiter);
                    lines.shift(); // Remove the header line from the data lines
                }
            }

            if (this.config.headers) {
                // Process data rows
                for (const line of lines) {
                    const data = line.split(this.config.delimiter);
                    if (data.length === this.config.headers.length && data[0] !== "") {
                        let obj: any = {};
                        for (let j = 0; j < this.config.headers.length; j++) {
                            obj[this.config.headers[j]] = data[j];
                        }

                        if (this.config.validate && !this.config.validate(obj)) {
                            continue;
                        }

                        if (this.config.filter && !this.config.filter(obj)) {
                            continue;
                        }

                        if (this.config.transform) {
                            obj = this.config.transform(obj)
                        }

                        this.push(obj);
                    }
                    else {
                       throw Error('Malformed Csv File')
                    }
                }
            }

            callback(null);
        }
        catch (error: any) {
            callback(error);
        }
    }
}

export { CsvParser, CsvParserConfig };