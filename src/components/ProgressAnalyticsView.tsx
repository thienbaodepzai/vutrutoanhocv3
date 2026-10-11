import React from 'react';
import { useMathVerse } from '../context/MathVerseContext';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Target,
} from 'lucide-react';

export const ProgressAnalyticsView: React.FC = () => {
  const { user } = useMathVerse();
  if (!user) return null;

  const totalAnswered = user.answeredQuestionsCount;
  const totalCorrect = user.correctAnswersCount;
  const overallAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  // Approximate study time: each answered question ~ 1.5 mins, each lesson ~ 10 mins
  const estimatedMins = Math.round(
    user.answeredQuestionsCount * 1.5 + user.completedLessons.length * 10
  );
  const estimatedHours = (estimatedMins / 60).toFixed(1);

  // Analyze topics
  const topicsData = Object.entries(user.topicStats).map(([topic, stats]) => {
    const rate = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    return {
      topic,
      correct: stats.correct,
      total: stats.total,
      rate,
    };
  });

  const strongTopics = topicsData.filter((t) => t.total >= 2 && t.rate >= 70);
  const weakTopics = topicsData.filter((t) => t.total >= 2 && t.rate < 60);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-indigo-600 dark:text-cyan-400" />
          <span>Tiến độ & Báo cáo Năng lực Toán học</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Theo dõi chi tiết số liệu rèn luyện, tỉ lệ chính xác và xác định điểm mạnh điểm yếu.
        </p>
      </div>

      {/* 4 Big Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Tổng câu đã làm</span>
            <Target className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">{totalAnswered}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Đúng {totalCorrect} câu</div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Tỉ lệ chính xác</span>
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            {overallAccuracy}%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            {overallAccuracy >= 80 ? 'Xuất sắc' : overallAccuracy >= 60 ? 'Khá tốt' : 'Cần cố gắng'}
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Tổng điểm XP</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600 dark:text-yellow-300 font-mono">{user.xp}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Điểm kinh nghiệm</div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Thời gian học</span>
            <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 font-mono">
            {estimatedHours}h
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Khoảng {estimatedMins} phút</div>
        </div>
      </div>

      {/* Topic Accuracy Breakdown */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs dark:shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Tỉ lệ chính xác theo từng phân môn</span>
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">Cập nhật theo thời gian thực</span>
        </div>

        <div className="space-y-4">
          {topicsData.length === 0 ? (
            <p className="text-xs text-slate-500 italic">Chưa có dữ liệu làm bài. Hãy làm bài luyện tập hoặc thử thách để cập nhật nhé!</p>
          ) : (
            topicsData.map((t) => (
              <div key={t.topic} className="space-y-1.5">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{t.topic}</span>
                  <span className="font-mono text-indigo-600 dark:text-cyan-300 font-bold">
                    {t.rate}% ({t.correct}/{t.total} câu)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      t.rate >= 70
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : t.rate >= 50
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                        : 'bg-gradient-to-r from-rose-500 to-pink-500'
                    }`}
                    style={{ width: `${t.rate || (t.total === 0 ? 0 : 5)}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Strengths & Weaknesses Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Strong Topics */}
        <div className="p-6 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 space-y-3">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-base">
            <CheckCircle2 className="w-5 h-5" />
            <span>Chủ đề thế mạnh của em</span>
          </div>
          {strongTopics.length > 0 ? (
            <div className="space-y-2">
              {strongTopics.map((st) => (
                <div
                  key={st.topic}
                  className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-emerald-200 dark:border-emerald-500/20 flex justify-between text-xs shadow-xs"
                >
                  <span className="font-bold text-slate-900 dark:text-white">{st.topic}</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">
                    {st.rate}% đúng ({st.correct}/{st.total})
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Làm thêm từ 2-3 câu hỏi để hệ thống xác định những chủ đề mà em vượt trội nhất nhé!
            </p>
          )}
        </div>

        {/* Weak Topics */}
        <div className="p-6 rounded-3xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/30 space-y-3">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-base">
            <AlertTriangle className="w-5 h-5" />
            <span>Chủ đề cần cải thiện</span>
          </div>
          {weakTopics.length > 0 ? (
            <div className="space-y-2">
              {weakTopics.map((wt) => (
                <div
                  key={wt.topic}
                  className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-rose-200 dark:border-rose-500/20 flex justify-between text-xs shadow-xs"
                >
                  <span className="font-bold text-slate-900 dark:text-white">{wt.topic}</span>
                  <span className="text-rose-700 dark:text-rose-400 font-mono font-bold">
                    {wt.rate}% đúng ({wt.correct}/{wt.total})
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Không có chủ đề nào bị đánh giá yếu! Em đang duy trì phong độ làm bài rất đều và tốt.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
