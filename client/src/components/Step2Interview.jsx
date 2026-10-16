import React, { useEffect, useRef, useState } from "react";

import maleVideo from "../assets/Videos/male-ai.mp4";
import femaleVideo from "../assets/Videos/female-ai.mp4";

import Timer from "./Timer";
import axios from "axios";

import { motion } from "motion/react";

import {
  FaMicrophone,
  FaMicrophoneSlash
} from "react-icons/fa";

import { ServerUrl } from "../App";

import { BsArrowRight } from "react-icons/bs";


function Step2Interview({ interviewData, onFinish }) {

  const {
    interviewId,
    questions = [],
    userName
  } = interviewData || {};


  // =====================================================
  // STATES
  // =====================================================

  const [isIntroPhase, setIsIntroPhase] = useState(true);

  const [isMicOn, setIsMicOn] = useState(true);

  const recognitionRef = useRef(null);

  const [isAIPlaying, setIsAIPlaying] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);

  const [answer, setAnswer] = useState("");

  const [feedback, setFeedback] = useState("");

  const [timeLeft, setTimeLeft] = useState(
    questions[0]?.timeLimit || 60
  );

  const [selectedVoice, setSelectedVoice] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [voiceGender, setVoiceGender] = useState("female");

  const [subtitle, setSubtitle] = useState("");

  const videoRef = useRef(null);


  const currentQuestion = questions[currentIndex];


  // =====================================================
  // LOAD BROWSER VOICES
  // =====================================================

  useEffect(() => {

    const loadVoices = () => {

      const voices = window.speechSynthesis.getVoices();

      if (!voices.length) {
        return;
      }


      // -----------------------------------------
      // FEMALE VOICE
      // -----------------------------------------

      const femaleVoice = voices.find((voice) =>
        voice.name.toLowerCase().includes("zira") ||
        voice.name.toLowerCase().includes("samantha") ||
        voice.name.toLowerCase().includes("female")
      );


      if (femaleVoice) {

        setSelectedVoice(femaleVoice);

        setVoiceGender("female");

        return;
      }


      // -----------------------------------------
      // MALE VOICE
      // -----------------------------------------

      const maleVoice = voices.find((voice) =>
        voice.name.toLowerCase().includes("david") ||
        voice.name.toLowerCase().includes("mark") ||
        voice.name.toLowerCase().includes("male")
      );


      if (maleVoice) {

        setSelectedVoice(maleVoice);

        setVoiceGender("male");

        return;
      }


      // -----------------------------------------
      // FALLBACK
      // -----------------------------------------

      setSelectedVoice(voices[0]);

      setVoiceGender("female");

    };


    loadVoices();

    window.speechSynthesis.onvoiceschanged = loadVoices;


    return () => {

      window.speechSynthesis.onvoiceschanged = null;

    };

  }, []);


  // =====================================================
  // VIDEO SOURCE
  // =====================================================

  const videoSource =
    voiceGender === "male"
      ? maleVideo
      : femaleVideo;


  // =====================================================
  // START MICROPHONE
  // =====================================================

  const startMic = () => {

    if (
      recognitionRef.current &&
      !isAIPlaying &&
      isMicOn
    ) {

      try {

        recognitionRef.current.start();

      } catch (error) {

        // Recognition may already be running

      }

    }

  };


  // =====================================================
  // STOP MICROPHONE
  // =====================================================

  const stopMic = () => {

    if (recognitionRef.current) {

      try {

        recognitionRef.current.stop();

      } catch (error) {

        // Recognition may already be stopped

      }

    }

  };


  // =====================================================
  // SPEAK FUNCTION
  // =====================================================

  const speakText = (text) => {

    return new Promise((resolve) => {

      if (
        !window.speechSynthesis ||
        !selectedVoice
      ) {

        resolve();

        return;
      }


      // Stop previous speech

      window.speechSynthesis.cancel();


      // Stop microphone while AI is speaking

      stopMic();


      // -----------------------------------------
      // NATURAL PAUSES
      // -----------------------------------------

      const humanText = text
        .replace(/,/g, ", ... ")
        .replace(/\./g, ". ... ");


      // -----------------------------------------
      // SPEECH UTTERANCE
      // -----------------------------------------

      const utterance =
        new SpeechSynthesisUtterance(humanText);


      utterance.voice = selectedVoice;

      utterance.rate = 0.92;

      utterance.pitch = 1.05;

      utterance.volume = 1;


      // -----------------------------------------
      // SPEECH START
      // -----------------------------------------

      utterance.onstart = () => {

        setIsAIPlaying(true);

        setSubtitle(text);


        if (videoRef.current) {

          videoRef.current.currentTime = 0;

          videoRef.current
            .play()
            .catch(() => {});

        }

      };


      // -----------------------------------------
      // SPEECH END
      // -----------------------------------------

      utterance.onend = () => {

        if (videoRef.current) {

          videoRef.current.pause();

          videoRef.current.currentTime = 0;

        }


        setIsAIPlaying(false);


        setTimeout(() => {

          setSubtitle("");

          resolve();

        }, 300);

      };


      // -----------------------------------------
      // SPEECH ERROR
      // -----------------------------------------

      utterance.onerror = () => {

        if (videoRef.current) {

          videoRef.current.pause();

          videoRef.current.currentTime = 0;

        }


        setIsAIPlaying(false);

        setSubtitle("");

        resolve();

      };


      // -----------------------------------------
      // START SPEECH
      // -----------------------------------------

      setSubtitle(text);

      window.speechSynthesis.speak(utterance);

    });

  };


  // =====================================================
  // INTRO + QUESTION SPEECH
  // =====================================================

  useEffect(() => {

    if (!selectedVoice) {
      return;
    }


    if (!interviewData) {
      return;
    }


    if (!questions.length) {
      return;
    }


    const runInterviewSpeech = async () => {


      // =============================================
      // INTRO
      // =============================================

      if (isIntroPhase) {

        await speakText(
          `Hi ${userName}, it's great to meet you today. I hope you're feeling confident and ready.`
        );


        await speakText(
          "I'll ask you a few questions. Just answer naturally, and take your time. Let's begin."
        );


        setIsIntroPhase(false);

        return;
      }


      // =============================================
      // QUESTION
      // =============================================

      if (currentQuestion) {

        await new Promise((resolve) =>
          setTimeout(resolve, 800)
        );


        // Last question announcement

        if (
          currentIndex === questions.length - 1
        ) {

          await speakText(
            "Alright, this one might be a bit more challenging."
          );

        }


        // Speak question

        await speakText(
          currentQuestion.question
        );


        // Start microphone after AI finishes

        if (isMicOn) {

          startMic();

        }

      }

    };


    runInterviewSpeech();


    return () => {

      window.speechSynthesis.cancel();

    };

  }, [
    selectedVoice,
    isIntroPhase,
    currentIndex
  ]);


  // =====================================================
  // TIMER
  // =====================================================

  useEffect(() => {

    if (isIntroPhase) {
      return;
    }


    if (!currentQuestion) {
      return;
    }


    if (isSubmitting) {
      return;
    }


    const timer = setInterval(() => {

      setTimeLeft((prev) => {

        if (prev <= 1) {

          clearInterval(timer);

          return 0;

        }


        return prev - 1;

      });

    }, 1000);


    return () => {

      clearInterval(timer);

    };

  }, [
    isIntroPhase,
    currentIndex,
    isSubmitting
  ]);


  // =====================================================
  // RESET TIMER WHEN QUESTION CHANGES
  // =====================================================

  useEffect(() => {

    if (!currentQuestion) {
      return;
    }


    setTimeLeft(
      currentQuestion.timeLimit || 60
    );

  }, [currentIndex]);


  // =====================================================
  // SPEECH RECOGNITION SETUP
  // =====================================================

  useEffect(() => {

    if (
      !("webkitSpeechRecognition" in window)
    ) {

      console.log(
        "Speech Recognition is not supported in this browser."
      );

      return;
    }


    const recognition =
      new window.webkitSpeechRecognition();


    recognition.lang = "en-US";

    recognition.continuous = true;

    recognition.interimResults = false;


    // -----------------------------------------
    // SPEECH RESULT
    // -----------------------------------------

    recognition.onresult = (event) => {

      const lastResult =
        event.results[
          event.results.length - 1
        ];


      const transcript =
        lastResult[0].transcript;


      setAnswer((prev) => {

        const newText =
          prev.trim() +
          " " +
          transcript.trim();


        return newText.trim();

      });

    };


    // -----------------------------------------
    // RECOGNITION END
    // -----------------------------------------

    recognition.onend = () => {

      if (
        isMicOn &&
        !isAIPlaying &&
        !isSubmitting
      ) {

        // Do not automatically restart

      }

    };


    // -----------------------------------------
    // RECOGNITION ERROR
    // -----------------------------------------

    recognition.onerror = (event) => {

      console.log(
        "Speech Recognition Error:",
        event.error
      );

    };


    recognitionRef.current = recognition;


    return () => {

      try {

        recognition.stop();

      } catch (error) {}

    };

  }, []);


  // =====================================================
  // TOGGLE MICROPHONE
  // =====================================================

  const toggleMic = () => {

    if (isMicOn) {

      stopMic();

      setIsMicOn(false);

    } else {

      setIsMicOn(true);

      if (!isAIPlaying) {

        try {

          recognitionRef.current?.start();

        } catch (error) {}

      }

    }

  };


  // =====================================================
  // SUBMIT ANSWER
  // =====================================================

  const submitAnswer = async () => {

    // Prevent double click

    if (isSubmitting) {
      return;
    }


    // =================================================
    // BLANK ANSWER
    // =================================================

    if (!answer || !answer.trim()) {

      // Stop microphone

      stopMic();

      setIsMicOn(false);


      // This message will appear
      // inside the existing feedback box

      const noAnswerMessage =
        "You did not submit an answer";


      // Show feedback on screen

      setFeedback(
        noAnswerMessage
      );


      // AI will speak this message

      await speakText(
        noAnswerMessage
      );


      setIsSubmitting(false);

      return;
    }


    // =================================================
    // NORMAL ANSWER
    // =================================================

    stopMic();

    setIsMicOn(false);

    setIsSubmitting(true);


    try {

      const result = await axios.post(

        ServerUrl +
          "/api/interview/submit-answer",

        {
          interviewId,

          questionIndex: currentIndex,

          answer: answer.trim(),

          timeTaken:
            (currentQuestion?.timeLimit || 60) -
            timeLeft
        },

        {
          withCredentials: true
        }

      );


      // -----------------------------------------
      // AI FEEDBACK
      // -----------------------------------------

      const feedbackMessage =
        result.data?.feedback ||
        "Thank you for your answer.";


      // Show feedback

      setFeedback(
        feedbackMessage
      );


      // AI speaks feedback

      await speakText(
        feedbackMessage
      );


      setIsSubmitting(false);


    } catch (error) {

      console.log(
        "Submit Answer Error:",
        error
      );


      const errorMessage =
        error.response?.data?.message ||
        "Something went wrong while submitting your answer.";


      // Show error in feedback box

      setFeedback(
        errorMessage
      );


      // AI speaks error

      await speakText(
        errorMessage
      );


      setIsSubmitting(false);

    }

  };


  // =====================================================
  // AUTO SUBMIT WHEN TIMER REACHES ZERO
  // =====================================================

  useEffect(() => {

    if (isIntroPhase) {
      return;
    }


    if (!currentQuestion) {
      return;
    }


    if (
      timeLeft === 0 &&
      !isSubmitting &&
      !feedback
    ) {

      submitAnswer();

    }

  }, [
    timeLeft
  ]);


  // =====================================================
  // NEXT QUESTION
  // =====================================================

  const handleNext = async () => {

    stopMic();

    setIsMicOn(false);

    setAnswer("");

    setFeedback("");

    setTimeLeft(
      questions[currentIndex + 1]?.timeLimit || 60
    );


    // -----------------------------------------
    // FINISH INTERVIEW
    // -----------------------------------------

    if (
      currentIndex + 1 >=
      questions.length
    ) {

      finishInterview();

      return;
    }


    // -----------------------------------------
    // NEXT QUESTION MESSAGE
    // -----------------------------------------

    await speakText(
      "Alright, let's move to the next question."
    );


    setCurrentIndex(
      currentIndex + 1
    );


    setTimeout(() => {

      setIsMicOn(true);

    }, 500);

  };


  // =====================================================
  // FINISH INTERVIEW
  // =====================================================

  const finishInterview = async () => {

    stopMic();

    setIsMicOn(false);


    try {

      const result = await axios.post(

        ServerUrl +
          "/api/interview/finish",

        {
          interviewId
        },

        {
          withCredentials: true
        }

      );


      console.log(
        "Interview Finished:",
        result.data
      );


      onFinish(
        result.data
      );


    } catch (error) {

      console.log(
        "Finish Interview Error:",
        error
      );

    }

  };


  // =====================================================
  // CLEANUP
  // =====================================================

  useEffect(() => {

    return () => {

      if (recognitionRef.current) {

        try {

          recognitionRef.current.stop();

          recognitionRef.current.abort();

        } catch (error) {}

      }


      window.speechSynthesis.cancel();

    };

  }, []);


  // =====================================================
  // INTERVIEW DATA CHECK
  // =====================================================

  if (!interviewData) {

    return (

      <div className="min-h-screen flex items-center justify-center bg-gray-50">

        <p className="text-gray-600">

          Interview data not found.
          Please start the interview again.

        </p>

      </div>

    );

  }


  // =====================================================
  // QUESTIONS CHECK
  // =====================================================

  if (questions.length === 0) {

    return (

      <div className="min-h-screen flex items-center justify-center bg-gray-50">

        <p className="text-gray-600">

          No interview questions found.

        </p>

      </div>

    );

  }


  // =====================================================
  // MAIN UI
  // =====================================================

  return (

    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-teal-100 flex items-center justify-center p-4 sm:p-6">

      <div className="w-full max-w-6xl min-h-[75vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col lg:flex-row overflow-hidden">


        {/* =====================================================
            VIDEO SECTION
        ===================================================== */}

        <div className="w-full lg:w-[35%] bg-white flex flex-col items-center p-6 space-y-6 border-r border-gray-200">


          {/* VIDEO */}

          <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl">

            <video
              ref={videoRef}
              src={videoSource}
              key={videoSource}
              muted
              playsInline
              preload="auto"
              className="w-full h-auto object-cover"
            />

          </div>


          {/* =====================================================
              SUBTITLE
          ===================================================== */}

          {subtitle && (

            <div className="w-full max-w-md bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm">

              <p className="text-gray-700 text-sm sm:text-base font-medium text-center leading-relaxed">

                {subtitle}

              </p>

            </div>

          )}


          {/* =====================================================
              TIMER AREA
          ===================================================== */}

          <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-5">


            {/* INTERVIEW STATUS */}

            <div className="flex justify-between items-center">

              <span className="text-sm text-gray-500">

                Interview Status

              </span>


              {isAIPlaying && (

                <span className="text-sm font-semibold text-emerald-600">

                  AI Speaking

                </span>

              )}

            </div>


            <div className="h-px bg-gray-200"></div>


            {/* TIMER */}

            <div className="flex justify-center">

              <Timer
                timeLeft={timeLeft}
                totalTime={
                  currentQuestion?.timeLimit || 60
                }
              />

            </div>


            <div className="h-px bg-gray-200"></div>


            {/* QUESTIONS COUNT */}

            <div className="grid grid-cols-2 gap-6 text-center">


              {/* CURRENT QUESTION */}

              <div>

                <span className="text-2xl font-bold text-emerald-600">

                  {currentIndex + 1}

                </span>


                <span className="text-xs text-gray-400 ml-1">

                  Current Questions

                </span>

              </div>


              {/* TOTAL QUESTIONS */}

              <div>

                <span className="text-2xl font-bold text-emerald-600">

                  {questions.length}

                </span>


                <span className="text-sm text-gray-400 ml-1">

                  Total Questions

                </span>

              </div>

            </div>

          </div>

        </div>


        {/* =====================================================
            TEXT SECTION
        ===================================================== */}

        <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 relative">


          {/* TITLE */}

          <h2 className="text-xl sm:text-2xl font-bold text-emerald-600 mb-6">

            AI Smart Interview

          </h2>


          {/* =====================================================
              QUESTION BOX
          ===================================================== */}

          {!isIntroPhase && (

            <div className="bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">

              <p className="text-xs sm:text-sm text-gray-400 mb-2">

                Question {currentIndex + 1} to{" "}
                {questions.length}

              </p>


              <div className="text-base sm:text-lg font-semibold text-gray-800 leading-relaxed">

                {currentQuestion?.question}

              </div>

            </div>

          )}


          {/* =====================================================
              TEXTAREA
          ===================================================== */}

          <div className="mt-4">

            <textarea
              value={answer}
              onChange={(e) =>
                setAnswer(e.target.value)
              }
              placeholder="Type your answer here..."
              className="w-full min-h-[330px] bg-gray-100 p-4 sm:p-6 rounded-2xl resize-none outline-none border border-gray-200 focus:ring-2 focus:ring-emerald-500 transition text-gray-800"
            />

          </div>


          {/* =====================================================
              BUTTONS / FEEDBACK
          ===================================================== */}

          {!feedback ? (

            <div className="flex items-center gap-4 mt-6">


              {/* MICROPHONE */}

              <motion.button
                onClick={toggleMic}
                type="button"
                whileTap={{
                  scale: 0.9
                }}
                className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-black text-white shadow-lg"
              >

                {isMicOn ? (

                  <FaMicrophone size={20} />

                ) : (

                  <FaMicrophoneSlash
                    size={20}
                  />

                )}

              </motion.button>


              {/* SUBMIT */}

              <motion.button
                type="button"
                onClick={submitAnswer}
                disabled={isSubmitting}
                whileTap={{
                  scale: 0.95
                }}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 sm:py-4 rounded-2xl shadow-lg hover:opacity-90 transition font-semibold disabled:bg-gray-500"
              >

                {isSubmitting
                  ? "Submitting..."
                  : "Submit Answer"}

              </motion.button>

            </div>

          ) : (

            <motion.div
              initial={{
                opacity: 0
              }}
              animate={{
                opacity: 1
              }}
              className="mt-6 bg-emerald-50 border border-amber-200 p-5 rounded-2xl shadow-sm"
            >

              <p className="text-emerald-700 font-medium mb-4">

                {feedback}

              </p>


              <button
                onClick={handleNext}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 rounded-xl shadow-md hover:opacity-90 transition flex items-center justify-center gap-1"
              >

                Next Question

                <BsArrowRight size={18} />

              </button>

            </motion.div>

          )}

        </div>

      </div>                                                                                                                                                                                                                                                                                                                                                                   

    </div>

  );

}


export default Step2Interview;