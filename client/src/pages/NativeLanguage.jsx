import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import {
  Globe2,
  Mic,
  ArrowRight,
  RotateCcw,
  Copy,
  Check,
  Volume2,
  Sparkles,
  AlertCircle,
  BookOpen
} from 'lucide-react';

export const NativeLanguage = () => {
  const { token } = useAuth();
  const { speak } = useAudio();

  const [inputText, setInputText] = useState('');
  const [translation, setTranslation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Speech recognition for Marathi voice input
  const { isListening, startListening, stopListening } = useSpeechRecognition({
    onResult: (spokenText) => {
      setInputText(spokenText);
      setError('');
    }
  });

  const handleTranslate = async () => {
    const text = inputText.trim();

    if (!text) {
      setError('Please enter a Marathi or Roman Marathi sentence.');
      setTranslation(null);
      return;
    }

    if (loading) return;

    if (isListening) stopListening();

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTranslation(data);
        setError('');
      } else {
        setTranslation(null);
        setError(data.message || data.error || "I didn't fully understand that sentence.");
      }
    } catch (err) {
      console.error('Translation error:', err);
      setTranslation(null);
      setError(err?.message ? `Translation error: ${err.message}` : 'Translation request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInputText('');
    setTranslation(null);
    setError('');
  };

  const handleCopy = () => {
    if (!translation?.englishTranslation) return;
    navigator.clipboard.writeText(translation.englishTranslation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleListen = (textToSpeak) => {
    const text = textToSpeak || translation?.englishTranslation;
    if (!text) return;
    speak(text, 'trans_' + Date.now(), 0.95);
  };

  const toggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      setError('');
      startListening('mr-IN');
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
            <Globe2 size={18} />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: 'var(--text-main)' }}>
            Native Language → English
          </h1>
        </div>
        <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
          Write or speak in Marathi or Roman Marathi and get a natural English translation.
        </p>
      </div>

      {/* Interactive Translation Card */}
      <div
        className="rounded-3xl border shadow-xl p-5 sm:p-7 space-y-5"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-main)'
        }}
      >
        {/* Input Section */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Your Marathi Input
          </label>
          <div
            className="rounded-2xl border transition-all duration-200 focus-within:ring-2 focus-within:ring-purple-500/40 p-3"
            style={{
              backgroundColor: 'var(--bg-input)',
              borderColor: 'var(--border-main)'
            }}
          >
            <textarea
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                if (error) setError('');
              }}
              placeholder="Type Marathi or Roman Marathi here..."
              rows={3}
              className="w-full bg-transparent border-none outline-none resize-none text-sm leading-relaxed"
              style={{ color: 'var(--text-main)' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handleTranslate();
                }
              }}
            />

            {/* Input Toolbar with exact buttons: Voice, Clear, Translate */}
            <div className="flex items-center justify-between pt-2 border-t mt-1" style={{ borderColor: 'var(--border-main)' }}>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleMic}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    isListening ? 'bg-red-500 text-white animate-pulse' : 'hover:opacity-90'
                  }`}
                  style={{
                    backgroundColor: isListening ? '#ef4444' : 'var(--bg-card)',
                    borderColor: isListening ? '#ef4444' : 'var(--border-main)',
                    color: isListening ? '#ffffff' : 'var(--text-secondary)'
                  }}
                  title={isListening ? "Listening... click to stop" : "Speak in Marathi"}
                >
                  <Mic size={14} className={isListening ? "animate-bounce" : ""} />
                  <span>{isListening ? "Listening..." : "🎤 Voice"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleClear}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium hover:opacity-80 transition cursor-pointer"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-main)',
                    color: 'var(--text-muted)'
                  }}
                  title="Clear input and results"
                >
                  <RotateCcw size={12} />
                  <span>Clear</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleTranslate()}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50 hover:opacity-95 hover:scale-102"
                style={{
                  background: 'var(--accent-gradient)',
                  boxShadow: inputText.trim() ? '0 4px 14px var(--accent-glow)' : 'none'
                }}
              >
                <span>{loading ? "Translating..." : "Translate"}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm flex items-center gap-2 animate-in fade-in">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Translation Output Card */}
        {translation && (
          <div
            className="rounded-2xl border p-4 sm:p-5 space-y-4 animate-in fade-in slide-in-from-top-2"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--accent-primary)'
            }}
          >
            {/* Header with Title and Action buttons */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sparkles size={16} style={{ color: 'var(--accent-primary)' }} />
                <span className="text-xs font-bold tracking-wide uppercase" style={{ color: 'var(--accent-primary)' }}>
                  English Translation
                </span>
                {translation.detectedLang && (
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize"
                    style={{
                      backgroundColor: 'rgba(168, 85, 247, 0.12)',
                      borderColor: 'rgba(168, 85, 247, 0.3)',
                      color: 'var(--accent-primary)'
                    }}
                  >
                    {translation.detectedLang === 'roman_marathi'
                      ? 'Roman Marathi'
                      : translation.detectedLang === 'marathi'
                      ? 'Marathi'
                      : translation.detectedLang}
                  </span>
                )}
              </div>

              {/* Action Buttons: Copy & Listen */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer hover:opacity-90"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-main)',
                    color: copied ? '#10b981' : 'var(--text-secondary)'
                  }}
                  title="Copy English translation"
                >
                  {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{copied ? "Copied!" : "📋 Copy"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleListen(translation.englishTranslation)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer hover:opacity-90 text-white"
                  style={{
                    background: 'var(--accent-gradient)',
                    borderColor: 'transparent'
                  }}
                  title="Listen to English pronunciation"
                >
                  <Volume2 size={14} />
                  <span>🔊 Listen</span>
                </button>
              </div>
            </div>

            {/* Translated Sentence */}
            <div
              className="p-4 rounded-xl border space-y-2"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-main)'
              }}
            >
              <p className="text-lg sm:text-xl font-bold leading-relaxed" style={{ color: 'var(--text-main)' }}>
                "{translation.englishTranslation}"
              </p>

              {translation.marathiNormalized && (
                <div className="pt-2 border-t" style={{ borderColor: 'var(--border-main)' }}>
                  <span className="text-[11px] font-bold uppercase tracking-wider block mb-0.5" style={{ color: 'var(--text-muted)' }}>
                    Meaning:
                  </span>
                  <p className="text-sm sm:text-base font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    {translation.marathiNormalized}
                  </p>
                </div>
              )}
            </div>

            {/* Learning Support Card */}
            {translation.learningSupport && (
              <div
                className="rounded-xl border p-4 space-y-3"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-main)'
                }}
              >
                <div className="flex items-center gap-2">
                  <BookOpen size={15} style={{ color: 'var(--accent-primary)' }} />
                  <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent-primary)' }}>
                    Learning Support
                  </h3>
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  {/* Natural English */}
                  <div>
                    <span className="font-semibold block text-[11px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>
                      Natural English:
                    </span>
                    <p className="font-bold text-sm sm:text-base" style={{ color: 'var(--text-main)' }}>
                      "{translation.learningSupport.naturalEnglish || translation.englishTranslation}"
                    </p>
                  </div>

                  {/* Simple Explanation */}
                  {translation.learningSupport.simpleExplanation && (
                    <div>
                      <span className="font-semibold block text-[11px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>
                        Simple explanation:
                      </span>
                      <p className="leading-relaxed font-normal" style={{ color: 'var(--text-secondary)' }}>
                        {translation.learningSupport.simpleExplanation}
                      </p>
                    </div>
                  )}

                  {/* Example */}
                  {translation.learningSupport.example && (
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold block text-[11px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                          Example:
                        </span>
                        <button
                          type="button"
                          onClick={() => handleListen(translation.learningSupport.example)}
                          className="flex items-center gap-1 text-[11px] font-semibold cursor-pointer hover:underline"
                          style={{ color: 'var(--accent-primary)' }}
                          title="Listen to example sentence"
                        >
                          <Volume2 size={12} />
                          <span>🔊 Listen</span>
                        </button>
                      </div>
                      <p className="italic font-medium leading-relaxed" style={{ color: 'var(--text-main)' }}>
                        "{translation.learningSupport.example}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

