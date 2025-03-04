import AppHead from "@/@shared/components/AppHead";
import Button from "@/@shared/ui/Button";
import {
  useGetQuestionsByIdQuery,
  useStartVivaCallMutation,
} from "@/api-services/questions.service";
import { useModalContext } from "@/contexts/ModalContext";
import ChevronLeft from "@/icons/ChevronLeft";
import AppLayout from "@/layouts/AppLayout";
import { capitalizeFirstLetterOfEachWord } from "@/utils";
import { NextPage } from "next";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";
import React, { useEffect, useState, useRef, ElementRef } from "react";
import Vapi from "@vapi-ai/web";
import { toast } from "react-toastify";
import CallInitiatingModal from "@/@modules/questions/CallInitiatingModal";
import InitiateVivaContainer from "@/@modules/questions/InitiateVivaContainer";
import VivaAnalysisContainer from "@/@modules/questions/VivaAnalysisContainer";
import { VivaAnalysisModel } from "@/models/viva.model";

const VivaQuestion: NextPage = () => {
  const [id, setId] = useState("");
  const { data, isLoading, error, refetch } = useGetQuestionsByIdQuery(id, {
    skip: !id,
    refetchOnMountOrArgChange: true,
  });
  const params = useParams();
  const router = useRouter();
  const { setModalContent } = useModalContext();

  useEffect(() => {
    if (params) {
      setId(params.id as string);
    }
  }, [params]);

  const [initiateCall] = useStartVivaCallMutation();
  const [isCallStarting, setIsCallStarting] = useState(false);
  const [callInProgress, setCallInProgress] = useState(false);
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [systemSpeaking, setSystemSpeaking] = useState(false);
  const [userSpeaking, setUserSpeaking] = useState(false);

  // Audio analysis refs
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize Vapi
  useEffect(() => {
    const newVapi = new Vapi("74ed4301-89e7-4304-a325-4d88a54e2908");
    setVapi(newVapi);
  }, []);

  // Initialize microphone and audio setup
  const initMicrophoneAnalysis = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      // Create audio context and analyzer
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      // Create data array for analysis
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      dataArrayRef.current = dataArray;

      // Start analyzing audio
      analyzeMicrophoneInput();
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error(
        "Could not access microphone. Please check your permissions."
      );
    }
  };

  // Cleanup microphone and audio resources
  const cleanupMicrophoneAnalysis = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    dataArrayRef.current = null;
  };

  // Analyze microphone input to detect speech
  const analyzeMicrophoneInput = () => {
    if (!analyserRef.current || !dataArrayRef.current) return;

    const analyzeFrame = () => {
      if (!analyserRef.current || !dataArrayRef.current) return;

      // Get frequency data
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);

      // Calculate average volume
      const average =
        dataArrayRef.current.reduce((acc, val) => acc + val, 0) /
        dataArrayRef.current.length;

      // Set a threshold to determine if user is speaking
      // You may need to adjust this threshold based on testing
      const threshold = 15;
      setUserSpeaking(average > threshold);

      // Continue analyzing
      animationFrameRef.current = requestAnimationFrame(analyzeFrame);
    };

    analyzeFrame();
  };

  // Setup Vapi event listeners
  useEffect(() => {
    vapi?.on("call-start", () => {
      setCallInProgress(true);
      // Start microphone analysis when call starts
      initMicrophoneAnalysis();
    });

    vapi?.on("call-end", () => {
      setCallInProgress(false);
      setSystemSpeaking(false);
      setUserSpeaking(false);
      // Clean up microphone analysis when call ends
      cleanupMicrophoneAnalysis();
    });

    vapi?.on("error", (e) => {
      console.error(e);
      setSystemSpeaking(false);
      setUserSpeaking(false);
    });

    vapi?.on("speech-start", () => {
      setSystemSpeaking(true);
    });

    vapi?.on("speech-end", () => {
      setSystemSpeaking(false);
    });

    return () => {
      // Clean up event listeners and audio analysis
      vapi?.off("call-start", () => {});
      vapi?.off("call-end", () => {});
      vapi?.off("error", () => {});
      vapi?.off("speech-start", () => {});
      vapi?.off("speech-end", () => {});
      cleanupMicrophoneAnalysis();
    };
  }, [vapi]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      cleanupMicrophoneAnalysis();
    };
  }, []);

  const requestMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Release stream immediately
      return true;
    } catch (error) {
      console.error("Microphone permission denied:", error);
      toast.error("Microphone permission is required to start the call.");
      return false;
    }
  };
  

  const handleStartCall = async () => {
    try {
      const hasPermission = await requestMicPermission();
      if (!hasPermission) return;
      
      setIsCallStarting(true);
      const assistantData = await initiateCall({ questionId: id });
      if (vapi) {
        await vapi.start(assistantData.data?.id);
      }
      setIsCallStarting(false);
    } catch (error) {
      toast.error("Something went wrong while initiating call");

      setModalContent(null);
    }
  };

  const handleEndCall = () => {
    if (vapi && callInProgress) {
      vapi.stop();
      buttonRef.current?.click();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (isCallStarting) {
      setModalContent(<CallInitiatingModal />);
    } else {
      setModalContent(null);
    }
  }, [isCallStarting]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio("/sounds/call-ended.mp3");
    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const buttonRef = useRef<ElementRef<"button">>(null);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      const timeoutId = setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          setIsPlaying(false);
        }
      }, 1500); // 2.5 seconds

      return () => clearTimeout(timeoutId);
    }
  }, [isPlaying]);

  return (
    <AppLayout>
      <AppHead title="Viva" />
      {!isPlaying && (
        <button
          ref={buttonRef}
          onClick={() => audioRef.current?.play()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hidden"
        >
          Play Sound
        </button>
      )}
      {data && (
        <div className="flex items-center justify-between mb-6">
          <Button
            title="Back"
            variant="text"
            starticon={<ChevronLeft />}
            className="!gap-1 mb-6 mt-7"
            onClick={() => {
              router.push(`/questions/view-questions/${data?.documentId}`);
            }}
          />
        </div>
      )}

      {data && (
        <div className="pb-6">
          <h1 className="text-center text-xl font-semibold">
            Oral (Viva) Q&A -{" "}
            {capitalizeFirstLetterOfEachWord(data.documentTitle.toLowerCase())}{" "}
          </h1>
          {data && !data.analysis && (
            <p className="text-center text-gray-500 my-3">
              {callInProgress
                ? "Test in progress..."
                : "Just start the call when you are all set!"}
            </p>
          )}
        </div>
      )}

      {data && data.analysis && (
        <VivaAnalysisContainer data={data.analysis.analysisData} />
      )}

      {data && !data.analysis && (
        <InitiateVivaContainer
          callInProgress={callInProgress}
          data={data}
          handleEndCall={handleEndCall}
          handleStartCall={handleStartCall}
          systemSpeaking={systemSpeaking}
          userSpeaking={userSpeaking}
        />
      )}
    </AppLayout>
  );
};

export default VivaQuestion;

const vivaAnalysisData: VivaAnalysisModel[] = [
  {
    question: "What is the function of the mitochondria?",
    questionNumber: 1,
    totalQuestions: 2,
    grade: "pass",
    userResponse: "It produces energy for the cell.",
    systemResponse:
      "Correct. The mitochondria generate ATP through cellular respiration.",
  },
  {
    question: "Explain the concept of osmosis.",
    questionNumber: 2,
    totalQuestions: 2,
    grade: "fail",
    userResponse:
      "It is the movement of molecules from high to low concentration.",
    systemResponse:
      "Incorrect. Osmosis specifically refers to the movement of water molecules across a semi-permeable membrane.",
  },
];
