import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { StreakCelebration } from '../components/streak/StreakCelebration';
import {
  Volume2,
  Mic,
  Search,
  Turtle,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ArrowRight,
  History
} from 'lucide-react';

export const Pronunciation = () => {
  const { token } = useAuth();
  const { speak } = useAudio();

  const [inputWord, setInputWord] = useState('');
  const [loading, setLoading] = useState(false);
  const [wordDetails, setWordDetails] = useState(null);
  const [error, setError] = useState('');
  const [practiceFeedback, setPracticeFeedback] = useState(null);
  const [history, setHistory] = useState([]);
  const [celebrateStreak, setCelebrateStreak] = useState(null);

  // Speech recognition for user practice
  const { isListening, transcript, isSupported, startListening, stopListening } = useSpeechRecognition({
    onResult: (spokenText, isFinal) => {
      if (isFinal && wordDetails) {
        submitPracticeAttempt(spokenText.trim());
      }
    }
  });

  // Load default featured word on mount
  useEffect(() => {
    lookupWord('beautiful');
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/pronunciation/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.history) {
        setHistory(data.history);
      }
    } catch (e) {
      console.warn('Failed to load pronunciation history:', e);
    }
  };

  const lookupWord = async (wordToSearch) => {
    const word = (wordToSearch || inputWord).trim();
    if (!word) return;

    setLoading(true);
    setError('');
    setPracticeFeedback(null);

    try {
      const res = await fetch(`/api/pronunciation/lookup?word=${encodeURIComponent(word)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok && data.success && data.details) {
        setWordDetails(data.details);
        setInputWord('');
      } else {
        setError(data.message || `Could not find "${word}". Please check spelling and try again.`);
      }
    } catch (err) {
      setError('Network error looking up word. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayNormal = () => {
    if (wordDetails) {
      speak(wordDetails.word, 'pron_normal', 1.0);
    }
  };

  const handlePlaySlow = () => {
    if (wordDetails) {
      speak(wordDetails.word, 'pron_slow', 0.7);
    }
  };

  const handleStartPractice = () => {
    setPracticeFeedback(null);
    startListening('en-US');
  };

  const submitPracticeAttempt = async (spokenTranscript) => {
    if (!wordDetails) return;

    try {
      const res = await fetch('/api/pronunciation/practice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          word: wordDetails.word,
          transcript: spokenTranscript,
          ipa: wordDetails.ipa
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPracticeFeedback({
          isMatch: data.isMatch,
          transcript: data.detectedTranscript,
          feedback: data.feedback
        });

        // Trigger streak celebration if streak increased
        if (data.streak && data.streak.streakIncreased) {
          setCelebrateStreak(data.streak.currentStreak);
        }

        fetchHistory();
      }
    } catch (err) {
      console.error('Practice attempt submit error:', err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div
        className="rounded-3xl p-6 sm:p-8 border shadow-lg relative overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-main)'
        }}
      >
        <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold w-fit mb-3" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--accent-primary)' }}>
          <Sparkles size={14} /> Speech Articulation & Phonics
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-main)' }}>
          🔊 Pronunciation Coach
        </h1>
        <p className="text-sm font-medium mt-1 max-w-xl" style={{ color: 'var(--text-muted)' }}>
          Listen to standard English articulation, slow down difficult phonemes, and practice speaking words aloud.
        </p>

        {/* Word Search Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            lookupWord();
          }}
          className="mt-6 flex flex-col sm:flex-row gap-3 max-w-2xl"
        >
          <div
            className="flex-1 flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all duration-200 focus-within:ring-2 focus-within:ring-purple-500/30"
            style={{
              backgroundColor: 'var(--bg-input)',
              borderColor: 'var(--border-main)'
            }}
          >
            <Search size={18} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={inputWord}
              onChange={(e) => setInputWord(e.target.value)}
              placeholder="Enter an English word (e.g. Beautiful, Confident, Comfortable)..."
              className="w-full bg-transparent border-none outline-none text-sm"
              style={{ color: 'var(--text-main)' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3.5 rounded-2xl text-white font-semibold text-sm transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 disabled:opacity-50"
            style={{
              background: 'var(--accent-gradient)',
              boxShadow: '0 8px 20px var(--accent-glow)'
            }}
          >
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>
                <Volume2 size={16} />
                <span>Pronounce</span>
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-3 text-xs text-red-400 flex items-center gap-1.5">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Main Pronunciation Result Card */}
      {wordDetails && (
        <div
          className="rounded-3xl p-6 sm:p-8 border shadow-xl space-y-6"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-main)'
          }}
        >
          {/* Word Heading, Badges, & Phonetics */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b" style={{ borderColor: 'var(--border-main)' }}>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
                  {wordDetails.word}
                </h2>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  {wordDetails.partOfSpeech}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  {wordDetails.difficulty}
                </span>
              </div>

              {/* IPA & Phonetic Learner Display */}
              <div className="mt-2 flex items-center gap-4 text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>
                <span className="font-semibold text-purple-400">{wordDetails.ipa}</span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>•</span>
                <span className="font-medium text-cyan-400">{wordDetails.phoneticLearner}</span>
              </div>
            </div>

            {/* Audio & Practice Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Normal Listen */}
              <button
                onClick={handlePlayNormal}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-white font-semibold text-xs transition shadow-md hover:scale-105 cursor-pointer"
                style={{ background: 'var(--accent-gradient)' }}
              >
                <Volume2 size={16} />
                <span>Listen</span>
              </button>

              {/* Slow Listen */}
              <button
                onClick={handlePlaySlow}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-semibold hover:bg-white/5 transition hover:scale-105 cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-main)',
                  color: 'var(--text-main)'
                }}
                title="Listen at 0.75x speed"
              >
                <Turtle size={16} className="text-amber-400" />
                <span>Slow (0.75x)</span>
              </button>

              {/* Microphone Practice */}
              <button
                onClick={handleStartPractice}
                disabled={isListening}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-white font-semibold text-xs transition shadow-md cursor-pointer ${
                  isListening ? 'bg-red-500 mic-active' : 'bg-emerald-600 hover:bg-emerald-500 hover:scale-105'
                }`}
              >
                <Mic size={16} className={isListening ? 'animate-pulse' : ''} />
                <span>{isListening ? 'Listening...' : 'Practice Speaking'}</span>
              </button>
            </div>
          </div>

          {/* Listening Indicator when practicing */}
          {isListening && (
            <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span>Say "{wordDetails.word}" clearly into your microphone...</span>
              </div>
              <button
                onClick={stopListening}
                className="font-bold underline cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Truthful Practice Feedback Box */}
          {practiceFeedback && (
            <div
              className={`p-5 rounded-2xl border text-xs animate-in fade-in ${
                practiceFeedback.isMatch
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm mb-1">
                {practiceFeedback.isMatch ? (
                  <CheckCircle2 size={18} className="text-emerald-400" />
                ) : (
                  <AlertCircle size={18} className="text-amber-400" />
                )}
                <span>{practiceFeedback.isMatch ? 'Great Pronunciation!' : 'Keep Practicing!'}</span>
              </div>
              <p className="mt-1 leading-relaxed text-xs">
                {practiceFeedback.feedback}
              </p>
            </div>
          )}

          {/* Meaning & Examples */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Meaning */}
            <div className="space-y-2 p-4 rounded-2xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                <BookOpen size={14} style={{ color: 'var(--accent-primary)' }} />
                <span>Meaning</span>
              </div>
              <p className="text-sm leading-relaxed font-medium" style={{ color: 'var(--text-main)' }}>
                {wordDetails.meaning}
              </p>
            </div>

            {/* Example Sentence */}
            <div className="space-y-2 p-4 rounded-2xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-main)' }}>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                <Sparkles size={14} className="text-amber-400" />
                <span>Example Sentence</span>
              </div>
              <p className="text-sm italic leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                "{wordDetails.example}"
              </p>
            </div>
          </div>

          {/* Synonyms & Antonyms */}
          <div className="flex flex-wrap gap-6 pt-2">
            {wordDetails.synonyms?.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Synonyms:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {wordDetails.synonyms.map((syn, i) => (
                    <button
                      key={i}
                      onClick={() => lookupWord(syn)}
                      className="px-2.5 py-1 rounded-xl text-xs font-medium border hover:opacity-80 transition cursor-pointer"
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        borderColor: 'var(--border-main)',
                        color: 'var(--accent-primary)'
                      }}
                    >
                      {syn}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {wordDetails.antonyms?.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Antonyms:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {wordDetails.antonyms.map((ant, i) => (
                    <button
                      key={i}
                      onClick={() => lookupWord(ant)}
                      className="px-2.5 py-1 rounded-xl text-xs font-medium border hover:opacity-80 transition cursor-pointer text-red-400"
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        borderColor: 'var(--border-main)'
                      }}
                    >
                      {ant}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Practice Word History */}
      {history.length > 0 && (
        <div
          className="rounded-3xl p-6 border shadow-sm space-y-4"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-main)'
          }}
        >
          <div className="flex items-center gap-2">
            <History size={16} style={{ color: 'var(--accent-primary)' }} />
            <h3 className="font-bold text-sm" style={{ color: 'var(--text-main)' }}>
              Recently Practiced Words
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => lookupWord(item.word)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition hover:scale-105 cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: item.is_match ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-main)',
                  color: 'var(--text-main)'
                }}
              >
                <span>{item.word}</span>
                {item.is_match ? (
                  <CheckCircle2 size={13} className="text-emerald-400" />
                ) : (
                  <span className="text-[10px] text-amber-400">practiced</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Streak Extended Celebration Modal */}
      {celebrateStreak !== null && (
        <StreakCelebration
          streakDays={celebrateStreak}
          onClose={() => setCelebrateStreak(null)}
        />
      )}
    </div>
  );
};
