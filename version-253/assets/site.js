(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMobileNav() {
    var button = qs('[data-nav-toggle]');
    var menu = qs('[data-nav-menu]');
    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var current = 0;
    var timer = null;

    function activate(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(current + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        activate(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function initFilterPanels() {
    qsa('[data-filter-scope]').forEach(function (scope) {
      var cards = qsa('[data-movie-card]', scope.parentElement || document);
      if (!cards.length) {
        cards = qsa('[data-movie-card]');
      }

      var input = qs('[data-filter-input]', scope);
      var region = qs('[data-filter-region]', scope);
      var type = qs('[data-filter-type]', scope);
      var year = qs('[data-filter-year]', scope);
      var genre = qs('[data-filter-genre]', scope);
      var count = qs('[data-result-count]', scope);
      var reset = qs('[data-filter-reset]', scope);
      var params = new URLSearchParams(window.location.search);

      if (input && params.get('q')) {
        input.value = params.get('q');
      }
      if (genre && params.get('genre')) {
        genre.value = params.get('genre');
      }
      if (region && params.get('region')) {
        region.value = params.get('region');
      }
      if (type && params.get('type')) {
        type.value = params.get('type');
      }
      if (year && params.get('year')) {
        year.value = params.get('year');
      }

      function applyFilters() {
        var query = normalize(input && input.value);
        var selectedRegion = normalize(region && region.value);
        var selectedType = normalize(type && type.value);
        var selectedYear = normalize(year && year.value);
        var selectedGenre = normalize(genre && genre.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.tags,
            card.textContent
          ].join(' '));

          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var matchesRegion = !selectedRegion || normalize(card.dataset.region).indexOf(selectedRegion) !== -1;
          var matchesType = !selectedType || normalize(card.dataset.type).indexOf(selectedType) !== -1;
          var matchesYear = !selectedYear || normalize(card.dataset.year) === selectedYear;
          var matchesGenre = !selectedGenre || normalize(card.dataset.tags).indexOf(selectedGenre) !== -1;
          var show = matchesQuery && matchesRegion && matchesType && matchesYear && matchesGenre;

          card.classList.toggle('is-hidden', !show);
          if (show) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = visible + ' 部影片';
        }
      }

      [input, region, type, year, genre].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilters);
          control.addEventListener('change', applyFilters);
        }
      });

      if (reset) {
        reset.addEventListener('click', function () {
          [input, region, type, year, genre].forEach(function (control) {
            if (control) {
              control.value = '';
            }
          });
          applyFilters();
        });
      }

      applyFilters();
    });
  }

  function renderSearchCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span class="badge">' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="movie-poster" href="' + escapeHtml(item.url) + '">',
      '    <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '在线观看" loading="lazy" onerror="this.removeAttribute(\'src\'); this.classList.add(\'image-missing\');">',
      '    <span class="poster-gradient"></span>',
      '    <span class="poster-play" aria-hidden="true">▶</span>',
      '    <span class="poster-year">' + escapeHtml(item.year) + '</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <div class="movie-meta-line"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
      '    <h3><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>',
      '    <p>' + escapeHtml(item.oneLine) + '</p>',
      '    <div class="badge-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('\n');
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initDynamicSearch() {
    var app = qs('[data-dynamic-search]');
    if (!app || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    var input = qs('[data-search-input]', app);
    var category = qs('[data-search-category]', app);
    var reset = qs('[data-search-reset]', app);
    var results = qs('[data-search-results]', app);
    var count = qs('[data-search-count]', app);
    var params = new URLSearchParams(window.location.search);

    if (input && params.get('q')) {
      input.value = params.get('q');
    }
    if (category && params.get('category')) {
      category.value = params.get('category');
    }

    function apply() {
      var query = normalize(input && input.value);
      var selectedCategory = normalize(category && category.value);
      var matched = window.MOVIE_SEARCH_DATA.filter(function (item) {
        var haystack = normalize([
          item.title,
          item.region,
          item.type,
          item.year,
          item.genre,
          item.oneLine,
          (item.tags || []).join(' ')
        ].join(' '));
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesCategory = !selectedCategory || normalize(item.category) === selectedCategory;
        return matchesQuery && matchesCategory;
      });

      if (count) {
        count.textContent = matched.length + ' 部影片';
      }
      if (results) {
        results.innerHTML = matched.slice(0, 240).map(renderSearchCard).join('\n');
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    if (category) {
      category.addEventListener('change', apply);
    }
    if (reset) {
      reset.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (category) {
          category.value = '';
        }
        apply();
      });
    }
    apply();
  }

  function initScrollToPlayer() {
    qsa('[data-scroll-to-player]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        var player = qs('[data-player]');
        if (player) {
          player.scrollIntoView({ behavior: 'smooth', block: 'center' });
          var trigger = qs('[data-player-trigger]', player);
          if (trigger) {
            trigger.focus();
          }
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initHero();
    initFilterPanels();
    initDynamicSearch();
    initScrollToPlayer();
  });
})();
