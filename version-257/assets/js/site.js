(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");

        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                var isOpen = mobileNav.classList.toggle("is-open");
                toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var active = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                active = (index + slides.length) % slides.length;
                slides.forEach(function (slide, idx) {
                    slide.classList.toggle("active", idx === active);
                });
                dots.forEach(function (dot, idx) {
                    dot.classList.toggle("active", idx === active);
                });
            }

            function start() {
                if (timer) {
                    clearInterval(timer);
                }
                timer = setInterval(function () {
                    show(active + 1);
                }, 5200);
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
                    start();
                });
            });

            show(0);
            start();
        }

        var filterForm = document.querySelector("[data-filter-form]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var empty = document.querySelector("[data-filter-empty]");

        if (filterForm && cards.length) {
            var qInput = filterForm.querySelector("[data-filter-q]");
            var yearSelect = filterForm.querySelector("[data-filter-year]");
            var regionSelect = filterForm.querySelector("[data-filter-region]");
            var typeSelect = filterForm.querySelector("[data-filter-type]");
            var params = new URLSearchParams(window.location.search);
            var initialQ = params.get("q") || "";

            if (initialQ && qInput) {
                qInput.value = initialQ;
            }

            function normalize(value) {
                return (value || "").toString().trim().toLowerCase();
            }

            function applyFilter() {
                var q = normalize(qInput && qInput.value);
                var year = normalize(yearSelect && yearSelect.value);
                var region = normalize(regionSelect && regionSelect.value);
                var type = normalize(typeSelect && typeSelect.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-category")
                    ].join(" "));

                    var matched = true;
                    if (q && haystack.indexOf(q) === -1) {
                        matched = false;
                    }
                    if (year && normalize(card.getAttribute("data-year")) !== year) {
                        matched = false;
                    }
                    if (region && normalize(card.getAttribute("data-region")) !== region) {
                        matched = false;
                    }
                    if (type && normalize(card.getAttribute("data-type")) !== type) {
                        matched = false;
                    }

                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [qInput, yearSelect, regionSelect, typeSelect].forEach(function (control) {
                if (!control) {
                    return;
                }
                control.addEventListener("input", applyFilter);
                control.addEventListener("change", applyFilter);
            });

            applyFilter();
        }
    });
})();
