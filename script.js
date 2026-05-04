/**
 * IALS site scripts
 * EDIT: Adjust scroll offset, selectors, or alert message if needed
 */
(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var navLinks = document.querySelectorAll(".nav-link");
  var sections = document.querySelectorAll("main section[id]");
  var toggle = document.getElementById("nav-toggle");
  var menu = document.getElementById("nav-menu");
  var yearEl = document.getElementById("year");
  var heroSection = document.getElementById("home");
  var heroScene = document.getElementById("hero-scene");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  /* Current year in footer */
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* Sticky header gains depth after scroll */
  function updateHeaderElevation() {
    if (!header) return;
    var y = window.scrollY || document.documentElement.scrollTop;
    header.classList.toggle("is-elevated", y > 16);
  }

  window.addEventListener("scroll", updateHeaderElevation, { passive: true });
  updateHeaderElevation();

  /* Hero: subtle 3D tilt toward cursor (desktop only, no reduced motion) */
  function bindHeroTilt() {
    if (!heroSection || !heroScene) return;
    if (reduceMotion.matches || !finePointer.matches) return;

    var maxX = 11;
    var maxY = 14;

    heroSection.addEventListener(
      "mousemove",
      function (e) {
        var rect = heroSection.getBoundingClientRect();
        var nx = (e.clientX - rect.left) / rect.width - 0.5;
        var ny = (e.clientY - rect.top) / rect.height - 0.5;
        heroScene.style.setProperty("--tilt-x", (-ny * maxX).toFixed(2) + "deg");
        heroScene.style.setProperty("--tilt-y", (nx * maxY).toFixed(2) + "deg");
      },
      { passive: true }
    );

    heroSection.addEventListener("mouseleave", function () {
      heroScene.style.setProperty("--tilt-x", "0deg");
      heroScene.style.setProperty("--tilt-y", "0deg");
    });
  }

  bindHeroTilt();

  /* Hero video: respect reduced motion (CSS swaps to PNG; pause to save work) */
  function bindHeroVideo() {
    var video = document.querySelector(".hero-phone-video");
    if (!video) return;
    function sync() {
      if (reduceMotion.matches) {
        video.pause();
        video.removeAttribute("autoplay");
      } else {
        video.setAttribute("autoplay", "");
        var p = video.play();
        if (p && typeof p.then === "function") {
          p.catch(function () {});
        }
      }
    }
    sync();
    reduceMotion.addEventListener("change", sync);
  }

  bindHeroVideo();

  /* Smooth scroll offset for sticky header (native smooth scroll + manual offset) */
  function scrollToHash(hash, pushHistory) {
    if (!hash || hash === "#") return;
    var target = document.querySelector(hash);
    if (!target) return;

    var headerH = header ? header.offsetHeight : 64;
    var extra = 12;
    var top = target.getBoundingClientRect().top + window.pageYOffset - headerH - extra;

    window.scrollTo({ top: top, behavior: "smooth" });

    if (pushHistory !== false) {
      history.pushState(null, "", hash);
    }
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      var el = document.querySelector(href);
      if (!el) return;
      e.preventDefault();
      scrollToHash(href);
      if (menu && toggle) {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  });

  /* Mobile menu */
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* Active nav highlight */
  function setActiveLink() {
    var scrollY = window.scrollY || document.documentElement.scrollTop;
    var headerH = header ? header.offsetHeight : 64;
    var current = "";

    sections.forEach(function (sec) {
      var rect = sec.getBoundingClientRect();
      var docTop = rect.top + scrollY;
      var activateLine = docTop - headerH - 24;
      if (scrollY >= activateLine) {
        current = sec.getAttribute("id") || "";
      }
    });

    navLinks.forEach(function (link) {
      link.classList.remove("is-active");
      if (link.getAttribute("href") === "#" + current) {
        link.classList.add("is-active");
      }
    });
  }

  window.addEventListener("scroll", setActiveLink, { passive: true });
  window.addEventListener("resize", setActiveLink);
  setActiveLink();

  /* On load with hash */
  if (window.location.hash) {
    window.addEventListener("load", function () {
      scrollToHash(window.location.hash, false);
    });
  }

  /* Contact form — no backend; alert on submit */
  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("cf-name");
      var email = document.getElementById("cf-email");
      var subject = document.getElementById("cf-subject");
      var message = document.getElementById("cf-message");

      if (!name || !email || !subject || !message) return;

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // EDIT: Customize confirmation text
      alert(
        "Thank you, " +
          name.value.trim() +
          ".\n\nYour message has been noted (demo only — no server).\n\nSubject: " +
          subject.value.trim()
      );
      form.reset();
    });
  }
})();
