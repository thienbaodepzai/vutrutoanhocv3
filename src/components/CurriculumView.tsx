import React, { useState } from 'react';
import { Grade, Lesson } from '../types/mathverse';
import { useMathVerse } from '../context/MathVerseContext';
import { CURRICULUM_DATA } from '../data/curriculumData';
import { LessonDetailModal } from './LessonDetailModal';
import { isGradeUnlocked, PROMOTION_EXAMS } from '../data/promotionExamsData';
import {
  BookOpen,
  CheckCircle2,
  Play,
  Sparkles,
  Filter,
  ChevronRight,
  Lock,
  Award,
  ArrowRight,
  Search,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

export const CurriculumView: React.FC = () => {
  const {
    user,
    updateGrade,
    setSelectedLessonId,
    setActiveTab,
    setLockedGradeAttempt,
    setActivePromotionExamGrade,
  } = useMathVerse();
  const currentGrade = user?.grade || 6;

  const [activeGradeTab, setActiveGradeTab] = useState<Grade>(currentGrade);
  const [selectedVolumeFilter, setSelectedVolumeFilter] = useState<'all' | 1 | 2>('all');
  const [selectedChapterFilter, setSelectedChapterFilter] = useState<string>('all');
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalLesson, setActiveModalLesson] = useState<Lesson | null>(null);

  // Filter lessons by grade
  const gradeLessons = CURRICULUM_DATA.filter((l) => l.grade === activeGradeTab);

  // Chapters list for this grade (sorted)
  const chapters = [
    'all',
    ...Array.from(new Set(gradeLessons.map((l) => l.chapter).filter(Boolean) as string[])),
  ];

  // Distinct topics in this grade
  const topics = ['all', ...Array.from(new Set(gradeLessons.map((l) => l.topic)))];

  // Filtered lessons
  const filteredLessons = gradeLessons.filter((l) => {
    // Volume filter
    if (selectedVolumeFilter !== 'all' && l.bookVolume !== selectedVolumeFilter) {
      return false;
    }
    // Chapter filter
    if (selectedChapterFilter !== 'all' && l.chapter !== selectedChapterFilter) {
      return false;
    }
    // Topic filter
    if (selectedTopicFilter !== 'all' && l.topic !== selectedTopicFilter) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = l.title.toLowerCase().includes(q);
      const matchObjective = l.objective.toLowerCase().includes(q);
      const matchChapter = (l.chapter || '').toLowerCase().includes(q);
      const matchTopic = l.topic.toLowerCase().includes(q);
      return matchTitle || matchObjective || matchChapter || matchTopic;
    }
    return true;
  });

  const handleOpenLesson = (lesson: Lesson) => {
    soundManager.playClickSound();
    setActiveModalLesson(lesson);
  };

  const handleStartPractice = (lessonId: string) => {
    setActiveModalLesson(null);
    setSelectedLessonId(lessonId);
    setActiveTab('practice');
  };

  const handleTabClick = (g: Grade) => {
    soundManager.playClickSound();
    if (isGradeUnlocked(user, g)) {
      setActiveGradeTab(g);
      updateGrade(g);
      setSelectedVolumeFilter('all');
      setSelectedChapterFilter('all');
      setSelectedTopicFilter('all');
      setSearchQuery('');
    } else {
      soundManager.playWrongSound();
      setLockedGradeAttempt(g);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-cyan-500/10 border border-indigo-200 dark:border-cyan-500/30 text-indigo-700 dark:text-cyan-300 text-xs font-bold mb-2">
            <BookOpen className="w-3.5 h-3.5" /> Bộ sách Kết nối tri thức với cuộc sống (Tập 1 & Tập 2)
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Bài học Toán Lớp {activeGradeTab} theo SGK</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Nội dung chi tiết từng bài học chuẩn theo sách giáo khoa Toán {activeGradeTab} (Tập 1 & Tập 2). Vượt qua bài kiểm tra để lên lớp!
          </p>
        </div>

        {/* Grade tabs with Lock indicator */}
        <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          {([6, 7, 8, 9] as Grade[]).map((g) => {
            const unlocked = isGradeUnlocked(user, g);
            const isActive = activeGradeTab === g;

            return (
              <button
                key={g}
                onClick={() => handleTabClick(g)}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-indigo-600 dark:bg-gradient-to-r dark:from-cyan-500 dark:to-indigo-600 text-white shadow-xs'
                    : unlocked
                    ? 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
                }`}
              >
                <span>Lớp {g}</span>
                {!unlocked && <Lock className="w-3.5 h-3.5 text-amber-500" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Promotion Exam Banner for KNTT */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-indigo-50/90 via-white to-purple-50/90 dark:from-indigo-950/70 dark:via-slate-900 dark:to-purple-950/70 border border-indigo-200 dark:border-indigo-500/40 shadow-xs dark:shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-400/40">
                <Award className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Bài tập tổng hợp lên lớp (Bộ sách Kết nối tri thức)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Quy định: Để lên Lớp 7 cần hoàn thành Tổng hợp Lớp 6; để lên Lớp 8 hoặc 9 phải trải qua đủ các kiến thức lớp trước đó.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {PROMOTION_EXAMS.map((exam) => {
              const isPassed = !!user?.completedGradeExams?.[exam.sourceGrade]?.passed;
              return (
                <button
                  key={exam.id}
                  onClick={() => {
                    soundManager.playClickSound();
                    setActivePromotionExamGrade(exam.sourceGrade);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                    isPassed
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600/30 dark:border-cyan-400/50 dark:text-cyan-300'
                  }`}
                >
                  {isPassed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  )}
                  <span>Thi lên Lớp {exam.unlocksGrade}</span>
                  {isPassed && <span className="text-[10px] text-emerald-600 dark:text-emerald-400">(Đã đạt)</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filters Bar: Tập 1 / Tập 2, Search & Chapters */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 space-y-3.5 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Volume Tabs: Tất cả / Tập 1 / Tập 2 */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shrink-0">
            <button
              onClick={() => {
                setSelectedVolumeFilter('all');
                soundManager.playClickSound();
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedVolumeFilter === 'all'
                  ? 'bg-indigo-600 text-white dark:bg-cyan-500 dark:text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Cả năm ({gradeLessons.length} bài)
            </button>
            <button
              onClick={() => {
                setSelectedVolumeFilter(1);
                soundManager.playClickSound();
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedVolumeFilter === 1
                  ? 'bg-amber-500 text-white dark:text-slate-950 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              📖 Tập 1 (Kỳ I)
            </button>
            <button
              onClick={() => {
                setSelectedVolumeFilter(2);
                soundManager.playClickSound();
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedVolumeFilter === 2
                  ? 'bg-indigo-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              📘 Tập 2 (Kỳ II)
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bài học, định lý, công thức (VD: Vi-ét, góc nội tiếp, luỹ thừa)..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 dark:focus:ring-cyan-500 focus:outline-none placeholder-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Chapters selection */}
        {chapters.length > 2 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-slate-500 shrink-0 flex items-center gap-1 pr-1 font-semibold">
              <Layers className="w-3.5 h-3.5" /> Chương:
            </span>
            {chapters.map((chap) => {
              const isSelected = selectedChapterFilter === chap;
              const shortName = chap === 'all' ? 'Tất cả chương' : chap.split('.')[0] || chap;
              return (
                <button
                  key={chap}
                  onClick={() => {
                    setSelectedChapterFilter(chap);
                    soundManager.playClickSound();
                  }}
                  title={chap}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap text-[11px] font-bold transition-all cursor-pointer shrink-0 border ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-600/30 dark:border-cyan-400 dark:text-cyan-300 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {shortName}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredLessons.length === 0 && (
        <div className="text-center py-12 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Không tìm thấy bài học phù hợp</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Hãy thử tìm bằng từ khóa khác hoặc đặt lại bộ lọc Tập sách / Chương.
          </p>
          <button
            onClick={() => {
              setSelectedVolumeFilter('all');
              setSelectedChapterFilter('all');
              setSelectedTopicFilter('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold cursor-pointer"
          >
            Đặt lại tất cả bộ lọc
          </button>
        </div>
      )}

      {/* Lesson Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredLessons.map((lesson) => {
          const isDone = user?.completedLessons.includes(lesson.id);

          return (
            <div
              key={lesson.id}
              className={`group p-5 rounded-2xl bg-white dark:bg-slate-900/80 border transition-all duration-300 backdrop-blur-md flex flex-col justify-between shadow-xs hover:shadow-md ${
                isDone
                  ? 'border-emerald-300 dark:border-emerald-500/30'
                  : 'border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/40'
              }`}
            >
              <div>
                {/* Meta row: Volume badge + Chapter + Done status */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {lesson.bookVolume && (
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${
                          lesson.bookVolume === 1
                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30'
                        }`}
                      >
                        Tập {lesson.bookVolume}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700/80">
                      {lesson.topic}
                    </span>
                  </div>

                  {isDone ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20 shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Đã học
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 shrink-0">
                      <Sparkles className="w-3 h-3 text-amber-500 dark:text-cyan-400" /> +50 XP
                    </span>
                  )}
                </div>

                {/* Chapter title (if any) */}
                {lesson.chapter && (
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 truncate">
                    {lesson.chapter}
                  </div>
                )}

                {/* Title */}
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-cyan-300 transition-colors mb-2 leading-snug">
                  {lesson.title}
                </h3>

                {/* Objective */}
                <p className="text-xs text-slate-600 dark:text-slate-300/90 line-clamp-2 leading-relaxed mb-4">
                  {lesson.objective}
                </p>

                {/* Key formulas preview */}
                {lesson.formulas.length > 0 && (
                  <div className="mb-4 p-2.5 rounded-xl bg-indigo-50/60 dark:bg-slate-950/60 border border-indigo-100 dark:border-slate-800/80 font-mono text-xs text-indigo-900 dark:text-cyan-300 flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans uppercase font-bold">Công thức:</span>
                    <span className="truncate">{lesson.formulas[0].formula}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                <button
                  onClick={() => handleOpenLesson(lesson)}
                  className="flex-1 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-600/30 dark:hover:bg-indigo-600 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-cyan-300 hover:text-indigo-900 dark:hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Chi tiết bài học</span>
                </button>

                <button
                  onClick={() => handleStartPractice(lesson.id)}
                  className="py-2 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <span>Luyện tập</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lesson Detail Interactive Modal */}
      {activeModalLesson && (
        <LessonDetailModal
          lesson={activeModalLesson}
          onClose={() => setActiveModalLesson(null)}
          onStartPractice={handleStartPractice}
        />
      )}
    </div>
  );
};
