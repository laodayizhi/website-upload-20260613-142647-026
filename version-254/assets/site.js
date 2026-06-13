(function () {
  var mobileButton = document.querySelector('[data-mobile-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (mobileButton && mobilePanel) {
    mobileButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-dropdown-button]').forEach(function (button) {
    var panel = button.parentElement.querySelector('[data-dropdown-panel]');
    if (!panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')));
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
      });
    }

    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  var searchInput = document.querySelector('[data-search-input]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var empty = document.querySelector('[data-empty-result]');

  if (searchInput && cards.length) {
    searchInput.addEventListener('input', function () {
      var keyword = searchInput.value.trim().toLowerCase();
      var shown = 0;

      cards.forEach(function (card) {
        var content = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-genre') || '',
          card.getAttribute('data-tags') || ''
        ].join(' ').toLowerCase();
        var matched = !keyword || content.indexOf(keyword) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          shown += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', shown === 0);
      }
    });
  }
})();
