import React, { useState } from 'react';
import { Grade } from '../types/mathverse';
import { useMathVerse } from '../context/MathVerseContext';
import { Sparkles, Compass, Rocket, BookOpen, ChevronRight, Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

const AVATARS = [
  { icon: '👨‍🚀', label: 'Phi hành gia' },
  { icon: '👩‍🚀', label: 'Nhà thám hiểm' },
  { icon: '🦉', label: 'Cú thông thái' },
  { icon: '🤖', label: 'Robot MathBot' },
  { icon: '🦊', label: 'Cáo nhanh nhẹn' },
  { icon: '⭐', label: 'Ngôi sao nhỏ' },
];

const GRADES: { grade: Grade; title: string; subtitle: string; icon: string; bgGrad: string }[] = [
  { grade: 6, title: 'Lớp 6', subtitle: 'Số tự nhiên, Số nguyên, Phân số & Hình trực quan', icon: '🌱', bgGrad: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30' },
  { grade: 7, title: 'Lớp 7', subtitle: 'Số hữu tỉ, Tỉ lệ thức, Tam giác & Định lý Pythagore', icon: '📐', bgGrad: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30' },
  { grade: 8, title: 'Lớp 8', subtitle: 'Hằng đẳng thức, Phương trình & Định lý Thalès', icon: '⚡', bgGrad: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/30' },
  { grade: 9, title: 'Lớp 9', subtitle: 'Căn bậc hai, Hệ phương trình, Vi-ét & Đường tròn', icon: '👑', bgGrad: 'from-purple-500/20 to-pink-500/10 border-purple-500/30' },
];

export const LoginScreen: React.FC = () => {
  const { signIn, signUp, registerLocalAccount, login } = useMathVerse();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<Grade>(6);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].icon);

  // Status & error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleToggleMode = (mode: 'signin' | 'signup') => {
    soundManager.playClickSound();
    setAuthMode(mode);
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation
    if (!email.trim()) {
      setErrorMessage('Vui lòng nhập địa chỉ email của em.');
      soundManager.playWrongSound();
      return;
    }
    if (!password) {
      setErrorMessage('Vui lòng nhập mật khẩu.');
      soundManager.playWrongSound();
      return;
    }

    if (authMode === 'signup') {
      if (!name.trim()) {
        setErrorMessage('Vui lòng nhập họ và tên của em để tạo tài khoản.');
        soundManager.playWrongSound();
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Mật khẩu cần có ít nhất 6 ký tự để bảo mật an toàn.');
        soundManager.playWrongSound();
        return;
      }
    }

    setIsSubmitting(true);
    soundManager.playClickSound();

    if (authMode === 'signin') {
      const res = await signIn(email, password);
      if (!res.success) {
        setErrorMessage(res.error || 'Đăng nhập không thành công. Vui lòng kiểm tra lại.');
        soundManager.playWrongSound();
      }
    } else {
      const res = await signUp(email, password, name.trim(), selectedGrade, selectedAvatar);
      if (!res.success) {
        setErrorMessage(res.error || 'Đăng ký tài khoản không thành công. Vui lòng thử lại.');
        soundManager.playWrongSound();
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-sky-50/50 to-indigo-50/50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-200">
      {/* Background Luminous Atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-400/10 dark:bg-indigo-600/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-400/10 dark:bg-cyan-600/20 rounded-full blur-[128px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-amber-300/15 dark:bg-purple-600/15 rounded-full blur-[96px]" />

        {/* Floating math symbols in background */}
        <span className="absolute top-16 left-12 text-indigo-300/40 dark:text-cyan-500/20 text-4xl select-none font-mono font-bold animate-bounce">π</span>
        <span className="absolute top-28 right-24 text-sky-400/30 dark:text-indigo-400/20 text-5xl select-none font-mono font-bold">∑</span>
        <span className="absolute bottom-24 left-20 text-purple-400/30 dark:text-purple-400/20 text-5xl select-none font-mono font-bold">√</span>
        <span className="absolute bottom-32 right-16 text-pink-400/30 dark:text-pink-400/20 text-4xl select-none font-mono font-bold">∞</span>
        <span className="absolute top-2/3 left-1/3 text-emerald-400/25 dark:text-emerald-400/15 text-3xl select-none font-mono font-bold">Δ</span>
      </div>

      <div className="relative z-10 w-full max-w-xl bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/80 shadow-xl shadow-slate-200/50 dark:shadow-indigo-950/50 rounded-3xl p-6 sm:p-8">
        {/* Header Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3.5 bg-gradient-to-tr from-indigo-600 to-cyan-500 rounded-2xl shadow-md shadow-indigo-500/20 mb-3 transform hover:scale-105 transition-transform duration-300">
            <Rocket className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-cyan-300 dark:via-indigo-200 dark:to-purple-400 tracking-tight">
            MathVerse
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1 flex items-center justify-center gap-1.5 font-medium">
            <Sparkles className="w-4 h-4 text-amber-500 dark:text-cyan-400" />
            Vũ trụ Toán học THCS • Firebase Cloud Sync
          </p>
        </div>

        {/* Tab switch between Sign In and Sign Up */}
        <div className="flex p-1 mb-6 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
          <button
            type="button"
            onClick={() => handleToggleMode('signin')}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              authMode === 'signin'
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-cyan-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => handleToggleMode('signup')}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              authMode === 'signup'
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-cyan-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Đăng ký tài khoản
          </button>
        </div>

        {/* Error message alert */}
        {errorMessage && (
          <div className="mb-5 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs sm:text-sm space-y-3 animate-in fade-in">
            <div className="flex items-start gap-2">
              <span className="text-base leading-none">⚠️</span>
              <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
            </div>

            {/* Quick action buttons */}
            <div className="pt-2 border-t border-rose-200/60 dark:border-rose-800/60 flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <a
                  href="https://console.firebase.google.com/project/mathverse---vu-tru-toan-hoc/authentication"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-cyan-400 hover:underline"
                >
                  🔗 Mở Firebase Console &rarr; Bấm "Get started"
                </a>

                {authMode === 'signup' && (
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClickSound();
                      registerLocalAccount(
                        email || 'hocsinh@mathverse.edu.vn',
                        password || '123456',
                        name || 'Học sinh MathVerse',
                        selectedGrade,
                        selectedAvatar
                      );
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-all cursor-pointer shadow-xs"
                  >
                    ⚡ Lưu tài khoản trên máy này & Vào học ngay
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                <span>Hoặc trải nghiệm nhanh:</span>
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playClickSound();
                    login(name.trim() || 'Học sinh MathVerse', selectedGrade, selectedAvatar);
                  }}
                  className="font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                >
                  🚀 Vào học với chế độ Khách &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sign Up Exclusive Fields: Name */}
          {authMode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Họ và tên học sinh
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Nhập họ và tên hoặc biệt danh của em..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-cyan-500 focus:border-transparent transition-all text-sm"
                  maxLength={40}
                  required={authMode === 'signup'}
                />
              </div>
            </div>
          )}

          {/* Email Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Địa chỉ Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="vidu@gmail.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-cyan-500 focus:border-transparent transition-all text-sm"
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Mật khẩu
              </label>
              {authMode === 'signup' && (
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tối thiểu 6 ký tự
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder={authMode === 'signup' ? 'Tạo mật khẩu (tối thiểu 6 ký tự)...' : 'Nhập mật khẩu...'}
                className="w-full pl-10 pr-11 py-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-cyan-500 focus:border-transparent transition-all text-sm"
                required
                autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5"
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Sign Up Exclusive Fields: Avatar & Grade */}
          {authMode === 'signup' && (
            <>
              {/* Avatar Selector */}
              <div className="pt-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Chọn nhân vật đại diện
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATARS.map((av) => (
                    <button
                      type="button"
                      key={av.label}
                      onClick={() => {
                        setSelectedAvatar(av.icon);
                        soundManager.playClickSound();
                      }}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-2xl transition-all duration-200 cursor-pointer ${
                        selectedAvatar === av.icon
                          ? 'bg-indigo-50 dark:bg-indigo-600/30 border-indigo-400 dark:border-cyan-400 scale-105 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100'
                      }`}
                      title={av.label}
                    >
                      <span>{av.icon}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Grade Selector */}
              <div className="pt-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Chọn lớp học của em
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {GRADES.map((g) => (
                    <button
                      type="button"
                      key={g.grade}
                      onClick={() => {
                        setSelectedGrade(g.grade);
                        soundManager.playClickSound();
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                        selectedGrade === g.grade
                          ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-400 dark:border-cyan-400 ring-2 ring-indigo-400 dark:ring-cyan-400 shadow-xs'
                          : 'bg-white dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-xl">{g.icon}</span>
                        {selectedGrade === g.grade && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-cyan-400" />
                        )}
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white text-xs">{g.title}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{g.subtitle}</div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold rounded-xl shadow-md shadow-indigo-600/25 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:pointer-events-none transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer text-sm sm:text-base"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{authMode === 'signin' ? 'Đang đăng nhập...' : 'Đang tạo tài khoản...'}</span>
                </>
              ) : (
                <>
                  <span>{authMode === 'signin' ? 'Đăng nhập vào MathVerse' : 'Tạo tài khoản & Bắt đầu học'}</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer switch prompt */}
        <div className="mt-4 text-center">
          {authMode === 'signin' ? (
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Chưa có tài khoản?{' '}
              <button
                type="button"
                onClick={() => handleToggleMode('signup')}
                className="font-bold text-indigo-600 dark:text-cyan-400 hover:underline cursor-pointer"
              >
                Đăng ký ngay tại đây
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Đã có tài khoản?{' '}
              <button
                type="button"
                onClick={() => handleToggleMode('signin')}
                className="font-bold text-indigo-600 dark:text-cyan-400 hover:underline cursor-pointer"
              >
                Đăng nhập tại đây
              </button>
            </p>
          )}
        </div>

        {/* Quick guest bypass */}
        <div className="mt-2 text-center">
          <button
            type="button"
            onClick={() => {
              soundManager.playClickSound();
              login(name.trim() || 'Học sinh MathVerse', selectedGrade, selectedAvatar);
            }}
            className="text-[11px] text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-cyan-400 underline transition-colors cursor-pointer"
          >
            Hoặc tiếp tục nhanh với chế độ Khách (Lưu trên máy này) &rarr;
          </button>
        </div>

        {/* Footer highlights */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-3 gap-2 text-center text-[12px] text-slate-500 dark:text-slate-400">
          <div className="flex flex-col items-center gap-1">
            <span className="text-indigo-600 dark:text-cyan-400 font-semibold flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" /> Chuẩn SGK THCS
            </span>
            <span>Lớp 6, 7, 8, 9</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> MathBot AI
            </span>
            <span>Gia sư giải thích</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-indigo-600 dark:text-purple-400 font-semibold flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" /> Ôn tập thông minh
            </span>
            <span>Tự chữa điểm yếu</span>
          </div>
        </div>
      </div>
    </div>
  );
};
