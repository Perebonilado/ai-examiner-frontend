import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export const useSpeechToText = () => {
  const [speechSynthesis, setSpeechSynthesis] =
    useState<SpeechSynthesisUtterance | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const speechSynthesis = new SpeechSynthesisUtterance();
    const voices = window.speechSynthesis.getVoices();
    speechSynthesis.voice =
      voices[voices.findIndex((v)=>v.name==="Google UK English Female") || 0] ||
      null;

    const handleBoundary = (event: SpeechSynthesisEvent) => {
      if (event.name === "word") {
        const spokenCharIndex = event.charIndex;
        const totalLength = event.utterance.text.length; // Corrected access
        setProgress((spokenCharIndex / totalLength) * 100); // Progress as percentage
      }
    };

    const handleEnd = () => {
      setIsSpeaking(false);
      setProgress(100); // 100% when finished
    };

    speechSynthesis.onboundary = handleBoundary;
    speechSynthesis.onend = handleEnd;

    setSpeechSynthesis(speechSynthesis);

    // Cleanup function to remove event listeners and cancel speech when the component unmounts
    return () => {
      speechSynthesis.onboundary = null;
      speechSynthesis.onend = null;
      window.speechSynthesis.cancel(); // Stop any ongoing speech
    };
  }, []);

  const speak = (text: string) => {
    try {
      if (speechSynthesis) {
        speechSynthesis.text = text;
        setIsSpeaking(true);
        window.speechSynthesis.speak(speechSynthesis);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while reading text");
    }
  };

  const stopSpeaking = () => {
    try {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setProgress(0); // Reset progress when speech is stopped
    } catch (error) {
      console.error(error);
      toast.error("Failed to stop speech");
    }
  };

  return { speak, stopSpeaking, isSpeaking, progress };
};
