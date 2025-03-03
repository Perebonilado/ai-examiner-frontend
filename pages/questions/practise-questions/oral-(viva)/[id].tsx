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
import React, { useEffect, useState, useRef } from "react";
import * as moment from "moment";
import Vapi from "@vapi-ai/web";
import { toast } from "react-toastify";
import CallActionButton from "@/@modules/questions/CallActionButton";
import StartCallIcon from "@/icons/StartCallIcon";
import EndCallIcon from "@/icons/EndCallIcon";
import CallProgressIndicator from "@/@modules/questions/CallProgressIndicator";
import SoundWaveIcon from "@/icons/SoundWaveIcon";
import MicIcon from "@/icons/MicIcon";

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
    const newVapi = new Vapi("e5840097-a2db-47a2-8134-059421e03fe8");
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
      setSystemSpeaking(false)
      setUserSpeaking(false)
      // Clean up microphone analysis when call ends
      cleanupMicrophoneAnalysis();
    });

    vapi?.on("error", (e) => {
      console.error(e);
      setSystemSpeaking(false)
      setUserSpeaking(false)
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

  const handleStartCall = async () => {
    try {
      setIsCallStarting(true);
      const assistantData = await initiateCall({ questionId: id });
      if (vapi) {
        await vapi.start(assistantData.data?.id);
      }
      setIsCallStarting(false);
    } catch (error) {
      toast.error("Something went wrong while initiating call");
    }
  };

  const handleEndCall = () => {
    if (vapi && callInProgress) {
      vapi.stop();
    }
  };

  return (
    <AppLayout>
      <AppHead title="Viva" />
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
        <div>
          <h1 className="text-center text-xl font-semibold">
            Live AI Q&A -{" "}
            {capitalizeFirstLetterOfEachWord(data.documentTitle.toLowerCase())}{" "}
          </h1>
          <p className="text-center text-gray-500 my-3">
            Just start the call when you're all set!
          </p>
        </div>
      )}

      {data && (
        <div className="mx-auto w-full max-w-[500px] flex justify-center gap-10 pb-6 border-b mt-10">
          <CallActionButton
            title="Start call"
            icon={
              <StartCallIcon fill={!callInProgress ? "#008650" : "#9ca3af"} />
            }
            isActive={!callInProgress}
            activeColor="#008650"
            handleClick={handleStartCall}
          />
          <CallActionButton
            title="End call"
            icon={<EndCallIcon fill={callInProgress ? "#EE6161" : "#9ca3af"} />}
            isActive={callInProgress}
            activeColor="#EE6161"
            handleClick={handleEndCall}
          />
        </div>
      )}

      <div className="mt-16 flex flex-col gap-10">
        <CallProgressIndicator
          icon={<SoundWaveIcon fill={systemSpeaking ? "#9A67E2" : undefined} />}
          speaker="Examiner"
          isSpeaking={systemSpeaking}
        />
        <CallProgressIndicator
          icon={<MicIcon fill={userSpeaking ? "#9A67E2" : undefined}/>}
          speaker="You"
          isSpeaking={userSpeaking}
        />
      </div>
    </AppLayout>
  );
};

export default VivaQuestion;
