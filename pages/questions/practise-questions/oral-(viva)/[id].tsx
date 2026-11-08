import AppHead from "@/@shared/components/AppHead";
import {
  useGetQuestionsByIdQuery,
  useStartVivaCallMutation,
} from "@/api-services/questions.service";
import { useModalContext } from "@/contexts/ModalContext";
import AppLayout from "@/layouts/AppLayout";
import {
  capitalizeFirstLetterOfEachWord,
  millisecondsToMinutesSeconds,
} from "@/utils";
import { NextPage } from "next";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";
import React, { useEffect, useState, useRef, ElementRef } from "react";
import Vapi from "@vapi-ai/web";
import { toast } from "react-toastify";
import CallInitiatingModal from "@/@modules/questions/CallInitiatingModal";
import InitiateVivaContainer from "@/@modules/questions/InitiateVivaContainer";
import VivaAnalysisContainer from "@/@modules/questions/VivaAnalysisContainer";
import CallPreparationConfirmation from "@/@modules/questions/CallPreparationConfirmation";
import PulseCallIndicator from "@/@modules/questions/PulseCallIndicator";
import {
  CallCreditsService,
  useGetCallCreditsQuery,
} from "@/api-services/call-credits.service";
import ConfirmationDialog from "@/@shared/components/ConfirmationDialog";
import { reduxStore } from "@/config/redux-config";
import GetMoreCreditsCard from "@/@modules/questions/GetMoreCreditsCard";
import { useGoogleTranslationContext } from "@/contexts/GoogleTransalationContext";
import { useDispatch } from "react-redux";
import {
  setDocumentIdInView,
  setDocumentTitleInView,
} from "@/features/documentChatSlice";
import { useGetUserProfileQuery } from "@/api-services/user.service";
import UpgradeAccountForm from "@/@shared/components/UpgradeAccountForm";
import cn from "classnames";

