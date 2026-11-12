/* =====================================================
   MindScope AI – Frontend logic
   Modules: config · helpers · toasts · navigation ·
   scroll reveal · validation · API call · result UI
   ===================================================== */
(() => {
  "use strict";

  /* ---------- Configuration ---------- */
  const API_URL = "http://127.0.0.1:8000/predict";
  const REQUEST_TIMEOUT_MS = 20000;
  const GAUGE_CIRCUMFERENCE = 2 * Math.PI * 94; // matches r="94" in the SVG

  /**
   * Field specification. Names match the FastAPI/Pydantic schema exactly.
   * type: "int" | "float" | "select" | "country"
   */
  const FIELDS = [
    { name: "age", label: "Age", type: "int", min: 10, max: 100 },
    { name: "gender", label: "Gender", type: "select", options: ["Male", "Female"] },
    { name: "country", label: "Country", type: "country",
      options: ["India", "USA", "Canada", "Australia", "UK", "Germany", "Mexico", "Turkey", "France", "Other"] },
    { name: "academic_level", label: "Academic level", type: "select", options: ["Undergraduate", "Graduate", "High School"] },
    { name: "most_used_platform", label: "Most used platform", type: "select",
      options: ["Facebook", "LinkedIn", "Instagram", "Snapchat", "Twitter", "YouTube", "TikTok", "LINE", "KakaoTalk", "VKontakte", "WhatsApp", "WeChat"] },
    { name: "purpose_of_use", label: "Purpose of use", type: "select", options: ["Networking", "Education", "Entertainment", "News"] },
    { name: "avg_daily_usage_hours", label: "Average daily usage", type: "float", min: 0, max: 24 },
    { name: "daily_unlocks", label: "Daily unlocks", type: "int", min: 0 },
    { name: "study_hours", label: "Study hours", type: "float", min: 0, max: 24 },
    { name: "physical_activity_hours", label: "Physical activity hours", type: "float", min: 0, max: 24 },
    { name: "sleep_hours_per_night", label: "Sleep hours", type: "float", min: 0, max: 24 },
    { name: "stress_level", label: "Stress level", type: "select", options: ["Low", "Medium", "High", "Very High"] },
  ];

  /* ---------- DOM references ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const form = $("#predictForm");
  const submitBtn = $("#submitBtn");
  const resultWrap = $("#resultWrap");
  const scoreEl = $("#scoreValue");
  const gaugeBar = $("#gaugeBar");
  const toastStack = $("#toastStack");

  /* ---------- Toasts ---------- */
  const TOAST_ICONS = { success: "i-check", error: "i-alert", info: "i-cpu" };

  function showToast(type, title, message, duration = 5500) {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.setAttribute("role", type === "error" ? "alert" : "status");
    toast.innerHTML = `
      <svg class="icon t-icon"><use href="#${TOAST_ICONS[type] || TOAST_ICONS.info}"/></svg>
      <div><strong></strong><span class="t-msg"></span></div>
      <button type="button" aria-label="Dismiss notification"><svg class="icon"><use href="#i-x"/></svg></button>`;
    // textContent keeps any server-provided text safe from HTML injection
    $("strong", toast).textContent = title;
    $(".t-msg", toast).textContent = message;

    const dismiss = () => {
      toast.classList.add("leaving");
      toast.addEventListener("animationend", () => toast.remove(), { once: true });
    };
    $("button", toast).addEventListener("click", dismiss);
    toastStack.appendChild(toast);
    if (duration) setTimeout(dismiss, duration);
  }

  /* ---------- Navigation ---------- */
  const navbar = $("#navbar");
  const navToggle = $("#navToggle");
  const navLinks = $("#navLinks");

  function setMenu(open) {
    navLinks.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  }
  navToggle.addEventListener("click", () => setMenu(!navLinks.classList.contains("open")));
  $$("a", navLinks).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("click", (e) => {
    if (!navbar.contains(e.target)) setMenu(false);
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  // Sticky bar styling + active link highlighting
  const sectionIds = ["home", "about", "prediction", "contact"];
  const navAnchors = $$(".nav-link");

  function onScroll() {
    navbar.classList.toggle("scrolled", window.scrollY > 10);
    const probe = window.scrollY + window.innerHeight * 0.35;
    let current = "home";
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= probe) current = id;
    });
    // Reaching the bottom of the page should highlight Contact
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) current = "contact";
    navAnchors.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${current}`));
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll reveal ---------- */
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Validation ---------- */
  function fieldWrapper(name) {
    return $(`.field[data-field="${name}"]`);
  }

  function setFieldState(spec, message) {
    const wrap = fieldWrapper(spec.name);
    const err = $(".error", wrap);
    wrap.classList.toggle("invalid", Boolean(message));
    wrap.classList.toggle("valid", !message);
    err.textContent = message || "";
    $("input, select", wrap).setAttribute("aria-invalid", message ? "true" : "false");
  }

  /** Returns { value, error } for one field. */
  function readField(spec) {
    const el = form.elements[spec.name];
    const raw = (el.value || "").trim();

    if (raw === "") {
      const action = spec.type === "select" ? "Please select" : "Please enter";
      return { error: `${action} ${spec.label.toLowerCase()}.` };
    }

    if (spec.type === "select") {
      return spec.options.includes(raw) ? { value: raw } : { error: `Choose a valid ${spec.label.toLowerCase()}.` };
    }

    if (spec.type === "country") {
      // Allow case-insensitive typing but send the exact capitalization the model expects.
      const match = spec.options.find((o) => o.toLowerCase() === raw.toLowerCase());
      return match ? { value: match } : { error: "Pick a country from the list (use “Other” if yours is missing)." };
    }

    const num = Number(raw);
    if (!Number.isFinite(num)) return { error: `${spec.label} must be a number.` };
    if (spec.type === "int" && !Number.isInteger(num)) return { error: `${spec.label} must be a whole number.` };
    if (spec.min !== undefined && num < spec.min) return { error: `${spec.label} must be at least ${spec.min}.` };
    if (spec.max !== undefined && num > spec.max) return { error: `${spec.label} must be at most ${spec.max}.` };
    return { value: num }; // real number, never a string
  }

  /** Validates all fields. Returns payload object or null if invalid. */
  function validateAll() {
    const payload = {};
    let firstInvalid = null;
    FIELDS.forEach((spec) => {
      const { value, error } = readField(spec);
      setFieldState(spec, error);
      if (error) {
        if (!firstInvalid) firstInvalid = form.elements[spec.name];
      } else {
        payload[spec.name] = value;
      }
    });
    if (firstInvalid) {
      firstInvalid.focus({ preventScroll: false });
      return null;
    }
    return payload;
  }

  // Live validation after a field has been touched
  FIELDS.forEach((spec) => {
    const el = form.elements[spec.name];
    const check = () => {
      const { error } = readField(spec);
      setFieldState(spec, error);
    };
    el.addEventListener("blur", check);
    el.addEventListener("change", check);
    el.addEventListener("input", () => {
      if (fieldWrapper(spec.name).classList.contains("invalid")) check();
    });
  });

  /* ---------- API call ---------- */
  /** Turns a FastAPI error body into a readable string. */
  function describeApiError(status, body) {
    if (body && Array.isArray(body.detail)) {
      // Pydantic validation errors (HTTP 422)
      return body.detail
        .map((d) => `${(d.loc || []).filter((p) => p !== "body").join(".") || "request"}: ${d.msg}`)
        .join(" | ");
    }
    if (body && typeof body.detail === "string") return body.detail;
    if (status >= 500) return "The server hit an internal error while running the model.";
    return `The server responded with status ${status}.`;
  }

  async function requestPrediction(payload) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      let body = null;
      try { body = await response.json(); } catch (_) { /* non-JSON body */ }

      if (!response.ok) {
        const err = new Error(describeApiError(response.status, body));
        err.kind = "http";
        throw err;
      }

      const score = body && body.predicted_mental_score;
      if (typeof score !== "number" || !Number.isFinite(score)) {
        const err = new Error("The API response did not contain a numeric “predicted_mental_score”.");
        err.kind = "format";
        throw err;
      }
      return score;
    } catch (error) {
      if (error.kind) throw error;
      const err = new Error(
        error.name === "AbortError"
          ? "The request timed out. Please check that the backend is responding."
          : "Could not reach the prediction server at " + API_URL + ". Make sure FastAPI is running and CORS allows this page."
      );
      err.kind = "network";
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  /* ---------- Result display ---------- */
  let rafId = null;

  function decimalsOf(n) {
    const s = String(n);
    if (s.includes("e")) return 2;
    const part = s.split(".")[1];
    return part ? Math.min(part.length, 4) : 0;
  }

  function animateScore(target) {
    const decimals = decimalsOf(target);
    const duration = 1800;
    const start = performance.now();
    cancelAnimationFrame(rafId);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { scoreEl.textContent = target.toFixed(decimals); return; }

    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      scoreEl.textContent = (target * eased).toFixed(decimals);
      if (t < 1) rafId = requestAnimationFrame(tick);
      else scoreEl.textContent = target.toFixed(decimals);
    };
    rafId = requestAnimationFrame(tick);
  }

  function showResult(score) {
    resultWrap.hidden = false;
    // Reset ring, then sweep it (decorative – the model's scale is unknown)
    gaugeBar.style.transition = "none";
    gaugeBar.style.strokeDashoffset = GAUGE_CIRCUMFERENCE;
    scoreEl.textContent = "0";
    void gaugeBar.getBoundingClientRect(); // force reflow
    gaugeBar.style.transition = "";
    requestAnimationFrame(() => { gaugeBar.style.strokeDashoffset = 0; });

    animateScore(score);
    setTimeout(() => resultWrap.scrollIntoView({ behavior: "smooth", block: "center" }), 120);
  }

  /* ---------- Form events ---------- */
  function setLoading(isLoading) {
    submitBtn.classList.toggle("is-loading", isLoading);
    submitBtn.disabled = isLoading;
    submitBtn.setAttribute("aria-busy", String(isLoading));
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = validateAll();
    if (!payload) {
      showToast("error", "Please check your inputs", "Some fields are missing or out of range.");
      return;
    }

    setLoading(true);
    try {
      const score = await requestPrediction(payload);
      showResult(score);
      showToast("success", "Prediction ready", "Your model-generated score is shown below.");
    } catch (error) {
      const titles = { http: "Prediction failed", network: "Connection problem", format: "Unexpected response" };
      showToast("error", titles[error.kind] || "Something went wrong", error.message, 9000);
    } finally {
      setLoading(false);
    }
  });

  form.addEventListener("reset", () => {
    // Wait for native reset, then clear validation visuals
    setTimeout(() => {
      $$(".field", form).forEach((f) => {
        f.classList.remove("invalid", "valid");
        $(".error", f).textContent = "";
      });
      resultWrap.hidden = true;
      cancelAnimationFrame(rafId);
    }, 0);
  });

  $("#againBtn").addEventListener("click", () => {
    resultWrap.hidden = true;
    cancelAnimationFrame(rafId);
    document.getElementById("prediction").scrollIntoView({ behavior: "smooth", block: "start" });
    form.elements[FIELDS[0].name].focus({ preventScroll: true });
  });

  /* ---------- Misc ---------- */
  $("#year").textContent = new Date().getFullYear();
})();
