import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Send, X, HelpCircle } from "lucide-react";
import type { LearningMode } from "@/lib/types";
import { startListening, stopListening, speak, speakWithAccessibility } from "@/lib/speech";

interface QuestionSystemProps {
  mode: LearningMode;
  isOpen: boolean;
  questionText: string;
  onAnswer?: (answer: string, inputType: "text" | "voice") => void;
  onSkip?: () => void;
  onClose?: () => void;
  autoPlayAudio?: boolean;
}

export function QuestionSystem({
  mode,
  isOpen,
  questionText,
  onAnswer,
  onSkip,
  onClose,
  autoPlayAudio = true,
}: QuestionSystemProps) {
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const textInputRef = useRef<HTMLInputElement>(null);
  const recognizerRef = useRef<ReturnType<typeof startListening> | null>(null);

  const stopVoiceCapture = () => {
    if (recognizerRef.current) {
      stopListening(recognizerRef.current);
      recognizerRef.current = null;
    }
    setIsListening(false);
  };

  const beginVoiceCapture = () => {
    setTranscript("");
    stopVoiceCapture();

    const recognizer = startListening(
      (result, isFinal) => {
        setTranscript(result);
        if (!isFinal) return;

        if (result.toLowerCase().includes("no question")) {
          handleSkip();
        } else {
          handleAnswer(result, "voice");
        }

        stopVoiceCapture();
      },
      undefined,
      () => {
        stopVoiceCapture();
      },
    );

    recognizerRef.current = recognizer;
    setIsListening(Boolean(recognizer));
  };

  // Auto-play audio based on mode
  useEffect(() => {
    if (isOpen && autoPlayAudio) {
      if (mode === "blind") {
        // Audio on by default for blind mode
        speak(questionText);
      } else if (mode === "standard" || mode === "deaf") {
        // Optional audio, just show text
        if (mode === "standard") {
          speakWithAccessibility(questionText, { rate: 0.9 });
        }
      }
    }
  }, [isOpen, mode, questionText, autoPlayAudio]);

  // Focus management
  useEffect(() => {
    if (isOpen && mode !== "blind") {
      textInputRef.current?.focus();
    }
  }, [isOpen, mode]);

  // Blind mode: auto-enable microphone
  useEffect(() => {
    if (isOpen && mode === "blind" && !recognizerRef.current) {
      beginVoiceCapture();
    }
    return () => {
      stopVoiceCapture();
    };
  }, [isOpen, mode]);

  const handleAnswer = (answer: string, inputType: "text" | "voice" = "text") => {
    onAnswer?.(answer, inputType);
    setInputValue("");
    setTranscript("");
  };

  const handleSkip = () => {
    onSkip?.();
    setInputValue("");
    setTranscript("");
  };

  const handleVoiceInput = () => {
    if (isListening) {
      stopVoiceCapture();
    } else {
      beginVoiceCapture();
    }
  };

  const handleClose = () => {
    stopVoiceCapture();
    onClose?.();
  };

  if (!isOpen) return null;

  // Determine ambient accessibility adaptations
  const isMinimalFocus = mode === "adhd_focus";
  const isVisualFirst = mode === "deaf";
  const isAudioFirst = mode === "blind";
  const isKeyboardFirst = mode === "blind" || mode === "standard";
  const isTactileLarge = mode === "motor_support";
  const showVoiceInput = mode !== "speech_difficulty" && mode !== "deaf";

  // Build adaptive styles
  const overlayClass = isMinimalFocus
    ? "fixed inset-0 bg-black/80 flex items-center justify-center z-50 transition-opacity"
    : isAudioFirst || isVisualFirst || isTactileLarge
    ? "fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 transition-opacity"
    : "fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-xl z-50 animate-slide-up";

  const containerClass = isMinimalFocus
    ? "bg-white rounded-2xl max-w-md w-full p-8 mx-4 shadow-2xl border border-gray-100"
    : isAudioFirst || isVisualFirst || isTactileLarge
    ? "bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100"
    : "max-w-4xl mx-auto p-4 flex items-center gap-4";

  const titleClass = isMinimalFocus
    ? "text-2xl font-black text-gray-900 tracking-tight mb-4"
    : isTactileLarge
    ? "text-xl font-bold text-gray-900 mb-3"
    : "text-base font-semibold text-gray-900 mb-2";

  const questionTextClass = isMinimalFocus
    ? "text-lg text-gray-700 font-medium mb-6 leading-relaxed"
    : isTactileLarge
    ? "text-base text-gray-700 mb-4 leading-relaxed"
    : "text-sm text-gray-600 mb-3 leading-normal";

  const inputPadding = isTactileLarge ? "px-4 py-4 text-lg" : "px-3 py-2 text-sm";
  const buttonPadding = isTactileLarge ? "px-6 py-4 text-base font-bold min-h-[48px]" : "px-4 py-2 text-sm font-semibold";

  return (
    <div className={overlayClass} role="dialog" aria-modal="true" aria-label="Question checkpoint">
      <div className={containerClass}>
        {/* Visual/Audio Icon Indicator */}
        {!isMinimalFocus && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[#7D2233]">
            <HelpCircle className="h-6 w-6" />
          </div>
        )}

        <div className="flex-1">
          {/* Subtle Ambient Header */}
          <h4 className={titleClass}>Question Checkpoint</h4>
          <p className={questionTextClass}>{questionText}</p>

          {/* Form Content */}
          <div className="space-y-4">
            {/* Visual Feedback for Voice Interaction */}
            {isListening && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-[#7D2233] font-medium animate-pulse">
                Listening... {transcript && <span className="text-gray-700 font-normal">"{transcript}"</span>}
              </div>
            )}

            {/* Input fields */}
            {!isAudioFirst && (
              <div className="flex items-center gap-2">
                <input
                  ref={textInputRef}
                  type="text"
                  placeholder={
                    showVoiceInput
                      ? "Type your answer or use voice input..."
                      : "Type your answer..."
                  }
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && inputValue.trim()) {
                      handleAnswer(inputValue);
                    }
                  }}
                  className={`flex-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7D2233] ${inputPadding}`}
                />

                {showVoiceInput && (
                  <button
                    onClick={handleVoiceInput}
                    className={`p-3 rounded-lg border transition-all ${
                      isListening
                        ? "bg-red-50 border-red-200 text-[#7D2233]"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                    title="Voice input"
                    aria-label={isListening ? "Stop voice transcription" : "Start voice transcription"}
                  >
                    {isListening ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                  </button>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleAnswer(inputValue || transcript)}
                disabled={!inputValue.trim() && !transcript.trim()}
                className={`bg-[#7D2233] text-white rounded-lg hover:bg-[var(--crimson-dark)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm ${buttonPadding}`}
              >
                <Send className="h-4 w-4" /> Submit Answer
              </button>

              <button
                onClick={handleSkip}
                className={`text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors ${buttonPadding}`}
              >
                No Question
              </button>

              <button
                onClick={handleClose}
                className={`text-gray-500 hover:text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors ${buttonPadding}`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
