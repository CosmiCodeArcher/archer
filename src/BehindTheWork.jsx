import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

/**
 * ─────────────────────────────────────────────────────────────────
 * DATA
 * ─────────────────────────────────────────────────────────────────
 * Placeholder set for now — one photo. Add more objects to this
 * array as you get more images; nothing else needs to change.
 *
 * `src` should point at a CAPPED / RESIZED rendition, never the
 * original master file. This matters more than any JS deterrent
 * below: the site should physically never have the full-res file
 * in the DOM. See the note at the bottom of this file for how to
 * swap this array for a live Supabase Storage fetch later, with
 * transformed (resized) URLs.
 * ─────────────────────────────────────────────────────────────────
 */
const moments = [
  {
    id: 1,
    src: "/behind-the-work/01.jpg",
    alt: "A quiet moment, unposed",
    caption: "Some days the work is loud. Some days it isn't.",
    category: "STILLNESS",
  },
  {
    id: 2,
    src: "/behind-the-work/02.jpg",
    alt: "A quiet moment, unposed",
    caption: "Some days the work is loud. Some days it isn't.",
    category: "STILLNESS",
  },
];

// How far the image drifts toward the cursor. Kept intentionally
// small and heavily damped — same "calm" philosophy as the brand
// bubbles, not a spatial-tracking effect that fights for attention.
const PARALLAX_MAX_OFFSET = 10; // px

function useDevtoolsGuess() {
  // Best-effort heuristic only. It compares the outer/inner window
  // delta, which is a common signal for an open devtools panel —
  // but it CAN false-positive (some mobile browsers, split screens,
  // heavy browser zoom) and is trivial to bypass. Treat this as a
  // playful soft deterrent, never as real protection.
  const [suspected, setSuspected] = useState(false);

  useEffect(() => {
    const threshold = 160;
    const check = () => {
      const widthDelta = window.outerWidth - window.innerWidth;
      const heightDelta = window.outerHeight - window.innerHeight;
      setSuspected(widthDelta > threshold || heightDelta > threshold);
    };
    check();
    window.addEventListener("resize", check);
    const interval = setInterval(check, 1500);
    return () => {
      window.removeEventListener("resize", check);
      clearInterval(interval);
    };
  }, []);

  return suspected;
}

function Watermark() {
  // Tiled, low-opacity, diagonal watermark. Pointer-events disabled
  // so it never interferes with the real UI sitting above it.
  const tiles = Array.from({ length: 24 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-20">
      <div className="grid grid-cols-4 gap-16 -rotate-[24deg] scale-125 opacity-[0.07] absolute -inset-24">
        {tiles.map((_, i) => (
          <span
            key={i}
            className="text-white text-sm font-semibold tracking-widest whitespace-nowrap"
          >
            ARCHER
          </span>
        ))}
      </div>
    </div>
  );
}

function GuardedImage({ photo }) {
  const [loaded, setLoaded] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const wrapRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 .. 0.5
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    setOffset({
      x: relX * PARALLAX_MAX_OFFSET,
      y: relY * PARALLAX_MAX_OFFSET,
    });
  }, []);

  const resetOffset = useCallback(() => setOffset({ x: 0, y: 0 }), []);

  return (
    <div
      ref={wrapRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetOffset}
      className="relative max-w-3xl max-h-[70vh] w-full aspect-[4/5] sm:aspect-auto sm:h-[70vh] mx-auto select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      <motion.img
        src={photo.src}
        alt={photo.alt}
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        onLoad={() => setLoaded(true)}
        animate={{ x: offset.x, y: offset.y }}
        transition={{ type: "tween", duration: 0.4, ease: "easeOut" }}
        className={`w-full h-full object-contain rounded-xl transition-[filter] duration-700 ease-out ${
          loaded ? "blur-0" : "blur-2xl scale-105"
        }`}
        style={{ WebkitTouchCallout: "none" }}
      />
      <Watermark />
      {/* Transparent layer above the image: a long-press or right-click
          here grabs this empty div, not the underlying <img>. A real
          deterrent for casual saving, not a hard barrier. */}
      <div
        className="absolute inset-0 z-30"
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      />
    </div>
  );
}

