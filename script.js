/* ═══════════════════════════════════════════════════════════════
   Balaji Pillalamarri — portfolio interactions
   Kept deliberately small: theme, nav, reveals, counters.
   ═══════════════════════════════════════════════════════════════ */

(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ─── theme ─── */
  const root = document.documentElement;
  const stored = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  root.setAttribute("data-theme", stored || (prefersDark ? "dark" : "light"));

  $("#themeToggle")?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    $('meta[name="theme-color"]')?.setAttribute(
      "content",
      next === "dark" ? "#131412" : "#faf8f5"
    );
  });

  /* ─── mobile menu ─── */
  const burger = $("#navBurger");
  const menu = $("#mobileMenu");

  const closeMenu = () => {
    burger?.classList.remove("open");
    menu?.classList.remove("open");
    burger?.setAttribute("aria-expanded", "false");
  };

  burger?.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
  });
  $$("#mobileMenu a").forEach((a) => a.addEventListener("click", closeMenu));

  /* ─── nav state + scroll progress + active link ─── */
  const nav = $("#nav");
  const bar = $("#progress");
  const sections = $$("section[id]");
  const navLinks = $$(".nav-links a");
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    nav?.classList.toggle("scrolled", y > 24);

    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;

    let current = "";
    sections.forEach((s) => {
      if (y >= s.offsetTop - 140) current = s.id;
    });
    navLinks.forEach((a) =>
      a.classList.toggle("active", a.getAttribute("href") === `#${current}`)
    );

    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(onScroll);
      }
    },
    { passive: true }
  );
  onScroll();

  /* ─── reveal on scroll ─── */
  const revealables = $$(".reveal");

  if (reduced || !("IntersectionObserver" in window)) {
    revealables.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const siblings = [...entry.target.parentElement.children].filter((c) =>
            c.classList.contains("reveal")
          );
          const delay = Math.min(siblings.indexOf(entry.target), 5) * 70;
          setTimeout(() => entry.target.classList.add("in"), delay);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealables.forEach((el) => io.observe(el));
  }

  /* ─── stat counters ─── */
  const counters = $$(".count");

  const runCount = (el) => {
    const target = Number(el.dataset.target || 0);
    if (reduced) {
      el.textContent = target.toLocaleString();
      return;
    }
    const duration = 1400;
    const start = performance.now();

    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ("IntersectionObserver" in window) {
    const co = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          runCount(entry.target);
          co.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => co.observe(el));
  } else {
    counters.forEach(runCount);
  }

  /* ─── footer year ─── */
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
