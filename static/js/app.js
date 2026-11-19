/* ==========================================================================
   ASHISH DASH — portfolio interactions
   Vanilla JS. No dependencies. No tracking. Just vibes.
   ========================================================================== */
(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Streamlit may scroll an inner container instead of window. Detect it once. */
  function getScroller() {
    var m = document.querySelector('[data-testid="stMain"]');
    if (m && m.scrollHeight > m.clientHeight + 20) return m;
    return window;
  }
  function scrollTopNow() {
    var sc = getScroller();
    return sc === window ? (window.scrollY || window.pageYOffset || 0) : sc.scrollTop;
  }
  function scrollProgress() {
    var sc = getScroller();
    var top = sc === window ? (window.scrollY || window.pageYOffset || 0) : sc.scrollTop;
    var h = (sc === window ? document.documentElement.scrollHeight : sc.scrollHeight) -
            (sc === window ? window.innerHeight : sc.clientHeight);
    return h > 0 ? Math.min(100, Math.max(0, (top / h) * 100)) : 0;
  }
  function lockScroll(lock) {
    var sc = getScroller();
    if (sc !== window) sc.style.overflow = lock ? "hidden" : "";
    document.body.style.overflow = lock ? "hidden" : "";
  }

  /* ---------------------------------------------------------------------
     1. Load-in
     --------------------------------------------------------------------- */
  function boot() {
    document.body.classList.add("loaded");
  }
  if (document.readyState === "complete") boot();
  else window.addEventListener("load", boot);
  setTimeout(boot, 700); // failsafe if an asset hangs

  /* ---------------------------------------------------------------------
     2. Scroll progress + XP bar + nav state
     --------------------------------------------------------------------- */
  var nav = $("#nav");
  var topBar = $("#scrollbar-top");
  var xpFill = $("#xp-fill");
  var xpPct = $("#xp-pct");
  var ticking = false;

  function onScroll() {
    var y = scrollTopNow();
    var p = scrollProgress();
    if (topBar) topBar.style.width = p + "%";
    if (xpFill) xpFill.style.width = p + "%";
    if (xpPct) xpPct.textContent = Math.round(p) + "%";
    if (nav) nav.classList.toggle("scrolled", y > 24);
    ticking = false;
    checkAchievements(p);
  }
  function bindScroll() {
    var sc = getScroller();
    (sc === window ? window : sc).addEventListener("scroll", function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();
  }
  bindScroll();
  setTimeout(bindScroll, 1200);

  /* ---------------------------------------------------------------------
     3. Reveal on scroll
     --------------------------------------------------------------------- */
  var revealEls = $$(".rv");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* skill bars */
  var skillsSec = $("#skills");
  if (skillsSec) {
    if ("IntersectionObserver" in window && !reduce) {
      var sio = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { skillsSec.classList.add("in"); sio.disconnect(); } });
      }, { threshold: 0.18 });
      sio.observe(skillsSec);
    } else { skillsSec.classList.add("in"); }
  }

  /* active nav link */
  var navLinks = $$(".nav-links a[data-nav]");
  var sections = navLinks.map(function (a) { return document.getElementById(a.getAttribute("data-nav")); }).filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    var nio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          navLinks.forEach(function (a) { a.classList.toggle("active", a.getAttribute("data-nav") === e.target.id); });
        }
      });
    }, { rootMargin: "-42% 0px -52% 0px" });
    sections.forEach(function (s) { nio.observe(s); });
  }

  /* ---------------------------------------------------------------------
     4. Custom cursor
     --------------------------------------------------------------------- */
  var cur = $("#cursor"), ring = $("#cursor-ring");
  var isFine = window.matchMedia("(pointer:fine)").matches;
  if (cur && ring && isFine && !reduce) {
    var mx = window.innerWidth / 2, my = window.innerHeight / 2, rx = mx, ry = my;
    window.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      cur.style.transform = "translate(" + mx + "px," + my + "px)";
      document.body.classList.add("cursor-on");
    }, { passive: true });
    (function loop() {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      ring.style.transform = "translate(" + rx + "px," + ry + "px)";
      window.requestAnimationFrame(loop);
    })();
    var hoverables = "a,button,.cert,.case,.chip,.sticker,.photo-frame,input,[data-cursor]";
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest && e.target.closest(hoverables)) document.body.classList.add("cursor-hover");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest && e.target.closest(hoverables)) document.body.classList.remove("cursor-hover");
    });
    document.addEventListener("mouseleave", function () { document.body.classList.remove("cursor-on"); });
  }

  /* ---------------------------------------------------------------------
     5. Mobile nav
     --------------------------------------------------------------------- */
  var burger = $("#burger");
  if (burger) {
    burger.addEventListener("click", function () {
      document.body.classList.toggle("nav-open");
      burger.setAttribute("aria-expanded", document.body.classList.contains("nav-open") ? "true" : "false");
    });
    $$(".sheet a").forEach(function (a) {
      a.addEventListener("click", function () { document.body.classList.remove("nav-open"); });
    });
  }

  /* ---------------------------------------------------------------------
     6. Tagline rotator
     --------------------------------------------------------------------- */
  var rot = $("#rot-word");
  if (rot) {
    var words = JSON.parse(rot.getAttribute("data-words"));
    var i = 0, j = 0, del = false;
    (function type() {
      if (reduce) { rot.textContent = words[0]; return; }
      var w = words[i];
      rot.textContent = w.slice(0, j);
      if (!del && j < w.length) { j++; setTimeout(type, 52 + Math.random() * 40); }
      else if (!del && j === w.length) { del = true; setTimeout(type, 1800); }
      else if (del && j > 0) { j--; setTimeout(type, 26); }
      else { del = false; i = (i + 1) % words.length; setTimeout(type, 260); }
    })();
  }

  /* ---------------------------------------------------------------------
     7. Project filters + cursor spotlight
     --------------------------------------------------------------------- */
  $$(".filters button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = btn.getAttribute("data-filter");
      $$(".filters button").forEach(function (b) { b.classList.toggle("on", b === btn); });
      $$(".case").forEach(function (c) {
        var cats = (c.getAttribute("data-cat") || "").split(" ");
        var show = f === "all" || cats.indexOf(f) > -1;
        c.style.display = show ? "" : "none";
        if (show) { c.classList.remove("rv", "in"); void c.offsetWidth; c.classList.add("rv", "in"); }
      });
    });
  });

  $$(".case").forEach(function (c) {
    c.addEventListener("mousemove", function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty("--mx", (e.clientX - r.left) + "px");
      c.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* count-up for case outcomes */
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var prefix = el.getAttribute("data-prefix") || "";
    var dec = (el.getAttribute("data-dec") || "0") | 0;
    if (reduce || isNaN(target)) { return; }
    var start = performance.now(), dur = 1200;
    (function tick(now) {
      var t = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = prefix + (target * eased).toFixed(dec) + suffix;
      if (t < 1) window.requestAnimationFrame(tick);
    })(start);
  }
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { countUp(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    $$("[data-count]").forEach(function (el) { cio.observe(el); });
  }

  /* ---------------------------------------------------------------------
     8. Certificate lightbox
     --------------------------------------------------------------------- */
  var lb = $("#lb"), lbImg = $("#lb-img"), lbTitle = $("#lb-title"), lbPdf = $("#lb-pdf"), lastFocus = null;

  function openLb(btn) {
    if (!lb) return;
    lastFocus = btn;
    lbImg.src = btn.getAttribute("data-full");
    lbImg.alt = btn.getAttribute("data-title") || "Certificate";
    lbTitle.textContent = btn.getAttribute("data-title") || "";
    lbPdf.href = btn.getAttribute("data-pdf") || "#";
    lb.classList.add("open");
    lockScroll(true);
    setTimeout(function () { var c = $("#lb-close"); if (c) c.focus(); }, 120);
    toast("📜", "Credential unlocked", btn.getAttribute("data-short") || "Certificate opened");
  }
  function closeLb() {
    if (!lb) return;
    lb.classList.remove("open");
    lockScroll(false);
    if (lastFocus) lastFocus.focus();
  }
  $$(".cert").forEach(function (c) {
    c.addEventListener("click", function () { openLb(c); });
  });
  if (lb) {
    $("#lb-close").addEventListener("click", closeLb);
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeLb(); });
  }

  /* ---------------------------------------------------------------------
     9. Toasts + achievements
     --------------------------------------------------------------------- */
  var toastWrap = $("#toasts");
  function toast(icon, kicker, text, ms) {
    if (!toastWrap) return;
    var t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = '<div class="ico">' + icon + '</div><div class="tx"><small>' + kicker + '</small><b>' + text + "</b></div>";
    toastWrap.appendChild(t);
    var maxToasts = window.innerWidth < 760 ? 1 : 2;
    while (toastWrap.children.length > maxToasts) toastWrap.removeChild(toastWrap.firstChild);
    requestAnimationFrame(function () { t.classList.add("in"); });
    setTimeout(function () {
      t.classList.remove("in");
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 600);
    }, ms || 4600);
  }
  window.__toast = toast;

  var seen = {};
  var milestones; /* assigned below — guarded so early scrolls are safe */
  milestones = [
    { at: 22, icon: "🛠️", kicker: "Achievement unlocked", text: "Skills inspected — nothing rusty in there." },
    { at: 55, icon: "🚀", kicker: "Achievement unlocked", text: "Projects reviewed. Impressed yet?" },
    { at: 90, icon: "☕", kicker: "Achievement unlocked", text: "Nearly done. Go on, hit that email button." }
  ];
  function checkAchievements(p) {
    if (!milestones) return;
    milestones.forEach(function (m, idx) {
      if (p >= m.at && !seen[idx]) {
        seen[idx] = true;
        setTimeout(function () { toast(m.icon, m.kicker, m.text); }, 400);
      }
    });
  }
  setTimeout(function () {
    toast("✨", "Welcome, recruiter", "Nice to meet you. Scroll on — it gets better.", 5200);
  }, 2800);

  /* konami-lite: type "hire" anywhere */
  var typed = "";
  document.addEventListener("keydown", function (e) {
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
    if (e.key && e.key.length === 1) {
      typed = (typed + e.key.toLowerCase()).slice(-4);
      if (typed === "hire") {
        typed = "";
        toast("🤝", "Secret found", "Hire command activated. Bold. I like it.");
        confetti(90);
      }
    }
  });

  /* click the portrait 5x */
  var photo = $("#portrait"), pokes = 0;
  if (photo) {
    photo.addEventListener("click", function () {
      pokes++;
      if (pokes === 5) {
        toast("🧑‍💻", "Easter egg", "That's me. The dashboard is also me, but shinier.");
        confetti(50);
      }
      if (pokes > 5) pokes = 0;
    });
  }

  /* ---------------------------------------------------------------------
     10. Confetti
     --------------------------------------------------------------------- */
  var canvas = $("#confetti");
  function confetti(n) {
    if (!canvas || reduce) return;
    var ctx = canvas.getContext("2d");
    var dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.scale(dpr, dpr);
    var colors = ["#DE4E26", "#0E5C54", "#D9F25C", "#15130F", "#F7F2E8"];
    var parts = [];
    for (var i = 0; i < (n || 60); i++) {
      parts.push({
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 220,
        y: window.innerHeight * 0.34 + (Math.random() - 0.5) * 80,
        vx: (Math.random() - 0.5) * 13,
        vy: Math.random() * -13 - 3,
        s: 3 + Math.random() * 6,
        r: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        c: colors[(Math.random() * colors.length) | 0],
        life: 1
      });
    }
    var start = performance.now();
    (function frame(now) {
      var elapsed = now - start;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      parts.forEach(function (p) {
        p.vy += 0.42; p.vx *= 0.995; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        p.life = Math.max(0, 1 - elapsed / 2600);
        ctx.save();
        ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.62);
        ctx.restore();
      });
      if (elapsed < 2700) requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    })(start);
  }

  /* ---------------------------------------------------------------------
     11. Terminal
     --------------------------------------------------------------------- */
  var term = $("#term-body"), input = $("#term-in");
  if (term && input) {
    var cmdHistory = [], hIdx = -1;

    var whoami = [
      "Ashish Dash — B.Tech CSE (AI & ML), 3rd year, CGPA 8.14.",
      "Keonjhar, Odisha, India. Usually found near a laptop and a cup of chai.",
      "Currently hunting a Data Analytics / AI Trainee role. Big-fan-of-clean-data energy."
    ];

    var cmds = {
      help: function () {
        return [
          dim("Available commands:") + " " + "help · whoami · skills · projects · certs · contact · fun · chai · joke · clear · sudo hire-me"
        ];
      },
      whoami: function () { return whoami.slice(); },
      about: function () { return whoami.slice(); },
      skills: function () {
        return [
          "python        ██████████████████░░  92%",
          "sql           █████████████████░░░  88%",
          "pandas/numpy  ██████████████████░░  90%",
          "scikit-learn  ████████████████░░░░  84%",
          "power bi      █████████████████░░░  86%",
          "tableau       ████████████████░░░░  82%",
          dim("…and 6 more, metric-verified. no vibes-only claims.")
        ];
      },
      projects: function () {
        return [
          u("01") + " HR Diagnostics Dashboard  " + dim("→ python · streamlit · plotly"),
          u("02") + " Syllabus AI (RAG engine)   " + dim("→ 98% syllabus adherence, 0 hallucinations"),
          u("03") + " JPMorgan Forage backend    " + dim("→ java · spring boot · kafka"),
          u("04") + " EAPLE EdTech platform      " + dim("→ ML for personalised learning"),
          u("05") + " This website               " + dim("→ you are inside project #5 right now")
        ];
      },
      certs: function () {
        return [
          u("NPTEL Elite") + " Data Science for Engineers (IIT Madras)  " + dim("2025"),
          u("NPTEL Elite") + " Data Mining (IIT Kharagpur)             " + dim("2026"),
          u("Adobe x UNICEF") + " Design Fundamentals with AI        " + dim("100%"),
          u("Deloitte") + " Data Analytics Job Simulation             " + dim("2026"),
          u("Tata") + " GenAI-Powered Data Analytics              " + dim("2026"),
          u("JPMorgan Chase") + " Software Engineering                " + dim("2026"),
          dim("…plus EduSkills/AICTE, Unified Mentor and CTTC (Govt. of India).")
        ];
      },
      contact: function () {
        return [
          "email     " + u("ashibabi2007@gmail.com"),
          "linkedin  linkedin.com/in/ashish-dash-8626223b0",
          "github    github.com/ashibabi2007-commits",
          "phone     +91 73259 73140",
          dim("Response time: faster than a pandas groupby on 1k rows.")
        ];
      },
      fun: function () {
        return [
          "Fun facts, professionally documented:",
          " · Machine Learning Lead at the Code Communicators club.",
          " · Has built & sold websites to local shops and restaurants.",
          " · Teaches juniors Python and ML — yes, for free.",
          " · Participates in hackathons the way other people watch series."
        ];
      },
      chai: function () {
        return [
          "  ( (",
          "   ) )",
          " ........",
          " |      |]  ☕ chai.exe running…",
          " \\      /",
          "  `----'   status: the true engine behind every model.",
          dim("Coffee count today: ∞ (or 0, depending on the day)")
        ];
      },
      joke: function () {
        var j = [
          "Why did the data scientist leave the party early? Because she had to drop nulls.",
          "A SQL query walks into a bar, approaches two tables and asks: 'May I JOIN you?'",
          "I told my model to be more confident. It now predicts 1 for everything. Accuracy: 50%, self-belief: 100%.",
          "My code doesn't have bugs — it has undocumented features.",
          "There are two hard things in data science: naming things, off-by-one errors, and naming things."
        ];
        return [j[(Math.random() * j.length) | 0]];
      },
      clear: function () { term.innerHTML = ""; return null; }
    };

    function u(t) { return '<span class="u">' + t + "</span>"; }
    function dim(t) { return '<span style="opacity:.6">' + t + "</span>"; }

    function print(html, cls) {
      var d = document.createElement("div");
      d.className = "term-line " + (cls || "out");
      d.innerHTML = html;
      var prompt = $(".term-prompt", term);
      if (prompt) term.insertBefore(d, prompt); else term.appendChild(d);
      term.scrollTop = term.scrollHeight;
    }

    function prompt() {
      var d = document.createElement("div");
      d.className = "term-prompt";
      d.innerHTML = '<span>ashish@portfolio:~$</span>';
      term.appendChild(d);
      term.scrollTop = term.scrollHeight;
    }

    var banner = [
      dim("Last login: today, from a recruiter's browser. 👋"),
      "Type " + u("help") + " to explore, or " + u("sudo hire-me") + " if you are feeling decisive."
    ];
    banner.forEach(function (b, i) {
      setTimeout(function () { print(b); }, 500 + i * 420);
    });

    function run(raw) {
      var cmd = raw.trim().toLowerCase();
      if (!cmd) { print('<span style="opacity:.5">(nothing typed — the void says hello)</span>'); return; }
      cmdHistory.unshift(cmd); hIdx = -1;
      if (cmd.indexOf("sudo hire-me") === 0 || cmd === "hire-me" || cmd === "hire me" || cmd === "hire") {
        print(u("Permission granted. Initiating recruitment protocol…"));
        setTimeout(function () { print("▸ Résumé attached to email · ▸ Portfolio reviewed · ▸ Interview scheduled (hopefully)"); }, 500);
        setTimeout(function () { print("Result: " + u("100% match") + " · Would be an honour to build with your team."); }, 1100);
        setTimeout(function () { confetti(120); toast("🎉", "Achievement unlocked", "You typed sudo hire-me. Correct instinct."); }, 1500);
        return;
      }
      if (cmd === "ls") { print("about  skills  projects  certs  contact  resume.pdf  secrets/"); return; }
      if (cmd === "resume") {
        print('Opening résumé… <a href="/app/static/docs/Ashish-Dash-Resume.pdf" target="_blank" style="color:#D9F25C;text-decoration:underline">click here if nothing happens</a>');
        return;
      }
      if (cmd === "sudo") { print("Nice try. But this portfolio is already root-level adorable."); return; }
      if (cmd === "exit" || cmd === "quit") { print("You can check out any time you like — but the chai never leaves. ☕"); return; }
      var fn = cmds[cmd];
      if (fn) {
        var out = fn();
        if (out === null) return;
        out.forEach(function (line, i) { setTimeout(function () { print(line); }, i * 90); });
      } else {
        print(u(cmd) + " : command not found. Try " + u("help") + " — or " + u("joke") + " if you're just here for the vibes.");
      }
    }

    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        var v = input.value;
        input.value = "";
        print('<span style="color:#7FA8A2">ashish@portfolio:~$</span> ' + v, "cmd");
        run(v);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (cmdHistory.length) { hIdx = Math.min(cmdHistory.length - 1, hIdx + 1); input.value = cmdHistory[hIdx]; }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        hIdx = Math.max(-1, hIdx - 1); input.value = hIdx === -1 ? "" : cmdHistory[hIdx];
      }
    });

    $$(".term-hint button").forEach(function (b) {
      b.addEventListener("click", function () {
        var c = b.getAttribute("data-cmd");
        print('<span style="color:#7FA8A2">ashish@portfolio:~$</span> ' + c, "cmd");
        run(c);
        input.focus();
      });
    });
  }

  /* ---------------------------------------------------------------------
     12. Misc charm
     --------------------------------------------------------------------- */
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  document.addEventListener("visibilitychange", function () {
    document.title = document.hidden
      ? "👀 The data misses you…"
      : "Ashish Dash — Data Analyst in the making";
  });

  /* smooth anchor scrolling (works with window or Streamlit's inner scroller) */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      document.body.classList.remove("nav-open");
      if (id === "#top") {
        var sc = getScroller();
        if (sc === window) window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
        else sc.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      } else {
        t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      }
      if (window.history && window.history.replaceState) {
        try { window.history.replaceState(null, "", id); } catch (err) { /* no-op */ }
      }
    });
  });
})();
