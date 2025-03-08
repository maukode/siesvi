import { Writable } from 'stream';
import { createWriteStream } from 'fs';
import { WriteStream } from 'fs';

export class CsvWriter<T> extends Writable {
    private columns: string[] | null = null;
    private delimiter: string;
    private includeHeader: boolean;
    private filePath: string | null = null;
    private fileStream: WriteStream | null = null;
    private outputBuffer: string = ''; // Store in-memory output if no filePath

    constructor(options: { filePath?: string; delimiter?: string; includeHeader?: boolean } = {}) {
        super({ objectMode: true });
        this.delimiter = options.delimiter || ',';
        this.includeHeader = options.includeHeader !== undefined ? options.includeHeader : true;
        this.filePath = options.filePath || null;
    }

    _construct(callback: (error?: Error | null) => void) {
        try {
            if (this.filePath) {
                this.fileStream = createWriteStream(this.filePath, { flags: 'w' });
            }
            callback();
        } catch (error) {
            callback(error as Error);
        }
    }

    _write(chunk: T, _: BufferEncoding, callback: (error?: Error | null) => void) {
        if (this.columns === null) {
            if (typeof chunk === 'object' && chunk !== null && !Array.isArray(chunk)) {
                this.columns = Object.keys(chunk);
                if (this.includeHeader) {
                    this.writeData(this.columns.join(this.delimiter) + '\n');
                }
            } else {
                return callback(new Error('First chunk must be an object to determine columns.'));
            }
        }

        if (typeof chunk === 'object' && chunk !== null && !Array.isArray(chunk)) {
            const rowValues = this.columns.map((col) => {
                let value = (chunk as any)[col]; // Access property dynamically
                if (typeof value === 'string') {
                    if (value.includes('"') || value.includes(this.delimiter)) {
                        value = `"${value.replace(/"/g, '""')}"`; // Escape double quotes
                    }
                }
                return value !== undefined && value !== null ? String(value) : ''; // Handle undefined/null
            });

            this.writeData(rowValues.join(this.delimiter) + '\n', callback);
        } else {
            callback(new Error('Chunk must be an object.'));
        }
    }

    writeData(data: string, callback?: (error?: Error | null) => void) {
        if (this.fileStream) {
            if (!this.fileStream.write(data, callback)) {
                this.fileStream.once('drain', () => callback && callback()); // Wait for drain event if buffer is full
            }
        } else {
            this.outputBuffer += data;
            if (callback) callback();
        }
    }

    _final(callback: (error?: Error | null) => void) {
        if (this.fileStream) {
            this.fileStream.end(callback);
        } else {
            callback();
        }
    }

    getOutputBuffer(): string {
        return this.outputBuffer;
    }
}
