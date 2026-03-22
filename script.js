// script.js
(() => {
  "use strict";

  /** -----------------------------
   * Helpers
   * ------------------------------*/
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /** -----------------------------
   * Header: add scrolled state
   * ------------------------------*/
  const header = $(".header");
  const onScrollHeader = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /** -----------------------------
   * Mobile nav toggle
   * ------------------------------*/
  const navToggle = $(".nav-toggle");
  const nav = $("[data-nav]");
  const setNavOpen = (open) => {
    if (!navToggle || !nav) return;
    navToggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("nav-open", open);
  };

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const open = navToggle.getAttribute("aria-expanded") !== "true";
      setNavOpen(open);
    });

    // Close on link click (mobile UX)
    $$("a", nav).forEach((a) => {
      a.addEventListener("click", () => setNavOpen(false));
    });

    // Close on ESC
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setNavOpen(false);
    });
  }

  /** -----------------------------
   * Custom cursor (desktop only)
   * - disables automatically for touch devices and reduced motion
   * ------------------------------*/
  const cursor = $(".cursor");
  const follower = $(".cursor-follower");

  const isTouch =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia("(pointer: coarse)").matches;

  if (!prefersReducedMotion && !isTouch && cursor && follower) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let fx = mouseX;
    let fy = mouseY;

    const move = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.transform = `translate(${mouseX - 10}px, ${mouseY - 10}px)`;
    };

    const animateFollower = () => {
      // Smooth trailing effect
      fx += (mouseX - fx) * 0.14;
      fy += (mouseY - fy) * 0.14;
      follower.style.transform = `translate(${fx - 20}px, ${fy - 20}px)`;
      requestAnimationFrame(animateFollower);
    };

    window.addEventListener("mousemove", move, { passive: true });
    animateFollower();

    // Cursor state on interactive elements
    const interactive = "a, button, input, textarea, select, summary, .chip";
    const setActive = (active) => {
      cursor.classList.toggle("is-active", active);
      follower.classList.toggle("is-active", active);
    };

    $$(interactive).forEach((el) => {
      el.addEventListener("mouseenter", () => setActive(true));
      el.addEventListener("mouseleave", () => setActive(false));
    });
  } else {
    // If touch/reduced motion, show normal cursor
    document.body.style.cursor = "auto";
    if (cursor) cursor.style.display = "none";
    if (follower) follower.style.display = "none";
  }

  /** -----------------------------
   * Reveal on scroll (IntersectionObserver)
   * ------------------------------*/
  const revealEls = $$(".reveal");
  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealEls.forEach((el) => io.observe(el));
  } else {
    // Fallback: instantly visible
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /** -----------------------------
   * Count-up stats (hero)
   * ------------------------------*/
  const counters = $$("[data-count]");
  const animateCounter = (el) => {
    const target = Number(el.getAttribute("data-count") || "0");
    const start = 0;
    const duration = 900; // ms
    const startTime = performance.now();

    const tick = (now) => {
      const t = Math.min(1, (now - startTime) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      const val = Math.round(start + (target - start) * eased);
      el.textContent = String(val);
      if (t < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  if (!prefersReducedMotion && "IntersectionObserver" in window && counters.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => io.observe(c));
  } else {
    counters.forEach((c) => (c.textContent = c.getAttribute("data-count") || "0"));
  }

  /** -----------------------------
   * Generator demo: simulated AI output
   * ------------------------------*/
  const genForm = $("#genForm");
  const generateBtn = $("#generateBtn");
  const scriptOut = $("#scriptOut");
  const captionsOut = $("#captionsOut");
  const logEl = $("#log");

  const setLoading = (loading) => {
    if (!generateBtn) return;
    generateBtn.disabled = loading;
    generateBtn.classList.toggle("is-loading", loading);
    const txt = $(".btn-text", generateBtn);
    if (txt) txt.textContent = loading ? "Generating..." : "Generate";
  };

  const pushLog = (line) => {
    if (!logEl) return;
    const current = logEl.textContent.trimEnd();
    logEl.textContent = `${current}\n${line}`;
    // keep scroll at bottom
    logEl.parentElement?.scrollTo({ top: 999999, behavior: "smooth" });
  };

  const buildScript = ({ topic, style, length, voice, notes }) => {
    // Lightweight “AI-ish” templating for demo purposes
    const seconds = Number(String(length).replace("s", "")) || 30;
    const beats = seconds <= 15 ? 3 : seconds <= 30 ? 5 : seconds <= 45 ? 6 : 7;

    const hookBank = [
      `Stop scrolling — this changes how you think about ${topic}.`,
      `If you're still doing this with ${topic}, you're losing time.`,
      `Here’s the fast way to level up ${topic} — no fluff.`,
      `Most people get ${topic} wrong. Do this instead.`
    ];

    const valueBank = [
      `Rule 1: Make it frictionless. If it takes more than 2 steps, you won't repeat it.`,
      `Rule 2: Track one number. Momentum loves a scoreboard.`,
      `Rule 3: Cut the “maybe”. Either schedule it, or delete it.`,
      `Rule 4: Use a 10-minute start. Starting is the real skill.`,
      `Rule 5: End with a checkpoint. Small wins compound.`
    ];

    const ctaBank = [
      `Want part 2? Comment “NEON”.`,
      `Follow for more cyber-clean systems.`,
      `Save this so you can run it tonight.`
    ];

    // Pick items deterministically-ish (based on topic length)
    const pick = (arr, seed) => arr[seed % arr.length];
    const seed = (topic || "").length + (style || "").length + (voice || "").length;

    const hook = pick(hookBank, seed);
    const cta = pick(ctaBank, seed + 2);

    // choose value points
    const points = [];
    for (let i = 0; i < beats - 2; i++) points.push(valueBank[(seed + i) % valueBank.length]);

    const lines = [
      `[STYLE: ${style}] [VOICE: ${voice}] [LENGTH: ${length}]`,
      `HOOK: ${hook}`,
      ...points.map((p, i) => `POINT ${i + 1}: ${p}`),
      `CTA: ${cta}`
    ];

    if (notes && notes.trim()) {
      lines.push(`NOTES: ${notes.trim()}`);
    }

    return lines.join("\n");
  };

  const buildCaptions = ({ topic }) => {
    // Fake caption chunks (punchy)
    const chunks = [
      `STOP SCROLLING`,
      `${topic.toUpperCase()}`,
      `DO THIS INSTEAD`,
      `SAVE THIS`,
      `FOLLOW FOR MORE`
    ];
    return chunks.join("\n");
  };

  if (genForm && scriptOut && captionsOut) {
    genForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (prefersReducedMotion) {
        // still works, just less animation expectation
      }

      const formData = new FormData(genForm);
      const payload = {
        topic: String(formData.get("topic") || "").trim(),
        style: String(formData.get("style") || ""),
        length: String(formData.get("length") || "30s"),
        voice: String(formData.get("voice") || ""),
        notes: String(formData.get("notes") || "")
      };

      if (!payload.topic) return;

      setLoading(true);

      // Clear outputs with subtle progression
      scriptOut.textContent = "Initializing...";
      captionsOut.textContent = "Preparing captions...";

      // Simulated pipeline
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      const steps = [
        ["[ai] drafting hook...", 420],
        ["[ai] structuring beats...", 380],
        ["[ai] generating voice pacing...", 340],
        ["[render] assembling captions...", 360],
        ["[export] finalizing preview...", 420]
      ];

      try {
        pushLog("");
        pushLog(`[request] topic="${payload.topic}" style="${payload.style}" length="${payload.length}" voice="${payload.voice}"`);
        for (const [line, ms] of steps) {
          pushLog(line);
          await wait(prefersReducedMotion ? 0 : ms);
        }

        const script = buildScript(payload);
        const captions = buildCaptions(payload);

        // Type-in effect (smooth)
        if (!prefersReducedMotion) {
          scriptOut.textContent = "";
          captionsOut.textContent = "";

          const typeInto = async (el, text, speed = 10) => {
            for (let i = 0; i < text.length; i++) {
              el.textContent += text[i];
              // accelerate whitespace
              const delay = text[i] === "\n" ? speed * 2 : speed;
              await wait(delay);
            }
          };

          await typeInto(scriptOut, script, 8);
          await wait(120);
          await typeInto(captionsOut, captions, 6);
        } else {
          scriptOut.textContent = script;
          captionsOut.textContent = captions;
        }

        pushLog("[done] generation complete ✅");
      } catch (err) {
        scriptOut.textContent = "Something went wrong. Try again.";
        captionsOut.textContent = "—";
        pushLog(`[error] ${String(err?.message || err)}`);
      } finally {
        setLoading(false);
      }
    });
  }

  /** -----------------------------
   * Copy buttons
   * ------------------------------*/
  const copyToClipboard = async (text) => {
    // Clipboard API with fallback
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        return ok;
      } catch {
        document.body.removeChild(ta);
        return false;
      }
    }
  };

  const copyScriptBtn = $("#copyScriptBtn");
  const copyCaptionsBtn = $("#copyCaptionsBtn");

  const withCopyFeedback = async (btn, textProvider) => {
    if (!btn) return;
    const original = btn.innerHTML;
    const text = textProvider();
    if (!text || !text.trim()) return;

    const ok = await copyToClipboard(text);
    btn.innerHTML = ok
      ? `<i class="fa-solid fa-check"></i> Copied`
      : `<i class="fa-solid fa-triangle-exclamation"></i> Failed`;

    btn.disabled = true;
    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = original;
    }, 1100);
  };

  if (copyScriptBtn && scriptOut) {
    copyScriptBtn.addEventListener("click", () =>
      withCopyFeedback(copyScriptBtn, () => scriptOut.textContent)
    );
  }
  if (copyCaptionsBtn && captionsOut) {
    copyCaptionsBtn.addEventListener("click", () =>
      withCopyFeedback(copyCaptionsBtn, () => captionsOut.textContent)
    );
  }

  /** -----------------------------
   * Back-to-top button
   * ------------------------------*/
  const toTop = $(".to-top");
  const updateToTop = () => {
    if (!toTop) return;
    toTop.classList.toggle("is-visible", window.scrollY > 600);
  };

  if (toTop) {
    window.addEventListener("scroll", updateToTop, { passive: true });
    updateToTop();

    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /** -----------------------------
   * Footer year
   * ------------------------------*/
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());
})();

