'use client';

import { SimpleLoginForm } from '@/components/auth/simple-login-form';
import { useAuth } from '@/contexts/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function LoginContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<'signin' | 'signup'>('signup');

  useEffect(() => {
    const roleParam = searchParams.get('role');
    setRole(roleParam);
  }, [searchParams]);

  useEffect(() => {
    if (!loading && user) {
      const redirectTo = searchParams.get('redirectTo') || '/dashboard';
      router.push(redirectTo);
    }
  }, [user, loading, router, searchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-70px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-70px)] min-h-[calc(100dvh-70px)] bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Enhanced Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-yellow-200/20 to-orange-200/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-2xl animate-bounce-slow" />
        <div className="absolute top-20 right-1/4 w-28 h-28 bg-gradient-to-br from-green-200/20 to-emerald-200/20 rounded-full blur-2xl animate-float" />
      </div>

      <div className="relative z-10 min-h-[calc(100vh-70px)] flex items-center justify-center p-3 sm:p-4">
        <div className="w-full max-w-6xl">
          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">

            {/* Left Column - Welcome Content */}
            <div className="space-y-3 sm:space-y-4 lg:space-y-6 text-center lg:text-left">
              {/* Role-based Icon and Animation - Hidden on mobile */}
              <div className="hidden lg:flex justify-center lg:justify-start">
                <div className="w-20 h-20 bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-lg flex items-center justify-center backdrop-blur-sm border border-white/20 hover:scale-110 transition-all duration-500">
                  {role === 'student' ? (
                    <div className="text-4xl animate-bounce">🌟</div>
                  ) : (
                    <div className="text-4xl">📚</div>
                  )}
                </div>
              </div>

              {/* Role-based Messaging */}
              <div className="space-y-3 sm:space-y-4">
                <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black text-gray-900 font-heading leading-tight">
                  {role === 'student' ? (
                    <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                      {formMode === 'signin' ? 'Welcome Back, Reader! ✨' : 'Join the Reading Adventure! 🌟'}
                    </span>
                  ) : (
                    <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {formMode === 'signin' ? 'Welcome Back' : 'Welcome to PrimaryReading'}
                    </span>
                  )}
                </h2>

                <p className="text-base sm:text-lg lg:text-xl text-text-secondary font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
                  {role === 'student'
                    ? formMode === 'signin'
                      ? 'Ready for your next amazing reading adventure? Your stories are waiting!'
                      : 'Start your magical reading journey and discover amazing stories just for you!'
                    : formMode === 'signin'
                      ? 'Sign in to access your dashboard and manage young learners'
                      : 'Create your account to access the magical world of reading adventures and manage young learners'}
                </p>

                {/* Role-based Encouragement Badge */}
                {role === 'student' && (
                  <div className="flex justify-center lg:justify-start">
                    <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200/50 shadow-sm">
                      <span className="text-sm font-semibold text-purple-800">🎯 Keep Reading, Keep Growing!</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Feature Preview - Hidden on mobile and optimized for height */}
              <div className="hidden lg:block xl:block">
                {role === 'student' ? (
                  <div className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-2xl p-4 lg:p-6 shadow-sm">
                    <p className="text-sm text-gray-700 font-semibold mb-2 lg:mb-3">
                      🎮 After you sign in, you&apos;ll be able to:
                    </p>
                    <div className="text-sm text-text-secondary space-y-1 lg:space-y-2">
                      <div className="flex items-center gap-3">
                        <span>📖 Read personalized stories</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span>🏆 Earn reading badges</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span>🎯 Play comprehension games</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span>⭐ Track your progress</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-2xl p-4 lg:p-6 shadow-sm">
                    <p className="text-sm text-gray-700 font-semibold mb-2 lg:mb-3">
                      👨‍👩‍👧‍👦 Parent/Teacher Dashboard includes:
                    </p>
                    <div className="text-sm text-text-secondary space-y-1 lg:space-y-2">
                      <div className="flex items-center gap-3">
                        <span>📊 Progress tracking</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span>⚙️ Reading level controls</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span>👶 Child profile management</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span>📈 Learning analytics</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Login Form */}
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <SimpleLoginForm onModeChange={setFormMode} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[calc(100vh-70px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}