const VivaQuestion: NextPage = () => {
  const [id, setId] = useState("");
  const { data, isLoading, error, refetch } = useGetQuestionsByIdQuery(id, {
    skip: !id,
    refetchOnMountOrArgChange: true,
  });
  const { data: credits, refetch: refechCallCredits } = useGetCallCreditsQuery(
    undefined,
    { pollingInterval: 30000, refetchOnMountOrArgChange: true }
  );
  const { data: userData } = useGetUserProfileQuery("");
  const params = useParams();
  const router = useRouter();
  const { setModalContent } = useModalContext();

  const dispatch = useDispatch();

  useEffect(() => {
    if (data) {
      dispatch(setDocumentIdInView(data.documentId));
    }
  }, [data]);

  useEffect(() => {
    if (data?.documentTitle) {
      dispatch(setDocumentTitleInView(data.documentTitle));
    }
  }, [data]);

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
      reduxStore.dispatch(
        CallCreditsService.util.invalidateTags([{ type: "call-credits" }])
      );
    });

    vapi?.on("error", (e) => {
      console.error(e);
      setSystemSpeaking(false);
      setUserSpeaking(false);
      reduxStore.dispatch(
        CallCreditsService.util.invalidateTags([{ type: "call-credits" }])
      );
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
      stream.getTracks().forEach((track) => track.stop()); // Release stream immediately
      return true;
    } catch (error) {
      console.error("Microphone permission denied:", error);
      toast.error("Microphone permission is required to start the call.");
      return false;
    }
  };

  const { selectedLanguageName } = useGoogleTranslationContext();

  const handleStartCall = async () => {
    try {
      setIsCallStarting(true);
      const assistantData = await initiateCall({
        questionId: id,
        language: selectedLanguageName || "english",
      });
      if (vapi) {
        await vapi.start(assistantData.data?.id);
      }
      setIsCallStarting(false);
    } catch (error) {
      toast.error("Something went wrong while initiating call");

      setModalContent(null);
    }
  };

  const verifyUserHasEnoughCallCredits = () => {
    if (credits && credits.remainingCreditsMs > 0) {
      return true;
    }

    return false;
  };

  const handleStartCallConfirmation = async () => {
    const hasEnoughtCredits = verifyUserHasEnoughCallCredits();
    const userIsGuest = userData?.role?.toLowerCase() === "guest";

    if (userIsGuest) {
      setModalContent(
        <UpgradeAccountForm redirectToPricingOnSuccess={false} />
      );
      return;
    }

    if (hasEnoughtCredits) {
      const hasPermission = await requestMicPermission();
      if (!hasPermission) return;

      setModalContent(
        <CallPreparationConfirmation handleProceed={handleStartCall} />
      );
    } else {
      setModalContent(
        <ConfirmationDialog
          confirmationText="Purchase credits"
          message="Please, purchase credits to continue"
          title="You do not have sufficient call credits"
          cancelText="Cancel"
          onConfirm={() => {
            router.push("/account/call-credits");
          }}
          onCancel={() => setModalContent(null)}
        />
      );
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

  const documentTitle = data?.documentTitle
    ? capitalizeFirstLetterOfEachWord(data.documentTitle.toLowerCase())
    : "";

  return (
    <div translate={data && !data.analysis ? "no" : "yes"}>
      <AppLayout
        handleBack={() => {
          router.push(`/questions/view-questions/${data?.documentId}`);
        }}
        crumbs={[
          { label: "All documents", href: "/documents" },
          ...(data
            ? [
                {
                  label: documentTitle,
                  href: `/questions/view-questions/${data.documentId}`,
                },
              ]
            : []),
          { label: "Oral (viva)" },
        ]}
        mobileTitle="Oral (viva)"
        noPadding
      >
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
          <div
            className={cn(
              "flex w-full flex-col px-7 pt-6 pb-14 max-md:px-4 max-md:pt-4 max-md:pb-[calc(28px+env(safe-area-inset-bottom))]",
              {
                "min-h-[calc(100dvh-60px)] max-md:min-h-[calc(100dvh-56px)]":
                  !data.analysis,
              }
            )}
          >
            <header
              className={cn(
                "grid w-full grid-cols-[minmax(0,1fr)_auto] items-start gap-x-6 max-md:block",
                { "mx-auto max-w-[740px]": data.analysis }
              )}
            >
              <h1 className="col-start-1 row-start-1 text-base font-semibold leading-[1.4] tracking-[-0.01em] text-ink max-md:text-[15px]">
                Oral (Viva) Q&A - {documentTitle}
              </h1>
              <div className="contents max-md:mt-1 max-md:flex max-md:flex-wrap max-md:items-center max-md:justify-between max-md:gap-x-3 max-md:gap-y-0.5">
                {credits && !data.analysis && (
                  <p className="col-start-1 row-start-2 mt-0.5 flex min-h-6 items-center gap-2 whitespace-nowrap text-[13px] text-muted max-md:mt-0">
                    {callInProgress && <PulseCallIndicator />}
                    {callInProgress
                      ? "Test in progress..."
                      : "Just start the call when you are all set!"}
                  </p>
                )}
                {credits && (
                  <GetMoreCreditsCard
                    className="col-start-2 row-start-1"
                    minuteLeft={millisecondsToMinutesSeconds(
                      credits?.remainingCreditsMs ?? 0
                    )}
                  />
                )}
              </div>
            </header>

            {data.analysis && (
              <div className="mt-8 max-md:mt-6">
                <VivaAnalysisContainer
                  data={data.analysis.analysisData}
                  callId={data.analysis.callId}
                />
              </div>
            )}

            {credits && !data.analysis && (
              <InitiateVivaContainer
                callInProgress={callInProgress}
                data={data}
                handleEndCall={handleEndCall}
                handleStartCall={handleStartCallConfirmation}
                systemSpeaking={systemSpeaking}
                userSpeaking={userSpeaking}
                maxCallDurationInSeconds={
                  credits ? credits.remainingCreditsMs / 1000 : 0
                }
              />
            )}
          </div>
        )}
      </AppLayout>
    </div>
  );
};

export default VivaQuestion;
