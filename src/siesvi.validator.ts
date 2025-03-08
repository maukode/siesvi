import { Transform, TransformCallback } from 'stream';

export interface CsvValidatorConfig {
  delimiter?: string;
  expectedHeader?: string[];
  minColumns?: number;
  maxColumns?: number;
}

export class CsvValidator extends Transform {
  private config: CsvValidatorConfig;
  private header: string[] | null = null;
  private rowCount: number = 0;

  constructor(config: CsvValidatorConfig = {}) {
    super({ objectMode: true });
    this.config = {
      delimiter: config.delimiter || ',',
      expectedHeader: config.expectedHeader,
      minColumns: config.minColumns,
      maxColumns: config.maxColumns,
    };
  }

  _transform(chunk: Buffer, encoding: BufferEncoding, callback: TransformCallback) {
    try {
      const lines = chunk.toString(encoding).split('\n').filter(line => line.trim() !== ''); // Remove empty lines
      for (const line of lines) {
        const row = line.split(this.config.delimiter!);
        this.rowCount++;

        if (!this.header) {
          this.header = row.map(header => header.trim()); // Trim headers

          if (this.config.expectedHeader) {
            if (this.config.expectedHeader.length !== this.header.length) {
              return callback(new Error(`Header column count mismatch. Expected ${this.config.expectedHeader.length}, got ${this.header.length} on line ${this.rowCount}`));
            }
            for (let i = 0; i < this.config.expectedHeader.length; i++) {
              if (this.config.expectedHeader[i].trim() !== this.header[i]) {
                return callback(new Error(`Header mismatch at column ${i + 1}. Expected '${this.config.expectedHeader[i].trim()}', got '${this.header[i]}' on line ${this.rowCount}`));
              }
            }
          }
          continue;
        }

        if (this.config.minColumns !== undefined && row.length < this.config.minColumns) {
          return callback(new Error(`Row ${this.rowCount} has too few columns. Expected at least ${this.config.minColumns}, got ${row.length}`));
        }

        if (this.config.maxColumns !== undefined && row.length > this.config.maxColumns) {
          return callback(new Error(`Row ${this.rowCount} has too many columns. Expected at most ${this.config.maxColumns}, got ${row.length}`));
        }
        this.push(chunk);
      }
      callback();
    } catch (error) {
      callback(error as Error);
    }
  }
}