import React from 'react';
import { useMathVerse } from '../context/MathVerseContext';
import { BADGES_DATA, LEVELS_DATA, getUserLevel, getNextLevel } from '../data/badgesData';
import { Award, Sparkles, Lock, CheckCircle2, TrendingUp, Star } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';
import trophyImg from '../assets/images/math_trophy_achievement_1791687276437.jpg';

export const AchievementsView: React.FC = () => {
  const { user } = useMathVerse();
  if (!user) return null;

  const currentLevel = getUserLevel(user.xp);
  const nextLevel = getNextLevel(user.xp);

  let progressPercent = 100;
  let xpRemaining = 0;
  if (nextLevel) {
    const range = nextLevel.minXp - currentLevel.minXp;
    const gained = user.xp - currentLevel.minXp;
    progressPercent = Math.min(Math.max(Math.round((gained / range) * 100), 0), 100);
    xpRemaining = nextLevel.minXp - user.xp;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Top Hero Banner with Trophy Visual */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-50 via-sky-50 to-indigo-50 dark:from-slate-900 dark:via-indigo-950/60 dark:to-slate-900 border border-amber-200/80 dark:border-slate-800 shadow-sm dark:shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-6 sm:p-8 gap-6">
          <div className="max-w-xl space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-700 dark:text-amber-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" /> Bảng Vinh Danh & Danh Hiệu
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center md:justify-start gap-2.5">
              <Award className="w-8 h-8 text-amber-500" />
              <span>Hệ thống Cấp độ & Huy hiệu</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              Tích lũy XP từ việc học bài, hoàn thành bài tập trắc nghiệm và thử thách để mở khóa toàn bộ 8 Huy hiệu vinh dự và thăng cấp Bậc thầy Toán học!
            </p>
          </div>
          <div className="w-44 h-32 sm:w-56 sm:h-36 rounded-2xl overflow-hidden shadow-md border border-amber-200 dark:border-amber-400/30 shrink-0">
            <img
              src={trophyImg}
              alt="Cúp Vinh Danh MathVerse"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Current Level Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="text-5xl sm:text-6xl p-4 rounded-3xl bg-amber-50 dark:bg-slate-950 border border-amber-200 dark:border-slate-800 shadow-inner">
              {currentLevel.icon}
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-cyan-400">
                Cấp độ hiện tại • Cấp {currentLevel.level}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-0.5">
                {currentLevel.title}
              </h2>
              <div className="text-sm font-bold text-amber-600 dark:text-amber-400 font-mono mt-1">
                ⭐ {user.xp} XP tổng cộng
              </div>
            </div>
          </div>

          {nextLevel ? (
            <div className="w-full sm:w-72 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 font-semibold">
                <span>Lên cấp {nextLevel.title}:</span>
                <span className="text-indigo-600 dark:text-cyan-400 font-bold">{progressPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 text-right">
                Cần thêm <strong className="text-slate-800 dark:text-slate-200">{xpRemaining} XP</strong>
              </div>
            </div>
          ) : (
            <div className="px-5 py-3 rounded-2xl bg-amber-50 dark:bg-rose-500/10 border border-amber-300 dark:border-rose-500/30 text-amber-700 dark:text-rose-300 font-bold text-sm">
              👑 Đã đạt cấp độ tối cao của MathVerse!
            </div>
          )}
        </div>
      </div>

      {/* Levels Pathway Roadmap */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-500" />
          <span>Lộ trình 5 cấp bậc trong Vũ trụ MathVerse</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {LEVELS_DATA.map((lvl) => {
            const isReached = user.xp >= lvl.minXp;
            const isCurrent = currentLevel.level === lvl.level;

            return (
              <div
                key={lvl.level}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  isCurrent
                    ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-400 dark:border-cyan-400 ring-2 ring-indigo-400/30 shadow-md'
                    : isReached
                    ? 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-xs'
                    : 'bg-slate-50/70 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800/80 opacity-60 text-slate-400 dark:text-slate-500'
                }`}
              >
                <div className="text-3xl mb-1">{lvl.icon}</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">{lvl.title}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-1">
                  {lvl.minXp}+ XP
                </div>
                {isReached && (
                  <span className="inline-block mt-2 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                    {isCurrent ? 'Hiện tại' : 'Đã đạt'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 8 Badges Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            <span>Bộ sưu tập 8 Huy hiệu vinh danh ({user.unlockedBadges.length}/8)</span>
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">Tự động mở khóa khi đạt tiêu chí</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BADGES_DATA.map((b) => {
            const isUnlocked = user.unlockedBadges.includes(b.id) || b.checkUnlocked(user);
            const prog = b.progress(user);
            const pct = Math.round((prog.current / prog.max) * 100);

            return (
              <div
                key={b.id}
                className={`p-5 rounded-3xl border transition-all duration-300 flex flex-col justify-between ${
                  isUnlocked
                    ? 'bg-gradient-to-b from-amber-50/70 via-white to-sky-50/40 dark:from-indigo-950/60 dark:to-slate-900 border-amber-300 dark:border-amber-500/40 shadow-sm dark:shadow-amber-500/10'
                    : 'bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 text-slate-400 dark:text-slate-500'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-4xl filter drop-shadow">{b.icon}</span>
                    {isUnlocked ? (
                      <span className="p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                        <Lock className="w-4 h-4" />
                      </span>
                    )}
                  </div>

                  <h4 className={`text-base font-bold mb-1 ${isUnlocked ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                    {b.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                    {b.description}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 space-y-1.5">
                  <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    <span>{b.criteria}</span>
                    <span className={isUnlocked ? 'text-emerald-700 dark:text-emerald-400 font-bold' : ''}>
                      {prog.current}/{prog.max}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isUnlocked
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                          : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
