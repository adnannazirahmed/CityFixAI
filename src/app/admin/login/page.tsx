'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { MapPin, Lock, Loader2, Eye, EyeOff, LayoutDashboard } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { IS_DEMO, DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '@/lib/demo/config';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

type LoginData = z.infer<typeof schema>;

/** Only allow same-origin relative paths as redirect targets (no open redirects). */
function safeNext(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return '/admin';
  if (next === '/admin/login' || next.startsWith('/admin/login?')) return '/admin';
  return next;
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLogin />
    </Suspense>
  );
}

function AdminLogin() {
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get('next'));
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: IS_DEMO ? DEMO_ADMIN_EMAIL : '',
      password: '',
    },
  });

  async function login(data: LoginData): Promise<boolean> {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok || json.error) {
        toast.error(json.error ?? 'Login failed. Check your credentials.');
        return false;
      }

      toast.success('Welcome back, Admin!');
      // Full navigation so middleware sees the new session cookie.
      window.location.assign(next);
      return true;
    } catch {
      toast.error('Network error. Please try again.');
      return false;
    }
  }

  async function onSubmit(data: LoginData) {
    setLoading(true);
    if (!(await login(data))) setLoading(false);
  }

  async function enterDemo() {
    setDemoLoading(true);
    if (!(await login({ email: DEMO_ADMIN_EMAIL, password: DEMO_ADMIN_PASSWORD }))) setDemoLoading(false);
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-950 to-blue-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-900/50">
            <MapPin className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">CityFix <span className="text-blue-400">AI</span></h1>
          <p className="text-gray-400 text-sm">Admin Console</p>
        </div>

        {IS_DEMO && (
          <Card className="border-blue-500/40 bg-blue-950/60 text-white shadow-xl">
            <CardContent className="space-y-3 p-5">
              <Button
                type="button"
                onClick={enterDemo}
                disabled={demoLoading || loading}
                className="w-full bg-blue-500 hover:bg-blue-400 text-white h-12 gap-2 text-base font-semibold"
              >
                {demoLoading ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Opening dashboard…</>
                ) : (
                  <><LayoutDashboard className="h-5 w-5" /> Enter demo dashboard</>
                )}
              </Button>
              <p className="text-xs text-blue-200/80 text-center">
                One click, no password needed. This is a portfolio demo with sample data.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Login card */}
        <Card className="border-gray-800 bg-gray-900 text-white shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg text-white">
              <Lock className="h-5 w-5 text-blue-400" />
              Sign In
            </CardTitle>
            <CardDescription className="text-gray-400">
              Access the city administration dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-blue-500"
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-xs text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    {...register('password')}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 pr-10 focus-visible:ring-blue-500"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-400">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading || demoLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white h-11 gap-2"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</>
                ) : (
                  'Sign In to Admin Dashboard'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo hint */}
        {IS_DEMO && (
        <Card className="border-gray-800 bg-gray-900/50">
          <CardContent className="py-3 px-4">
            <p className="text-xs text-gray-400 text-center">
              Demo credentials: <strong className="text-gray-200">{DEMO_ADMIN_EMAIL}</strong> /{' '}
              <strong className="text-gray-200">{DEMO_ADMIN_PASSWORD}</strong>
            </p>
          </CardContent>
        </Card>
        )}
      </div>
    </div>
  );
}
