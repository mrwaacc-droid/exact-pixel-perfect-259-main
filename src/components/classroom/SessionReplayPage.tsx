import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Captions,
  MessageCircle,
  Calendar,
  Clock,
  User,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface SessionReplayPageProps {
  sessionId: string;
  courseId: string;
  lessonId: string;
  lessonTitle: string;
  replayData?: {
    recordedAt: string;
    duration: number;
    teacherName: string;
    events: Array<{
      timestamp: number;
      type: string;
      description: string;
    }>;
    transcript: string;
    notes: string[];
  };
}

export function SessionReplayPage({
  sessionId,
  courseId,
  lessonId,
  lessonTitle,
  replayData,
}: SessionReplayPageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);

  const defaultData = {
    recordedAt: "2 hours ago",
    duration: 2700,
    teacherName: "Mr. Klass",
    events: [
      { timestamp: 0, type: "intro", description: "Lesson started" },
      { timestamp: 300, type: "concept", description: "Quadratic concept introduced" },
      { timestamp: 900, type: "example", description: "Worked example shown" },
      { timestamp: 1500, type: "practice", description: "Student practice time" },
      { timestamp: 2100, type: "quiz", description: "Quiz presented" },
      { timestamp: 2700, type: "summary", description: "Lesson summary" },
    ],
    transcript: "Mr. Klass: Let's learn about quadratic equations...",
    notes: ["Key concept: standard form", "Example: x² - 5x + 6 = 0"],
  };

  const data = replayData || defaultData;
  const progress = (currentTime / data.duration) * 100;
  const minutes = Math.floor(data.duration / 60);
  const seconds = data.duration % 60;

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSkip = (seconds: number) => {
    setCurrentTime(Math.max(0, Math.min(data.duration, currentTime + seconds)));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-black/50 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to={`/classroom/session/${sessionId}` as any}
            className="flex items-center gap-2 text-[#7D2233] hover:text-[var(--crimson-soft)] font-medium"
          >
            <ArrowLeft size={18} />
            Back
          </Link>
          <h1 className="text-xl font-bold text-white">{lessonTitle} - Replay</h1>
          <div className="w-32" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Video Player */}
        <div className="mb-6">
          <div className="bg-black rounded-lg overflow-hidden mb-4">
            {/* Video Frame */}
            <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative">
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mb-4">
                  <Play size={48} className="text-white/50" />
                </div>
                <p className="text-white/50">Session Replay</p>
              </div>

              {/* Caption Display */}
              {showCaptions && (
                <div className="absolute bottom-4 left-0 right-0 px-4">
                  <div className="bg-black/80 rounded px-3 py-2 text-center">
                    <p className="text-sm text-white">
                      "Let's explore the solutions to quadratic equations..."
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="px-4 pt-4">
              <Progress value={progress} className="bg-gray-700 h-1" />
              <div className="flex justify-between text-xs text-gray-400 mt-2 px-0.5">
                <span>
                  {Math.floor(currentTime / 60)}:
                  {String(Math.round(currentTime % 60)).padStart(2, "0")}
                </span>
                <span>
                  {minutes}:{String(seconds).padStart(2, "0")}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="px-4 py-4 flex items-center justify-between bg-gray-800/50 border-t border-gray-700">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSkip(-30)}
                  className="p-2 hover:bg-gray-700 rounded transition-colors"
                  title="Skip back 30s"
                >
                  <SkipBack size={20} />
                </button>

                <button
                  onClick={togglePlayPause}
                  className="p-2 hover:bg-gray-700 rounded transition-colors"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>

                <button
                  onClick={() => handleSkip(30)}
                  className="p-2 hover:bg-gray-700 rounded transition-colors"
                  title="Skip forward 30s"
                >
                  <SkipForward size={20} />
                </button>

                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 hover:bg-gray-700 rounded transition-colors ml-2"
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCaptions(!showCaptions)}
                  className={`p-2 rounded transition-colors ${
                    showCaptions ? "bg-[var(--crimson)]" : "hover:bg-gray-700"
                  }`}
                  title="Toggle captions"
                >
                  <Captions size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold text-white mb-4">Lesson Timeline</h2>
                <div className="space-y-2">
                  {data.events.map((event, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentTime(event.timestamp)}
                      className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-gray-700 transition-colors text-left"
                    >
                      <div className="text-xs text-gray-400 font-mono mt-1">
                        {Math.floor(event.timestamp / 60)}:
                        {String(event.timestamp % 60).padStart(2, "0")}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white capitalize">
                          {event.type.replace("_", " ")}
                        </div>
                        <div className="text-xs text-gray-400">{event.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Session Info */}
          <div className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-white mb-4">Session Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-400">Date</div>
                      <div className="text-sm text-white">{data.recordedAt}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-400">Duration</div>
                      <div className="text-sm text-white">{minutes} minutes</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <User size={16} className="text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-400">Teacher</div>
                      <div className="text-sm text-white">{data.teacherName}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {data.notes.length > 0 && (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <MessageCircle size={16} />
                    Your Notes
                  </h3>
                  <div className="space-y-2">
                    {data.notes.map((note, i) => (
                      <p key={i} className="text-sm text-gray-300">
                        • {note}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Transcript */}
        {showTranscript && (
          <Card className="mt-6 bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Transcript</h3>
                <button
                  onClick={() => setShowTranscript(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <ChevronDown size={20} />
                </button>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{data.transcript}</p>
            </CardContent>
          </Card>
        )}

        {!showTranscript && (
          <button
            onClick={() => setShowTranscript(true)}
            className="mt-4 w-full py-3 px-4 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <MessageCircle size={16} />
            Show Transcript
          </button>
        )}
      </main>
    </div>
  );
}
