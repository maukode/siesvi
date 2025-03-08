import { Readable } from 'stream';
import { open, FileHandle } from 'fs/promises';

export class FileLoader extends Readable {
  private filePath: string;
  private chunkSize: number;
  private fileHandle: FileHandle | null = null;
  private position: number = 0;
  private fileSize: number = 0;

  constructor(filePath: string, chunkSize: number = 64 * 1024) { // Default 64KB
    super();
    this.filePath = filePath;
    this.chunkSize = chunkSize;
  }

  async _construct(callback: (error?: Error | null) => void) {
    try {
      this.fileHandle = await open(this.filePath, 'r');
      const stats = await this.fileHandle.stat();
      this.fileSize = stats.size;
      callback(null);
    } catch (error) {
      callback(error as Error);
    }
  }

  async _read(_: number) {
    if (!this.fileHandle) {
      this.destroy(new Error('File handle not initialized.'));
      return;
    }

    if (this.position >= this.fileSize) {
      this.push(null); // End of stream
      if (this.fileHandle) {
        this.fileHandle.close();
        this.fileHandle = null;
      }
      return;
    }

    const buffer = Buffer.alloc(Math.min(this.chunkSize, this.fileSize - this.position));

    try {
      const { bytesRead } = await this.fileHandle.read(buffer, 0, buffer.length, this.position);
      if (bytesRead === 0) {
        this.push(null); // End of stream
        if (this.fileHandle) {
          this.fileHandle.close();
          this.fileHandle = null;
        }
        return;
      }
      this.position += bytesRead;
      this.push(buffer.subarray(0, bytesRead));
    } catch (error) {
      this.destroy(error as Error);
      if (this.fileHandle) {
        this.fileHandle.close();
        this.fileHandle = null;
      }
    }
  }

  async _destroy(error: Error | null, callback: (error: Error | null) => void) {
    if (this.fileHandle) {
      try {
        await this.fileHandle.close();
        this.fileHandle = null;
        callback(error);
      } catch (closeError) {
        callback(error || closeError as Error);
      }
    } else {
      callback(error);
    }
  }
}