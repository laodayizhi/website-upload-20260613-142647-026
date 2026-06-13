(function () {
    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function normalize(value) {
        return (value || '').toString().toLowerCase().trim();
    }

    ready(function () {
        var toggle = document.querySelector('[data-nav-toggle]');
        var menu = document.querySelector('[data-mobile-nav]');
        if (toggle && menu) {
            toggle.addEventListener('click', function () {
                menu.classList.toggle('is-open');
            });
        }

        all('[data-hero-slider]').forEach(function (slider) {
            var slides = all('.hero-slide', slider);
            var dots = all('[data-hero-dot]', slider);
            var prev = slider.querySelector('[data-hero-prev]');
            var next = slider.querySelector('[data-hero-next]');
            var index = 0;
            var timer;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('is-active', slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('is-active', dotIndex === index);
                });
            }

            function start() {
                window.clearInterval(timer);
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5600);
            }

            if (prev) {
                prev.addEventListener('click', function () {
                    show(index - 1);
                    start();
                });
            }
            if (next) {
                next.addEventListener('click', function () {
                    show(index + 1);
                    start();
                });
            }
            dots.forEach(function (dot) {
                dot.addEventListener('click', function () {
                    show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
                    start();
                });
            });
            show(0);
            start();
        });

        all('.page-searchable').forEach(function (wrap) {
            var input = wrap.querySelector('.site-search');
            var buttons = all('.filter-btn', wrap);
            var items = all('.filter-item', wrap);
            var current = '';

            function apply() {
                var query = normalize(input ? input.value : '');
                items.forEach(function (item) {
                    var haystack = normalize(item.getAttribute('data-search'));
                    var matchesQuery = !query || haystack.indexOf(query) !== -1;
                    var matchesFilter = !current || haystack.indexOf(normalize(current)) !== -1;
                    item.classList.toggle('is-hidden', !(matchesQuery && matchesFilter));
                });
            }

            if (input) {
                input.addEventListener('input', apply);
            }
            buttons.forEach(function (button) {
                button.addEventListener('click', function () {
                    current = button.getAttribute('data-filter') || '';
                    buttons.forEach(function (other) {
                        other.classList.toggle('is-active', other === button);
                    });
                    apply();
                });
            });
            apply();
        });

        all('.static-player').forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('.player-cover');
            var message = player.querySelector('.player-message');
            var streamUrl = player.getAttribute('data-video');
            var hlsInstance = null;
            var loaded = false;

            function setMessage(value) {
                if (message) {
                    message.textContent = value || '';
                }
            }

            function loadAndPlay() {
                if (!video || !streamUrl) {
                    return;
                }
                if (!loaded) {
                    loaded = true;
                    video.controls = true;
                    if (window.Hls && window.Hls.isSupported()) {
                        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                        hlsInstance.loadSource(streamUrl);
                        hlsInstance.attachMedia(video);
                        hlsInstance.on(window.Hls.Events.MEDIA_ATTACHED, function () {
                            video.play().catch(function () {
                                setMessage('点击视频继续播放');
                            });
                        });
                        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                            if (data && data.fatal) {
                                setMessage('视频加载失败，请稍后重试');
                                if (hlsInstance) {
                                    hlsInstance.destroy();
                                    hlsInstance = null;
                                }
                                loaded = false;
                            }
                        });
                    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = streamUrl;
                        video.play().catch(function () {
                            setMessage('点击视频继续播放');
                        });
                    } else {
                        video.src = streamUrl;
                        video.play().catch(function () {
                            setMessage('视频加载失败，请稍后重试');
                        });
                    }
                } else if (video.paused) {
                    video.play().catch(function () {
                        setMessage('点击视频继续播放');
                    });
                } else {
                    video.pause();
                }
                player.classList.add('is-ready');
            }

            if (button) {
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    loadAndPlay();
                });
            }
            player.addEventListener('click', function (event) {
                if (event.target && event.target.tagName && event.target.tagName.toLowerCase() === 'a') {
                    return;
                }
                loadAndPlay();
            });
            if (video) {
                video.addEventListener('play', function () {
                    player.classList.add('is-ready');
                    setMessage('');
                });
                video.addEventListener('pause', function () {
                    if (video.currentTime === 0) {
                        player.classList.remove('is-ready');
                    }
                });
            }
        });
    });
})();
