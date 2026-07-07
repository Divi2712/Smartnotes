/* ============================================================
   NOTES.TS  –  Save / Load / Delete notes + AI Summary logic
   ============================================================ */

/* ---- Types ---- */
export interface Note {
  id: string;
  text: string;
  date: string;          // human-readable
  timestamp: number;     // for sorting
  summary?: string;      // AI-generated summary (optional)
  type: 'text';
}

/* ---- Storage Key ---- */
const NOTES_KEY = 'ai_notes_all';

/* ---- Helpers ---- */

/** Generate a simple unique ID */
function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/* ---- Public API ---- */

/** Load all notes from localStorage, newest first */
export function getNotes(): Note[] {
  const raw = localStorage.getItem(NOTES_KEY);
  const notes: Note[] = raw ? JSON.parse(raw) : [];
  return notes.sort((a, b) => b.timestamp - a.timestamp);
}

/** Add a new note */
export function addNote(text: string): Note {
  const notes = getNotes();
  const note: Note = {
    id: uid(),
    text: text.trim(),
    date: new Date().toLocaleString(),
    timestamp: Date.now(),
    type: 'text',
  };
  // Store newest first in array
  const updated = [note, ...notes];
  localStorage.setItem(NOTES_KEY, JSON.stringify(updated));
  return note;
}

/** Delete a note by its id */
export function deleteNote(id: string): void {
  const notes = getNotes().filter(n => n.id !== id);
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

/** Update the summary field of a note */
export function saveNoteSummary(id: string, summary: string): void {
  const notes = getNotes();
  const idx = notes.findIndex(n => n.id === id);
  if (idx !== -1) {
    notes[idx].summary = summary;
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  }
}

/** Clear ALL notes (used by History page clear button) */
export function clearAllNotes(): void {
  localStorage.removeItem(NOTES_KEY);
}

/* ---- AI-Style Summarisation ---- */

/**
 * Simulated AI summarisation.
 *
 * This function analyses the provided text and produces a concise
 * bullet-point style summary without calling any real API.
 * Swap the body of this function with a real API call (OpenAI, Gemini, etc.)
 * whenever you have an API key.
 */
export function generateSummary(text: string): string {
  const trimmed = text.trim();

  if (trimmed.length < 20) {
    return 'Please write more content (at least 20 characters) to generate a summary.';
  }

  // Split into sentences
  const sentences = trimmed
    .replace(/([.!?])\s+/g, '$1|')
    .split('|')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  // Pick key sentences (every 2nd one, max 4)
  const keyPoints: string[] = [];
  sentences.forEach((s, i) => {
    if (i % 2 === 0 && keyPoints.length < 4) {
      // Trim to max 120 chars per point
      keyPoints.push(s.length > 120 ? s.slice(0, 117) + '...' : s);
    }
  });

  // Word count
  const wordCount = trimmed.split(/\s+/).length;

  const summary =
    `📋 Summary (${wordCount} words → ${keyPoints.length} key points):\n\n` +
    keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n');

  return summary;
}
