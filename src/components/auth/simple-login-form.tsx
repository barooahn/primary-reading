'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Mail, Lock, Sparkles, UserCheck, BookOpen } from 'lucide-react';

interface SimpleLoginFormProps {
  onModeChange?: (mode: 'signin' | 'signup') => void;
}

export function SimpleLoginForm({ onModeChange }: SimpleLoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signup'); // Default to signup
  const [showPassword, setShowPassword] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const supabase = createClient();

  // Notify parent of initial mode
  useEffect(() => {
    onModeChange?.(mode);
  }, [mode, onModeChange]);

  // Validation helpers
  const isEmailValid = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isPasswordValid = (password: string) => {
    return password.length >= 6;
  };

  const showEmailError = emailTouched && email && !isEmailValid(email);
  const showPasswordError = passwordTouched && password && !isPasswordValid(password);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });
        
        if (error) {
          setError(error.message);
        } else if (data.user && !data.user.email_confirmed_at) {
          setMessage('Please check your email for the confirmation link!');
        } else {
          setMessage('Account created successfully!');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setError(error.message);
        } else {
          setMessage('Signed in successfully!');
          window.location.href = '/dashboard';
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-xl border-2 border-gray-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-all duration-500 hover:scale-[1.02]">
      <CardHeader className="text-center space-y-4 pb-6">
        {/* Brand Icon */}
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center shadow-lg">
          <BookOpen className="h-8 w-8 text-primary" />
        </div>

        <CardTitle className="text-xl font-bold text-gray-800">
          {mode === 'signin' ? 'Sign In' : 'Create Account'}
        </CardTitle>

        <CardDescription className="text-sm text-gray-600">
          {mode === 'signin'
            ? 'Ready to continue your reading adventure?'
            : 'Create your account to start your magical reading journey'
          }
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleAuth} className="space-y-6" noValidate role="form" aria-label={mode === 'signin' ? 'Sign in to your account' : 'Create a new account'}>
          {/* Email Field */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-semibold text-gray-700 flex items-center gap-2"
            >
              <Mail className="h-4 w-4 text-primary" />
              Email Address
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEmailTouched(true)}
                required
                aria-describedby={showEmailError ? "email-error" : undefined}
                aria-invalid={showEmailError ? "true" : "false"}
                className={`h-12 pl-4 pr-4 text-base rounded-xl border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white/90 focus:bg-white placeholder:text-gray-400 focus:ring-0 ${
                  showEmailError
                    ? 'border-red-300 focus:border-red-400'
                    : 'border-gray-200 focus:border-primary'
                }`}
              />
              {showEmailError && (
                <p id="email-error" className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <span>❌</span>
                  Please enter a valid email address
                </p>
              )}
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-semibold text-gray-700 flex items-center gap-2"
            >
              <Lock className="h-4 w-4 text-primary" />
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setPasswordTouched(true)}
                required
                minLength={6}
                aria-describedby={showPasswordError ? "password-error" : undefined}
                aria-invalid={showPasswordError ? "true" : "false"}
                className={`h-12 pl-4 pr-12 text-base rounded-xl border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white/90 focus:bg-white placeholder:text-gray-400 focus:ring-0 ${
                  showPasswordError
                    ? 'border-red-300 focus:border-red-400'
                    : 'border-gray-200 focus:border-primary'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={0}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {mode === 'signup' && !showPasswordError && (
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <span className="text-primary">💡</span>
                Password should be at least 6 characters long
              </p>
            )}
            {showPasswordError && (
              <p id="password-error" className="text-red-600 text-xs mt-1 flex items-center gap-1">
                <span>❌</span>
                Password must be at least 6 characters long
              </p>
            )}
          </div>

          {/* Enhanced Error Messages */}
          {error && (
            <div className="relative bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="text-red-500 text-lg">😔</div>
                <div className="flex-1">
                  <h4 className="text-red-800 font-semibold text-sm mb-1">Oops! Something went wrong</h4>
                  <p className="text-red-700 text-sm">{error}</p>
                  {error.includes('Invalid login credentials') && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-800 text-xs font-medium flex items-center gap-2">
                        <span className="text-base">💡</span>
                        Don&apos;t have an account yet? Click &quot;Create your account&quot; below to get started!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Success Messages */}
          {message && (
            <div className="relative bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="text-green-600 text-lg">🎉</div>
                <div className="flex-1">
                  <h4 className="text-green-800 font-semibold text-sm mb-1">Great news!</h4>
                  <p className="text-green-700 text-sm">{message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {mode === 'signin' ? (
                  <>
                    <UserCheck className="h-5 w-5" />
                    <span>Sign In</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    <span>Create Account</span>
                  </>
                )}
              </div>
            )}
          </Button>

          {/* Enhanced Mode Toggle */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">
              {mode === 'signin'
                ? "New to PrimaryReading?"
                : "Already part of our reading family?"
              }
            </p>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                const newMode = mode === 'signin' ? 'signup' : 'signin';
                setMode(newMode);
                onModeChange?.(newMode);
              }}
              className="text-primary hover:text-primary/80 font-semibold hover:bg-primary/5 rounded-xl px-6 py-2 transition-all duration-300 hover:scale-105"
            >
              {mode === 'signin'
                ? "Create your account →"
                : "Sign in to your account →"
              }
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}