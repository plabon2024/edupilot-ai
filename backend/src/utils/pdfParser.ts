import fs from "fs/promises";
import { PDFParse } from "pdf-parse";
export const extractTextFromPDF = async (filePath: string) => {
  try {
    const dataBuffer = await fs.readFile(filePath);
    if (!dataBuffer || dataBuffer.length === 0) {
      throw new Error("File buffer is empty");
    }

    // pdf-parse is a default function
    const parser = new PDFParse(new Uint8Array(dataBuffer));
    const data = await parser.getText();
    return {
      text: data.text,
      numPages: data.pages,
      info: data.total,
    };
  } catch (error: any) {
    console.error("PDF parsing error:", error);

    throw new Error(
      "Failed to extract text from PDF: " + (error?.message || String(error))
    );
  }
};
