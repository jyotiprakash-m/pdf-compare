import { NextRequest, NextResponse } from 'next/server';
import { spawn, exec } from 'child_process';
import { Readable } from 'stream';
import fetch from 'node-fetch';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Check if pdftotext is installed
async function isPdftotextInstalled(): Promise<boolean> {
  try {
    await execAsync('which pdftotext');
    return true;
  } catch (error) {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'PDF URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Check if pdftotext is installed
    const pdftotextInstalled = await isPdftotextInstalled();
    if (!pdftotextInstalled) {
      return NextResponse.json(
        { 
          error: 'PDF extraction tool not found',
          message: 'The pdftotext utility (part of poppler-utils) is required but not installed. Please install it using: sudo apt-get install poppler-utils'
        },
        { status: 500 }
      );
    }

    try {
      // Download PDF directly as a buffer
      console.log(`Downloading PDF from ${url}`);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to download PDF: ${response.statusText}`);
      }
      
      const pdfBuffer = await response.arrayBuffer();
      
      // Check if buffer is empty
      if (pdfBuffer.byteLength === 0) {
        throw new Error('Downloaded file is empty');
      }

      // Extract text using pdftotext with buffer input
      console.log('Extracting text from PDF buffer');
      const extractedText = await extractTextFromPdfBuffer(Buffer.from(pdfBuffer));

      return NextResponse.json({ text: extractedText });
    } catch (error) {
      console.error('PDF processing error:', error);
      throw error;
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to extract text from PDF', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Function to extract text from PDF buffer using pdftotext
async function extractTextFromPdfBuffer(pdfBuffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Create a readable stream from the buffer
      const bufferStream = new Readable();
      bufferStream.push(pdfBuffer);
      bufferStream.push(null); // Signal the end of the stream
      
      // Spawn pdftotext process with stdin/stdout pipes
      const pdfToText = spawn('pdftotext', ['-', '-']);
      
      // Collect stdout chunks
      const chunks: Buffer[] = [];
      pdfToText.stdout.on('data', (chunk) => {
        chunks.push(Buffer.from(chunk));
      });
      
      // Handle process completion
      pdfToText.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`pdftotext process exited with code ${code}`));
          return;
        }
        
        // Combine chunks and convert to string
        const textBuffer = Buffer.concat(chunks);
        resolve(textBuffer.toString('utf-8'));
      });
      
      // Handle process errors
      pdfToText.on('error', (err) => {
        reject(new Error(`pdftotext process error: ${err.message}`));
      });
      
      // Handle stderr output
      pdfToText.stderr.on('data', (data) => {
        console.error(`pdftotext stderr: ${data}`);
      });
      
      // Pipe the PDF buffer to pdftotext's stdin
      bufferStream.pipe(pdfToText.stdin);
      
      // Handle stdin errors
      pdfToText.stdin.on('error', (err) => {
        reject(new Error(`pdftotext stdin error: ${err.message}`));
      });
    } catch (error) {
      reject(new Error(`Failed to extract text: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  });
}
