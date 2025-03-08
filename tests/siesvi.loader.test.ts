import { FileLoader } from '../src/siesvi.loader'; // Adjust the path
import fs from 'fs';
import path from 'path';

describe('FileLoader', () => {
    const testFilePath = path.join(__dirname, 'test.csv');

    beforeEach(() => {
        // Create a test CSV file
        fs.writeFileSync(testFilePath, 'Name,Age,City\nJohn,30,New York\nJane,25,London');
    });

    afterEach(() => {
        // Clean up the test file
        if (fs.existsSync(testFilePath)) {
            fs.unlinkSync(testFilePath);
        }
    });

    it('should read the CSV file in chunks', (done) => {
        const loader = new FileLoader(testFilePath, 10); // Small chunk size for testing

        const chunks: Buffer[] = [];
        loader.on('data', (chunk: Buffer) => {
            chunks.push(chunk);
        });

        loader.on('end', () => {
            const combined = Buffer.concat(chunks).toString();
            expect(combined).toBe('Name,Age,City\nJohn,30,New York\nJane,25,London');
            done();
        });

        loader.on('error', (err) => {
            done(err);
        });
    });

    it('should handle an empty CSV file', (done) => {
        fs.writeFileSync(testFilePath, '');
        const loader = new FileLoader(testFilePath);

        loader.on('data', () => {
            done(new Error('Should not emit data'));
        });

        loader.on('end', () => {
            done();
        });

        loader.on('error', (err) => {
            done(err);
        });
    });

    it('should handle a CSV file with only a header', (done) => {
        fs.writeFileSync(testFilePath, 'Name,Age,City\n');
        const loader = new FileLoader(testFilePath);

        let chunkReceived = false;
        let receivedChunk: Buffer | null = null;

        loader.on('data', (chunk: Buffer) => {
            chunkReceived = true;
            receivedChunk = chunk;
        });

        loader.on('end', () => {
            if (chunkReceived && receivedChunk) {
                const receivedString = receivedChunk.toString().trim();
                expect(receivedString).toBe('Name,Age,City');
                done();
            } else {
                done(new Error("No chunk received or chunk was null"));
            }
        });

        loader.on('error', (err) => {
            done(err);
        });
    });

    it('should handle an error if the file does not exist', (done) => {
        const nonExistentFilePath = 'nonexistent.csv';
        const loader = new FileLoader(nonExistentFilePath);

        loader.on('data', () => {
            done(new Error('Should not emit data'));
        });

        loader.on('end', () => {
            done(new Error('Should not emit end'));
        });

        loader.on('error', (err) => {
            expect(err.message).toContain('no such file or directory');
            done();
        });
    });

    it('should handle large files', (done) => {
        const largeData = 'Name,Age,City\n' + 'John,30,New York\n'.repeat(1000);
        fs.writeFileSync(testFilePath, largeData);
        const loader = new FileLoader(testFilePath, 1024);
        let totalLength = 0;

        loader.on('data', (chunk: Buffer) => {
            totalLength += chunk.length;
        });

        loader.on('end', () => {
            expect(totalLength).toBe(Buffer.from(largeData).length);
            done();
        });

        loader.on('error', (err) => {
            done(err);
        });
    });
});