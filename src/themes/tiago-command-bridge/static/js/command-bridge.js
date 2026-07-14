(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const setupShipIntro = () => {
    const intro = document.querySelector("[data-ship-intro]");
    const skip = intro?.querySelector("[data-intro-skip]");
    if (!intro || !skip) return;

    if (reducedMotion) {
      intro.hidden = true;
      return;
    }

    document.body.classList.add("intro-active");
    let complete = false;
    let releaseTimer;
    let skipFallbackTimer;
    let focusShipIdAfterSkip = false;

    const finish = () => {
      if (complete) return;
      complete = true;
      window.clearTimeout(releaseTimer);
      window.clearTimeout(skipFallbackTimer);
      intro.classList.add("is-complete");
      document.body.classList.remove("intro-active");
      intro.hidden = true;
      if (focusShipIdAfterSkip) document.querySelector(".ship-id")?.focus({ preventScroll: true });
    };

    const skipToDoors = () => {
      if (complete || intro.classList.contains("is-skipping")) return;
      window.clearTimeout(releaseTimer);
      focusShipIdAfterSkip = document.activeElement === skip;
      skip.disabled = true;
      intro.classList.add("is-skipping");
      skipFallbackTimer = window.setTimeout(finish, 1500);
    };

    intro.addEventListener("animationend", (event) => {
      if (event.target === intro && event.animationName === "intro-skip-release") finish();
    });
    skip.addEventListener("click", skipToDoors);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") skipToDoors();
    });

    releaseTimer = window.setTimeout(finish, 6800);
  };

  const updateClock = () => {
    const clock = document.querySelector("[data-clock]");
    if (!clock) return;

    const tick = () => {
      const time = new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "UTC",
      }).format(new Date());
      clock.textContent = `${time} UTC`;
    };

    tick();
    window.setInterval(tick, 1000);
  };

  const updateCurrentSol = () => {
    const target = document.querySelector("[data-current-sol]");
    if (!target?.dataset.birthDate) return;

    const [year, month, day] = target.dataset.birthDate.split("-").map(Number);
    const now = new Date();
    const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const birth = Date.UTC(year, month - 1, day);
    const sol = Math.max(0, Math.floor((today - birth) / 86_400_000));

    target.textContent = `SOL-${String(sol).padStart(4, "0")}`;
    target.setAttribute("aria-label", `Current SOL: ${sol.toLocaleString("en-US")}`);
  };

  const revealPanels = () => {
    const panels = document.querySelectorAll(".reveal");
    if (!panels.length || reducedMotion || !("IntersectionObserver" in window)) {
      panels.forEach((panel) => panel.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.08 },
    );

    panels.forEach((panel) => observer.observe(panel));
  };

  const setupMobileNavigation = () => {
    const navigator = document.querySelector("[data-mobile-nav]");
    const trigger = navigator?.querySelector("[data-mobile-nav-trigger]");
    const panel = document.querySelector("[data-mobile-nav-panel]");
    const currentCode = navigator?.querySelector("[data-mobile-nav-code]");
    const currentLabel = navigator?.querySelector("[data-mobile-nav-label]");
    const progress = navigator?.querySelector("[data-mobile-nav-progress]");
    const scrim = document.querySelector("[data-mobile-nav-scrim]");
    const closeButton = panel?.querySelector("[data-mobile-nav-close]");
    const header = document.querySelector(".bridge-header");
    const bridge = document.querySelector(".hero");
    const links = Array.from(panel?.querySelectorAll("a[href^='#']") || []);
    if (!navigator || !trigger || !panel || !currentCode || !currentLabel || !progress || !scrim || !closeButton || !links.length) return;

    const setOpen = (open) => {
      trigger.setAttribute("aria-expanded", String(open));
      panel.setAttribute("aria-hidden", String(!open));
      navigator.classList.toggle("is-open", open);
      document.body.classList.toggle("mobile-nav-open", open);
    };

    trigger.addEventListener("click", () => setOpen(trigger.getAttribute("aria-expanded") !== "true"));
    scrim.addEventListener("click", () => setOpen(false));
    closeButton.addEventListener("click", () => {
      setOpen(false);
      trigger.focus();
    });
    links.forEach((link) => link.addEventListener("click", () => setOpen(false)));

    document.addEventListener("click", (event) => {
      if (!navigator.contains(event.target) && !panel.contains(event.target)) setOpen(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || trigger.getAttribute("aria-expanded") !== "true") return;
      setOpen(false);
      trigger.focus();
    });

    let queued = false;
    const update = () => {
      const headerHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height"));
      const marker = headerHeight + window.innerHeight * 0.28;
      let active = links[0];

      links.forEach((link) => {
        const section = document.querySelector(link.getAttribute("href"));
        if (section && section.getBoundingClientRect().top <= marker) active = link;
      });

      links.forEach((link) => {
        if (link === active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });

      currentCode.textContent = active.dataset.navCode;
      currentLabel.textContent = active.dataset.navLabel;
      trigger.setAttribute("aria-label", `Open deck navigation. Current section: ${active.dataset.navLabel.toLowerCase()}`);
      header?.classList.toggle("is-beyond-bridge", Boolean(bridge && bridge.getBoundingClientRect().bottom <= headerHeight));

      const maximum = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      progress.style.transform = `scaleX(${Math.min(1, Math.max(0, window.scrollY / maximum))})`;
      queued = false;
    };

    const requestUpdate = () => {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(update);
    };

    update();
    setOpen(false);
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    window.addEventListener("hashchange", requestUpdate);
  };

  const readableDate = (rawDate) => {
    const date = new Date(rawDate);
    if (Number.isNaN(date.getTime())) return "RECENT LOG";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    })
      .format(date)
      .toUpperCase();
  };

  const plainText = (html) => {
    const parsed = new DOMParser().parseFromString(html, "text/html");
    return (parsed.body.textContent || "").replace(/\s+/g, " ").trim();
  };

  const makeLogCard = (item) => {
    const title = item.querySelector("title")?.textContent?.trim() || "Untitled transmission";
    const href = item.querySelector("link")?.textContent?.trim() || "https://notes.tiago.dev";
    const description = plainText(item.querySelector("description")?.textContent || "");
    const date = readableDate(item.querySelector("pubDate")?.textContent || "");

    const card = document.createElement("a");
    card.className = "log-card";
    card.href = href;
    card.target = "_blank";
    card.rel = "noreferrer";

    const time = document.createElement("time");
    time.textContent = date;

    const body = document.createElement("div");
    const heading = document.createElement("h3");
    heading.textContent = title;
    const excerpt = document.createElement("p");
    excerpt.textContent = description || "Open this transmission in the complete ship archive.";
    body.append(heading, excerpt);

    card.append(time, body);
    return card;
  };

  const loadCaptainLogs = async () => {
    const feed = document.querySelector("[data-log-feed]");
    const state = document.querySelector("[data-feed-state]");
    const script = document.querySelector("script[data-feed]");
    if (!feed || !state || !script?.dataset.feed) return;

    try {
      const response = await fetch(script.dataset.feed, {
        headers: { Accept: "application/rss+xml, application/xml, text/xml" },
      });
      if (!response.ok) throw new Error(`Feed returned ${response.status}`);

      const source = await response.text();
      const xml = new DOMParser().parseFromString(source, "application/xml");
      if (xml.querySelector("parsererror")) throw new Error("Feed could not be decoded");

      const items = Array.from(xml.querySelectorAll("item")).slice(0, 4);
      if (!items.length) throw new Error("Feed has no entries");

      feed.replaceChildren(...items.map(makeLogCard));
      feed.setAttribute("aria-busy", "false");
      state.dataset.state = "online";
      state.innerHTML = '<i class="status-dot"></i> LIVE FEED';
    } catch (error) {
      const fallback = document.createElement("a");
      fallback.className = "log-card";
      fallback.href = "https://notes.tiago.dev";
      fallback.target = "_blank";
      fallback.rel = "noreferrer";
      fallback.innerHTML = "<time>COMMS DELAY</time><div><h3>Ship archive remains available</h3><p>The live receiver is temporarily out of range. Open the archive to continue reading.</p></div>";
      feed.replaceChildren(fallback);
      feed.setAttribute("aria-busy", "false");
      state.dataset.state = "cached";
      state.textContent = "DIRECT LINK";
    }
  };

  const startStarfield = () => {
    const canvas = document.querySelector("#starfield");
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let width = 0;
    let height = 0;
    let scale = 1;
    let animationFrame = 0;
    let stars = [];

    const makeStar = (fresh = false) => ({
      x: (Math.random() - 0.5) * width,
      y: (Math.random() - 0.5) * height,
      z: fresh ? width : Math.random() * width,
      size: Math.random() * 1.15 + 0.25,
      warm: Math.random() > 0.86,
    });

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      scale = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * scale);
      canvas.height = Math.floor(height * scale);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(scale, 0, 0, scale, 0, 0);
      const count = Math.max(70, Math.min(180, Math.floor((width * height) / 9000)));
      stars = Array.from({ length: count }, () => makeStar());
    };

    const draw = (moving = true) => {
      context.clearRect(0, 0, width, height);
      context.save();
      context.translate(width / 2, height / 2);

      stars.forEach((star, index) => {
        if (moving) star.z -= width > 900 ? 1.1 : 0.65;
        if (star.z <= 1) stars[index] = star = makeStar(true);

        const perspective = 110 / star.z;
        const x = star.x * perspective;
        const y = star.y * perspective;
        const radius = Math.min(2.1, star.size * (1 + (width - star.z) / width));
        if (Math.abs(x) > width / 2 || Math.abs(y) > height / 2) {
          stars[index] = makeStar(true);
          return;
        }

        context.beginPath();
        context.fillStyle = star.warm ? "rgba(255, 175, 72, 0.8)" : "rgba(196, 232, 235, 0.76)";
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
      });

      context.restore();
      if (moving) animationFrame = window.requestAnimationFrame(() => draw(true));
    };

    resize();
    draw(!reducedMotion);
    window.addEventListener("resize", () => {
      window.cancelAnimationFrame(animationFrame);
      resize();
      draw(!reducedMotion);
    }, { passive: true });
  };

  setupShipIntro();
  updateClock();
  updateCurrentSol();
  revealPanels();
  setupMobileNavigation();
  loadCaptainLogs();
  startStarfield();
})();
