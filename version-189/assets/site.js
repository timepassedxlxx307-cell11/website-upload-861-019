(function () {
    'use strict';

    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var button = document.querySelector('[data-mobile-menu-button]');
        var menu = document.querySelector('[data-mobile-menu]');

        if (!button || !menu) {
            return;
        }

        button.addEventListener('click', function () {
            var isOpen = menu.classList.toggle('is-open');
            button.setAttribute('aria-expanded', String(isOpen));
        });
    }

    function setupLocalFilters() {
        var grids = document.querySelectorAll('[data-filter-grid]');

        grids.forEach(function (grid) {
            var section = grid.closest('section') || document;
            var input = section.querySelector('[data-filter-input]');
            var yearSelect = section.querySelector('[data-year-filter]');
            var typeSelect = section.querySelector('[data-type-filter]');
            var count = section.querySelector('[data-result-count]');
            var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

            function applyFilters() {
                var keyword = input ? input.value.trim().toLowerCase() : '';
                var year = yearSelect ? yearSelect.value : '';
                var type = typeSelect ? typeSelect.value : '';
                var visible = 0;

                cards.forEach(function (card) {
                    var text = (card.getAttribute('data-search') || '').toLowerCase();
                    var cardYear = card.getAttribute('data-year') || '';
                    var cardType = card.getAttribute('data-type') || '';
                    var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var matchesYear = !year || cardYear === year;
                    var matchesType = !type || cardType.indexOf(type) !== -1;
                    var show = matchesKeyword && matchesYear && matchesType;

                    card.classList.toggle('is-hidden', !show);
                    if (show) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = '当前显示 ' + visible + ' 部影片';
                }
            }

            if (input) {
                input.addEventListener('input', applyFilters);
            }
            if (yearSelect) {
                yearSelect.addEventListener('change', applyFilters);
            }
            if (typeSelect) {
                typeSelect.addEventListener('change', applyFilters);
            }
        });
    }

    function setupGlobalSearch() {
        var input = document.getElementById('global-search-input');
        var button = document.querySelector('[data-global-search-button]');
        var results = document.getElementById('global-search-results');
        var count = document.getElementById('global-search-count');

        if (!input || !results || !window.MOVIES_INDEX) {
            return;
        }

        var prefix = results.getAttribute('data-root-prefix') || '';

        function escapeHtml(value) {
            return String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function truncate(value, length) {
            var text = String(value || '').replace(/\s+/g, ' ').trim();
            return text.length > length ? text.slice(0, length) + '…' : text;
        }

        function renderCard(movie) {
            var searchText = [movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(' '), movie.oneLine].join(' ');
            return [
                '<article class="movie-card movie-card--compact" data-search="' + escapeHtml(searchText) + '">',
                '    <a class="poster-wrap" href="' + escapeHtml(prefix + movie.detail) + '">',
                '        <img src="' + escapeHtml(prefix + movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '        <span class="poster-gradient"></span>',
                '        <span class="badge badge-blue">' + escapeHtml(movie.year) + '</span>',
                '        <span class="badge badge-dark">' + escapeHtml(movie.region) + '</span>',
                '        <span class="play-float" aria-hidden="true">▶</span>',
                '    </a>',
                '    <div class="movie-card-body">',
                '        <h3><a href="' + escapeHtml(prefix + movie.detail) + '">' + escapeHtml(movie.title) + '</a></h3>',
                '        <p>' + escapeHtml(truncate(movie.oneLine, 82)) + '</p>',
                '        <div class="movie-meta-line"><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
                '    </div>',
                '</article>'
            ].join('\n');
        }

        function performSearch() {
            var keyword = input.value.trim().toLowerCase();
            var matches = window.MOVIES_INDEX.filter(function (movie) {
                if (!keyword) {
                    return true;
                }
                var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(' '), movie.oneLine, movie.categoryName].join(' ').toLowerCase();
                return text.indexOf(keyword) !== -1;
            }).slice(0, 120);

            if (!matches.length) {
                results.innerHTML = '<div class="empty-state">没有找到匹配影片，请更换关键词。</div>';
            } else {
                results.innerHTML = matches.map(renderCard).join('\n');
            }

            if (count) {
                count.textContent = keyword ? '找到 ' + matches.length + ' 条结果，最多展示前 120 条' : '默认展示前 120 部影片';
            }
        }

        input.addEventListener('input', performSearch);
        if (button) {
            button.addEventListener('click', performSearch);
        }
    }

    function loadHlsLibrary(callback, onError) {
        if (window.Hls) {
            callback();
            return;
        }

        var existing = document.querySelector('script[data-hls-loader]');
        if (existing) {
            existing.addEventListener('load', callback, { once: true });
            existing.addEventListener('error', onError, { once: true });
            return;
        }

        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
        script.async = true;
        script.setAttribute('data-hls-loader', 'true');
        script.addEventListener('load', callback, { once: true });
        script.addEventListener('error', onError, { once: true });
        document.head.appendChild(script);
    }

    function setupPlayers() {
        var shells = document.querySelectorAll('.player-shell');

        shells.forEach(function (shell) {
            var video = shell.querySelector('.hls-player');
            var overlay = shell.querySelector('.play-overlay');
            var message = shell.querySelector('.player-message');

            if (!video) {
                return;
            }

            var source = video.getAttribute('data-src');
            var initialized = false;
            var hlsInstance = null;

            function showMessage(text) {
                if (message) {
                    message.textContent = text || '';
                }
            }

            function initializePlayer() {
                if (initialized || !source) {
                    return;
                }

                initialized = true;
                showMessage('正在加载高清播放源…');

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    showMessage('');
                    return;
                }

                loadHlsLibrary(function () {
                    if (window.Hls && window.Hls.isSupported()) {
                        hlsInstance = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hlsInstance.loadSource(source);
                        hlsInstance.attachMedia(video);
                        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            showMessage('');
                        });
                        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                            if (data && data.fatal) {
                                showMessage('视频加载失败，请稍后重试或检查播放源。');
                            }
                        });
                    } else {
                        showMessage('当前浏览器不支持 HLS 播放。');
                    }
                }, function () {
                    showMessage('播放器组件加载失败，请检查网络后重试。');
                });
            }

            function playVideo() {
                initializePlayer();
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        showMessage('浏览器阻止了自动播放，请再次点击视频播放按钮。');
                    });
                }
            }

            if (overlay) {
                overlay.addEventListener('click', playVideo);
            }

            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
                showMessage('');
            });

            video.addEventListener('pause', function () {
                shell.classList.remove('is-playing');
            });

            video.addEventListener('error', function () {
                showMessage('视频加载失败，请稍后重试。');
            });

            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        setupMobileMenu();
        setupLocalFilters();
        setupGlobalSearch();
        setupPlayers();
    });
}());
