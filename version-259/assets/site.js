(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    var input = document.querySelector('[data-filter-input]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var regionSelect = document.querySelector('[data-filter-region]');
    var grid = document.querySelector('[data-filter-grid]');

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function filterCards() {
        if (!grid) {
            return;
        }
        var keyword = normalize(input ? input.value : '');
        var typeValue = normalize(typeSelect ? typeSelect.value : '');
        var regionValue = normalize(regionSelect ? regionSelect.value : '');
        var cards = grid.querySelectorAll('.movie-card, .ranking-card');
        cards.forEach(function (card) {
            var dataset = card.dataset || {};
            var haystack = normalize([
                dataset.title,
                dataset.region,
                dataset.type,
                dataset.year,
                dataset.genre,
                dataset.tags,
                card.textContent
            ].join(' '));
            var typeMatch = !typeValue || normalize(dataset.type || card.getAttribute('data-type')).indexOf(typeValue) !== -1;
            var regionMatch = !regionValue || normalize(dataset.region || card.getAttribute('data-region')).indexOf(regionValue) !== -1;
            var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
            card.classList.toggle('is-hidden', !(typeMatch && regionMatch && keywordMatch));
        });
    }

    [input, typeSelect, regionSelect].forEach(function (el) {
        if (el) {
            el.addEventListener('input', filterCards);
            el.addEventListener('change', filterCards);
        }
    });
})();

function initPlayer(src, videoId, overlayId) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video) {
        return;
    }
    var wrap = video.closest('.player-wrap');
    var started = false;

    function markPlaying() {
        if (wrap) {
            wrap.classList.add('is-playing');
        }
        video.setAttribute('controls', 'controls');
    }

    function attach() {
        if (started) {
            return;
        }
        started = true;
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(src);
            hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
        } else {
            video.src = src;
        }
    }

    function play() {
        attach();
        markPlaying();
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
        }
    }

    if (overlay) {
        overlay.addEventListener('click', play);
    }

    document.querySelectorAll('[data-player-start]').forEach(function (button) {
        button.addEventListener('click', play);
    });

    video.addEventListener('click', function () {
        if (video.paused) {
            play();
        }
    });

    video.addEventListener('play', markPlaying);
}
