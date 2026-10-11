import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Grade, UserProfile, MistakeRecord } from '../types/mathverse';
import { BADGES_DATA, getUserLevel } from '../data/badgesData';
import { soundManager } from '../utils/soundEffects';
import { isGradeUnlocked } from '../data/promotionExamsData';
import {
  auth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateFirebaseAuthProfile,
  saveProfileToFirestore,
  loadProfileFromFirestore,
  FirebaseUser,
} from '../firebase';

export function getFirebaseErrorMessage(code: string, rawMessage?: string): string {
  switch (code) {
    case 'auth/configuration-not-found':
      return 'Dự án Firebase chưa bấm nút "Get started" trong mục Authentication! Vui lòng mở Firebase Console > chọn Authentication > bấm nút "Get started" màu xanh và bật "Email/Password".';
    case 'auth/operation-not-allowed':
      return 'Phương thức Email/Mật khẩu chưa được bật trong Firebase Console! Vui lòng vào Firebase Console > Authentication > Sign-in method > Nhấn vào "Email/Password" và gạt Bật (Enable) rồi nhấn Save.';
    case 'auth/unauthorized-domain':
      return 'Tên miền trang web này chưa được cấp phép trong Firebase. Vui lòng vào Firebase Console > Authentication > Settings > Authorized domains và thêm tên miền của trang web.';
    case 'auth/api-key-not-valid':
    case 'auth/invalid-api-key':
      return 'Firebase API Key không hợp lệ hoặc bị hạn chế API. Vui lòng kiểm tra lại cấu hình Firebase.';
    case 'auth/invalid-email':
      return 'Địa chỉ email không hợp lệ. Vui lòng kiểm tra lại định dạng email (ví dụ: hocsinh@gmail.com).';
    case 'auth/user-disabled':
      return 'Tài khoản này đã bị khóa bởi quản trị viên.';
    case 'auth/user-not-found':
      return 'Không tìm thấy tài khoản với email này. Nếu chưa có tài khoản, vui lòng chọn tab Đăng ký.';
    case 'auth/wrong-password':
      return 'Mật khẩu không chính xác. Vui lòng thử lại.';
    case 'auth/invalid-credential':
      return 'Email hoặc mật khẩu không chính xác. Hoặc tài khoản này chưa được kích hoạt.';
    case 'auth/email-already-in-use':
      return 'Email này đã được đăng ký tài khoản trước đó. Vui lòng chuyển sang tab Đăng nhập.';
    case 'auth/weak-password':
      return 'Mật khẩu quá ngắn (Firebase yêu cầu tối thiểu 6 ký tự).';
    case 'auth/network-request-failed':
      return 'Lỗi kết nối mạng, vui lòng kiểm tra lại đường truyền internet.';
    case 'auth/too-many-requests':
      return 'Quá nhiều lần thử không thành công. Firebase đã tạm thời chặn yêu cầu, vui lòng thử lại sau 1-2 phút.';
    default:
      if (code) {
        return `Đã xảy ra lỗi (${code}): ${rawMessage || 'Vui lòng kiểm tra lại cài đặt Firebase.'}`;
      }
      return rawMessage || 'Đã xảy ra lỗi xác thực tài khoản. Vui lòng thử lại.';
  }
}

