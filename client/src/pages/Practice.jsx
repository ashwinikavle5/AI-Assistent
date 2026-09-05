import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import { StreakCelebration } from '../components/streak/StreakCelebration';
import {
  BrainCircuit,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Volume2,
  RefreshCw,
  Award,
  Layers
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Daily life',
  'College',
  'Friends',
  'Family',
  'Food',
  'Travel',
  'Shopping',
  'Work',
  'Technology',
  'Hobbies',
  'Weather',
  'Common conversations'
];

const DIFFICULTIES = [
  { id: 'Beginner', label: '🟢 Beginner', desc: 'Simple daily expressions' },
  { id: 'Intermediate', label: '🟡 Intermediate', desc: 'Compound sentences & conjunctions' },
  { id: 'Advanced', label: '🔴 Advanced', desc: 'Complex grammar & conditionals' }
];

export const Practice = () => {
  const { token } = useAuth();
  const { speak } = useAudio();

  const [currentDifficulty, setCurrentDifficulty] = useState('Beginner');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [question, setQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [history, setHistory] = useState([]);
  const [celebrateStreak, setCelebrateStreak] = useState(null);

  useEffect(() => {
    loadNextQuestion();
    loadHistory();
  }, [currentDifficulty, selectedCategory]);

  const loadNextQuestion = async () => {
    if (!token) return;
    setLoading(true);
    setEvaluation(null);
    setUserAnswer('');

    try {
      const catParam = selectedCategory !== 'All' ? `&category=${encodeURIComponent(selectedCategory)}` : '';
      const res = await fetch(`/api/practice/next?difficulty=${currentDifficulty}${catParam}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success && data.question) {
        setQuestion(data.question);
      }
    } catch (e) {
      console.error('Error fetching question:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/practice/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success && data.history) {
        setHistory(data.history);
      }
    } catch (e) {
      console.warn('Failed to load practice history:', e);
    }
  };

  const handleEvaluate = async (e) => {
    e.preventDefault();
    if (!userAnswer.trim() || !question || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/practice/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          questionId: question.questionId,
          userAnswer: userAnswer.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEvaluation(data);

        // Streak extension celebration if applicable
        if (data.streak && data.streak.streakIncreased) {
          setCelebrateStreak(data.streak.currentStreak);
        }

        loadHistory();
      }
    } catch (e) {
      console.error('Error evaluating attempt:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleListenTranslation = () => {
    if (evaluation?.correctAnswer) {
      speak(evaluation.correctAnswer, 'correct_trans_audio');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div
        className="rounded-3xl p-6 sm:p-8 border shadow-lg relative overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-main)'
        }}
      >
        <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold w-fit mb-3" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--accent-primary)' }}>
          <Sparkles size={14} /> Marathi → English Translation Coach
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-main)' }}>
          🧠 English Practice
        </h1>
        <p className="text-sm font-medium mt-1 max-w-xl" style={{ color: 'var(--text-muted)' }}>
          Translate authentic Marathi sentences into natural, conversational English. Questions never repeat.
        </p>

        {/* Difficulty Selection Pills */}
        <div className="mt-6 flex flex-wrap gap-2.5">
          {DIFFICULTIES.map((diff) => (
            <button
              key={diff.id}
              onClick={() => setCurrentDifficulty(diff.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer border ${
                currentDifficulty === diff.id ? 'shadow-md scale-105' : 'hover:opacity-80'
              }`}
              style={{
                background: currentDifficulty === diff.id ? 'var(--accent-gradient)' : 'var(--bg-card)',
                borderColor: currentDifficulty === diff.id ? 'transparent' : 'var(--border-main)',
                color: currentDifficulty === diff.id ? '#ffffff' : 'var(--text-secondary)'
              }}
            >
              <span>{diff.label}</span>
            </button>
          ))}
        </div>

        {/* Category Horizontal Pills */}
        <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-semibold shrink-0" style={{ color: 'var(--text-muted)' }}>
            Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs whitespace-nowrap transition-colors cursor-pointer border ${
                selectedCategory === cat ? 'font-bold' : 'hover:opacity-80'
              }`}
              style={{
                backgroundColor: selectedCategory === cat ? 'var(--accent-primary)' : 'var(--bg-card)',
                borderColor: 'var(--border-main)',
                color: selectedCategory === cat ? '#ffffff' : 'var(--text-muted)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Practice Interactive Challenge Card */}
      <div
        className="rounded-3xl p-6 sm:p-8 border shadow-xl space-y-6"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-main)'
        }}
      >
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }} />
            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              Preparing your unique practice sentence...
            </p>
          </div>
        ) : question ? (
          <div className="space-y-6">
            {/* Header tags */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  {question.category}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {question.difficulty}
                </span>
              </div>

              <button
                onClick={loadNextQuestion}
                className="flex items-center gap-1.5 text-xs font-semibold hover:opacity-80 transition cursor-pointer"
                style={{ color: 'var(--accent-primary)' }}
                title="Get another question"
              >
                <RefreshCw size={14} />
                <span>Skip / Refresh</span>
              </button>
            </div>

            {/* Marathi Sentence Prompt */}
            <div
              className="p-6 sm:p-8 rounded-2xl border text-center space-y-2"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-main)'
              }}
            >
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Translate this Marathi sentence into English:
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-normal pt-2" style={{ color: 'var(--text-main)' }}>
                "{question.marathiSentence}"
              </h2>
            </div>

            {/* Translation Input Form */}
            {!evaluation ? (
              <form onSubmit={handleEvaluate} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    Your English Translation:
                  </label>
                  <textarea
                    rows={3}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type your English translation here..."
                    required
                    className="w-full p-4 rounded-2xl border text-sm outline-none transition-all duration-200 resize-none focus:ring-2 focus:ring-purple-500/30"
                    style={{
                      backgroundColor: 'var(--bg-input)',
                      borderColor: 'var(--border-main)',
                      color: 'var(--text-main)'
                    }}
                  />
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={!userAnswer.trim() || submitting}
                    className="px-6 py-3 rounded-2xl text-white font-semibold text-sm transition-all duration-200 shadow-md flex items-center gap-2 cursor-pointer hover:opacity-95 disabled:opacity-50"
                    style={{
                      background: 'var(--accent-gradient)',
                      boxShadow: '0 8px 20px var(--accent-glow)'
                    }}
                  >
                    {submitting ? (
                      <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <>
                        <span>Submit Answer</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Evaluation Feedback Section */
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Result Banner */}
                <div
                  className={`p-6 rounded-2xl border ${
                    evaluation.isCorrect
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-amber-500/10 border-amber-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 font-bold text-base">
                      {evaluation.isCorrect ? (
                        <CheckCircle2 size={22} className="text-emerald-400" />
                      ) : (
                        <AlertCircle size={22} className="text-amber-400" />
                      )}
                      <span className={evaluation.isCorrect ? 'text-emerald-300' : 'text-amber-300'}>
                        {evaluation.isCorrect ? '✅ Correct Translation!' : '🟡 Needs Improvement'}
                      </span>
                    </div>

                    <button
                      onClick={handleListenTranslation}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-black/20 text-xs font-semibold hover:opacity-80 transition cursor-pointer text-white"
                      title="Listen to standard English"
                    >
                      <Volume2 size={14} />
                      <span>Hear Answer</span>
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    {/* Your Answer */}
                    <div className="space-y-1">
                      <span className="font-semibold uppercase tracking-wider text-white/60">
                        Your Answer:
                      </span>
                      <p className="p-2.5 rounded-xl bg-black/20 font-medium text-white/95">
                        "{evaluation.userAnswer}"
                      </p>
                    </div>

                    {/* Correct / Better Answer */}
                    <div className="space-y-1">
                      <span className="font-semibold uppercase tracking-wider text-emerald-300">
                        Natural English Translation:
                      </span>
                      <p className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/25 font-bold text-emerald-200 text-sm">
                        "{evaluation.correctAnswer}"
                      </p>
                    </div>

                    {/* Explanation */}
                    {evaluation.explanation && (
                      <div className="space-y-1 pt-1">
                        <span className="font-semibold uppercase tracking-wider text-cyan-300 flex items-center gap-1">
                          <Sparkles size={13} /> Explanation:
                        </span>
                        <p className="leading-relaxed text-white/90">
                          {evaluation.explanation}
                        </p>
                      </div>
                    )}

                    {/* Vocab Tip */}
                    {evaluation.vocabTip && (
                      <div className="space-y-1 pt-1">
                        <span className="font-semibold uppercase tracking-wider text-purple-300 flex items-center gap-1">
                          <Award size={13} /> Vocabulary Tip:
                        </span>
                        <p className="leading-relaxed text-white/90">
                          {evaluation.vocabTip}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Next Question Button */}
                <div className="flex justify-end">
                  <button
                    onClick={loadNextQuestion}
                    className="px-6 py-3.5 rounded-2xl text-white font-bold text-sm transition-all duration-200 shadow-lg flex items-center gap-2 cursor-pointer hover:opacity-95 hover:scale-105"
                    style={{
                      background: 'var(--accent-gradient)',
                      boxShadow: '0 8px 20px var(--accent-glow)'
                    }}
                  >
                    <span>Next Question</span>
                    <ArrowRight size={17} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p style={{ color: 'var(--text-muted)' }}>No questions available for this category.</p>
          </div>
        )}
      </div>

      {/* Recent Practice History */}
      {history.length > 0 && (
        <div
          className="rounded-3xl p-6 border shadow-sm space-y-4"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-main)'
          }}
        >
          <div className="flex items-center gap-2">
            <Layers size={16} style={{ color: 'var(--accent-primary)' }} />
            <h3 className="font-bold text-sm" style={{ color: 'var(--text-main)' }}>
              Completed Practice Attempts
            </h3>
          </div>

          <div className="space-y-2.5">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-main)'
                }}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold" style={{ color: 'var(--text-main)' }}>
                      {item.marathi_sentence}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 font-semibold" style={{ color: 'var(--text-muted)' }}>
                      {item.difficulty}
                    </span>
                  </div>
                  <p className="italic text-emerald-400">
                    → "{item.better_sentence}"
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                    item.is_correct ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  }`}>
                    {item.is_correct ? 'Correct' : 'Needs Work'}
                  </span>
                </div>
              </div>
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
