
import { toast } from "../../components/ui/toast/toast";
// src/ai/components/AIFloatingButton.tsx
import React, { useRef, useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { parseVoiceWithLlm } from "../services/githubLlmClient";
import { Square, Loader2, Volume2 } from "lucide-react";

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}
interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}
interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onerror: (e: SpeechRecognitionErrorEvent) => void;
  onresult: (e: SpeechRecognitionEvent) => void;
  onend: () => void;
  onstart: () => void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

const AIFloatingButton: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [liveText, setLiveText] = useState("");
  const [finalText, setFinalText] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimer = useRef<NodeJS.Timeout | null>(null);

  console.log("AIFloatingButton Rendered – Auth:", isAuthenticated);

  const startListening = () => {
    if (!isAuthenticated) {
      toast({ title: "Login Required", description: "Please log in", variant: "destructive" });
      return;
    }

    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) {
      toast({ title: "Not Supported", description: "Voice not supported", variant: "destructive" });
      return;
    }

    const rec = new Ctor();
    rec.lang = "en-IN";
    rec.continuous = true;
    rec.interimResults = true;

    let finalTextSoFar = "";

    rec.onstart = () => {
      console.log("STARTED");
      setIsListening(true);
      setLiveText("");
      setFinalText("");
      finalTextSoFar = "";
    };

    rec.onresult = (e: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) {
          const spoken = r[0].transcript.trim();
          finalTextSoFar += " " + spoken;
          console.log("FINAL PART:", spoken);
        } else {
          interim += r[0].transcript;
        }
      }

      const displayText = (finalTextSoFar + " " + interim).trim();
      console.log("Live display:", displayText);
      setLiveText(displayText);
      setFinalText(finalTextSoFar.trim());

      if (silenceTimer.current) clearTimeout(silenceTimer.current);
      silenceTimer.current = setTimeout(() => {
        console.log("Silence → stop");
        rec.stop();
      }, 2000);
    };

    rec.onend = async () => {
      console.log("ENDED");
      setIsListening(false);
      if (silenceTimer.current) clearTimeout(silenceTimer.current);

      const textToSend = finalText.trim();
      console.log("TEXT TO SEND:", textToSend);

      if (!textToSend) {
        console.log("No final text → skip");
        setLiveText("");
        return;
      }

      setIsProcessing(true);

      // Inside onend → after LLM success
try {
  console.log("CALLING LLM...");
  const result = await parseVoiceWithLlm(textToSend);
  console.log("LLM RESULT:", result);

  // === UPDATE INPUTS + DISPATCH EVENT ===
  const originEl = document.getElementById("origin") as HTMLInputElement | null;
  const destEl = document.getElementById("destination") as HTMLInputElement | null;

  if (originEl) originEl.value = result.origin;
  if (destEl) destEl.value = result.destination;

  // Dispatch event for MapRouteSelector
  window.dispatchEvent(
    new CustomEvent("voice-route-set", {
      detail: { origin: result.origin, destination: result.destination },
    })
  );

  toast({
    title: "Route Set!",
    description: `${result.origin} to ${result.destination}`,
  });
} catch (error) {
        console.error("LLM ERROR:", error);
        toast({
          title: "AI Failed",
          description: error instanceof Error ? error.message : "Try again",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
        setLiveText("");
        setFinalText("");
      }
    };

    rec.onerror = (e: SpeechRecognitionErrorEvent) => {
      console.error("Speech error:", e.error);
      setIsListening(false);
      toast({ title: "Voice Error", description: e.error, variant: "destructive" });
    };

    recognitionRef.current = rec;
    rec.start();
  };

  const stopListening = () => {
    console.log("Manual stop");
    recognitionRef.current?.stop();
  };

  useEffect(() => {
    return () => {
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
      recognitionRef.current?.abort();
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3">
      {(liveText || isProcessing) && (
        <div className="max-w-xs animate-fade-in rounded-lg bg-black/90 p-4 text-white shadow-2xl">
          {liveText && <p className="text-lg font-medium">{liveText}</p>}
          {isProcessing && <p className="text-sm opacity-80">Processing…</p>}
        </div>
      )}

      <button
        onClick={isListening ? stopListening : startListening}
        disabled={isProcessing || !isAuthenticated}
        className={`
          flex h-16 w-16 items-center justify-center rounded-full shadow-2xl
          ${isAuthenticated
            ? isListening
              ? "bg-red-600 hover:bg-red-700"
              : "bg-gradient-to-br from-emerald-500 to-teal-600"
            : "bg-gray-400 cursor-not-allowed"}
          ${isListening ? "animate-pulse ring-4 ring-red-300" : ""}
          ${isProcessing ? "opacity-80" : ""}
        `}
      >
        {isProcessing ? (
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        ) : isListening ? (
          <Square className="h-7 w-7 text-white" />
        ) : (
          <Volume2 className="h-8 w-8 text-white" />
        )}
      </button>

      {!isAuthenticated && <p className="text-xs text-gray-500">Login to use</p>}
    </div>
  );
};

export default AIFloatingButton;