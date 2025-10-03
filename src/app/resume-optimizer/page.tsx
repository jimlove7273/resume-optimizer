"use client";
import { useState, useEffect } from "react";
import { saveAs } from "file-saver";
import ReactMarkdown from "react-markdown";

export default function ResumeOptimizer() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState("Professional");
  const [optimized, setOptimized] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem("resumeHistory");
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  const handleOptimize = async () => {
    if (!resumeText.trim()) return;

    setLoading(true);
    setOptimized("");

    const res = await fetch("/api/optimize-resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeText, jobDescription, tone }),
    });

    const data = await res.json();
    const optimizedResume = data.optimized ?? "";
    setOptimized(optimizedResume);
    setLoading(false);

    // Save to history
    const newHistory = [optimizedResume, ...history].slice(0, 5); // last 5
    setHistory(newHistory);
    localStorage.setItem("resumeHistory", JSON.stringify(newHistory));
  };

  const handleDownload = () => {
    if (!optimized) return;
    const blob = new Blob([optimized], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "optimized_resume.txt");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 bg-gray-100 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-center mb-8">Resume Optimizer</h1>

      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div>
          <label
            htmlFor="resume"
            className="block text-sm font-medium text-gray-700"
          >
            Your Resume
          </label>
          <textarea
            id="resume"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={12}
            className="w-full border rounded-md px-4 py-2 text-sm text-gray-900 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="requirements"
            className="block text-sm font-medium text-gray-700"
          >
            Job Description (optional)
          </label>
          <textarea
            id="requirements"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={6}
            className="w-full border rounded-md px-4 py-2 text-sm text-gray-900 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="tone"
            className="block text-sm font-medium text-gray-700"
          >
            Tone
          </label>
          <select
            id="tone"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="Professional">Professional</option>
            <option value="Casual">Casual</option>
            <option value="Impactful">Impactful</option>
            <option value="ATS-Focused">ATS-Focused</option>
          </select>
        </div>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full"
          onClick={handleOptimize}
          disabled={loading}
        >
          {loading ? "Optimizing..." : "Optimize Resume"}
        </button>
      </div>

      {optimized && (
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <h2 className="text-xl font-semibold">Optimized Resume</h2>
          <div className="whitespace-pre-wrap bg-gray-50 p-2 border rounded-md text-sm">
            <ReactMarkdown>{optimized}</ReactMarkdown>
          </div>
          <button
            className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 w-full"
            onClick={handleDownload}
          >
            Download TXT
          </button>
        </div>
      )}

      {history.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <h3 className="font-semibold">Recent Optimizations</h3>
          {history.map((item, i) => (
            <div
              key={i}
              className="whitespace-pre-wrap bg-gray-100 p-2 border rounded-md text-sm"
            >
              <ReactMarkdown>{item}</ReactMarkdown>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
