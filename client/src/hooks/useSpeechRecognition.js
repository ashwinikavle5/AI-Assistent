import { useState, useEffect, useRef } from 'react';

export const useSpeechRecognition = ({ onResult, onEnd, onError } = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US'; // Can be adjusted dynamically

    recognition.onstart = () => {
      setIsListening(true);
      setErrorMessage('');
    };

    recognition.onresult = (event) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);
      if (onResult) {
        onResult(currentTranscript, event.results[event.results.length - 1].isFinal);
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition event error:', event.error);
      if (event.error === 'not-allowed') {
        setErrorMessage('Microphone access was denied. Please allow microphone permissions in your browser settings.');
      } else if (event.error === 'no-speech') {
        setErrorMessage('No speech detected. Please try speaking again.');
      } else {
        setErrorMessage('Speech recognition encountered an issue. You can continue by typing.');
      }
      setIsListening(false);
      if (onError) onError(event);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (onEnd) onEnd();
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  const startListening = (lang = 'en-US') => {
    if (!recognitionRef.current) {
      setErrorMessage('Speech recognition is not supported on this device/browser. Please type your message.');
      return;
    }

    setTranscript('');
    setErrorMessage('');
    recognitionRef.current.lang = lang;

    try {
      recognitionRef.current.start();
    } catch (e) {
      console.warn('Error starting speech recognition:', e);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  };

  return {
    isListening,
    transcript,
    isSupported,
    errorMessage,
    startListening,
    stopListening,
    setTranscript
  };
};
