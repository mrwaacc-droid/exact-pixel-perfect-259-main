import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { ClassroomPage } from "@/components/classroom/ClassroomPage";
import { DEMO_QUADRATIC_LESSON, DEMO_CLASSROOM_CONTEXT } from "@/lib/demo-data";
import { generateTeacherResponse } from "@/lib/ai-teacher";
import { speak, stopSpeech, createRecognizer, startListening, stopListening } from "@/lib/speech";
import type { TeacherState, ChatMessage, ClassroomContext } from "@/lib/types";
import { ArrowLeft, Subtitles, Eye, EyeOff, Mic, MicOff, Loader2, Sparkles } from "lucide-react";
import { requireClientAuthRoute } from "@/lib/route-guards";

export const Route = createFileRoute("/classroom-enhanced/$lessonId")({
  beforeLoad: () => requireClientAuthRoute(),
  component: ClassroomLesson,
  head: ({ params }) => ({
    meta: [
      { title: `${params.lessonId} — Klassruum` },
      { name: "description", content: "Interactive AI classroom lesson" },
    ],
  }),
});

function ClassroomLesson() {
  const { lessonId } = Route.useParams();
  const [classroomContext, setClassroomContext] =
    useState<ClassroomContext>(DEMO_CLASSROOM_CONTEXT);
  const [teacherState, setTeacherState] = useState<TeacherState>("idle");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [hasStarted, setHasStarted] = useState(false);

  const recognizerRef = useRef<ReturnType<typeof createRecognizer> | null>(null);

  // Initialize lesson based on ID
  useEffect(() => {
    if (lessonId === "quadratic") {
      setClassroomContext({
        ...DEMO_CLASSROOM_CONTEXT,
        lesson: DEMO_QUADRATIC_LESSON,
      });
    }
  }, [lessonId]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => stopSpeech();
  }, []);

  const startLesson = () => {
    setHasStarted(true);
    setTeacherState("speaking");
    setIsLoading(true);

    // Simulate teacher greeting
    const greeting = DEMO_QUADRATIC_LESSON.steps[0].spokenScript;
    setCurrentMessage(greeting);

    setTimeout(() => {
      setIsLoading(false);
      speak(
        greeting,
        () => {
          setIsSpeaking(false);
          setTeacherState("listening");
        },
        () => {
          setIsSpeaking(false);
          setTeacherState("listening");
        },
      );
      setIsSpeaking(true);

      // Add message to context
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: "ai_teacher",
        message: greeting,
        createdAt: new Date().toISOString(),
      };
      setClassroomContext((prev) => ({
        ...prev,
        messages: [...prev.messages, newMessage],
        progress: {
          ...prev.progress,
          teacherState: "speaking",
          currentStep: "hook",
          progressPercentage: 12.5,
        },
      }));
    }, 1000);
  };

  const toggleListening = () => {
    if (isListening) {
      if (recognizerRef.current) {
        stopListening(recognizerRef.current);
        setTeacherState("listening");
      }
      setIsListening(false);
      return;
    }

    setIsListening(true);
    setTeacherState("listening");

    recognizerRef.current = startListening(
      (transcript, isFinal) => {
        if (isFinal && transcript) {
          handleStudentMessage(transcript);
        }
      },
      (error) => {
        console.error("Speech recognition error:", error);
        setIsListening(false);
        setTeacherState("idle");
      },
      () => {
        setIsListening(false);
        setTeacherState("listening");
      },
    );
  };

  const handleStudentMessage = (message: string) => {
    setTeacherState("thinking");
    setIsLoading(true);

    // Add student message
    const studentMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "student",
      message,
      createdAt: new Date().toISOString(),
    };

    setClassroomContext((prev) => ({
      ...prev,
      messages: [...prev.messages, studentMessage],
    }));

    // Generate teacher response
    setTimeout(() => {
      const response = generateTeacherResponse(
        message,
        classroomContext.progress as any,
        DEMO_QUADRATIC_LESSON,
      );

      setCurrentMessage(response.speak);

      // Add teacher response
      const teacherMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai_teacher",
        message: response.speak,
        createdAt: new Date().toISOString(),
      };

      setClassroomContext((prev) => ({
        ...prev,
        messages: [...prev.messages, teacherMessage],
        progress: {
          ...prev.progress,
          teacherState: "speaking",
          currentStep: response.nextStep,
          confusionScore: Math.max(
            0,
            Math.min(1, prev.progress.confusionScore + response.confusionDelta),
          ),
        },
      }));

      setIsLoading(false);
      setTeacherState("speaking");

      // Speak the response
      speak(response.speak, () => {
        setIsSpeaking(false);
        setTeacherState("listening");
      });
      setIsSpeaking(true);
    }, 1500);
  };

  const handleEndLesson = () => {
    stopSpeech();
    if (recognizerRef.current) {
      stopListening(recognizerRef.current);
    }
    // Navigate back to dashboard
    window.location.href = "/_authenticated/dashboard";
  };

  const handleQuickAction = (message: string) => {
    handleStudentMessage(message);
  };

  if (!hasStarted) {
    return (
      <div className="flex h-screen flex-col bg-gray-50">
        {/* Top Bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link to="/student/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft size={20} className="text-gray-600" />
            </Link>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {classroomContext.lesson.title}
              </div>
              <div className="text-xs text-gray-500">
                {classroomContext.course.title} · {classroomContext.lesson.subject}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCaptions(!showCaptions)}
              className={`p-2 rounded-lg ${
                showCaptions ? "bg-crimson-soft text-crimson" : "hover:bg-gray-100 text-gray-600"
              }`}
              title="Toggle captions"
            >
              {showCaptions ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
        </header>

        {/* Welcome Screen */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md w-full">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">👨‍🏫</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Meet Mr. Klass</h1>
              <p className="text-gray-600">
                Your AI teacher is ready to help you master{" "}
                <span className="font-semibold text-crimson">
                  {classroomContext.lesson.title}
                </span>
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">What you'll learn:</h3>
              <div className="space-y-2 text-sm text-gray-600">
                {classroomContext.lesson.steps.slice(0, 4).map((step, index) => (
                  <div key={step.key} className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-crimson-soft text-crimson flex items-center justify-center text-xs font-semibold">
                      {index + 1}
                    </span>
                    <span>{step.title}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={startLesson}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-crimson text-white py-3 px-6 rounded-lg font-semibold hover:bg-crimson-dark transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Begin Lesson
                  </>
                )}
              </button>

              <button
                onClick={toggleListening}
                disabled={isLoading}
                className={`p-3 rounded-lg transition-colors ${
                  isListening
                    ? "bg-red-100 text-red-600"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                title="Voice command"
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              Estimated time: {classroomContext.lesson.durationMinutes} minutes
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Top Bar */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link to="/student/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div>
            <div className="text-sm font-semibold text-gray-900">
              {classroomContext.lesson.title}
            </div>
            <div className="text-xs text-gray-500">
              {classroomContext.course.title} · Step {classroomContext.progress.progressPercentage}%
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCaptions(!showCaptions)}
            className={`p-2 rounded-lg ${
              showCaptions ? "bg-crimson-soft text-crimson" : "hover:bg-gray-100 text-gray-600"
            }`}
            title="Toggle captions"
          >
            <Subtitles size={18} />
          </button>
        </div>
      </header>

      {/* Classroom */}
      <ClassroomPage
        classroomContext={classroomContext}
        teacherState={teacherState}
        isSpeaking={isSpeaking}
        isListening={isListening}
        showCaptions={showCaptions}
        currentMessage={currentMessage}
        onToggleCaptions={() => setShowCaptions(!showCaptions)}
        onEndLesson={handleEndLesson}
      >
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-500 p-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            Mr. Klass is thinking…
          </div>
        )}
      </ClassroomPage>
    </div>
  );
}
