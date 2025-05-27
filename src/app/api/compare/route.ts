import { type NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    const { text1, text2, model } = await request.json();

    if (!text1 || !text2) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    if (!model || !["ollama", "openai"].includes(model)) {
      return NextResponse.json(
        { error: "Valid model type (ollama or openai) is required" },
        { status: 400 }
      );
    }

    let comparisonResult: any;

    if (model === "ollama") {
      comparisonResult = await compareWithOllama(text1, text1);
    } else {
      comparisonResult = await compareWithOpenAI(text1, text2);
    }

    return NextResponse.json(comparisonResult);
  } catch (error) {
    console.error("Error comparing documents:", error);
    return NextResponse.json(
      { error: "Failed to compare documents" },
      { status: 500 }
    );
  }
}

async function compareWithOllama(text1: string, text2: string) {
  try {
    // Ollama runs locally, so we need to make a request to the local Ollama server
    const response = await axios.post("http://localhost:11434/api/generate", {
      model: "llama3", // Default model, can be configured
      prompt: `Compare the following two documents and provide:
1. A similarity score as a percentage
2. Key differences between the documents
3. A summary of the main points in each document

Document 1:
${text1.substring(0, 5000)}

Document 2:
${text2.substring(0, 5000)}`,
      stream: false,
    });

    return {
      comparison: response.data.response,
      model: "ollama",
    };
  } catch (error) {
    console.error("Error using Ollama:", error);
    throw new Error("Failed to compare with Ollama");
  }
}

async function compareWithOpenAI(text1: string, text2: string) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("OpenAI API key is not configured");
    }

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a structured and analytical document comparison assistant. Provide objective and well-formatted results.",
          },
          {
            role: "user",
            content: `
    Compare the following two documents and provide a structured response with the following:
    
    1. **Similarity Score** — Estimate how similar the two documents are in terms of structure, content, and phrasing (as a percentage).
    2. **Key Differences** — List significant conceptual, structural, or descriptive differences. Use bullet points (a., b., etc.).
    3. **Words or Phrases Changed, Added, or Removed** — Identify specific words/phrases that differ between the documents, categorizing them as:
       - Added
       - Removed
       - Changed (show "from" → "to")
    
    Use this exact format:
    
    1. Similarity Score: XX%
    2. Key Differences:
        a. ...
        b. ...
    3. Words or Phrases Changed, Added, or Removed:
        a. ...
        b. ...
    
    Document 1:
    ${text1.substring(0, 5000)}
    
    Document 2:
    ${text2.substring(0, 5000)}
            `,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      comparison: response.data.choices[0].message.content,
      model: "openai",
    };
  } catch (error) {
    console.error("Error using OpenAI:", error);
    throw new Error("Failed to compare with OpenAI");
  }
}
