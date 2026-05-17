import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/store';
import { addCity, MAX_CITIES } from '@/store/citiesSlice';
import { lookupZip } from '@/api/weather';
import type { SavedCity } from '@/types/weather';



/**
 * Split user input on commas, spaces, semicolons, or newlines.
 * Trims whitespace and drops empty tokens.
 */
const parseZips = (raw: string): string[] => {
  return raw
    .split(/[\s,;]+/)
    .map((z) => z.trim())
    .filter(Boolean);
};

interface LookupOutcome {
  zip: string;
  status: 'added' | 'duplicate' | 'failed';
  message?: string;
  city?: SavedCity;
}

export const SearchBar = () => {
  const [input, setInput] = useState('');
  const [country] = useState('US');
  const [busy, setBusy] = useState(false);
  const dispatch = useAppDispatch();
  const cities = useAppSelector((s) => s.cities.cities);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const zips = parseZips(input);
    if (zips.length === 0) return;

    // Dedup user's own input — "94103, 94103" shouldn't double-count
    const uniqueZips = Array.from(new Set(zips));

    const freeSlots = MAX_CITIES - cities.length;
    if (freeSlots <= 0) {
      toast.error(`Dashboard full — ${MAX_CITIES}/${MAX_CITIES} cities. Remove one to add more.`);
      return;
    }

    // If the user pasted more than will fit, warn but still process the first N
    if (uniqueZips.length > freeSlots) {
      toast(
        `Only ${freeSlots} slot${freeSlots === 1 ? '' : 's'} left — processing the first ${freeSlots}.`,
        { icon: '⚠️' }
      );
    }

    const toProcess = uniqueZips.slice(0, freeSlots);
    setBusy(true);

    // Track which ids are already on the dashboard OR queued in this submission,
    // so two different zips resolving to the same city don't both add.
    const queuedIds = new Set<string>(cities.map((c) => c.id));

    // Fire all lookups in parallel
    const settled = await Promise.allSettled(
      toProcess.map((zip) => lookupZip(zip, country))
    );

    const outcomes: LookupOutcome[] = settled.map((res, i) => {
      const zip = toProcess[i];
      if (res.status === 'rejected') {
        return {
          zip,
          status: 'failed',
          message: (res.reason as Error)?.message ?? 'Lookup failed',
        };
      }
      const result = res.value;
      const id = `zip-${result.country}-${result.zip}`;
      if (queuedIds.has(id)) {
        return { zip, status: 'duplicate', message: result.name };
      }
      queuedIds.add(id);
      const city: SavedCity = {
        id,
        zip: result.zip,
        country: result.country,
        lat: result.lat,
        lon: result.lon,
        displayName: result.name,
        addedAt: Date.now(),
      };
      return { zip, status: 'added', city };
    });

    // Dispatch successful adds. The reducer also enforces the cap.
    outcomes.forEach((o) => {
      if (o.status === 'added' && o.city) dispatch(addCity(o.city));
    });

    setBusy(false);

    // Summarize results
    const added = outcomes.filter((o) => o.status === 'added');
    const duplicates = outcomes.filter((o) => o.status === 'duplicate');
    const failed = outcomes.filter((o) => o.status === 'failed');

    if (added.length > 0) {
      const names = added.map((o) => o.city!.displayName).join(', ');
      toast.success(
        added.length === 1
          ? `Added ${names}`
          : `Added ${added.length} cities: ${names}`
      );
    }
    duplicates.forEach((o) => {
      toast(`${o.message ?? o.zip} is already on your dashboard.`, { icon: '↩️' });
    });
    failed.forEach((o) => {
      toast.error(`${o.zip}: ${o.message ?? 'failed'}`);
    });

    // Clear input only if at least one succeeded; otherwise let user fix it
    if (added.length > 0) setInput('');
  };

  const parsedCount = parseZips(input).length;
  const remaining = MAX_CITIES - cities.length;

  return (
    <motion.form
      onSubmit={onSubmit}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="glass flex w-full max-w-2xl items-center gap-2 rounded-full px-2 py-2 pl-5"
    >
      <Search className="h-4 w-4 shrink-0 text-white/60" strokeWidth={2.5} />
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={
          remaining === 0
            ? 'Dashboard full — remove a city to add more'
            : `Add up to ${remaining} ZIP${remaining === 1 ? '' : 's'} — separate with commas`
        }
        className="flex-1 bg-transparent text-sm tracking-wide text-white placeholder:text-white/40 focus:outline-none"
        aria-label="ZIP or postal codes (comma or space separated)"
        autoComplete="off"
      />

      {/* Live count badge when user types multiple zips */}
      {parsedCount > 1 && (
        <span
          className={`hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] sm:inline-block ${
            parsedCount > remaining
              ? 'bg-amber-400/20 text-amber-200'
              : 'bg-white/10 text-white/70'
          }`}
          aria-live="polite"
          title={
            parsedCount > remaining
              ? `Only ${remaining} of ${parsedCount} will be added`
              : `${parsedCount} zips ready`
          }
        >
          {Math.min(parsedCount, remaining)} / {parsedCount}
        </span>
      )}

      <button
        type="submit"
        disabled={busy || !input.trim() || remaining === 0}
        className="flex h-9 items-center gap-2 rounded-full bg-white px-5 text-xs font-semibold uppercase tracking-[0.15em] text-slate-900 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
        {busy
          ? 'Adding'
          : parsedCount > 1
          ? `Add ${Math.min(parsedCount, remaining)}`
          : 'Add'}
      </button>
    </motion.form>
  );
};
