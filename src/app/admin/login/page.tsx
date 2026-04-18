'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

type LoginData = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: 'admin@cityfix.ai',
      password: '',
    },
  });

  async function onSubmit(data: LoginData) {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok || json.error) {
        toast.error(json.error ?? 'Login failed. Check your credentials.');
        return;
      }

      toast.success('Welcome back, Admin!');
      router.push('/admin');
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-blue-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-900/50">
            <MapPin className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">CityFix AI</h1>
          <p className="text-gray-400 text-sm">Admin Console</p>
        </div>

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
                disabled={loading}
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
        <Card className="border-gray-800 bg-gray-900/50">
          <CardContent className="py-3 px-4">
            <p className="text-xs text-gray-400 text-center">
              Demo credentials: <strong className="text-gray-200">admin@cityfix.ai</strong> /{' '}
              <strong className="text-gray-200">cityfix-admin-2024</strong>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
