(function () {
  var root = document.documentElement;
  var toggle = document.querySelector(".theme-toggle");

  function currentTheme() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function syncToggle(theme) {
    if (!toggle) return;
    var dark = theme === "dark";
    toggle.setAttribute("aria-pressed", dark ? "true" : "false");
    toggle.setAttribute("aria-label", dark ? "Activar tema claro" : "Activar tema oscuro");
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    syncToggle(theme);
    document.dispatchEvent(new CustomEvent("themechange"));
  }

  syncToggle(currentTheme());

  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("theme", next);
      } catch (err) {
        /* si el almacenamiento está bloqueado, el tema igual cambia en esta visita */
      }
      applyTheme(next);
    });
  }

  var scheme = window.matchMedia("(prefers-color-scheme: dark)");
  if (scheme.addEventListener) {
    scheme.addEventListener("change", function (event) {
      var stored = null;
      try {
        stored = localStorage.getItem("theme");
      } catch (err) {
        stored = null;
      }
      if (stored !== "light" && stored !== "dark") {
        applyTheme(event.matches ? "dark" : "light");
      }
    });
  }

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealables = document.querySelectorAll(".reveal");
  root.classList.add("js");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealables.forEach(function (node) {
      node.classList.add("is-in");
    });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );
    revealables.forEach(function (node) {
      observer.observe(node);
    });
  }

  var route = document.querySelector("[data-route]");
  var routeBar = route ? route.querySelector(".route-progress") : null;
  if (route && routeBar && !reduceMotion) {
    var updateRoute = function () {
      var rect = route.getBoundingClientRect();
      var total = rect.height || 1;
      var traveled = window.innerHeight * 0.72 - rect.top;
      var progress = Math.max(0, Math.min(1, traveled / total));
      routeBar.style.transform = "scaleY(" + progress + ")";
    };
    updateRoute();
    document.addEventListener("scroll", updateRoute, { passive: true });
    window.addEventListener("resize", updateRoute);
  }

  var canvas = document.getElementById("chart-corea");
  if (!canvas || !window.Chart) return;

  var labels = [
    "2022 T1",
    "2022 T2",
    "2022 T3",
    "2022 T4",
    "2023 T1",
    "2023 T2",
    "2023 T3",
    "2023 T4",
    "2024 T1",
    "2024 T2"
  ];
  var values = [42, 48, 45, 61, 58, 72, 69, 80, 77, 91];
  var chart = null;

  function cssVar(name) {
    return getComputedStyle(root).getPropertyValue(name).trim();
  }

  function renderChart() {
    if (chart) chart.destroy();
    chart = new window.Chart(canvas, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Índice ilustrativo",
            data: values,
            borderColor: cssVar("--lagoon"),
            backgroundColor: cssVar("--mist"),
            pointBackgroundColor: cssVar("--card"),
            pointBorderColor: cssVar("--clay"),
            pointBorderWidth: 2,
            pointRadius: 4,
            borderWidth: 2,
            tension: 0.25,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: reduceMotion ? false : { duration: 700 },
        plugins: {
          legend: {
            labels: { color: cssVar("--ink"), font: { family: cssVar("--sans") } }
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return "Índice ilustrativo: " + context.parsed.y + " (dato de ejemplo)";
              }
            }
          }
        },
        scales: {
          x: {
            ticks: { color: cssVar("--ink-soft") },
            grid: { color: cssVar("--line") }
          },
          y: {
            beginAtZero: true,
            suggestedMax: 100,
            title: {
              display: true,
              text: "Índice ilustrativo (sin unidad real)",
              color: cssVar("--ink-soft")
            },
            ticks: { color: cssVar("--ink-soft") },
            grid: { color: cssVar("--line") }
          }
        }
      }
    });
  }

  renderChart();
  document.addEventListener("themechange", renderChart);
})();
