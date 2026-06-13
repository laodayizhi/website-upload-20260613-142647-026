(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-menu]');
    if (menuButton && menu) {
      menuButton.addEventListener('click', function () {
        menu.classList.toggle('open');
      });
    }

    document.querySelectorAll('[data-search-scope]').forEach(function (scope) {
      var input = scope.querySelector('[data-search-input]');
      var button = scope.querySelector('[data-search-button]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
      function filterCards() {
        var value = (input && input.value ? input.value : '').trim().toLowerCase();
        cards.forEach(function (card) {
          var text = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-tags') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-type') || ''
          ].join(' ').toLowerCase();
          card.classList.toggle('hide-card', value && text.indexOf(value) === -1);
        });
      }
      if (input) {
        input.addEventListener('input', filterCards);
        input.addEventListener('keydown', function (event) {
          if (event.key === 'Enter') {
            event.preventDefault();
            filterCards();
          }
        });
      }
      if (button) {
        button.addEventListener('click', filterCards);
      }
    });

    var slider = document.querySelector('[data-hero-slider]');
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
      var index = 0;
      function showSlide(next) {
        if (!slides.length) {
          return;
        }
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('active', i === index);
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          showSlide(i);
        });
      });
      showSlide(0);
      window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }
  });
})();
