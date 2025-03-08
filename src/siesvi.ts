import { Readable } from "node:stream"
import { FileLoader } from "./siesvi.loader"
import { CsvValidator } from "./siesvi.validator"
import { CsvParser } from "./siesvi.parser"
import { CsvWriter } from "./siesvi.writer"

export interface CsvConfig {
    filePath: string
    delimiter: string
}

export class Csv {
    private config: CsvConfig
    private stream: Readable

    constructor(config: CsvConfig) {
        this.config = config

        try {
            const _stream = new FileLoader(this.config.filePath) // Ensure this is a Readable stream
            const _validator = new CsvValidator({ delimiter: this.config.delimiter }) // Ensure this is a Transform stream
            const _parser = new CsvParser({ delimiter: this.config.delimiter }) // Ensure this is a Transform stream

            this.stream = _stream.pipe(_validator).pipe(_parser)
        } catch (error) {
            throw new Error(`CSV processing failed: ${error}`)
        }
    }

    getStream() {
        return this.stream
    }

    async forEach(callback: (data: any) => void ) {
        for await (const chunk of this.stream) {
            callback(chunk)
        }
    }

    writeCsv(outputPath: string, includeHeader?: boolean) {
        const _writer = new CsvWriter({filePath: outputPath, delimiter: this.config.delimiter, includeHeader: includeHeader})
        this.stream.pipe(_writer)
    }

    writeCsvStream<T>(includeHeader?: boolean) {
        const _writer = new CsvWriter<T>({delimiter: this.config.delimiter, includeHeader: includeHeader})
        return this.stream.pipe(_writer)
    }
}