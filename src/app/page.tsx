"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import ComparisonResult from "../../components/ComparisonResult";

export default function Home() {
  const [url1, setUrl1] = useState("http://localhost:3000/notebookLM1.pdf");
  const [url2, setUrl2] = useState("http://localhost:3000/notebookLM2.pdf");
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [totalPages1, setTotalPages1] = useState(1);
  const [totalPages2, setTotalPages2] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorDetails, setErrorDetails] = useState("");
  const [tab1, setTab1] = useState<"text" | "pdf">("pdf");
  const [tab2, setTab2] = useState<"text" | "pdf">("pdf");
  const [model, setModel] = useState("openai");
  const [compareResult, setCompareResult] = useState({
    comparison: "",
    model: "",
  });
  const [loadingCompare, setLoadingCompare] = useState(false);

  const containerRef1 = useRef<HTMLDivElement>(null);
  const containerRef2 = useRef<HTMLDivElement>(null);
  const [containerWidth1, setContainerWidth1] = useState(600);
  const [containerWidth2, setContainerWidth2] = useState(600);

  useLayoutEffect(() => {
    const updateWidths = () => {
      if (containerRef1.current) {
        setContainerWidth1(containerRef1.current.offsetWidth);
      }
      if (containerRef2.current) {
        setContainerWidth2(containerRef2.current.offsetWidth);
      }
    };

    updateWidths();
    window.addEventListener("resize", updateWidths);
    return () => window.removeEventListener("resize", updateWidths);
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const originalWarn = console.warn;
    const ignoreMessage = "AbortException: TextLayer task cancelled";

    console.warn = (...args) => {
      if (typeof args[0] === "string" && args[0].includes(ignoreMessage)) {
        return;
      }
      originalWarn(...args);
    };

    return () => {
      console.warn = originalWarn;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url1 || !url2) {
      setError("Please enter both PDF URLs");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setErrorDetails("");
      setText1("");
      setText2("");

      const fetchText = async (url: string) => {
        const res = await fetch("/api/extract-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to extract text from PDF");
        }
        return data.text;
      };

      const [t1, t2] = await Promise.all([fetchText(url1), fetchText(url2)]);
      setText1(t1);
      setText2(t2);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      if (
        errorMessage.includes("pdftotext") ||
        errorMessage.includes("ENOENT")
      ) {
        setErrorDetails(
          "This error may be because the pdftotext utility is not installed. Please make sure poppler-utils is installed on your system."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompare = async () => {
    try {
      setLoadingCompare(true);
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text1, text2, model }),
      });
      setLoadingCompare(false);
      const data = await res.json();
      setCompareResult(data);
      console.log("Comparison result:", data); // replace with UI display
    } catch (err) {
      console.error("Comparison failed", err);
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">PDF Text Extractor</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Compare text from two PDF URLs
        </p>
      </header>

      <main className="space-y-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="pdf-url-1"
              className="block text-sm font-medium mb-1"
            >
              PDF URL 1
            </label>
            <input
              id="pdf-url-1"
              type="url"
              value={url1}
              onChange={(e) => setUrl1(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              required
              disabled
            />
          </div>
          <div>
            <label
              htmlFor="pdf-url-2"
              className="block text-sm font-medium mb-1"
            >
              PDF URL 2
            </label>
            <input
              id="pdf-url-2"
              type="url"
              value={url2}
              onChange={(e) => setUrl2(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              required
              disabled
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Extracting..." : "Extract Text from Both"}
          </button>
        </form>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
            <p className="font-medium">{error}</p>
            {errorDetails && <p className="mt-2 text-sm">{errorDetails}</p>}
          </div>
        )}

        {(text1 || text2) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PDF 1 Panel */}
            <div
              ref={containerRef1}
              className="border rounded-md  bg-white shadow max-h-[600px] overflow-y-auto"
            >
              <div className="flex space-x-2 border-b mb-2 p-2 sticky top-0 bg-white z-10">
                <button
                  className={`flex-1 py-2 text-sm font-medium rounded-sm ${
                    tab1 === "text" ? "bg-blue-100" : "hover:bg-gray-100"
                  }`}
                  onClick={() => setTab1("text")}
                  type="button"
                >
                  Text View
                </button>
                <button
                  className={`flex-1 py-2 text-sm font-medium rounded-sm ${
                    tab1 === "pdf" ? "bg-blue-100" : "hover:bg-gray-100"
                  }`}
                  onClick={() => setTab1("pdf")}
                  type="button"
                >
                  PDF View
                </button>
              </div>
              {tab1 === "text" ? (
                <div className="p-4 whitespace-pre-wrap">{text1}</div>
              ) : (
                <Document
                  file={url1}
                  onLoadSuccess={({ numPages }) => setTotalPages1(numPages)}
                >
                  {Array.from({ length: totalPages1 }, (_, index) => (
                    <Page
                      key={`page1_${index + 1}`}
                      pageNumber={index + 1}
                      width={containerWidth1 - 32}
                    />
                  ))}
                </Document>
              )}
            </div>

            {/* PDF 2 Panel */}
            <div
              ref={containerRef2}
              className="border rounded-md bg-white shadow max-h-[600px] overflow-y-auto"
            >
              <div className="flex space-x-2 border-b mb-2 p-2 sticky top-0 bg-white z-10">
                <button
                  className={`flex-1 py-2 text-sm font-medium rounded-sm ${
                    tab2 === "text" ? "bg-blue-100" : "hover:bg-gray-100"
                  }`}
                  onClick={() => setTab2("text")}
                  type="button"
                >
                  Text View
                </button>
                <button
                  className={`flex-1 py-2 text-sm font-medium rounded-sm ${
                    tab2 === "pdf" ? "bg-blue-100" : "hover:bg-gray-100"
                  }`}
                  onClick={() => setTab2("pdf")}
                  type="button"
                >
                  PDF View
                </button>
              </div>
              {tab2 === "text" ? (
                <div className="p-4 whitespace-pre-wrap">{text2}</div>
              ) : (
                <Document
                  file={url2}
                  onLoadSuccess={({ numPages }) => setTotalPages2(numPages)}
                >
                  {Array.from({ length: totalPages2 }, (_, index) => (
                    <Page
                      key={`page2_${index + 1}`}
                      pageNumber={index + 1}
                      width={containerWidth2 - 32}
                    />
                  ))}
                </Document>
              )}
            </div>
          </div>
        )}

        {text1 && text2 && (
          <div>
            <label
              htmlFor="model"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              AI Model
            </label>
            <select
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="openai">OpenAI (GPT-4)</option>
              <option value="ollama">Ollama (Local LLM)</option>
            </select>
            <button
              type="button"
              onClick={handleCompare}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 mt-3 disabled:cursor-not-allowed"
            >
              {loadingCompare ? "Comparing..." : "Compare Texts"}
            </button>

            {compareResult.comparison && (
              <ComparisonResult data={compareResult} />
            )}
          </div>
        )}

        <div className="text-center text-sm text-gray-500 mt-8">
          <p>
            Paste two PDF URLs to extract and compare their text content
            side-by-side.
          </p>
          <p className="mt-2 font-medium">
            Note: Server must have poppler-utils installed.
          </p>
        </div>
      </main>

      <footer className="mt-12 pt-6 border-t text-center text-sm text-gray-500">
        <p>PDF Text Extractor - Built with Next.js</p>
      </footer>
    </div>
  );
}
