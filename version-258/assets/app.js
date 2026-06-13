(function() {
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', function() {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-hero-carousel]').forEach(function(carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function() {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function() {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function() {
                show(index + 1);
                restart();
            });
        }

        show(0);
        restart();
    });

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    document.querySelectorAll('[data-filter-grid]').forEach(function(grid) {
        var input = document.querySelector('.movie-filter-input');
        var selects = Array.prototype.slice.call(document.querySelectorAll('.movie-filter-select'));
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card, .rank-item'));
        var empty = document.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var startQuery = params.get('q');

        if (input && startQuery) {
            input.value = startQuery;
        }

        function applyFilter() {
            var query = normalize(input ? input.value : '');
            var active = 0;

            cards.forEach(function(card) {
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var matched = !query || text.indexOf(query) !== -1;

                selects.forEach(function(select) {
                    var key = select.getAttribute('data-filter-key');
                    var value = normalize(select.value);
                    if (value && normalize(card.getAttribute('data-' + key)) !== value) {
                        matched = false;
                    }
                });

                card.classList.toggle('is-hidden-card', !matched);
                if (matched) {
                    active += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', active === 0);
            }
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        selects.forEach(function(select) {
            select.addEventListener('change', applyFilter);
        });

        applyFilter();
    });

    document.querySelectorAll('.video-player').forEach(function(player) {
        var video = player.querySelector('video');
        var overlay = player.querySelector('.player-overlay');
        var stream = player.getAttribute('data-stream');
        var loaded = false;
        var hls = null;

        function bindStream() {
            if (!video || !stream || loaded) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }

            loaded = true;
        }

        function startPlay() {
            bindStream();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            if (video) {
                video.setAttribute('controls', 'controls');
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function() {
                        if (overlay) {
                            overlay.classList.remove('is-hidden');
                        }
                    });
                }
            }
        }

        if (overlay) {
            overlay.addEventListener('click', startPlay);
        }

        if (video) {
            video.addEventListener('click', function() {
                if (video.paused) {
                    startPlay();
                }
            });
            video.addEventListener('play', function() {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
            });
            video.addEventListener('pause', function() {
                if (video.currentTime === 0 && overlay) {
                    overlay.classList.remove('is-hidden');
                }
            });
        }

        window.addEventListener('beforeunload', function() {
            if (hls) {
                hls.destroy();
            }
        });
    });
})();
