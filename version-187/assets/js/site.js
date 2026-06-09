(function () {
    var menuButton = document.querySelector('[data-mobile-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var activeIndex = 0;

        var showSlide = function (index) {
            activeIndex = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide((activeIndex + 1) % slides.length);
            }, 5200);
        }
    }

    var searchableBlocks = Array.prototype.slice.call(document.querySelectorAll('[data-search-root]'));

    searchableBlocks.forEach(function (root) {
        var input = root.querySelector('.js-search-input');
        var typeFilter = root.querySelector('.js-type-filter');
        var yearFilter = root.querySelector('.js-year-filter');
        var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));
        var empty = root.querySelector('.no-results');

        var applyFilters = function () {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var typeValue = typeFilter ? typeFilter.value : '';
            var yearValue = yearFilter ? yearFilter.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                var type = card.getAttribute('data-type') || '';
                var year = card.getAttribute('data-year') || '';
                var matched = true;

                if (keyword && text.indexOf(keyword) === -1) {
                    matched = false;
                }

                if (typeValue && type !== typeValue) {
                    matched = false;
                }

                if (yearValue && year !== yearValue) {
                    matched = false;
                }

                card.hidden = !matched;

                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        };

        if (input) {
            input.addEventListener('input', applyFilters);
        }

        if (typeFilter) {
            typeFilter.addEventListener('change', applyFilters);
        }

        if (yearFilter) {
            yearFilter.addEventListener('change', applyFilters);
        }
    });
})();

function initializePlayer(playUrl) {
    var video = document.getElementById('moviePlayer');
    var overlay = document.getElementById('playerOverlay');
    var errorBox = document.getElementById('playerError');
    var hlsInstance = null;
    var attached = false;

    if (!video || !playUrl) {
        return;
    }

    var showError = function () {
        if (errorBox) {
            errorBox.textContent = '播放遇到问题，请刷新重试';
            errorBox.classList.add('is-visible');
        }
    };

    var attach = function () {
        if (attached) {
            return;
        }

        attached = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = playUrl;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(playUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    showError();
                }
            });
            return;
        }

        video.src = playUrl;
    };

    var start = function () {
        attach();

        if (overlay) {
            overlay.classList.add('is-hidden');
        }

        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                if (overlay) {
                    overlay.classList.remove('is-hidden');
                }
            });
        }
    };

    if (overlay) {
        overlay.addEventListener('click', start);
    }

    video.addEventListener('play', function () {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    });

    video.addEventListener('error', showError);
    attach();
}
