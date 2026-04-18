'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  MapPin, Loader2, CheckCircle2, AlertCircle,
  Camera, X, Brain, Navigation, Home,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getCategoryLabel, getScoreColor } from '@/lib/utils';
import type { AIAnalysisResult } from '@/types';

const schema = z.object({
  description: z.string().min(10, 'Please provide at least 10 characters').max(1000),
  address: z.string().optional(),
  neighborhood: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

type Step = 'location' | 'describe' | 'analyzing' | 'preview' | 'submitting' | 'done';

export function ReportForm() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('location');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Manual address entry
  const [manualStreet, setManualStreet] = useState('');
  const [manualCity, setManualCity] = useState('');
  const [manualZip, setManualZip] = useState('');
  const [suggestions, setSuggestions] = useState<{ display_name: string; lat: string; lon: string }[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const [manualError, setManualError] = useState<string | null>(null);
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const description = watch('description') ?? '';

  // ─── Geolocation ──────────────────────────────────────────────────────────
  const detectLocation = useCallback(() => {
    setLocationLoading(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported by your browser.');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationLoading(false);
        setStep('describe');
      },
      () => {
        setLocationError('Could not detect location. Using Worcester city center.');
        setLocation({ lat: 42.2626, lng: -71.8023 });
        setLocationLoading(false);
        setStep('describe');
      },
      { timeout: 10000 }
    );
  }, []);

  // ─── Address autocomplete (Nominatim) ────────────────────────────────────────
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 3) { setSuggestions([]); return; }
    setSuggestLoading(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      const data = await res.json();
      setSuggestions(data ?? []);
    } catch {
      setSuggestions([]);
    } finally {
      setSuggestLoading(false);
    }
  }, []);

  const handleStreetChange = (val: string) => {
    setManualStreet(val);
    setResolvedAddress(null);
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    suggestTimer.current = setTimeout(() => {
      const query = [val, manualCity, manualZip].filter(Boolean).join(', ');
      fetchSuggestions(query);
    }, 400);
  };

  const pickSuggestion = (s: { display_name: string; lat: string; lon: string }) => {
    setLocation({ lat: parseFloat(s.lat), lng: parseFloat(s.lon) });
    setResolvedAddress(s.display_name);
    setManualStreet(s.display_name.split(',')[0] ?? s.display_name);
    setSuggestions([]);
  };

  const geocodeManual = async () => {
    setManualError(null);
    if (!manualStreet.trim()) { setManualError('Street address is required.'); return; }
    setSuggestLoading(true);
    try {
      const query = [manualStreet, manualCity, manualZip].filter(Boolean).join(', ');
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      const data = await res.json();
      if (data?.[0]) {
        setLocation({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
        setResolvedAddress(data[0].display_name);
        setSuggestions([]);
        setStep('describe');
      } else {
        setManualError('Address not found. Please check the spelling or try a nearby landmark.');
      }
    } catch {
      setManualError('Could not look up address. Check your connection and try again.');
    } finally {
      setSuggestLoading(false);
    }
  };

  // ─── Image compression (canvas resize to max 1024px, JPEG 80%) ──────────────
  const compressImage = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const MAX = 1024;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.80));
      };
      img.onerror = reject;
      img.src = objectUrl;
    });

  // ─── Image upload ──────────────────────────────────────────────────────────
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageUrl(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  // ─── Analyze with AI ──────────────────────────────────────────────────────
  const analyzeWithAI = async (data: FormData) => {
    if (!imageFile) {
      setError('A photo is required. Please upload a photo of the issue so AI can verify it.');
      return;
    }
    setStep('analyzing');
    setError(null);

    try {
      // Compress image client-side first so the base64 stays well under JSON body limits
      const compressedDataUrl = await compressImage(imageFile);
      setImageUrl(compressedDataUrl);

      // AI analysis preview — send compressed base64 directly, no upload needed
      const analyzeRes = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: data.description, image_url: compressedDataUrl }),
      });
      const analyzeData = await analyzeRes.json();
      if (analyzeData.data) {
        setAiResult(analyzeData.data);
        setStep('preview');
      } else {
        throw new Error(analyzeData.error ?? 'AI analysis failed');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to analyze report.';
      setError(`Analysis error: ${msg}`);
      setStep('describe');
    }
  };

  // ─── Final submission ──────────────────────────────────────────────────────
  const submitReport = async (data: FormData) => {
    setSubmitting(true);
    setStep('submitting');

    // Get or generate anonymous user ID
    let userId = localStorage.getItem('cityfix_user_id');
    if (!userId) {
      userId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem('cityfix_user_id', userId);
    }

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: data.description,
          address: data.address,
          neighborhood: data.neighborhood,
          latitude: location!.lat,
          longitude: location!.lng,
          image_url: imageUrl,
          user_id: userId,
          ai_result: aiResult,  // pass pre-computed result — skip second OpenAI call
        }),
      });

      const json = await res.json();
      if (json.error) throw new Error(json.error);

      setStep('done');
      setTimeout(() => router.push(`/report/success?uid=${userId}`), 1500);
    } catch (err) {
      setError('Submission failed. Please try again.');
      setStep('preview');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Step: Location ────────────────────────────────────────────────────────
  if (step === 'location') {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <MapPin className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold">Share Your Location</h2>
          <p className="text-gray-500 text-sm">
            We need the issue location to report it accurately to city officials.
          </p>
        </div>

        {locationError && (
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{locationError}</AlertDescription>
          </Alert>
        )}

        {/* Option 1: GPS */}
        <Button
          onClick={detectLocation}
          disabled={locationLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base gap-2"
        >
          {locationLoading ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> Detecting location…</>
          ) : (
            <><Navigation className="h-5 w-5" /> Use My Current Location</>
          )}
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or enter address manually</span>
          </div>
        </div>

        {/* Option 2: Manual address */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Home className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Enter the issue address</span>
          </div>

          {/* Street address with autocomplete */}
          <div className="relative">
            <Input
              placeholder="Street address (e.g. 123 Main St)"
              value={manualStreet}
              onChange={e => handleStreetChange(e.target.value)}
              onBlur={() => setTimeout(() => setSuggestions([]), 200)}
              className="pr-8"
            />
            {suggestLoading && (
              <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-gray-400" />
            )}
            {suggestions.length > 0 && (
              <ul className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
                {suggestions.map((s, i) => (
                  <li
                    key={i}
                    onMouseDown={() => pickSuggestion(s)}
                    className="flex items-start gap-2 px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0"
                  >
                    <MapPin className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
                    <span className="text-gray-700 leading-snug">{s.display_name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* City + Zip row */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="City (e.g. Worcester)"
              value={manualCity}
              onChange={e => setManualCity(e.target.value)}
            />
            <Input
              placeholder="ZIP code (e.g. 01601)"
              value={manualZip}
              onChange={e => setManualZip(e.target.value)}
            />
          </div>

          {resolvedAddress && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-800">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
              <span className="truncate">{resolvedAddress}</span>
            </div>
          )}

          {manualError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{manualError}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={geocodeManual}
            disabled={suggestLoading || !manualStreet.trim()}
            variant="outline"
            className="w-full h-11 gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            {suggestLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Looking up address…</>
            ) : (
              <><MapPin className="h-4 w-4" /> Use This Address</>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // ─── Step: Describe ────────────────────────────────────────────────────────
  if (step === 'describe') {
    return (
      <form onSubmit={handleSubmit(analyzeWithAI)} className="space-y-6">
        {location && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
            <span>
              Location captured:{' '}
              <strong>{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</strong>
            </span>
          </div>
        )}

        {/* Image upload */}
        <div className="space-y-2">
          <Label>
            Photo <span className="text-red-500">*</span>
            <span className="ml-1 text-xs text-gray-400 font-normal">(required — AI uses it to verify the issue)</span>
          </Label>
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow border hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full h-36 rounded-lg border-2 border-dashed border-red-300 hover:border-blue-400 hover:bg-blue-50 bg-red-50/30 transition-colors flex flex-col items-center justify-center gap-2 text-gray-500"
            >
              <Camera className="h-8 w-8 text-red-400" />
              <span className="text-sm font-medium">Upload a photo of the issue</span>
              <span className="text-xs text-gray-400">JPEG, PNG, WebP — max 10MB</span>
              <span className="text-xs text-red-500 font-medium">Required to submit</span>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">
            Describe the issue <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="e.g., Large pothole on the corner of Main St and 2nd Ave. It's been there for a week and cars keep swerving around it."
            className="min-h-[100px]"
          />
          <div className="flex justify-between text-xs text-gray-400">
            {errors.description ? (
              <span className="text-red-500">{errors.description.message}</span>
            ) : (
              <span>Be specific — it helps AI generate better analysis</span>
            )}
            <span>{description.length}/1000</span>
          </div>
        </div>

        {/* Optional fields */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="address" className="text-xs">Street Address (optional)</Label>
            <Input id="address" {...register('address')} placeholder="" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="neighborhood" className="text-xs">Neighborhood (optional)</Label>
            <Input id="neighborhood" {...register('neighborhood')} placeholder="" />
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base gap-2"
        >
          <Brain className="h-5 w-5" />
          Analyze with AI
        </Button>
      </form>
    );
  }

  // ─── Step: Analyzing ───────────────────────────────────────────────────────
  if (step === 'analyzing') {
    return (
      <div className="space-y-6 text-center py-8">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 animate-pulse">
          <Brain className="h-10 w-10 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold mb-2">AI is analyzing your report…</h2>
          <p className="text-gray-500 text-sm">Classifying issue, computing priority scores, checking for duplicates</p>
        </div>
        <div className="space-y-2 max-w-xs mx-auto">
          {['Classifying issue type…', 'Computing urgency score…', 'Checking for duplicates…'].map((msg, i) => (
            <div key={msg} className="flex items-center gap-2 text-sm text-gray-600">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500 shrink-0" style={{ animationDelay: `${i * 0.2}s` }} />
              {msg}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Step: Preview AI Result ───────────────────────────────────────────────
  if (step === 'preview' && aiResult) {
    return (
      <form onSubmit={handleSubmit(submitReport)} className="space-y-6">
        <div className="flex items-center justify-between rounded-lg bg-blue-50 border border-blue-200 px-3 py-2">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-blue-600 shrink-0" />
            <p className="text-sm text-blue-800 font-medium">AI Analysis Complete</p>
          </div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            aiResult.confidence >= 85 ? 'bg-green-100 text-green-700' :
            aiResult.confidence >= 60 ? 'bg-blue-100 text-blue-700' :
            aiResult.confidence >= 30 ? 'bg-amber-100 text-amber-700' :
            'bg-red-100 text-red-700'
          }`}>
            Visual confidence: {aiResult.confidence}/100
          </span>
        </div>

        {aiResult.mismatch_detected && (
          <div className="flex items-start gap-2 rounded-lg bg-yellow-50 border border-yellow-300 px-3 py-3">
            <AlertCircle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-yellow-800">Photo mismatch detected</p>
              <p className="text-xs text-yellow-700 mt-0.5">
                {aiResult.mismatch_note ?? 'The photo shows a different issue than described. Category updated based on visual evidence.'}
              </p>
            </div>
          </div>
        )}

        <Card className="border-blue-100">
          <CardContent className="pt-4 space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">AI-Generated Title</p>
              <p className="font-semibold text-gray-900">{aiResult.title}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge className="bg-blue-100 text-blue-800">
                {getCategoryLabel(aiResult.category)}
              </Badge>
              <Badge variant={aiResult.severity === 'critical' ? 'critical' : aiResult.severity === 'high' ? 'high' : aiResult.severity === 'medium' ? 'medium' : 'low'}>
                {aiResult.severity} severity
              </Badge>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">AI Summary</p>
              <p className="text-sm text-gray-700">{aiResult.summary}</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Urgency', score: aiResult.urgency_score },
                { label: 'Impact', score: aiResult.impact_score },
                { label: 'Priority', score: aiResult.priority_score },
              ].map(({ label, score }) => (
                <div key={label} className="text-center rounded-lg bg-gray-50 p-2">
                  <div className={`text-2xl font-bold tabular-nums ${getScoreColor(score)}`}>
                    {score}
                  </div>
                  <div className="text-xs text-gray-500">{label}</div>
                  <Progress
                    value={score}
                    className="h-1 mt-1"
                  />
                </div>
              ))}
            </div>

            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
              <p className="text-xs text-amber-800">
                <strong>Reasoning:</strong> {aiResult.reasoning}
              </p>
            </div>

            <div className="rounded-lg bg-green-50 border border-green-200 p-3">
              <p className="text-xs text-green-800">
                <strong>Recommended Action:</strong> {aiResult.recommended_action}
              </p>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => setStep('describe')}
          >
            Edit Report
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            {submitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
            ) : (
              <>Submit Report</>
            )}
          </Button>
        </div>
      </form>
    );
  }

  // ─── Step: Done ────────────────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <div className="text-center py-10 space-y-4">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-green-800">Report Submitted!</h2>
        <p className="text-gray-500 text-sm">Redirecting you to confirmation…</p>
        <Loader2 className="mx-auto h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }

  // Step: Submitting
  return (
    <div className="text-center py-10 space-y-4">
      <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-600" />
      <p className="text-gray-600">Submitting your report…</p>
    </div>
  );
}
