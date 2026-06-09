(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var button = qs('[data-nav-toggle]');
        var menu = qs('[data-nav-menu]');

        if (!button || !menu) {
            return;
        }

        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = qs('[data-hero]');

        if (!hero) {
            return;
        }

        var slides = qsa('.hero-slide', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var current = 0;

        function show(index) {
            current = index;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                show((current + 1) % slides.length);
            }, 5200);
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function setupSearch() {
        var inputs = qsa('[data-search-input]');
        var data = window.MOVIE_SEARCH || [];

        inputs.forEach(function (input) {
            var box = input.parentElement ? qs('[data-search-results]', input.parentElement) : null;

            if (!box) {
                return;
            }

            function render() {
                var query = normalize(input.value);

                if (!query) {
                    box.classList.remove('is-open');
                    box.innerHTML = '';
                    return;
                }

                var results = data.filter(function (movie) {
                    var text = [
                        movie.title,
                        movie.year,
                        movie.region,
                        movie.genre,
                        (movie.tags || []).join(' '),
                        movie.summary
                    ].join(' ');

                    return normalize(text).indexOf(query) !== -1;
                }).slice(0, 12);

                box.innerHTML = results.map(function (movie) {
                    return '<a href="' + escapeHtml(movie.url) + '">' +
                        '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '">' +
                        '<span><strong>' + escapeHtml(movie.title) + '</strong><em>' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.genre) + '</em></span>' +
                        '</a>';
                }).join('');

                box.classList.toggle('is-open', results.length > 0);
            }

            input.addEventListener('input', render);
            input.addEventListener('focus', render);
            input.addEventListener('keydown', function (event) {
                if (event.key === 'Enter') {
                    var first = qs('a', box);

                    if (first) {
                        window.location.href = first.getAttribute('href');
                    }
                }
            });

            document.addEventListener('click', function (event) {
                if (!box.contains(event.target) && event.target !== input) {
                    box.classList.remove('is-open');
                }
            });
        });
    }

    function setupPageFilter() {
        var input = qs('[data-card-filter]');
        var grid = qs('[data-filter-grid]');
        var regionSelect = qs('[data-card-filter-select="region"]');
        var yearSelect = qs('[data-card-filter-select="year"]');

        if (!grid) {
            return;
        }

        var cards = qsa('[data-title]', grid);

        function applyFilter() {
            var query = normalize(input ? input.value : '');
            var region = regionSelect ? normalize(regionSelect.value) : '';
            var year = yearSelect ? normalize(yearSelect.value) : '';

            cards.forEach(function (card) {
                var title = normalize(card.getAttribute('data-title'));
                var cardRegion = normalize(card.getAttribute('data-region'));
                var cardYear = normalize(card.getAttribute('data-year'));
                var genre = normalize(card.getAttribute('data-genre'));
                var tags = normalize(card.getAttribute('data-tags'));
                var fullText = [title, cardRegion, cardYear, genre, tags].join(' ');
                var okQuery = !query || fullText.indexOf(query) !== -1;
                var okRegion = !region || cardRegion === region;
                var okYear = !year || cardYear === year;

                card.classList.toggle('is-hidden', !(okQuery && okRegion && okYear));
            });
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        if (regionSelect) {
            regionSelect.addEventListener('change', applyFilter);
        }

        if (yearSelect) {
            yearSelect.addEventListener('change', applyFilter);
        }
    }

    setupMenu();
    setupHero();
    setupSearch();
    setupPageFilter();
})();
