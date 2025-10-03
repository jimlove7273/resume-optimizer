"use client";
import { useEffect, useState } from "react";

interface LoadingAnimationProps {
  message?: string;
  submessage?: string;
  showProgress?: boolean;
}

export default function LoadingAnimation({
  message = "Processing your resume...",
  submessage = "This may take a few moments",
  showProgress = true
}: LoadingAnimationProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "Analyzing resume content",
    "Processing job requirements",
    "Optimizing language and format",
    "Finalizing improvements"
  ];

  useEffect(() => {
    if (!showProgress) return;

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 500);

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length);
    }, 2000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [showProgress, steps.length]);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      {/* Main loading animation */}
      <div className="relative mb-8">
        <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin">
          <div className="absolute top-1 left-1 w-6 h-6 bg-blue-600 rounded-full animate-pulse"></div>
        </div>

        {/* Floating dots animation */}
        <div className="absolute -top-2 -left-2 w-24 h-24">
          <div className="absolute top-0 left-1/2 w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="absolute top-1/2 right-0 w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="absolute top-1/2 left-0 w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
        </div>
      </div>

      {/* Message */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
        {message}
      </h3>

      {/* Submessage */}
      <p className="text-gray-600 mb-6 text-center">
        {submessage}
      </p>

      {/* Progress indicator */}
      {showProgress && (
        <div className="w-full max-w-md space-y-4">
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>

          {/* Current step indicator */}
          <div className="text-center">
            <p className="text-sm text-gray-500 animate-pulse">
              {steps[currentStep]}...
            </p>
          </div>
        </div>
      )}

      {/* AI brain animation */}
      <div className="mt-8 flex items-center justify-center space-x-1">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <span className="text-sm text-gray-500 ml-2">AI is thinking</span>
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-32 h-32 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
    </div>
  );
}
