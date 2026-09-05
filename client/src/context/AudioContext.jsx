import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTextId, setCurrentTextId] = useState(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [autoPlay, setAutoPlay] = useState(false);

  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);
  const utteranceRef = useRef(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const speak = (text, id = null, customSpeed = null) => {
    if (!synthRef.current) {
      console.warn('Speech synthesis not supported on this browser.');
      return;
    }

    // If already playing the same text and not paused, stop it
    if (isPlaying && currentTextId === id && !isPaused) {
      stop();
      return;
    }

    // Cancel any active utterance
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = customSpeed !== null ? customSpeed : playbackSpeed;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    // Pick best English voice if available
    const voices = synthRef.current.getVoices();
    const naturalVoice = voices.find(v => (v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('David'))));
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setCurrentTextId(id);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentTextId(null);
    };

    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentTextId(null);
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const pause = () => {
    if (synthRef.current && isPlaying && !isPaused) {
      synthRef.current.pause();
      setIsPaused(true);
    }
  };

  const resume = () => {
    if (synthRef.current && isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
    }
  };

  const stop = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentTextId(null);
    }
  };

  const changeSpeed = (speed) => {
    setPlaybackSpeed(speed);
  };

  return (
    <AudioContext.Provider value={{
      isPlaying,
      isPaused,
      currentTextId,
      playbackSpeed,
      autoPlay,
      setAutoPlay,
      speak,
      pause,
      resume,
      stop,
      changeSpeed
    }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);
