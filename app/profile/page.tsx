'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Profile = { id: string; username: string; biography: string };

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editing, setEditing] = useState(false);
  const [biography, setBiography] = useState('');
  const [saving, setSaving] = useState(false);

  const [creating, setCreating] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newBiography, setNewBiography] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('access_token');
    setToken(stored);
    if (!stored) { setLoading(false); return; }
    fetchProfile(stored);
  }, []);

  async function fetchProfile(accessToken: string) {
    setLoading(true);
    const res = await fetch('/api/profile', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || 'Failed to load profile.'); return; }
    setProfile(data.profile);
    if (data.profile) setBiography(data.profile.biography);
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!token) return;
    setCreating(true);
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ username: newUsername, biography: newBiography }),
    });
    const data = await res.json();
    setCreating(false);
    if (res.ok) { setProfile(data.profile); setBiography(data.profile.biography); }
    else setError(data.error || 'Failed to create profile.');
  }

  async function handleSave() {
    if (!token) return;
    setSaving(true);
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ biography }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) { setProfile(data.profile); setEditing(false); }
    else setError(data.error || 'Failed to save.');
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-slate-400">Loading…</p>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6">
        <section className="text-center space-y-4">
          <p className="text-slate-300">You must be logged in to view your profile.</p>
          <Link href="/login" className="inline-block rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm hover:border-emerald-400 hover:text-emerald-200">
            Go to login
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6 py-12">
      <section className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-black/30">
        <p className="text-sm uppercase tracking-[0.25em] text-emerald-300">Profile</p>

        {error ? (
          <p className="mt-4 rounded-xl border border-red-800 bg-red-900/30 p-3 text-sm text-red-300">{error}</p>
        ) : null}

        {profile === null ? (
          <>
            <h1 className="mt-4 text-3xl font-semibold">Create your profile</h1>
            <form onSubmit={handleCreate} className="mt-6 space-y-4">
              <label className="block text-sm text-slate-200">
                Username
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400"
                  placeholder="your_username"
                />
              </label>
              <label className="block text-sm text-slate-200">
                Biography
                <textarea
                  value={newBiography}
                  onChange={(e) => setNewBiography(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400"
                  placeholder="Tell us about yourself…"
                />
              </label>
              <button
                type="submit"
                disabled={creating}
                className="w-full rounded-xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-70"
              >
                {creating ? 'Creating…' : 'Create profile'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="mt-4 text-3xl font-semibold">{profile.username}</h1>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-widest text-slate-400">Biography</p>
              {editing ? (
                <div className="mt-2 space-y-3">
                  <textarea
                    value={biography}
                    onChange={(e) => setBiography(e.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300 disabled:opacity-70"
                    >
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      onClick={() => { setEditing(false); setBiography(profile.biography); }}
                      className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm hover:border-slate-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-2">
                  <p className="text-slate-300">{profile.biography || 'No biography yet.'}</p>
                  <button
                    onClick={() => setEditing(true)}
                    className="mt-3 rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm hover:border-emerald-400 hover:text-emerald-200"
                  >
                    Edit biography
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        <p className="mt-8 text-sm text-slate-300">
          Back to <Link href="/" className="text-emerald-300 hover:underline">home</Link>
        </p>
      </section>
    </main>
  );
}
