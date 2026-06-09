(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
            return;
        }
        document.addEventListener('DOMContentLoaded', callback);
    }

    function initMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        if (slides.length === 0) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initSearch() {
        var boxes = Array.prototype.slice.call(document.querySelectorAll('[data-search-box]'));
        boxes.forEach(function (box) {
            var input = box.querySelector('[data-search-input]');
            var select = box.querySelector('[data-search-select]');
            var chips = Array.prototype.slice.call(box.querySelectorAll('[data-filter]'));
            var scopeSelector = box.getAttribute('data-search-box');
            var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
            if (!scope) {
                return;
            }
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search]'));
            var empty = document.querySelector('[data-empty]');
            var activeFilter = '';

            function currentQuery() {
                return input ? input.value.trim().toLowerCase() : '';
            }

            function currentSelect() {
                return select ? select.value.trim().toLowerCase() : '';
            }

            function apply() {
                var query = currentQuery();
                var selected = currentSelect();
                var visible = 0;
                cards.forEach(function (card) {
                    var value = (card.getAttribute('data-search') || '').toLowerCase();
                    var okQuery = !query || value.indexOf(query) !== -1;
                    var okSelected = !selected || value.indexOf(selected) !== -1;
                    var okFilter = !activeFilter || value.indexOf(activeFilter) !== -1;
                    var show = okQuery && okSelected && okFilter;
                    card.style.display = show ? '' : 'none';
                    if (show) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.style.display = visible ? 'none' : 'block';
                }
            }

            if (input) {
                input.addEventListener('input', apply);
            }
            if (select) {
                select.addEventListener('change', apply);
            }
            chips.forEach(function (chip) {
                chip.addEventListener('click', function () {
                    var value = (chip.getAttribute('data-filter') || '').toLowerCase();
                    activeFilter = activeFilter === value ? '' : value;
                    chips.forEach(function (item) {
                        item.classList.toggle('is-active', item === chip && activeFilter === value);
                    });
                    apply();
                });
            });
            apply();
        });
    }

    function initPlayer() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (box) {
            var video = box.querySelector('video');
            var button = box.querySelector('.play-overlay');
            var source = box.getAttribute('data-m3u8');
            var hls = null;
            var loaded = false;
            if (!video || !source) {
                return;
            }

            function load() {
                if (loaded) {
                    return;
                }
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    loaded = true;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    loaded = true;
                    return;
                }
                video.src = source;
                loaded = true;
            }

            function play() {
                load();
                video.controls = true;
                if (button) {
                    button.classList.add('is-hidden');
                }
                var started = video.play();
                if (started && typeof started.catch === 'function') {
                    started.catch(function () {
                        if (button) {
                            button.classList.remove('is-hidden');
                        }
                    });
                }
            }

            if (button) {
                button.addEventListener('click', play);
            }
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                if (button) {
                    button.classList.add('is-hidden');
                }
            });
            window.addEventListener('pagehide', function () {
                if (hls) {
                    hls.destroy();
                    hls = null;
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initSearch();
        initPlayer();
    });
}());
