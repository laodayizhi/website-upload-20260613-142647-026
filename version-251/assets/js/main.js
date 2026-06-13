(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
        });
    }

    var carousel = document.querySelector('[data-hero-carousel]');

    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function startCarousel() {
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startCarousel();
            });
        });

        showSlide(0);
        startCarousel();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function yearMatches(cardYear, selectedYear) {
        if (!selectedYear) {
            return true;
        }

        var year = Number(cardYear || 0);
        var selected = Number(selectedYear || 0);

        if (selected === 2010) {
            return year >= 2010 && year <= 2019;
        }

        if (selected === 2000) {
            return year >= 2000 && year <= 2009;
        }

        return year === selected;
    }

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        var input = scope.querySelector('[data-filter-input]');
        var type = scope.querySelector('[data-filter-type]');
        var region = scope.querySelector('[data-filter-region]');
        var year = scope.querySelector('[data-filter-year]');
        var results = scope.parentElement.querySelector('[data-filter-results]');
        var empty = scope.parentElement.querySelector('[data-empty-state]');

        if (!results) {
            return;
        }

        var cards = Array.prototype.slice.call(results.querySelectorAll('.filter-card'));

        function applyFilter() {
            var q = normalize(input ? input.value : '');
            var selectedType = normalize(type ? type.value : '');
            var selectedRegion = normalize(region ? region.value : '');
            var selectedYear = year ? year.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var title = normalize(card.getAttribute('data-title'));
                var cardType = normalize(card.getAttribute('data-type'));
                var cardRegion = normalize(card.getAttribute('data-region'));
                var cardTags = normalize(card.getAttribute('data-tags'));
                var cardYear = card.getAttribute('data-year');
                var haystack = [title, cardType, cardRegion, cardTags, cardYear].join(' ');
                var matched = true;

                if (q && haystack.indexOf(q) === -1) {
                    matched = false;
                }

                if (selectedType && cardType.indexOf(selectedType) === -1) {
                    matched = false;
                }

                if (selectedRegion && cardRegion.indexOf(selectedRegion) === -1 && cardTags.indexOf(selectedRegion) === -1) {
                    matched = false;
                }

                if (!yearMatches(cardYear, selectedYear)) {
                    matched = false;
                }

                card.classList.toggle('hidden-by-filter', !matched);

                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        }

        [input, type, region, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query && input) {
            input.value = query;
        }

        applyFilter();
    });

    document.querySelectorAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play-button]');
        var message = player.querySelector('[data-player-message]');
        var source = player.getAttribute('data-src') || (video ? video.getAttribute('data-video-src') : '');
        var loaded = false;
        var hlsInstance = null;

        function showMessage(text) {
            if (!message) {
                return;
            }

            message.textContent = text;
            message.classList.toggle('show', Boolean(text));
        }

        function loadVideo() {
            return new Promise(function (resolve, reject) {
                if (!video || !source) {
                    showMessage('暂时无法读取播放地址');
                    reject(new Error('missing video source'));
                    return;
                }

                if (loaded) {
                    resolve();
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });

                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        loaded = true;
                        showMessage('');
                        resolve();
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            showMessage('视频加载失败，请稍后重试');
                            reject(new Error('hls error'));
                        }
                    });
                    return;
                }

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    loaded = true;
                    showMessage('');
                    resolve();
                    return;
                }

                showMessage('当前浏览器暂不支持该播放格式');
                reject(new Error('unsupported hls'));
            });
        }

        function playVideo() {
            loadVideo().then(function () {
                return video.play();
            }).then(function () {
                player.classList.add('playing');
            }).catch(function () {
                player.classList.remove('playing');
            });
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                playVideo();
            });
        }

        if (video) {
            video.addEventListener('play', function () {
                player.classList.add('playing');
            });

            video.addEventListener('pause', function () {
                player.classList.remove('playing');
            });

            video.addEventListener('ended', function () {
                player.classList.remove('playing');
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
