import { CsvParser } from '../src/index';

describe('CsvParser', () => {
    it('should parse CSV data with headers', (done) => {
        const csvData = 'name,age\nJohn,30\nJane,25';
        const expectedOutput = [
            { name: 'John', age: '30' },
            { name: 'Jane', age: '25' }
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
            { header1: 'John', header2: '30' },
            { header1: 'Jane', header2: '25' }
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
            { name: 'John', age: '30' },
            { name: 'Jane', age: '25' }
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

    it('should error on invalid CSV data', (done) => {
        const csvData = 'name,age\nJohn,30\nJane';
        const expectedOutput = [
            { name: 'John', age: '30' }
        ];

        const parser = new CsvParser({ delimiter: ',' });
        const result: any[] = [];

        parser.on('data', (data) => {
            result.push(data);
        });

        parser.on('error', (error) => {
            expect(error).toBeDefined();
            done();
        });

        parser.write(Buffer.from(csvData));
        parser.end();
    });

    it('should parse CSV with validation', (done) => {
        const csvData = 'name,age\nJohn Ahu,30\nJane,25';
        type User = {name: string, age: string}
        const expectedOutput: User[] = [
            { name: 'John Ahu', age: '30' }
        ];

        const parser = new CsvParser({
            delimiter: ',',
            validate: (row: User) => parseInt(row.age) > 25
        });
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

    it('should parse CSV with filter', (done) => {
        const csvData = 'name,age\nJohn,30\nJane,25';
        type User = {name: string, age: string}
        const expectedOutput: User[] = [
            { name: 'John', age: '30' }
        ];

        const parser = new CsvParser({
            delimiter: ',',
            filter: (row: User) => row.name !== 'Jane'
        });
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

    it('should parse CSV with transform', (done) => {
        const csvData = 'name,age\nJohn,30\nJane,25';
        type User = {name: string, age: number}
        const expectedOutput: User[] = [
            { name: 'John', age: 30 },
            { name: 'Jane', age: 25 }
        ];

        const parser = new CsvParser({
            delimiter: ',',
            transform: (row: any) => ({...row, age: parseInt(row.age)})
        });
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