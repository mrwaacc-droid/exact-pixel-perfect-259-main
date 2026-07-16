import React, { useState } from "react";
import { BookOpen, Download, Copy, X, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";

interface NotesSection {
  title: string;
  content: string;
  keyPoints: string[];
}

interface LearnerNotesProps {
  lessonTitle: string;
  summary: string;
  sections: NotesSection[];
  formulasAndRules?: Array<{
    formula: string;
    when: string;
    example: string;
  }>;
  commonMistakes?: Array<{
    mistake: string;
    correction: string;
  }>;
  onDownload?: () => void;
}

export function LearnerNotesPanel({
  lessonTitle,
  summary,
  sections,
  formulasAndRules = [],
  commonMistakes = [],
  onDownload,
}: LearnerNotesProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set([sections[0]?.title]),
  );
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const toggleSection = (title: string) => {
    const newSet = new Set(expandedSections);
    if (newSet.has(title)) {
      newSet.delete(title);
    } else {
      newSet.add(title);
    }
    setExpandedSections(newSet);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-[#7D2233]" />
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{lessonTitle} Notes</h3>
            <p className="text-xs text-gray-500">Study materials</p>
          </div>
        </div>
        <button
          onClick={onDownload}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Download notes"
        >
          <Download className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Summary */}
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
        </div>

        {/* Main Sections */}
        {sections.map((section, index) => (
          <div key={index} className="border-b border-gray-100 last:border-b-0">
            <button
              onClick={() => toggleSection(section.title)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
            >
              <h4 className="font-semibold text-gray-900 text-sm">{section.title}</h4>
              {expandedSections.has(section.title) ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>

            {expandedSections.has(section.title) && (
              <div className="px-6 pb-4 space-y-3">
                <p className="text-sm text-gray-600 leading-relaxed">{section.content}</p>

                {section.keyPoints.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                      Key Points
                    </p>
                    <ul className="space-y-1">
                      {section.keyPoints.map((point, pIndex) => (
                        <li key={pIndex} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-[#7D2233] mt-0.5">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Formulas and Rules */}
        {formulasAndRules.length > 0 && (
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection("Formulas & Rules")}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
            >
              <h4 className="font-semibold text-gray-900 text-sm">Formulas & Rules</h4>
              {expandedSections.has("Formulas & Rules") ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>

            {expandedSections.has("Formulas & Rules") && (
              <div className="px-6 pb-4 space-y-3">
                {formulasAndRules.map((item, index) => (
                  <div key={index} className="p-3 bg-[#F7E7EA] rounded-lg border border-[var(--crimson-soft)]">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <code className="text-xs font-mono font-semibold text-[#191314] flex-1">
                        {item.formula}
                      </code>
                      <button
                        onClick={() => copyToClipboard(item.formula, index)}
                        className="p-1 text-gray-500 hover:text-gray-700 hover:bg-[var(--crimson-soft)] rounded transition-colors flex-shrink-0"
                        title="Copy formula"
                      >
                        {copiedIndex === index ? (
                          <span className="text-xs text-green-600">✓</span>
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">
                      <strong>When:</strong> {item.when}
                    </p>
                    <p className="text-xs text-gray-600">
                      <strong>Example:</strong> {item.example}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Common Mistakes */}
        {commonMistakes.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection("Common Mistakes")}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
            >
              <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                Common Mistakes
              </h4>
              {expandedSections.has("Common Mistakes") ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>

            {expandedSections.has("Common Mistakes") && (
              <div className="px-6 pb-4 space-y-3">
                {commonMistakes.map((item, index) => (
                  <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-xs font-semibold text-red-900 mb-1">
                      ❌ Mistake: {item.mistake}
                    </p>
                    <p className="text-xs text-gray-700">
                      ✅ <strong>Correct:</strong> {item.correction}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface TeacherNotesProps {
  lessonTitle: string;
  keyMessages: string[];
  commonStudentConfusions: string[];
  timingNotes: string;
  adaptations?: {
    forSlowLearners: string;
    forFastLearners: string;
  };
}

export function TeacherNotesPanel({
  lessonTitle,
  keyMessages,
  commonStudentConfusions,
  timingNotes,
  adaptations,
}: TeacherNotesProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["Key Messages"]));

  const toggleSection = (title: string) => {
    const newSet = new Set(expandedSections);
    if (newSet.has(title)) {
      newSet.delete(title);
    } else {
      newSet.add(title);
    }
    setExpandedSections(newSet);
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg border border-amber-200 shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-amber-100 bg-amber-50/30">
        <h3 className="font-semibold text-gray-900 text-sm">Teacher Guide: {lessonTitle}</h3>
        <p className="text-xs text-gray-500 mt-1">For your reference</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Key Messages */}
        <div className="border-b border-gray-100">
          <button
            onClick={() => toggleSection("Key Messages")}
            className="w-full px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
          >
            <h4 className="font-semibold text-gray-900 text-xs uppercase tracking-wide">
              Key Messages
            </h4>
            {expandedSections.has("Key Messages") ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </button>

          {expandedSections.has("Key Messages") && (
            <div className="px-6 pb-3 space-y-2">
              {keyMessages.map((msg, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-[#7D2233] font-bold text-xs mt-0.5">★</span>
                  <p className="text-xs text-gray-700">{msg}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Common Confusions */}
        <div className="border-b border-gray-100">
          <button
            onClick={() => toggleSection("Common Confusions")}
            className="w-full px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
          >
            <h4 className="font-semibold text-gray-900 text-xs uppercase tracking-wide">
              Common Confusions
            </h4>
            {expandedSections.has("Common Confusions") ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </button>

          {expandedSections.has("Common Confusions") && (
            <div className="px-6 pb-3 space-y-2">
              {commonStudentConfusions.map((confusion, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold text-xs mt-0.5">⚠</span>
                  <p className="text-xs text-gray-700">{confusion}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Timing Notes */}
        <div className="border-b border-gray-100">
          <button
            onClick={() => toggleSection("Timing Notes")}
            className="w-full px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
          >
            <h4 className="font-semibold text-gray-900 text-xs uppercase tracking-wide">
              Timing Notes
            </h4>
            {expandedSections.has("Timing Notes") ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </button>

          {expandedSections.has("Timing Notes") && (
            <div className="px-6 pb-3">
              <p className="text-xs text-gray-700 leading-relaxed">{timingNotes}</p>
            </div>
          )}
        </div>

        {/* Adaptations */}
        {adaptations && (
          <div>
            <button
              onClick={() => toggleSection("Adaptations")}
              className="w-full px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
            >
              <h4 className="font-semibold text-gray-900 text-xs uppercase tracking-wide">
                Adaptations
              </h4>
              {expandedSections.has("Adaptations") ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>

            {expandedSections.has("Adaptations") && (
              <div className="px-6 pb-3 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-green-700 mb-1">For Slow Learners:</p>
                  <p className="text-xs text-gray-700">{adaptations.forSlowLearners}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-purple-700 mb-1">For Fast Learners:</p>
                  <p className="text-xs text-gray-700">{adaptations.forFastLearners}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
