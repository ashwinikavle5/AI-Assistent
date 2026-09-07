import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import {
  Volume2,
  Search,
  Check,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

const PRACTICE_WORDS = [
  'beautiful',
  'confidence',
  'pronunciation',
  'comfortable',
  'opportunity',
  'education',
  'development',
  'difficult'
];

export const Pronunciation = () => {
  const { token } = useAuth();
  const { speak } = useAudio();

  const [inputWord, setInputWord] = useState('beautiful');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [misspellingData, setMisspellingData] = useState(null);
  const [learningData, setLearningData] = useState(null);

  // Perform pronunciation lookup
  const handleLookup = async (wordToSearch) => {
    const target = (wordToSearch !== undefined ? wordToSearch : inputWord).trim();

    setErrorMsg('');
    setMisspellingData(null);

    // Empty input validation
    if (!target) {
      setErrorMsg('Please enter an English word.');
      setLearningData(null);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/pronunciation/lookup?word=${encodeURIComponent(target)}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (!response.ok) {
        setErrorMsg('Unable to check the word right now. Please try again.');
        setLearningData(null);
        return;
      }

      const data = await response.json();

      if (data.success && data.details) {
        setLearningData(data.details);
        setInputWord(data.details.word);
        setErrorMsg('');
        setMisspellingData(null);
      } else if (data.isMisspelled) {
        // Misspelled word -> ask user for confirmation
        setMisspellingData({
          enteredWord: data.enteredWord || target,
          suggestedWord: data.suggestedWord
        });
        setLearningData(null);
        setErrorMsg('');
      } else if (data.error === 'EMPTY_INPUT') {
        setErrorMsg('Please enter an English word.');
        setLearningData(null);
        setMisspellingData(null);
      } else if (data.error === 'SERVICE_UNAVAILABLE') {
        setErrorMsg('Word information is temporarily unavailable. Please try again.');
        setLearningData(null);
        setMisspellingData(null);
      } else {
        // Genuine unrecognized word
        setErrorMsg('Word not found. Please enter a valid English word.');
        setLearningData(null);
        setMisspellingData(null);
      }
    } catch (err) {
      console.error('Error checking word pronunciation:', err);
      setErrorMsg('Word information is temporarily unavailable. Please try again.');
      setLearningData(null);
      setMisspellingData(null);
    } finally {
      setLoading(false);
    }
  };

  // Load default word on mount
  useEffect(() => {
    handleLookup('beautiful');
  }, []);

  // Listen to English pronunciation (Speaks ONLY the English word)
  const handleListen = () => {
    const wordToPronounce = learningData?.word || inputWord.trim();
    if (!wordToPronounce) return;

    try {
      speak(wordToPronounce, 'pron_' + wordToPronounce.toLowerCase() + '_' + Date.now(), 0.95);
    } catch (err) {
      console.error('TTS speech error:', err);
      setErrorMsg('Speech audio playback is currently unavailable.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center p-1.5 shadow-xs shrink-0"
            style={{ background: 'var(--accent-gradient)', color: '#fff' }}
          >
            <Volume2 size={18} aria-hidden="true" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: 'var(--text-main)' }}>
            Pronunciation Learning
          </h1>
        </div>
        <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
          Enter any English word and learn its meaning and pronunciation.
        </p>
      </div>

      {/* Main Pronunciation Search Box UI */}
      <div
        className="rounded-3xl border shadow-xl p-5 sm:p-7 space-y-6"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-main)'
        }}
      >
        <div className="space-y-2">
          <div
            className="flex flex-col sm:flex-row gap-2.5 p-2 rounded-2xl border"
            style={{
              backgroundColor: 'var(--bg-input)',
              borderColor: 'var(--border-main)'
            }}
          >
            <div className="flex-1 flex items-center gap-2 px-2">
              <Search size={16} style={{ color: 'var(--text-muted)' }} aria-hidden="true" />
              <input
                type="text"
                value={inputWord}
                onChange={(e) => {
                  setInputWord(e.target.value);
                  if (errorMsg) setErrorMsg('');
                  if (misspellingData) setMisspellingData(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleLookup();
                  }
                }}
                placeholder="Enter an English word..."
                className="w-full bg-transparent border-none outline-none text-sm font-medium"
                style={{ color: 'var(--text-main)' }}
              />
            </div>

            {/* Check Button */}
            <button
              type="button"
              onClick={() => handleLookup()}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50 hover:opacity-95 shrink-0"
              style={{
                background: 'var(--accent-gradient)',
                boxShadow: inputWord.trim() ? '0 4px 14px var(--accent-glow)' : 'none'
              }}
            >
              <Search size={15} aria-hidden="true" />
              <span>{loading ? 'Checking...' : 'Check'}</span>
            </button>
          </div>
        </div>

        {/* Practice Words Chips */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>
            Practice Words:
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {PRACTICE_WORDS.map((word) => (
              <button
                key={word}
                type="button"
                onClick={() => {
                  setInputWord(word);
                  handleLookup(word);
                }}
                className={`text-xs px-3 py-1.5 rounded-xl border transition-all duration-150 cursor-pointer font-medium ${
                  learningData?.word?.toLowerCase() === word.toLowerCase()
                    ? 'ring-1 ring-purple-500 font-bold'
                    : 'hover:scale-102'
                }`}
                style={{
                  backgroundColor:
                    learningData?.word?.toLowerCase() === word.toLowerCase()
                      ? 'rgba(168, 85, 247, 0.15)'
                      : 'var(--bg-card)',
                  borderColor:
                    learningData?.word?.toLowerCase() === word.toLowerCase()
                      ? 'rgb(168, 85, 247)'
                      : 'var(--border-main)',
                  color:
                    learningData?.word?.toLowerCase() === word.toLowerCase()
                      ? 'var(--accent-primary)'
                      : 'var(--text-secondary)'
                }}
              >
                {word}
              </button>
            ))}
          </div>
        </div>

        {/* Error Notification Banner */}
        {errorMsg && (
          <div className="p-4 rounded-2xl border bg-red-500/10 border-red-500/30 text-red-400 flex items-start gap-3 animate-in fade-in">
            <AlertCircle size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-xs sm:text-sm font-semibold">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Misspelling Confirmation Banner */}
        {misspellingData && (
          <div
            className="p-4 sm:p-5 rounded-2xl border animate-in fade-in space-y-3"
            style={{
              backgroundColor: 'rgba(234, 179, 8, 0.08)',
              borderColor: 'rgba(234, 179, 8, 0.35)'
            }}
          >
            <div className="flex items-start gap-3">
              <HelpCircle size={20} className="text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  I couldn't recognize this word.
                </p>
                <p className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--text-main)' }}>
                  Did you mean <span className="font-bold text-amber-300">"{misspellingData.suggestedWord}"</span>?
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 pl-8">
              <button
                type="button"
                onClick={() => {
                  const targetWord = misspellingData.suggestedWord;
                  setInputWord(targetWord);
                  setMisspellingData(null);
                  handleLookup(targetWord);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-95 transition cursor-pointer"
                style={{ background: 'var(--accent-gradient)' }}
              >
                <Check size={14} aria-hidden="true" />
                <span>Use "{misspellingData.suggestedWord}"</span>
              </button>

              <button
                type="button"
                onClick={() => setMisspellingData(null)}
                className="px-3 py-2 rounded-xl border text-xs font-semibold hover:opacity-80 transition cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-main)',
                  color: 'var(--text-muted)'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Pronunciation Learning Result Card */}
        {learningData && (
          <div
            className="rounded-3xl border p-5 sm:p-7 space-y-5 shadow-sm animate-in fade-in duration-200"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-main)'
            }}
          >
            {/* Word Heading & Listen Button */}
            <div
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4"
              style={{ borderColor: 'var(--border-main)' }}
            >
              <div className="flex items-center gap-3 flex-wrap">
                <h2
                  className="text-2xl sm:text-3xl font-extrabold tracking-tight capitalize"
                  style={{ color: 'var(--text-main)' }}
                >
                  {learningData.word}
                </h2>
                {learningData.partOfSpeech && (
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize"
                    style={{
                      backgroundColor: 'rgba(168, 85, 247, 0.12)',
                      borderColor: 'rgba(168, 85, 247, 0.3)',
                      color: 'var(--accent-primary)'
                    }}
                  >
                    Part of Speech: {learningData.partOfSpeech}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleListen}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition-all duration-200 cursor-pointer hover:opacity-95 shadow-md w-fit"
                style={{
                  background: 'var(--accent-gradient)',
                  boxShadow: '0 4px 12px var(--accent-glow)'
                }}
                title={`Listen to pronunciation of ${learningData.word}`}
              >
                <Volume2 size={16} aria-hidden="true" />
                <span>🔊 Listen</span>
              </button>
            </div>

            {/* Marathi Meaning */}
            <div
              className="p-4 rounded-2xl border space-y-1"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-main)'
              }}
            >
              <span className="text-xs font-bold block" style={{ color: 'var(--accent-primary)' }}>
                मराठी अर्थ:
              </span>
              <p className="text-lg sm:text-xl font-bold" style={{ color: 'var(--text-main)' }}>
                {learningData.marathiMeaning}
              </p>
            </div>

            {/* Simple Meaning */}
            <div
              className="p-4 rounded-2xl border space-y-1"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-main)'
              }}
            >
              <span className="text-xs font-bold block text-blue-400">
                Simple Meaning:
              </span>
              <p className="text-xs sm:text-sm font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {learningData.simpleEnglishMeaning}
              </p>
            </div>

            {/* Example Sentence */}
            <div
              className="p-4 rounded-2xl border space-y-1"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-main)'
              }}
            >
              <span className="text-xs font-bold block text-emerald-400">
                Example:
              </span>
              <p className="text-xs sm:text-sm font-medium italic leading-relaxed" style={{ color: 'var(--text-main)' }}>
                "{learningData.example.replace(/^["']|["']$/g, '')}"
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pronunciation;
