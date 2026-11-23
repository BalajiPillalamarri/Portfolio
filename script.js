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
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } },
  };

  const root = document.documentElement;
  const stored = store.get("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  root.setAttribute("data-theme", stored || (prefersDark ? "dark" : "light"));

  $("#themeToggle")?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    store.set("theme", next);
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

  /* ─── project filters ─── */
  const filterBtns = $$(".filter-btn");
  const cards = $$("#workGrid .work-card");

  filterBtns.forEach((btn) =>
    btn.addEventListener("click", () => {
      const f = btn.dataset.filter;
      filterBtns.forEach((b) => {
        const on = b === btn;
        b.classList.toggle("active", on);
        b.setAttribute("aria-pressed", String(on));
      });
      cards.forEach((c) => {
        const show = f === "all" || c.dataset.org === f;
        c.classList.toggle("is-hidden", !show);
        if (show) c.classList.add("in");
      });
    })
  );

  /* ─── F1 lights-out reaction timer ─── */
  const f1Btn = $("#f1Btn");
  const f1Lights = $$(".f1-light");
  const f1Out = $("#f1Readout");
  const f1Best = $("#f1Best");
  let f1State = "idle"; // idle | lighting | go
  let f1Timers = [];
  let f1GoAt = 0;

  const showBest = () => {
    const best = Number(store.get("f1-best"));
    if (f1Best) f1Best.textContent = best ? `Personal best · ${best} ms` : "";
  };
  const resetF1 = (label) => {
    f1Timers.forEach(clearTimeout);
    f1Timers = [];
    f1State = "idle";
    f1Lights.forEach((l) => l.classList.remove("on"));
    f1Btn.classList.remove("armed");
    f1Btn.textContent = label;
  };

  const f1Press = () => {
    if (f1State === "idle") {
      f1State = "lighting";
      f1Btn.textContent = "Wait for it…";
      f1Btn.classList.add("armed");
      f1Out.textContent = "Lights on…";
      f1Lights.forEach((light, i) =>
        f1Timers.push(setTimeout(() => light.classList.add("on"), 900 * (i + 1)))
      );
      const holdFor = 900 * 5 + 300 + Math.random() * 2400;
      f1Timers.push(
        setTimeout(() => {
          f1State = "go";
          f1Lights.forEach((l) => l.classList.remove("on"));
          f1Btn.textContent = "GO!";
          f1GoAt = performance.now();
        }, holdFor)
      );
    } else if (f1State === "lighting") {
      resetF1("Try again");
      f1Out.innerHTML = "<b>Jump start!</b> Drive-through penalty. Wait for lights out.";
    } else if (f1State === "go") {
      const ms = Math.round(performance.now() - f1GoAt);
      resetF1("Go again");
      const verdict =
        ms < 200 ? "pole-position reflexes." :
        ms < 280 ? "right in the F1 driver range." :
        ms < 400 ? "solid launch, a bit of wheelspin." :
        "the safety car would like a word.";
      f1Out.innerHTML = `<b>${ms} ms</b> — ${verdict}`;
      const best = Number(store.get("f1-best"));
      if (!best || ms < best) store.set("f1-best", String(ms));
      showBest();
    }
  };

  f1Btn?.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    f1Press();
  });
  f1Btn?.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (!e.repeat) f1Press();
    }
  });
  showBest();

  /* ─── LEGO brick builder ─── */
  const stage = $("#legoStage");
  const legoOut = $("#legoReadout");
  const colors = ["--brick-red", "--brick-yellow", "--brick-blue", "--brick-green", "--brick-white"];
  const MAX_BRICKS = 6;
  const legoMsgs = [
    "0 bricks. Every great build starts here.",
    "1 brick. The foundation is laid.",
    "2 bricks. Clutch power engaged.",
    "3 bricks. Halfway to a tower.",
    "4 bricks. Don't lose the instruction booklet.",
    "5 bricks. One more and it's a skyline.",
    "6 bricks. Masterpiece. Time to knock it down?",
  ];
  let bricks = 0;

  $("#legoAdd")?.addEventListener("click", () => {
    if (bricks >= MAX_BRICKS) {
      legoOut.textContent = "The tower is complete. Knock it down to build again.";
      return;
    }
    const b = document.createElement("div");
    b.className = "brick" + (bricks === MAX_BRICKS - 1 ? " short" : "");
    b.style.setProperty("--c", `var(${colors[bricks % colors.length]})`);
    b.style.marginLeft = `${bricks % 2 ? 20 : -20}px`;
    stage.appendChild(b);
    bricks += 1;
    legoOut.textContent = legoMsgs[bricks];
  });
  $("#legoReset")?.addEventListener("click", () => {
    stage.replaceChildren();
    bricks = 0;
    legoOut.textContent = legoMsgs[0];
  });

  /* ─── footer year ─── */
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
