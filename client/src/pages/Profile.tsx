// client/src/pages/Profile.tsx
//
// User profile page. Gated: redirects to /login if not authenticated.
// Shows account info, an avatar, an edit form (display name + avatar), and
// a Logout button.

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import type { EventDTO } from "../../../shared/types";
import { useAuth } from "@/auth/AuthContext";
import { useFavorites } from "@/auth/FavoritesContext";
import { downloadICS, eventsToICS } from "@/lib/calendar";
import { Button } from "@/components/ui/button";
import EventCard from "@/components/EventCard";
import EventDialog from "@/components/EventDialog";

export default function Profile() {
  const { user, loading, logout, updateProfile, changePassword } = useAuth();
  const favorites = useFavorites();
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<EventDTO | null>(null);

  // Edit-form state. Initialized from the user once it's available.
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password-change form state.
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSubmitting, setPwSubmitting] = useState(false);
  const [pwMessage, setPwMessage] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);

  // Seed the name field once the user loads.
  useEffect(() => {
    if (user) setName(user.displayName);
  }, [user]);

  // Local preview for a freshly-picked avatar; revoke the blob URL on change.
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function handleLogout() {
    navigate("/", { replace: true });
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);
    try {
      await updateProfile({ displayName: name }, file, removeAvatar);
      setFile(null);
      setRemoveAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setMessage("Profil gespeichert.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen");
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePasswordChange(e: FormEvent) {
    e.preventDefault();
    setPwError(null);
    setPwMessage(null);
    if (newPassword.length < 8) {
      setPwError("Neues Passwort muss mindestens 8 Zeichen haben.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Die neuen Passwörter stimmen nicht überein.");
      return;
    }
    setPwSubmitting(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPwMessage("Passwort geändert.");
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Fehlgeschlagen");
    } finally {
      setPwSubmitting(false);
    }
  }

  if (loading) {
    return (
      <section className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-gray-500">Lädt…</p>
      </section>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Which image to show: new pick → current avatar (unless removing) → icon.
  const avatarSrc =
    previewUrl ?? (removeAvatar ? null : user.avatarUrl) ?? "/profile-icon.png";

  return (
    <section className="max-w-3xl mx-auto px-6 py-16">
      <div className="flex items-center gap-4 mb-8">
        <img
          src={avatarSrc}
          alt="Profilbild"
          className="h-20 w-20 rounded-full object-cover border border-gray-200"
        />
        <h1 className="text-3xl font-bold">Mein Profil</h1>
      </div>

      {/* Account info — read-only. */}
      <dl className="grid grid-cols-[8rem_1fr] gap-y-3 text-sm">
        <dt className="font-semibold text-gray-700">Email</dt>
        <dd>{user.email}</dd>

        <dt className="font-semibold text-gray-700">Rolle</dt>
        <dd>
          <span
            className={
              user.role === "EDITOR"
                ? "inline-block px-2 py-0.5 rounded bg-asta-red text-white text-xs font-semibold"
                : "inline-block px-2 py-0.5 rounded bg-gray-200 text-gray-700 text-xs font-semibold"
            }
          >
            {user.role}
          </span>
        </dd>

        <dt className="font-semibold text-gray-700">Mitglied seit</dt>
        <dd>{new Date(user.createdAt).toLocaleDateString("de-DE")}</dd>
      </dl>

      {/* Edit form: display name + avatar. */}
      <form onSubmit={handleSave} className="mt-12 border-t pt-8 space-y-4">
        <h2 className="text-xl font-semibold">Profil bearbeiten</h2>

        <div>
          <label htmlFor="displayName" className="block text-sm font-semibold mb-1">
            Anzeigename
          </label>
          <input
            id="displayName"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full max-w-sm border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="avatar" className="block text-sm font-semibold mb-1">
            Profilbild{" "}
            <span className="text-gray-500 font-normal">
              (optional, wird quadratisch zugeschnitten)
            </span>
          </label>
          <input
            id="avatar"
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              if (e.target.files?.[0]) setRemoveAvatar(false);
            }}
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gray-100 file:cursor-pointer hover:file:bg-gray-200"
          />
          {user.avatarUrl && !file && (
            <label className="flex items-center gap-2 mt-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={removeAvatar}
                onChange={(e) => setRemoveAvatar(e.target.checked)}
              />
              Profilbild entfernen
            </label>
          )}
        </div>

        {error && (
          <p className="text-red-600 text-sm" role="alert">
            Fehler: {error}
          </p>
        )}
        {message && <p className="text-green-700 text-sm">{message}</p>}

        <Button type="submit" disabled={submitting} className="cursor-pointer">
          {submitting ? "Speichert…" : "Speichern"}
        </Button>
      </form>

      {/* Change password. */}
      <form
        onSubmit={handlePasswordChange}
        className="mt-12 border-t pt-8 space-y-4 max-w-sm"
      >
        <h2 className="text-xl font-semibold">Passwort ändern</h2>

        <div>
          <label
            htmlFor="currentPassword"
            className="block text-sm font-semibold mb-1"
          >
            Aktuelles Passwort
          </label>
          <input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="newPassword"
            className="block text-sm font-semibold mb-1"
          >
            Neues Passwort{" "}
            <span className="text-gray-500 font-normal">(min. 8 Zeichen)</span>
          </label>
          <input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-semibold mb-1"
          >
            Neues Passwort bestätigen
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        {pwError && (
          <p className="text-red-600 text-sm" role="alert">
            Fehler: {pwError}
          </p>
        )}
        {pwMessage && <p className="text-green-700 text-sm">{pwMessage}</p>}

        <Button type="submit" disabled={pwSubmitting} className="cursor-pointer">
          {pwSubmitting ? "Speichert…" : "Passwort ändern"}
        </Button>
      </form>

      {/* Favorited events ("Merkliste"). */}
      <section className="mt-12 border-t pt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Meine Events</h2>
          {favorites.events.length > 0 && (
            <button
              type="button"
              onClick={() =>
                downloadICS("meine-events.ics", eventsToICS(favorites.events))
              }
              className="text-sm font-medium text-asta-red hover:underline cursor-pointer"
            >
              Alle als .ics exportieren
            </button>
          )}
        </div>
        {favorites.events.length === 0 ? (
          <p className="text-gray-500">
            Du hast noch keine Events gemerkt. Tippe auf das Herz bei einem
            Event, um es hier zu speichern.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {favorites.events.map((e) => (
              <EventCard
                key={e.id}
                event={e}
                onClick={setSelectedEvent}
                isFavorite={favorites.isFavorite(e.id)}
                onToggleFavorite={() => favorites.toggle(e.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Logout at the bottom. */}
      <div className="mt-12 border-t pt-8">
        <Button
          onClick={handleLogout}
          variant="brandOutline"
          className="cursor-pointer"
        >
          Logout
        </Button>
      </div>

      <EventDialog
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </section>
  );
}
