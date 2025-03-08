import { Readable } from 'stream';
import { CsvWriter } from '../src/siesvi.writer'

describe('CsvWriter', () => {
    it('should write CSV with header and default delimiter', (done) => {
        const objects = [
            { name: 'Alice', age: 30, city: 'New York' },
            { name: 'Bob', age: 25, city: 'London' },
        ];

        const readable = Readable.from(objects, { objectMode: true });
        const writable = new CsvWriter();

        writable.on('finish', () => {
            expect(writable.getOutputBuffer()).toBe('name,age,city\nAlice,30,New York\nBob,25,London\n');
            done();
        });

        readable.pipe(writable);
    });

    it('should write CSV without header and custom delimiter', (done) => {
        const objects = [
            { name: 'Charlie', age: 35, city: 'Paris' },
            { name: 'David', age: 40, city: 'Tokyo, Japan' },
        ];

        const readable = Readable.from(objects, { objectMode: true });
        const writable = new CsvWriter({ delimiter: '|', includeHeader: false });

        writable.on('finish', () => {
            expect(writable.getOutputBuffer()).toBe('Charlie|35|Paris\nDavid|40|Tokyo, Japan\n');
            done();
        });

        readable.pipe(writable);
    });

    it('should handle null and undefined values', (done) => {
        const objects = [
            { name: 'Eve', age: null, city: undefined },
            { name: 'Frank', age: 45, city: 'Berlin' },
        ];

        const readable = Readable.from(objects, { objectMode: true });
        const writable = new CsvWriter();

        writable.on('finish', () => {
            expect(writable.getOutputBuffer()).toBe('name,age,city\nEve,,\nFrank,45,Berlin\n');
            done();
        });

        readable.pipe(writable);
    });

    it('should handle objects with quotes in values', (done) => {
        const objects = [
            { name: 'George', info: 'this is "quoted" text' }
        ];

        const readable = Readable.from(objects, { objectMode: true });
        const writable = new CsvWriter();

        writable.on('finish', () => {
            expect(writable.getOutputBuffer()).toBe('name,info\nGeorge,"this is ""quoted"" text"\n');
            done();
        })

        readable.pipe(writable)
    });

    it('should handle an error if the first chunk is not an object', (done) => {
        const readable = Readable.from(['not an object']);
        const writable = new CsvWriter();

        writable.on('error', (err) => {
            expect(err.message).toBe('First chunk must be an object to determine columns.');
            done();
        });

        readable.pipe(writable);
    });

    it('should handle an error if the chunk is not an object', (done) => {
        const readable = Readable.from([{id: 1}, "string"]);
        const writable = new CsvWriter();

        writable.on('error', (err) => {
            expect(err.message).toBe('Chunk must be an object.');
            done();
        });

        readable.pipe(writable);
    });
});