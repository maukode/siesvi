import { CsvParser } from '../src/index';

describe('CsvParser', () => {
    it('should parse CSV data with headers', (done) => {
        const csvData = 'name,age\nJohn,30\nJane,25';
        const expectedOutput = [
            { name: 'John', age: 30 },
            { name: 'Jane', age: 25 }
        ];

        const parser = new CsvParser();
        const result: any[] = [];

        parser.on('data', (data) => {
            result.push(data);
        });

        parser.on('end', () => {
            expect(result).toEqual(expectedOutput);
            done();
        });

        parser.write(Buffer.from(csvData));
        parser.end();
    });

    it('should parse CSV data without headers', (done) => {
        const csvData = 'John,30\nJane,25';
        const expectedOutput = [
            { header1: 'John', header2: 30 },
            { header1: 'Jane', header2: 25 }
        ];

        const parser = new CsvParser({ delimiter: ',', headers: ['header1', 'header2'] });
        const result: any[] = [];

        parser.on('data', (data) => {
            result.push(data);
        });

        parser.on('end', () => {
            expect(result).toEqual(expectedOutput);
            done();
        });

        parser.write(Buffer.from(csvData));
        parser.end();
    });

    it('should handle empty CSV data', (done) => {
        const csvData = '';
        const expectedOutput: any[] = [];

        const parser = new CsvParser({ delimiter: ',' });
        const result: any[] = [];

        parser.on('data', (data) => {
            result.push(data);
        });

        parser.on('end', () => {
            expect(result).toEqual(expectedOutput);
            done();
        });

        parser.write(Buffer.from(csvData));
        parser.end();
    });

    it('should handle CSV data with different delimiters', (done) => {
        const csvData = 'name;age\nJohn;30\nJane;25';
        const expectedOutput = [
            { name: 'John', age: 30 },
            { name: 'Jane', age: 25 }
        ];

        const parser = new CsvParser({ delimiter: ';' });
        const result: any[] = [];

        parser.on('data', (data) => {
            result.push(data);
        });

        parser.on('end', () => {
            expect(result).toEqual(expectedOutput);
            done();
        });

        parser.write(Buffer.from(csvData));
        parser.end();
    });
});