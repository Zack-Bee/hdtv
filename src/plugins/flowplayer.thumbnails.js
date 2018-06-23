/*jslint browser: true, node: true */
/*global window */

/*!
   Thumbnail image plugin for Flowplayer HTML5
   Copyright (c) 2015-2017, Flowplayer Drive Oy
   Released under the MIT License:
   http://www.opensource.org/licenses/mit-license.php
   requires:
   - Flowplayer HTML5 version 6.x or greater
   revision: $GIT_ID$
*/
(function () {
    "use strict";
    var extension = function (flowplayer) {

        flowplayer(function (api, root) {
            var common = flowplayer.common,
                bean = flowplayer.bean,
                extend = flowplayer.extend,
                support = flowplayer.support,
                timeline = common.find('.fp-timeline', root)[0],
                timelineTooltip = common.find('.fp-time' + (flowplayer.version.indexOf('6.') === 0
                    ? 'line-tooltip'
                    : 'stamp'), root)[0];

            if (support.touch || !support.inlineVideo) {
                return;
            }

            api.on('ready', function (_ev, a, video) {
                // cleanup
                bean.off(root, '.thumbnails');
                common.css(timelineTooltip, {
                    width: '',
                    height: '',
                    'background-image': '',
                    'background-repeat': '',
                    'background-size': '',
                    'background-position': '',
                    'border': '',
                    'text-shadow': ''
                });

                var c = extend({
                    lazyload: true,
                    responsive: true
                }, a.conf.thumbnails, video.thumbnails),
                    template = c.template,
                    sprite = template && template.indexOf('{time}') < 0;

                if (!template || (sprite && (!c.rows || !c.columns || !c.width || !c.height))) {
                    return;
                }

                var height = sprite
                    ? c.height / c.rows
                    : c.height || 80,
                    engine = common.find('.fp-engine', root)[0],
                    ratio = (video.height || common.height(engine)) / (video.width || common.width(engine)),
                    width = sprite
                        ? c.width / c.columns
                        : height / ratio,
                    interval = c.interval || 1,
                    time_format = c.time_format || function (t) {
                        return t;
                    },
                    startIndex = typeof c.startIndex === 'number'
                        ? c.startIndex
                        : 1,
                    thumb = c.lazyload && !sprite
                        ? new Image()
                        : null,
                    preloadImages = function (max, start) {
                        max = Math.floor(max / interval + start);
                        function load() {
                            if (start > max) {
                                return;
                            }
                            var img = new Image();
                            img.src = template.replace('{time}', time_format(start));
                            img.onload = function () {
                                start += 1;
                                load();
                            };
                        }
                        load();
                    };

                if (c.preload) {
                    preloadImages(video.duration, startIndex);
                }

                bean.on(root, 'mousemove.thumbnails', '.fp-timeline', function (ev) {
                    var x = ev.pageX || ev.clientX,
                        delta = x - common.offset(timeline).left,
                        percentage = delta / common.width(timeline),
                        seconds = Math.round(percentage * api.video.duration),
                        url,
                        displayThumb = function () {
                            var scale = (c.responsive && common.hasClass(root, 'is-small'))
                                ? 0.7
                                : (c.responsive && common.hasClass(root, 'is-tiny'))
                                    ? 0.6
                                    : 1,
                                css = {
                                    width: (width * scale) + 'px',
                                    height: (height * scale) + 'px',
                                    'background-image': "url('" + url + "')",
                                    'background-repeat': 'no-repeat',
                                    border: '1px solid #333',
                                    'text-shadow': '1px 1px #000'
                                };
                            if (sprite) {
                                var left = Math.floor(seconds % c.columns) * -width - (width - width * scale) / 2,
                                    top = Math.floor(seconds / c.columns) * -height - (height - height * scale) / 2;
                                css['background-position'] = left + 'px ' + top + 'px';
                            } else {
                                extend(css, {
                                    'background-size': 'cover',
                                    'background-position': 'center'
                                });
                            }
                            common.css(timelineTooltip, css);
                        };

                    // 2nd condition safeguards at out of range retrieval attempts
                    if (seconds < 0 || seconds > Math.round(api.video.duration)) {
                        return;
                    }
                    // enables greater interval than one second between thumbnails
                    seconds = Math.floor(seconds / interval);

                    // {time} template expected to start at 1, video time/first frame starts at 0
                    url = template.replace('{time}', time_format(seconds + startIndex));

                    if (c.lazyload && !sprite) {
                        thumb.src = url;
                        bean.on(thumb, 'load', displayThumb);
                    } else {
                        displayThumb();
                    }
                });
            });

        });
    };

    if (typeof module === 'object' && module.exports) {
        module.exports = extension;
    } else if (window.flowplayer) {
        extension(window.flowplayer);
    }
}());