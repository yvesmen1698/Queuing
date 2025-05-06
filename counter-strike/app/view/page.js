"use client";
import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { User2 } from "lucide-react";

export default function ViewPage() {
  const [queueData, setQueueData] = useState({ cashiers: [] });
  const [animatingIds, setAnimatingIds] = useState(new Set());
  const previousNumbersRef = useRef({});
  const audioPoolRef = useRef([]);
  const audioPoolSize = 5;
  const speechSynthRef = useRef(null);

  // Initialize audio and speech synthesis once
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      speechSynthRef.current = window.speechSynthesis;
    }

    // Initialize notification sound pool
    audioPoolRef.current = Array(audioPoolSize)
      .fill()
      .map(() => {
        const audio = new Audio("/notif.mp3");
        audio.volume = 1;
        return audio;
      });

    queueData.cashiers.forEach((cashier) => {
      previousNumbersRef.current[cashier.id] = cashier.currentNumber;
    });

    const eventSource = new EventSource("/api/events");

    eventSource.onmessage = (event) => {
      const newData = JSON.parse(event.data);

      let changeCount = 0;
      newData.cashiers.forEach((cashier) => {
        const previousNumber = previousNumbersRef.current[cashier.id];
        if (
          previousNumber !== undefined &&
          cashier.currentNumber !== previousNumber
        ) {
          // Play notification sound
          const audioElement = audioPoolRef.current[changeCount % audioPoolSize];
          audioElement.currentTime = 0;
          audioElement.play().catch((err) => {
            console.error("Error playing sound:", err);
          });

          // Announce the counter number with voice (twice)
          announceCounter(cashier.name, cashier.currentNumber, cashier.rangeEnd, 1);

          changeCount++;

          setAnimatingIds((prev) => new Set([...prev, cashier.id]));
          setTimeout(() => {
            setAnimatingIds((prev) => {
              const newSet = new Set(prev);
              newSet.delete(cashier.id);
              return newSet;
            });
          }, 1000);
        }
        previousNumbersRef.current[cashier.id] = cashier.currentNumber;
      });

      setQueueData(newData);
    };

    return () => eventSource.close();
    // eslint-disable-next-line
  }, []);

  // Function to announce counter number with voice - with repetition
  const announceCounter = (cashierName, currentNumber, rangeEnd, repeatCount = 1) => {
    if (!speechSynthRef.current) return;

    // Cancel any ongoing speech if this is the first announcement
    if (repeatCount === 1) {
      speechSynthRef.current.cancel();
    }

    // Create the announcement text
    const announcement = `${cashierName} is now serving number ${currentNumber} to ${rangeEnd}`;

    // Create utterance object
    const utterance = new SpeechSynthesisUtterance(announcement);

    // Set female voice if available
    const voices = speechSynthRef.current.getVoices();
    const femaleVoice = voices.find(voice => voice.name.includes('female') || voice.name.includes('Female'));
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    // Set other properties
    utterance.rate = 0.9; // Slightly slower than default
    utterance.pitch = 1.1; // Slightly higher pitch
    utterance.volume = 1.0;

    // If this is the first announcement, schedule the second one after this one finishes
    if (repeatCount === 1) {
      utterance.onend = () => {
        // Add a short pause between announcements
        setTimeout(() => {
          announceCounter(cashierName, currentNumber, rangeEnd, 2);
        }, 500);
      };
    }

    // Speak the announcement
    speechSynthRef.current.speak(utterance);
  };

  // Load voices when the component mounts
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      // Some browsers need a small delay to load voices
      const loadVoices = () => {
        const voices = speechSynthRef.current.getVoices();
        if (voices.length === 0) {
          // If voices aren't ready yet, try again in a moment
          setTimeout(loadVoices, 100);
        }
      };

      loadVoices();

      // Handle voice changes
      speechSynthRef.current.onvoiceschanged = loadVoices;
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="p-4 lg:p-8 h-screen flex flex-col">
        <Card className="flex-1 shadow-xl flex flex-col">
          <CardHeader className="border-b bg-white py-6">
            <div className="flex items-center justify-center space-x-4">
              <h1 className="text-6xl font-bold text-gray-800">Queue Status</h1>
              <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse" />
            </div>
            <div className="flex items-center justify-center mt-4">
              <p className="text-center text-gray-500 text-2xl mr-4">
                Counter Updates
              </p>
              {/* Sound toggle button removed */}
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-8 flex items-center">
            <div className="grid grid-cols-3 gap-8 w-full h-full">
              {Array.from({ length: queueData.cashiers.length }).map(
                (_, index) => {
                  const cashier = queueData.cashiers[index];
                  if (!cashier || !cashier.isActive) {
                    return (
                      <div
                        key={index}
                        className="relative overflow-hidden rounded-xl bg-white border border-gray-100 p-8 shadow-lg transition-all duration-300"
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-red-500 rotate-45 transform translate-x-12 -translate-y-12" />
                        <div className="relative h-full flex flex-col justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                              <User2 className="w-8 h-8 text-blue-600" />
                            </div>
                            <h2 className="text-3xl font-semibold text-gray-800">
                              {cashier?.name || "Cashier"}
                            </h2>
                          </div>
                          <div className="mt-4 text-center">
                            <p className="text-5xl font-bold text-red-500 tracking-tight transition-all duration-300 transform scale-100">
                              Please Proceed to the next available Counter
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={cashier.id}
                      className="relative overflow-hidden rounded-xl bg-white border border-gray-100 p-8 shadow-lg transition-all duration-300"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500 rotate-45 transform translate-x-12 -translate-y-12" />
                      <div className="relative h-full flex flex-col justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-blue-100 rounded-xl">
                            <User2 className="w-8 h-8 text-blue-600" />
                          </div>
                          <h2 className="text-5xl font-semibold text-gray-800">
                            {cashier.name}
                          </h2>
                        </div>
                        <div className="mt-4 text-center">
                          <p className="text-xl text-black-500 mb-5">
                            Now Serving:
                          </p>
                          <p
                            className={`text-9xl font-bold text-blue-600 tracking-tight transition-all duration-300 transform
                            ${
                              animatingIds.has(cashier.id)
                                ? "scale-125 text-green-600"
                                : "scale-100"
                            }`}
                          >
                            {cashier.currentNumber > 0
                              ? `${cashier.currentNumber}-${cashier.rangeEnd}`
                              : "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
