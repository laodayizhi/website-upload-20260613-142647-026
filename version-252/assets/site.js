(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
            return;
        }
        fn();
    }

    ready(function () {
        var toggle = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".nav-panel");
        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                var open = panel.classList.toggle("open");
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
            });
        }

        initHero();
        initFilters();
        initPlayers();
    });

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                show(Number(dot.getAttribute("data-slide")) || 0);
                start();
            });
        });
        start();
    }

    function initFilters() {
        var lists = Array.prototype.slice.call(document.querySelectorAll("[data-card-list]"));
        if (!lists.length) {
            return;
        }
        var input = document.querySelector("[data-search-input]");
        var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
        var activeFilter = "all";
        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }
        function apply() {
            var query = normalize(input ? input.value : "");
            lists.forEach(function (list) {
                Array.prototype.slice.call(list.querySelectorAll(".movie-card")).forEach(function (card) {
                    var blob = normalize(card.getAttribute("data-search"));
                    var category = card.getAttribute("data-category") || "";
                    var matchedText = !query || blob.indexOf(query) !== -1;
                    var matchedFilter = activeFilter === "all" || category === activeFilter;
                    card.classList.toggle("is-hidden", !(matchedText && matchedFilter));
                });
            });
        }
        if (input) {
            input.addEventListener("input", apply);
        }
        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                activeFilter = chip.getAttribute("data-filter") || "all";
                chips.forEach(function (item) {
                    item.classList.toggle("active", item === chip);
                });
                apply();
            });
        });
        apply();
    }

    function initPlayers() {
        Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (root) {
            var video = root.querySelector("video");
            var overlay = root.querySelector(".player-overlay");
            var stream = root.getAttribute("data-stream");
            var loaded = false;
            var hlsInstance = null;
            if (!video || !stream) {
                return;
            }
            function load() {
                if (loaded) {
                    return;
                }
                loaded = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = stream;
                }
            }
            function play() {
                load();
                root.classList.add("is-playing");
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {});
                }
            }
            if (overlay) {
                overlay.addEventListener("click", play);
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener("play", function () {
                root.classList.add("is-playing");
            });
            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }
})();