interface MathVerseContextType {
  user: UserProfile | null;
  isAuthLoading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedLessonId: string | null;
  setSelectedLessonId: (id: string | null) => void;
  selectedPracticeTopic: string | null;
  setSelectedPracticeTopic: (topic: string | null) => void;
  lockedGradeAttempt: Grade | null;
  setLockedGradeAttempt: (grade: Grade | null) => void;
  activePromotionExamGrade: Grade | null;
  setActivePromotionExamGrade: (grade: Grade | null) => void;
  signUp: (email: string, pass: string, name: string, grade: Grade, avatar: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  registerLocalAccount: (email: string, pass: string, name: string, grade: Grade, avatar: string) => void;
  login: (name: string, grade: Grade, avatar: string) => void;
  logout: () => Promise<void>;
  addXp: (amount: number, reason?: string) => void;
  completeLesson: (lessonId: string) => void;
  recordQuestionResult: (
    questionId: string,
    isCorrect: boolean,
    topic: string,
    questionText: string,
    userAnswer: string,
    correctAnswer: string,
    explanation: string,
    xpEarned: number
  ) => void;
  toggleSound: () => void;
  updateGrade: (grade: Grade) => void;
  unlockGrade: (sourceGrade: Grade, nextGrade: Grade, score: number, total: number) => void;
  updateProfile: (name: string, avatar: string) => void;
  resetAllData: () => void;
  recentXpGained: { amount: number; reason?: string } | null;
  newBadgeUnlocked: string | null;
  clearNewBadge: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

const STORAGE_KEY_PREFIX = 'mathverse_user_profile_';
const GUEST_STORAGE_KEY = 'mathverse_user_profile_v1';
const THEME_KEY = 'mathverse_theme_v1';
const LAST_LOCAL_KEY = 'mathverse_last_local_uid';

const defaultProfile: UserProfile = {
  name: '',
  grade: 6,
  avatar: '👨‍🚀',
  xp: 0,
  streak: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  completedLessons: [],
  answeredQuestionsCount: 0,
  correctAnswersCount: 0,
  timeSpentSeconds: 0,
  unlockedBadges: [],
  topicStats: {
    'Số học': { correct: 0, total: 0 },
    'Phân số': { correct: 0, total: 0 },
    'Đại số': { correct: 0, total: 0 },
    'Hình học': { correct: 0, total: 0 },
    'Thống kê': { correct: 0, total: 0 },
  },
  recentMistakes: [],
  soundEnabled: true,
  theme: 'light',
  unlockedGrades: [6],
  completedGradeExams: {},
};

function parseProfileFromFirebaseUser(firebaseUser: FirebaseUser): UserProfile {
  let avatar = '👨‍🚀';
  let grade: Grade = 6;
  let unlockedGrades: Grade[] = [6];

  if (firebaseUser.photoURL) {
    try {
      const parsed = JSON.parse(firebaseUser.photoURL);
      if (parsed.avatar) avatar = parsed.avatar;
      if (parsed.grade) grade = parsed.grade;
      if (parsed.unlockedGrades) unlockedGrades = parsed.unlockedGrades;
    } catch {
      if (firebaseUser.photoURL.length <= 4) {
        avatar = firebaseUser.photoURL;
      }
    }
  }

  const today = new Date().toISOString().split('T')[0];
  return {
    ...defaultProfile,
    uid: firebaseUser.uid,
    email: firebaseUser.email || undefined,
    name: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Học sinh MathVerse'),
    grade,
    avatar,
    unlockedGrades,
    lastActiveDate: today,
    streak: 1,
  };
}

const MathVerseContext = createContext<MathVerseContextType | undefined>(undefined);

export const MathVerseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedPracticeTopic, setSelectedPracticeTopic] = useState<string | null>(null);
  const [recentXpGained, setRecentXpGained] = useState<{ amount: number; reason?: string } | null>(null);
  const [newBadgeUnlocked, setNewBadgeUnlocked] = useState<string | null>(null);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // State for theme: default to bright ('light')
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {}
    return 'light';
  });

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {}
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    soundManager.playClickSound();
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newTheme: 'light' | 'dark') => {
    soundManager.playClickSound();
    setThemeState(newTheme);
  };

  // State for locked grade attempt and active promotion exam
  const [lockedGradeAttempt, setLockedGradeAttempt] = useState<Grade | null>(null);
  const [activePromotionExamGrade, setActivePromotionExamGrade] = useState<Grade | null>(null);

  // Listen to Firebase Auth state change via onAuthStateChanged
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is logged in via Firebase
        const uid = firebaseUser.uid;
        let profileData: UserProfile | null = null;

        // 1. Try reading from Cloud Firestore (enables cross-device sync)
        profileData = await loadProfileFromFirestore(uid);

        // 2. Fallback to localStorage if cloud document doesn't exist yet
        if (!profileData) {
          try {
            const local = localStorage.getItem(STORAGE_KEY_PREFIX + uid);
            if (local) {
              profileData = JSON.parse(local);
            }
          } catch (e) {
            console.warn('Local profile notice:', e);
          }
        }

        // 3. Fallback to constructing profile from Firebase User credentials
        if (!profileData || !profileData.name) {
          profileData = parseProfileFromFirebaseUser(firebaseUser);
        }

        // Update streak and last active date
        const today = new Date().toISOString().split('T')[0];
        const lastDate = profileData.lastActiveDate || today;
        let streak = profileData.streak || 1;

        if (lastDate !== today) {
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          if (lastDate === yesterday) {
            streak += 1;
          } else {
            streak = 1;
          }
        }

        const resolvedProfile: UserProfile = {
          ...defaultProfile,
          ...profileData,
          uid: firebaseUser.uid,
          email: firebaseUser.email || profileData.email,
          name: profileData.name || firebaseUser.displayName || 'Học sinh MathVerse',
          streak,
          lastActiveDate: today,
          unlockedGrades: profileData.unlockedGrades || [6],
          completedGradeExams: profileData.completedGradeExams || {},
        };

        setUser(resolvedProfile);

        // Keep local cache up to date
        try {
          localStorage.setItem(STORAGE_KEY_PREFIX + uid, JSON.stringify(resolvedProfile));
        } catch {}

        // Save to Firestore in background to ensure remote backup
        saveProfileToFirestore(uid, resolvedProfile).catch(() => {});
      } else {
        // No Firebase user logged in. Check if there was a local account or guest session
        try {
          const lastLocalUid = localStorage.getItem(LAST_LOCAL_KEY);
          if (lastLocalUid) {
            const localSaved = localStorage.getItem(STORAGE_KEY_PREFIX + lastLocalUid);
            if (localSaved) {
              const parsed = JSON.parse(localSaved);
              if (parsed && parsed.name) {
                setUser({
                  ...defaultProfile,
                  ...parsed,
                });
                setIsAuthLoading(false);
                return;
              }
            }
          }

          const guest = localStorage.getItem(GUEST_STORAGE_KEY);
          if (guest) {
            const parsed = JSON.parse(guest);
            if (parsed && parsed.name && !parsed.uid) {
              setUser({
                ...defaultProfile,
                ...parsed,
              });
            } else {
              setUser(null);
            }
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        }
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sync profile changes to localStorage and Firestore
  useEffect(() => {
    if (user) {
      soundManager.setSoundEnabled(user.soundEnabled ?? true);
      const storageKey = user.uid ? STORAGE_KEY_PREFIX + user.uid : GUEST_STORAGE_KEY;
      try {
        localStorage.setItem(storageKey, JSON.stringify(user));
      } catch {}

      if (user.uid && !user.uid.startsWith('local_')) {
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
        }
        syncTimeoutRef.current = setTimeout(() => {
          saveProfileToFirestore(user.uid!, user).catch(() => {});
        }, 1000);
      }
    }
  }, [user]);

  // Check badges whenever user profile changes
  const checkBadgeUnlocks = (updatedUser: UserProfile): UserProfile => {
    let newlyUnlocked: string[] = [];
    const currentBadges = new Set(updatedUser.unlockedBadges);

    BADGES_DATA.forEach((badge) => {
      if (!currentBadges.has(badge.id)) {
        if (badge.checkUnlocked(updatedUser)) {
          currentBadges.add(badge.id);
          newlyUnlocked.push(badge.title);
        }
      }
    });

    if (newlyUnlocked.length > 0) {
      setNewBadgeUnlocked(newlyUnlocked[0]);
      soundManager.triggerBigCelebration();
    }

    return {
      ...updatedUser,
      unlockedBadges: Array.from(currentBadges),
    };
  };

  // Sign up with Email and Password via Firebase
  const signUp = async (
    email: string,
    pass: string,
    name: string,
    grade: Grade,
    avatar: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const fbUser = userCred.user;
      const today = new Date().toISOString().split('T')[0];

      const unlockedGrades: Grade[] = [6];
      const completedGradeExams: Record<number, any> = {};

      if (grade >= 7) {
        unlockedGrades.push(7);
        completedGradeExams[6] = { passed: true, score: 9, total: 10, date: today };
      }
      if (grade >= 8) {
        unlockedGrades.push(8);
        completedGradeExams[7] = { passed: true, score: 9, total: 10, date: today };
      }
      if (grade >= 9) {
        unlockedGrades.push(9);
        completedGradeExams[8] = { passed: true, score: 9, total: 10, date: today };
      }

      const newProfile: UserProfile = {
        ...defaultProfile,
        uid: fbUser.uid,
        email: fbUser.email || email.trim(),
        name: name.trim(),
        grade,
        avatar,
        unlockedGrades,
        completedGradeExams,
        lastActiveDate: today,
        streak: 1,
      };

      // Update Firebase Auth profile
      await updateFirebaseAuthProfile(fbUser, {
        displayName: name.trim(),
        photoURL: JSON.stringify({ avatar, grade, unlockedGrades }),
      });

      // Save to Firestore and local storage
      await saveProfileToFirestore(fbUser.uid, newProfile);
      localStorage.setItem(STORAGE_KEY_PREFIX + fbUser.uid, JSON.stringify(newProfile));

      setUser(newProfile);
      soundManager.playTriumphSound();
      return { success: true };
    } catch (err: any) {
      console.warn('Sign up notice (Firebase):', err?.code || err?.message);
      return {
        success: false,
        error: getFirebaseErrorMessage(err?.code || '', err?.message),
      };
    }
  };

  // Sign in with Email and Password via Firebase
  const signIn = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const userCred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const fbUser = userCred.user;

      // Try load profile from Firestore or localStorage
      let profile = await loadProfileFromFirestore(fbUser.uid);
      if (!profile) {
        try {
          const cached = localStorage.getItem(STORAGE_KEY_PREFIX + fbUser.uid);
          if (cached) profile = JSON.parse(cached);
        } catch {}
      }

      if (!profile || !profile.name) {
        profile = parseProfileFromFirebaseUser(fbUser);
      }

      const today = new Date().toISOString().split('T')[0];
      const resolvedProfile: UserProfile = {
        ...defaultProfile,
        ...profile,
        uid: fbUser.uid,
        email: fbUser.email || email.trim(),
        lastActiveDate: today,
      };

      setUser(resolvedProfile);
      localStorage.setItem(STORAGE_KEY_PREFIX + fbUser.uid, JSON.stringify(resolvedProfile));
      soundManager.playTriumphSound();
      return { success: true };
    } catch (err: any) {
      console.warn('Sign in notice (Firebase):', err?.code || err?.message);
      return {
        success: false,
        error: getFirebaseErrorMessage(err?.code || '', err?.message),
      };
    }
  };

  // Register account locally on browser (instant bypass when Firebase Auth is pending setup in Console)
  const registerLocalAccount = (
    email: string,
    pass: string,
    name: string,
    grade: Grade,
    avatar: string
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const unlockedGrades: Grade[] = [6];
    const completedGradeExams: Record<number, any> = {};

    if (grade >= 7) {
      unlockedGrades.push(7);
      completedGradeExams[6] = { passed: true, score: 9, total: 10, date: today };
    }
    if (grade >= 8) {
      unlockedGrades.push(8);
      completedGradeExams[7] = { passed: true, score: 9, total: 10, date: today };
    }
    if (grade >= 9) {
      unlockedGrades.push(9);
      completedGradeExams[8] = { passed: true, score: 9, total: 10, date: today };
    }

    const localUid = 'local_' + Date.now();
    const newProfile: UserProfile = {
      ...defaultProfile,
      uid: localUid,
      email: email.trim(),
      name: name.trim() || 'Học sinh MathVerse',
      grade,
      avatar,
      unlockedGrades,
      completedGradeExams,
      lastActiveDate: today,
      streak: 1,
    };

    setUser(newProfile);
    localStorage.setItem(STORAGE_KEY_PREFIX + localUid, JSON.stringify(newProfile));
    localStorage.setItem(LAST_LOCAL_KEY, localUid);
    soundManager.playTriumphSound();
  };

  // Guest login
  const login = (name: string, grade: Grade, avatar: string) => {
    const today = new Date().toISOString().split('T')[0];
    const unlockedGrades: Grade[] = [6];
    const completedGradeExams: Record<number, any> = {};

    if (grade >= 7) {
      unlockedGrades.push(7);
      completedGradeExams[6] = { passed: true, score: 9, total: 10, date: today };
    }
    if (grade >= 8) {
      unlockedGrades.push(8);
      completedGradeExams[7] = { passed: true, score: 9, total: 10, date: today };
    }
    if (grade >= 9) {
      unlockedGrades.push(9);
      completedGradeExams[8] = { passed: true, score: 9, total: 10, date: today };
    }

    const newUser: UserProfile = {
      ...defaultProfile,
      name,
      grade,
      avatar,
      unlockedGrades,
      completedGradeExams,
      lastActiveDate: today,
      streak: 1,
    };
    setUser(newUser);
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(newUser));
    soundManager.playTriumphSound();
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out notice:', e);
    }
    setUser(null);
    localStorage.removeItem(GUEST_STORAGE_KEY);
    localStorage.removeItem(LAST_LOCAL_KEY);
    setActiveTab('dashboard');
  };

  const addXp = (amount: number, reason?: string) => {
    if (!user) return;
    setRecentXpGained({ amount, reason });
    setTimeout(() => setRecentXpGained(null), 3000);

    setUser((prev) => {
      if (!prev) return null;
      const updated = {
        ...prev,
        xp: prev.xp + amount,
      };
      return checkBadgeUnlocks(updated);
    });
  };

  const completeLesson = (lessonId: string) => {
    if (!user) return;
    const isNew = !user.completedLessons.includes(lessonId);

    setUser((prev) => {
      if (!prev) return null;
      if (!isNew) return prev;

      const updated = {
        ...prev,
        completedLessons: [...prev.completedLessons, lessonId],
        xp: prev.xp + 50,
      };
      return checkBadgeUnlocks(updated);
    });

    if (isNew) {
      soundManager.triggerConfetti();
      soundManager.playTriumphSound();
      setRecentXpGained({ amount: 50, reason: 'Hoàn thành bài học' });
      setTimeout(() => setRecentXpGained(null), 3000);
    }
  };

  const recordQuestionResult = (
    questionId: string,
    isCorrect: boolean,
    topic: string,
    questionText: string,
    userAnswer: string,
    correctAnswer: string,
    explanation: string,
    xpEarned: number
  ) => {
    if (!user) return;

    setUser((prev) => {
      if (!prev) return null;

      const prevTopic = prev.topicStats[topic] || { correct: 0, total: 0 };
      const updatedTopicStats = {
        ...prev.topicStats,
        [topic]: {
          correct: prevTopic.correct + (isCorrect ? 1 : 0),
          total: prevTopic.total + 1,
        },
      };

      let mistakes = [...prev.recentMistakes];
      if (!isCorrect) {
        const newMistake: MistakeRecord = {
          questionId,
          questionText,
          topic,
          userAnswer,
          correctAnswer,
          explanation,
          timestamp: Date.now(),
        };
        // Keep at most 20 recent mistakes
        mistakes = [newMistake, ...mistakes.filter((m) => m.questionId !== questionId)].slice(0, 20);
      } else {
        // If answered correctly later, remove from mistakes
        mistakes = mistakes.filter((m) => m.questionId !== questionId);
      }

      const updated: UserProfile = {
        ...prev,
        answeredQuestionsCount: prev.answeredQuestionsCount + 1,
        correctAnswersCount: prev.correctAnswersCount + (isCorrect ? 1 : 0),
        xp: prev.xp + (isCorrect ? xpEarned : 0),
        topicStats: updatedTopicStats,
        recentMistakes: mistakes,
      };

      return checkBadgeUnlocks(updated);
    });

    if (isCorrect) {
      soundManager.playCorrectSound();
      setRecentXpGained({ amount: xpEarned, reason: 'Trả lời đúng' });
      setTimeout(() => setRecentXpGained(null), 2500);
    } else {
      soundManager.playWrongSound();
    }
  };

  const toggleSound = () => {
    setUser((prev) => {
      if (!prev) return null;
      const nextSound = !prev.soundEnabled;
      soundManager.setSoundEnabled(nextSound);
      return { ...prev, soundEnabled: nextSound };
    });
  };

  const updateGrade = (targetGrade: Grade) => {
    if (!user) return;
    if (isGradeUnlocked(user, targetGrade)) {
      setUser((prev) => (prev ? { ...prev, grade: targetGrade } : null));
      soundManager.playClickSound();
    } else {
      // Grade is locked! Trigger modal prompt
      soundManager.playWrongSound();
      setLockedGradeAttempt(targetGrade);
    }
  };

  const unlockGrade = (sourceGrade: Grade, nextGrade: Grade, score: number, total: number) => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    soundManager.triggerBigCelebration();

    setUser((prev) => {
      if (!prev) return null;
      const currentUnlocked = new Set(prev.unlockedGrades || [6]);
      currentUnlocked.add(nextGrade);

      const updatedExams = {
        ...(prev.completedGradeExams || {}),
        [sourceGrade]: {
          passed: true,
          score,
          total,
          date: today,
        },
      };

      const updated: UserProfile = {
        ...prev,
        grade: nextGrade,
        xp: prev.xp + 150,
        unlockedGrades: Array.from(currentUnlocked) as Grade[],
        completedGradeExams: updatedExams,
      };

      return checkBadgeUnlocks(updated);
    });

    setRecentXpGained({ amount: 150, reason: `Mở khóa thành công Lớp ${nextGrade}` });
    setTimeout(() => setRecentXpGained(null), 3500);
  };

  const updateProfile = (name: string, avatar: string) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, name, avatar };
      if (auth.currentUser) {
        updateFirebaseAuthProfile(auth.currentUser, {
          displayName: name,
          photoURL: JSON.stringify({ avatar, grade: prev.grade, unlockedGrades: prev.unlockedGrades }),
        }).catch(() => {});
      }
      return updated;
    });
  };

  const resetAllData = () => {
    if (!user) return;
    const cleanUser: UserProfile = {
      ...defaultProfile,
      uid: user.uid,
      email: user.email,
      name: user.name,
      grade: user.grade,
      avatar: user.avatar,
    };
    setUser(cleanUser);
    const storageKey = user.uid ? STORAGE_KEY_PREFIX + user.uid : GUEST_STORAGE_KEY;
    localStorage.setItem(storageKey, JSON.stringify(cleanUser));
    if (user.uid && !user.uid.startsWith('local_')) {
      saveProfileToFirestore(user.uid, cleanUser).catch(() => {});
    }
  };

  const clearNewBadge = () => {
    setNewBadgeUnlocked(null);
  };

  return (
    <MathVerseContext.Provider
      value={{
        user,
        isAuthLoading,
        activeTab,
        setActiveTab,
        selectedLessonId,
        setSelectedLessonId,
        selectedPracticeTopic,
        setSelectedPracticeTopic,
        lockedGradeAttempt,
        setLockedGradeAttempt,
        activePromotionExamGrade,
        setActivePromotionExamGrade,
        signUp,
        signIn,
        registerLocalAccount,
        login,
        logout,
        addXp,
        completeLesson,
        recordQuestionResult,
        toggleSound,
        updateGrade,
        unlockGrade,
        updateProfile,
        resetAllData,
        recentXpGained,
        newBadgeUnlocked,
        clearNewBadge,
        theme,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </MathVerseContext.Provider>
  );
};

export const useMathVerse = () => {
  const context = useContext(MathVerseContext);
  if (!context) {
    throw new Error('useMathVerse must be used within a MathVerseProvider');
  }
  return context;
};
