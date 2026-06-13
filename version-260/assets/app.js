document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
    setupScrollButtons();
});

function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (!toggle || !panel) {
        return;
    }

    toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
    });
}

function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");

    if (!slider) {
        return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var active = 0;

    function showSlide(index) {
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === active);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === active);
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(active + 1);
        }, 5200);
    }
}

function setupFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]"));

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function applyFilter(value) {
        var keyword = normalize(value);
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute("data-search") || card.textContent);
            var matched = !keyword || haystack.indexOf(keyword) !== -1;
            card.classList.toggle("is-hidden", !matched);
        });

        chips.forEach(function (chip) {
            chip.classList.toggle("is-active", normalize(chip.getAttribute("data-filter-chip")) === keyword);
        });
    }

    inputs.forEach(function (input) {
        input.addEventListener("input", function () {
            applyFilter(input.value);
        });
    });

    chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
            var value = chip.getAttribute("data-filter-chip") || "";
            inputs.forEach(function (input) {
                input.value = value;
            });
            applyFilter(value);
        });
    });
}

function loadHlsLibrary() {
    if (window.Hls) {
        return Promise.resolve(window.Hls);
    }

    if (window.__hlsLoadingPromise) {
        return window.__hlsLoadingPromise;
    }

    window.__hlsLoadingPromise = new Promise(function (resolve, reject) {
        var script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
        script.async = true;
        script.onload = function () {
            if (window.Hls) {
                resolve(window.Hls);
            } else {
                reject(new Error("HLS 初始化失败"));
            }
        };
        script.onerror = function () {
            reject(new Error("HLS 组件加载失败"));
        };
        document.head.appendChild(script);
    });

    return window.__hlsLoadingPromise;
}

function prepareVideo(wrapper, video, source, errorBox) {
    if (wrapper.__readyPromise) {
        return wrapper.__readyPromise;
    }

    wrapper.__readyPromise = new Promise(function (resolve, reject) {
        if (!source) {
            reject(new Error("未绑定播放源"));
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            resolve();
            return;
        }

        loadHlsLibrary()
            .then(function (Hls) {
                if (!Hls.isSupported()) {
                    reject(new Error("当前浏览器不支持 HLS 播放"));
                    return;
                }

                var hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                wrapper.__hls = hls;
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    resolve();
                });
                hls.on(Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }

                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                        showPlayerError(errorBox, "网络波动，正在重新加载视频。 ");
                        return;
                    }

                    if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                        showPlayerError(errorBox, "媒体加载异常，正在恢复播放。 ");
                        return;
                    }

                    hls.destroy();
                    reject(new Error("视频加载失败"));
                });
            })
            .catch(reject);
    });

    return wrapper.__readyPromise;
}

function showPlayerError(errorBox, message) {
    if (!errorBox) {
        return;
    }

    errorBox.textContent = message;
    errorBox.classList.add("is-visible");
}

function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function (wrapper) {
        var video = wrapper.querySelector("video");
        var button = wrapper.querySelector("[data-play-button]");
        var errorBox = wrapper.querySelector("[data-player-error]");
        var source = wrapper.getAttribute("data-src");

        if (!video || !button) {
            return;
        }

        function startPlayback() {
            if (errorBox) {
                errorBox.classList.remove("is-visible");
                errorBox.textContent = "";
            }

            prepareVideo(wrapper, video, source, errorBox)
                .then(function () {
                    return video.play();
                })
                .catch(function (error) {
                    showPlayerError(errorBox, error.message || "播放失败，请稍后重试。 ");
                });
        }

        button.addEventListener("click", startPlayback);
        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            } else {
                video.pause();
            }
        });
        video.addEventListener("play", function () {
            wrapper.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
            wrapper.classList.remove("is-playing");
        });
    });
}

function setupScrollButtons() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-scroll-player]"));

    buttons.forEach(function (button) {
        button.addEventListener("click", function (event) {
            event.preventDefault();
            var player = document.querySelector("[data-player]");
            if (player) {
                player.scrollIntoView({ behavior: "smooth", block: "center" });
                var playButton = player.querySelector("[data-play-button]");
                if (playButton) {
                    playButton.click();
                }
            }
        });
    });
}