export default function BehindTheWork() {
  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const devtoolsSuspected = useDevtoolsGuess();

  const close = useCallback(() => setIsOpen(false), []);
  const next = useCallback(
    () => setIndex((i) => (i + 1) % moments.length),
    []
  );
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + moments.length) % moments.length),
    []
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close, next, prev]);

  const photo = moments[index];

  return (
    <>
      {/* ── Trigger ──────────────────────────────────────────────
          Deliberately understated. Not a nav item, not a gallery
          grid teaser — just a quiet line of text someone notices
          if they're actually reading, not skimming. */}
      <button
        onClick={() => setIsOpen(true)}
        className="group inline-flex items-center gap-2 mx-auto mt-6 text-sm text-gray-500 dark:text-gray-400 hover:text-modern-coral dark:hover:text-modern-teal transition-colors duration-300"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-modern-coral/60 group-hover:bg-modern-coral transition-colors" />
        A little more of me, if you'd like to see it
      </button>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center px-4"
              onContextMenu={(e) => e.preventDefault()}
            >
              {/* Close */}
              <button
                onClick={close}
                aria-label="Close"
                className="absolute top-6 right-6 text-white/60 hover:text-white text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-all duration-300"
              >
                ✕
              </button>

              {/* Image */}
              <div className="relative w-full flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full flex flex-col items-center"
                  >
                    <div
                      className={`transition-[filter] duration-500 ${
                        devtoolsSuspected ? "blur-3xl" : "blur-0"
                      }`}
                    >
                      <GuardedImage photo={photo} />
                    </div>

                    <div className="mt-6 text-center max-w-lg">
                      <div className="text-xs tracking-[0.2em] font-semibold bg-gradient-to-r from-modern-coral to-modern-teal bg-clip-text text-transparent mb-2">
                        {photo.category}
                      </div>
                      <p className="text-gray-300 text-sm md:text-base">
                        {photo.caption}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {devtoolsSuspected && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-white/70 text-sm bg-black/60 px-4 py-2 rounded-full">
                      Peeking behind the curtain? 👀
                    </p>
                  </div>
                )}
              </div>

              {/* Nav arrows — only meaningful once there's more than one photo */}
              {moments.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    aria-label="Previous"
                    className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-3xl w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 transition-all duration-300"
                  >
                    ‹
                  </button>
                  <button
                    onClick={next}
                    aria-label="Next"
                    className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-3xl w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 transition-all duration-300"
                  >
                    ›
                  </button>

                  {/* Progress dots */}
                  <div className="absolute bottom-8 flex gap-2">
                    {moments.map((m, i) => (
                      <button
                        key={m.id}
                        onClick={() => setIndex(i)}
                        aria-label={`Go to photo ${i + 1}`}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          i === index
                            ? "w-6 bg-gradient-to-r from-modern-coral to-modern-teal"
                            : "w-1.5 bg-white/30 hover:bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

/**
 * ─────────────────────────────────────────────────────────────────
 * SWAPPING IN SUPABASE STORAGE LATER
 * ─────────────────────────────────────────────────────────────────
 * Your project already has @supabase/supabase-js configured
 * (see MeetingScheduler.jsx) via VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.
 *
 * When you're ready to move off the local placeholder:
 *
 * 1. Create a bucket (e.g. "behind-the-work"). Keep it PRIVATE,
 *    not public — this alone is a bigger protection win than any
 *    watermark, since nobody can guess/hotlink a stable public URL.
 *
 * 2. Upload your ORIGINAL high-quality files there. That's your
 *    private master copy — never referenced by the site directly.
 *
 * 3. Fetch a signed, TIME-LIMITED url for display, and — this is
 *    the important part — request a resized/transformed rendition,
 *    not the original:
 *
 *    const { data } = await supabase.storage
 *      .from('behind-the-work')
 *      .createSignedUrl('01.jpg', 3600, {
 *        transform: { width: 1600, quality: 80 }
 *      });
 *
 *    (Image transforms need Supabase's paid Pro tier storage add-on.
 *    If you're on the free tier, Cloudinary/ImageKit's free plans
 *    both do on-the-fly resizing via URL params and can sit in
 *    front of a private Supabase bucket the same way.)
 *
 * 4. Replace the static `moments` array above with a small
 *    useEffect that fetches these signed URLs on mount and sets
 *    them into state instead.
 *
 * The signed URL expiring after an hour is itself a nice side
 * benefit: even a leaked link goes stale on its own.
 * ─────────────────────────────────────────────────────────────────
 */