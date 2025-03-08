import { CsvValidator, CsvValidatorConfig } from '../src/siesvi.validator'; // Adjust the path
import { Readable, Writable } from 'stream';
import { finished } from 'stream/promises';

describe('CsvValidator', () => {
  it('should pass valid CSV data', async () => {
    const config: CsvValidatorConfig = {
      expectedHeader: ['Name', 'Age', 'City'],
      minColumns: 3,
      maxColumns: 3,
    };
    const validator = new CsvValidator(config);
    const input = Readable.from(`Name,Age,City\nJohn,30,New York\nJane,25,London`);
    const output = new Writable({
      write(_chunk, _encoding, callback) {
        callback();
      },
    });

    input.pipe(validator).pipe(output);

    await finished(output);
  });

  it('should fail on header mismatch', async () => {
    const config: CsvValidatorConfig = {
      expectedHeader: ['Name', 'Age', 'City'],
    };
    const validator = new CsvValidator(config);
    const input = Readable.from(`FirstName,Age,City\nJohn,30,New York`);
    const output = new Writable({
      write(_chunk, _encoding, callback) {
        callback();
      },
    });

    const promise = new Promise<void>((resolve, reject) => {
        validator.on('error', (err) => {
            expect(err.message).toBe('Header mismatch at column 1. Expected \'Name\', got \'FirstName\' on line 1');
            reject(err);
        });
        output.on('finish', resolve);
    });

    input.pipe(validator).pipe(output);

    await expect(promise).rejects.toThrow('Header mismatch at column 1. Expected \'Name\', got \'FirstName\' on line 1');
  });

  it('should fail on header column count mismatch', async () => {
    const config: CsvValidatorConfig = {
      expectedHeader: ['Name', 'Age', 'City'],
    };
    const validator = new CsvValidator(config);
    const input = Readable.from(`Name,Age\nJohn,30`);
    const output = new Writable({
      write(_chunk, _encoding, callback) {
        callback();
      },
    });

    const promise = new Promise<void>((resolve, reject) => {
        validator.on('error', (err) => {
            expect(err.message).toBe('Header column count mismatch. Expected 3, got 2 on line 1');
            reject(err);
        });
        output.on('finish', resolve);
    });

    input.pipe(validator).pipe(output);

    await expect(promise).rejects.toThrow('Header column count mismatch. Expected 3, got 2 on line 1');
  });

  it('should fail on too few columns', async () => {
    const config: CsvValidatorConfig = {
      minColumns: 3,
    };
    const validator = new CsvValidator(config);
    const input = Readable.from(`Name,Age,City\nJohn,30`);
    const output = new Writable({
      write(_chunk, _encoding, callback) {
        callback();
      },
    });

    const promise = new Promise<void>((resolve, reject) => {
        validator.on('error', (err) => {
            expect(err.message).toBe('Row 2 has too few columns. Expected at least 3, got 2');
            reject(err);
        });
        output.on('finish', resolve);
    });

    input.pipe(validator).pipe(output);

    await expect(promise).rejects.toThrow('Row 2 has too few columns. Expected at least 3, got 2');
  });

  it('should fail on too many columns', async () => {
    const config: CsvValidatorConfig = {
      maxColumns: 3,
    };
    const validator = new CsvValidator(config);
    const input = Readable.from(`Name,Age,City\nJohn,30,New York,Extra`);
    const output = new Writable({
      write(_chunk, _encoding, callback) {
        callback();
      },
    });

    const promise = new Promise<void>((resolve, reject) => {
        validator.on('error', (err) => {
            expect(err.message).toBe('Row 2 has too many columns. Expected at most 3, got 4');
            reject(err);
        });
        output.on('finish', resolve);
    });

    input.pipe(validator).pipe(output);

    await expect(promise).rejects.toThrow('Row 2 has too many columns. Expected at most 3, got 4');
  });

  it('should handle empty lines', async () => {
    const config: CsvValidatorConfig = {
      minColumns: 2,
    };
    const validator = new CsvValidator(config);
    const input = Readable.from(`Name,Age\nJohn,30\n\nJane,25\n`);
    const output = new Writable({
      write(_chunk, _encoding, callback) {
        callback();
      },
    });

    input.pipe(validator).pipe(output);

    await finished(output);
  });
});