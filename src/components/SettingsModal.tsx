import React, { useState, useEffect } from 'react';
import { useMathVerse } from '../context/MathVerseContext';
import { Grade } from '../types/mathverse';
import {
  Settings,
  Volume2,
  VolumeX,
  User,
  RotateCcw,
  LogOut,
  Save,
  Check,
  AlertTriangle,
  Music,
  Headphones,
  Sparkles,
  Lock,
  Sun,
  Moon,
} from 'lucide-react';
import { soundManager } from '../utils/soundEffects';
import { musicPlayer, MUSIC_TRACKS } from '../utils/musicPlayer';
import { isGradeUnlocked } from '../data/promotionExamsData';

const AVATARS = ['👨‍🚀', '👩‍🚀', '🦉', '🤖', '🦊', '⭐'];

export const SettingsModal: React.FC = () => {
  const {
    user,
    toggleSound,
    updateGrade,
    updateProfile,
    resetAllData,
    logout,
    setLockedGradeAttempt,
    theme,
    toggleTheme,
    setTheme,
  } = useMathVerse();

  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '👨‍🚀');
  const [selectedGrade, setSelectedGrade] = useState<Grade>(user?.grade || 6);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // Music state
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [currentTrackId, setCurrentTrackId] = useState('cosmic-nebula');
  const [musicVolume, setMusicVolume] = useState(0.45);

  useEffect(() => {
    const unsub = musicPlayer.subscribe((state) => {
      setIsMusicPlaying(state.isPlaying);
      setCurrentTrackId(state.trackId);
      setMusicVolume(state.volume);
    });
    const s = musicPlayer.getState();
    setIsMusicPlaying(s.isPlaying);
    setCurrentTrackId(s.trackId);
    setMusicVolume(s.volume);
    return () => unsub();
  }, []);

  if (!user) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      updateProfile(name.trim(), avatar);
      updateGrade(selectedGrade);
      soundManager.playClickSound();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  const handleReset = () => {
    soundManager.playWrongSound();
    resetAllData();
    setConfirmReset(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          <span>Cài đặt hệ thống</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Tùy chỉnh giao diện, thông tin cá nhân, khối lớp, nhạc nền tập trung và hiệu ứng âm thanh.
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs dark:shadow-xl space-y-6">
        {/* Theme Mode Toggle Section */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {theme === 'light' ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-400" />
              )}
              <span>Giao diện màu sắc</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 text-[10px] font-bold border border-indigo-200 dark:border-indigo-500/30">
                {theme === 'light' ? '☀️ Giao diện Sáng tinh khôi' : '🌙 Giao diện Tối phi thuyền'}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Chuyển đổi giữa chế độ Sáng dễ nhìn, năng động và chế độ Tối huyền bí
            </p>
          </div>

          <div className="inline-flex p-1 rounded-xl bg-slate-200/80 dark:bg-slate-900 border border-slate-300 dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                if (theme !== 'light') toggleTheme();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                theme === 'light'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Sáng</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (theme !== 'dark') toggleTheme();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                theme === 'dark'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-indigo-300" />
              <span>Tối</span>
            </button>
          </div>
        </div>

        {/* Background Music Section */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-50/70 via-indigo-50/40 to-purple-50/70 dark:from-indigo-950/60 dark:via-slate-950 dark:to-purple-950/60 border border-indigo-200/80 dark:border-indigo-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Headphones className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
                <span>Nhạc nền Không gian Tập trung</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-cyan-500/20 dark:text-cyan-300 text-[10px] font-bold">
                  THƯ GIÃN
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Giai điệu Lo-Fi & Ambient thư giãn giúp giảm căng thẳng và tăng khả năng tập trung
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                soundManager.playClickSound();
                musicPlayer.togglePlay();
              }}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                isMusicPlaying ? 'bg-indigo-600 dark:bg-cyan-500 justify-end' : 'bg-slate-300 dark:bg-slate-800 justify-start'
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform" />
            </button>
          </div>

          {/* Volume Control */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Âm lượng nhạc nền:
              </span>
              <span className="font-mono text-indigo-600 dark:text-cyan-400 font-bold">
                {Math.round(musicVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={musicVolume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setMusicVolume(val);
                musicPlayer.setVolume(val);
              }}
              className="w-full accent-indigo-600 dark:accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Track selection */}
          <div className="space-y-2 pt-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Danh sách bản nhạc nền:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MUSIC_TRACKS.map((t) => {
                const isSelected = t.id === currentTrackId;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      soundManager.playClickSound();
                      musicPlayer.setTrack(t.id);
                      if (!isMusicPlaying) musicPlayer.play();
                    }}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-950 dark:bg-cyan-950/50 dark:border-cyan-400 dark:text-white shadow-xs'
                        : 'bg-white/80 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xl">{t.icon}</span>
                    <div className="truncate">
                      <div className="text-xs font-bold truncate">{t.title}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{t.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Sound FX Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {user.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                )}
                <span>Hiệu ứng âm thanh khi trả lời câu hỏi</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Âm thanh vui nhộn khi trả lời đúng, sai và hoàn thành bài thi
              </p>
            </div>

            <button
              type="button"
              onClick={toggleSound}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                user.soundEnabled ? 'bg-indigo-600 dark:bg-cyan-500 justify-end' : 'bg-slate-300 dark:bg-slate-800 justify-start'
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform" />
            </button>
          </div>

          {/* Account email info */}
          {user.email && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Tài khoản Firebase
              </label>
              <div className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>{user.email}</span>
                <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700/50">
                  Đã kết nối Firebase
                </span>
              </div>
            </div>
          )}

          {/* Student Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Họ và tên học sinh
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-cyan-500 focus:outline-none shadow-xs"
              maxLength={30}
            />
          </div>

          {/* Avatar selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Nhân vật đại diện
            </label>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map((av) => (
                <button
                  type="button"
                  key={av}
                  onClick={() => setAvatar(av)}
                  className={`p-3 rounded-xl border text-2xl transition-all cursor-pointer ${
                    avatar === av
                      ? 'bg-indigo-50 dark:bg-indigo-600/30 border-indigo-400 dark:border-cyan-400 ring-2 ring-indigo-400/30'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Grade Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Lớp đang học (Bộ sách Kết nối tri thức)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {([6, 7, 8, 9] as Grade[]).map((g) => {
                const unlocked = isGradeUnlocked(user, g);
                return (
                  <button
                    type="button"
                    key={g}
                    onClick={() => {
                      if (unlocked) {
                        setSelectedGrade(g);
                        soundManager.playClickSound();
                      } else {
                        soundManager.playWrongSound();
                        setLockedGradeAttempt(g);
                      }
                    }}
                    className={`p-3 rounded-xl border font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      selectedGrade === g
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                        : unlocked
                        ? 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        : 'bg-slate-100/60 dark:bg-slate-950/40 border-slate-200/80 dark:border-slate-800/80 text-slate-400'
                    }`}
                  >
                    <span>Lớp {g}</span>
                    {!unlocked && <Lock className="w-3 h-3 text-amber-500" />}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
              * Để mở khóa lớp cao hơn, em cần vượt qua bài tập tổng hợp Kết nối tri thức của các lớp trước đó.
            </p>
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-md shadow-indigo-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Lưu thay đổi
            </button>
            {savedSuccess && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold animate-in fade-in">
                <Check className="w-4 h-4" /> Đã cập nhật thành công!
              </span>
            )}
          </div>
        </form>

        {/* Danger Zone: Reset & Logout */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Quản trị dữ liệu
          </h3>

          <div className="flex flex-col sm:flex-row gap-3">
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-rose-300 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 hover:bg-rose-50 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Đặt lại dữ liệu điểm & tiến độ
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-500/40 flex items-center gap-3">
                <span className="text-xs text-rose-800 dark:text-rose-200">
                  Xác nhận đặt lại về 0 XP?
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Đồng ý
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 rounded-lg text-xs cursor-pointer"
                >
                  Hủy
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={logout}
              className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Đăng xuất tài khoản
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
