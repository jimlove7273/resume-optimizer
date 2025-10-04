"use client";
import { useState, useEffect } from "react";
import { saveAs } from "file-saver";
import ReactMarkdown from "react-markdown";
import { useToast } from "../../hooks/useToast";
import { ToastContainer } from "../../components/Toast";
import LoadingAnimation from "../../components/LoadingAnimation";

export default function ResumeOptimizer() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState("Professional");
  const [optimized, setOptimized] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"input" | "output">("input");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { toasts, toast, removeToast } = useToast();

  const getWordCount = (text: string) => {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  };

  const getReadingTime = (text: string) => {
    const words = getWordCount(text);
    return Math.ceil(words / 200); // Average reading speed is ~200 words per minute
  };

  useEffect(() => {
    const savedHistory = localStorage.getItem("resumeHistory");
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    // Load draft from localStorage
    const savedDraft = localStorage.getItem("resumeDraft");
    if (savedDraft) {
      const draft = JSON.parse(savedDraft);
      setResumeText(draft.resumeText || "");
      setJobDescription(draft.jobDescription || "");
      setTone(draft.tone || "Professional");
      setLastSaved(new Date(draft.timestamp));
    }
  }, []);

  // Auto-save draft
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (resumeText.trim() || jobDescription.trim()) {
        const draft = {
          resumeText,
          jobDescription,
          tone,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem("resumeDraft", JSON.stringify(draft));
        setLastSaved(new Date());
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [resumeText, jobDescription, tone]);

  const handleOptimize = async () => {
    if (!resumeText.trim()) return;

    setLoading(true);
    setOptimized("");
    setActiveTab("output");

    try {
      const res = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription, tone }),
      });

      const data = await res.json();
      const optimizedResume = data.optimized ?? "";
      setOptimized(optimizedResume);
      setLoading(false);

      if (optimizedResume) {
        toast.success("Resume optimized successfully! 🎉");
        // Save to history
        const newHistory = [optimizedResume, ...history].slice(0, 5);
        setHistory(newHistory);
        localStorage.setItem("resumeHistory", JSON.stringify(newHistory));
      } else {
        toast.error("Failed to optimize resume. Please try again.");
      }
    } catch {
      setLoading(false);
      toast.error("An error occurred while optimizing your resume.");
    }
  };

  const handleDownload = () => {
    if (!optimized) return;
    try {
      const blob = new Blob([optimized], { type: "text/plain;charset=utf-8" });
      saveAs(blob, "optimized_resume.txt");
      toast.success("Resume downloaded successfully! 📄");
    } catch {
      toast.error("Failed to download resume. Please try again.");
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("resumeHistory");
    toast.info("History cleared successfully.");
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard! 📋");
    } catch {
      toast.error("Failed to copy to clipboard.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Resume Optimizer
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                  <p className="text-sm text-gray-500">
                    AI-powered resume enhancement
                  </p>
                  {lastSaved && (
                    <span className="text-xs text-gray-400 flex items-center">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Draft saved {lastSaved.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab("input")}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "input"
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                Input
              </button>
              <button
                onClick={() => setActiveTab("output")}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "output"
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
                disabled={!optimized && !loading}
              >
                Output
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Panel */}
          <div
            className={`lg:col-span-5 space-y-6 ${activeTab === "output" ? "hidden lg:block" : ""}`}
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Input Information
                </h2>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Resume Content *
                  </label>
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    rows={14}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder-gray-400 resize-none"
                    placeholder="Paste your current resume content here..."
                  />
                  <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                    <div className="flex space-x-4">
                      <span>{resumeText.length} characters</span>
                      <span>{getWordCount(resumeText)} words</span>
                      <span>{getReadingTime(resumeText)} min read</span>
                    </div>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        resumeText.length < 500
                          ? "bg-red-100 text-red-600"
                          : resumeText.length < 2000
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-green-100 text-green-600"
                      }`}
                    >
                      {resumeText.length < 500
                        ? "Too short"
                        : resumeText.length < 2000
                          ? "Good length"
                          : "Detailed"}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Job Description (Optional)
                    {jobDescription && (
                      <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                        +Tailored optimization
                      </span>
                    )}
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={8}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder-gray-400 resize-none"
                    placeholder="Paste the job description you're applying for to get a tailored resume..."
                  />
                  {jobDescription && (
                    <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                      <span>{getWordCount(jobDescription)} words</span>
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
                        Job-specific optimization enabled
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Optimization Tone
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-white"
                  >
                    <option value="Professional">Professional</option>
                    <option value="Casual">Casual</option>
                    <option value="Impactful">Impactful</option>
                    <option value="ATS-Focused">ATS-Focused</option>
                  </select>
                </div>

                {!resumeText.trim() && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 text-amber-500 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-sm font-medium text-amber-800">
                        Please enter your resume content to get started
                      </p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleOptimize}
                  disabled={loading || !resumeText.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Optimizing Resume...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      <span>Optimize Resume</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Output Panel */}
          <div
            className={`lg:col-span-7 space-y-6 ${activeTab === "input" ? "hidden lg:block" : ""}`}
          >
            {loading || optimized ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                  <h2 className="text-lg font-semibold text-white flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Optimized Resume
                  </h2>
                </div>

                <div className="p-6">
                  {loading ? (
                    <LoadingAnimation
                      message="AI is optimizing your resume..."
                      submessage="This may take a few moments"
                      showProgress={true}
                    />
                  ) : (
                    <>
                      <div className="bg-gray-50 rounded-xl p-4 mb-6 max-h-96 overflow-y-auto">
                        <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900">
                          <ReactMarkdown>{optimized}</ReactMarkdown>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={handleDownload}
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <span>Download TXT</span>
                        </button>

                        <button
                          onClick={() => copyToClipboard(optimized)}
                          className="flex-1 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center space-x-2"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                          <span>Copy to Clipboard</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-12 text-center">
                  <svg
                    className="w-16 h-16 text-gray-300 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No optimized resume yet
                  </h3>
                  <p className="text-gray-500">
                    Enter your resume content and click &quot;Optimize
                    Resume&quot; to get started.
                  </p>
                </div>
              </div>
            )}

            {/* History Section */}
            {history.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Recent Optimizations ({history.length})
                  </h3>
                  <button
                    onClick={clearHistory}
                    className="text-white/80 hover:text-white text-sm font-medium px-3 py-1 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Clear All
                  </button>
                </div>

                <div className="p-6 space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                  {history.map((item, i) => (
                    <div
                      key={i}
                      className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">
                          Version {history.length - i}
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => copyToClipboard(item)}
                            className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                          >
                            Copy
                          </button>
                          <button
                            onClick={() => {
                              setOptimized(item);
                              setActiveTab("output");
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Load
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-700 line-clamp-3 overflow-hidden">
                        <ReactMarkdown>
                          {item.substring(0, 200) + "..."}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer
        toasts={toasts.map((toast) => ({
          ...toast,
          onClose: removeToast,
        }))}
      />
    </div>
  );
}
