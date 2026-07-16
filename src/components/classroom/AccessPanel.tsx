import {
  Eye,
  Volume2,
  Subtitles,
  Keyboard,
  MousePointer,
  Moon,
  Sun,
  Text,
  Gauge,
  Accessibility,
} from "lucide-react";
import type { ClassroomContext, LearnerAccessProfile } from "@/lib/types";

interface AccessPanelProps {
  classroomContext: ClassroomContext;
  onAccessChange?: (profile: Partial<LearnerAccessProfile>) => void;
}

export function AccessPanel({ classroomContext, onAccessChange }: AccessPanelProps) {
  const { learnerAccessProfile } = classroomContext;

  const toggleSetting = (setting: keyof typeof learnerAccessProfile, value?: any) => {
    const newProfile: Partial<LearnerAccessProfile> = {
      [setting]: value ?? !(learnerAccessProfile[setting] as any),
    };
    onAccessChange?.(newProfile);
  };

  const settings = [
    {
      category: "Visual",
      icon: Eye,
      items: [
        {
          key: "captionsEnabled",
          label: "Captions",
          description: "Show text captions during lessons",
          enabled: learnerAccessProfile.captionsEnabled,
        },
        {
          key: "boardDescriptionsEnabled",
          label: "Board descriptions",
          description: "Audio descriptions of whiteboard content",
          enabled: learnerAccessProfile.boardDescriptionsEnabled,
        },
        {
          key: "highContrast",
          label: "High contrast",
          description: "Increase contrast for better visibility",
          enabled: learnerAccessProfile.highContrast,
        },
        {
          key: "largeText",
          label: "Large text",
          description: "Increase text size throughout",
          enabled: learnerAccessProfile.largeText,
        },
      ],
    },
    {
      category: "Audio",
      icon: Volume2,
      items: [
        {
          key: "audioEnabled",
          label: "Audio",
          description: "Enable teacher voice and sounds",
          enabled: learnerAccessProfile.audioEnabled,
        },
        {
          key: "voiceInputEnabled",
          label: "Voice input",
          description: "Use voice commands instead of typing",
          enabled: learnerAccessProfile.voiceInputEnabled,
        },
      ],
    },
    {
      category: "Navigation",
      icon: Keyboard,
      items: [
        {
          key: "keyboardShortcutsEnabled",
          label: "Keyboard shortcuts",
          description: "Use keyboard for quick actions",
          enabled: learnerAccessProfile.keyboardShortcutsEnabled,
        },
        {
          key: "reducedMotion",
          label: "Reduced motion",
          description: "Minimize animations and transitions",
          enabled: learnerAccessProfile.reducedMotion,
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white overflow-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Accessibility size={18} className="text-[var(--crimson)]" />
          <h3 className="text-sm font-semibold text-gray-900">Learning Access</h3>
        </div>
        <p className="text-xs text-gray-500 mt-1">Customize your learning experience</p>
      </div>

      {/* Settings */}
      <div className="p-4 space-y-6">
        {settings.map((section) => (
          <div key={section.category}>
            <div className="flex items-center gap-2 mb-3">
              <section.icon size={16} className="text-gray-600" />
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                {section.category}
              </h4>
            </div>

            <div className="space-y-2">
              {section.items.map((item) => (
                <button
                  key={item.key}
                  onClick={() => toggleSetting(item.key as any)}
                  className="w-full text-left p-3 rounded-lg border transition-colors hover:border-[var(--crimson-soft)]"
                  style={{
                    borderColor: item.enabled ? "var(--primary)" : "var(--gray-200)",
                    backgroundColor: item.enabled ? "var(--primary-light)" : "var(--white)",
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{item.label}</span>
                        {item.enabled && <span className="w-2 h-2 rounded-full bg-[var(--crimson)]" />}
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">{item.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Pace and Style */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Gauge size={16} className="text-gray-600" />
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Learning Preferences
            </h4>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-2 block">Lesson Pace</label>
              <div className="grid grid-cols-3 gap-2">
                {["slow", "normal", "fast"].map((pace) => (
                  <button
                    key={pace}
                    onClick={() => toggleSetting("lessonPace" as any, pace)}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
                      learnerAccessProfile.lessonPace === pace
                        ? "bg-[var(--crimson)] text-white border-[var(--crimson)]"
                        : "bg-white text-gray-700 border-gray-200 hover:border-[var(--crimson-soft)]"
                    }`}
                  >
                    {pace.charAt(0).toUpperCase() + pace.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 mb-2 block">
                Explanation Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["simple", "standard", "detailed"].map((style) => (
                  <button
                    key={style}
                    onClick={() => toggleSetting("explanationStyle" as any, style)}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
                      learnerAccessProfile.explanationStyle === style
                        ? "bg-[var(--crimson)] text-white border-[var(--crimson)]"
                        : "bg-white text-gray-700 border-gray-200 hover:border-[var(--crimson-soft)]"
                    }`}
                  >
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">Settings saved automatically</p>
      </div>
    </div>
  );
}
