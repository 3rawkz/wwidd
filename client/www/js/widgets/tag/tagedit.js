/**
 * Tag Editor Widget
 */
/*global document, jQuery, wraith, jOrder, window */
var app = app || {};

app.widgets = function (widgets, $, wraith, jOrder, services, model) {
    /**
     * @constructor
     * @param mediaid {string} Media entry identifier.
     * @param tag {string} Tag name in "name:kind" format.
     */
    widgets.tagedit = function (mediaid, tag) {
        var self = wraith.widget.create(widgets.tag(mediaid)),
            tmp = tag.split(':'),
            name = tmp[0] || '',
            kind = tmp[1] || '';

        self.hints = widgets.tagedit.hints;

        //////////////////////////////
        // Getters / setters

        self.kind = function () {
            return kind;
        };

        self.name = function () {
            return name;
        };

        self.tag = function () {
            return tag;
        };

        self.mediaid = function () {
            return mediaid;
        };

        //////////////////////////////
        // Overrides

        /**
         * Checks whether string is a tag matched by the active search.
         * @param str {string}
         */
        function isFilter(str) {
            // get tags matched by filter
            var matched = model.Media.matchedTags(),
                i;
            for (i = 0; i < matched.length; i++) {
                if (str === matched[i]) {
                    return true;
                }
            }
            return false;
        }

        self.display = function () {
            return widgets.tagedit.html(name, kind, self.id, isFilter(tag));
        };

        self.edit = function () {
            return [
                '<span id="', self.id, '" class="w_tagedit ' + model.kind.getNumber(kind) + '">',
                    '<div class="background"></div>',
                    '<input type="text" class="focus" value="', tag, '"/>',
                    '<a href="#" class="button remove" title="Remove tag"></a>',
                    tag.indexOf(' ') === -1 ? '' : '<a href="#" class="button explode" title="Explode tag"></a>',
                '</span>'
            ].join('');
        };

        return self;
    };

    //////////////////////////////
    // Static methods

    widgets.tagedit.html = function (name, kind, id, hit) {
        hit = hit ? 'hit' : null;
        return [
            '<span ', id ? 'id="' + id + '" ' : '', 'class="',
            ['w_tag', 'w_tagedit', 'background', model.kind.getNumber(kind), hit].join(' '), '" title="', kind, '">',
                '<span>', name.replace(' ', '&nbsp;'), '</span>',
            '</span>'
        ].join('');
    };

    //////////////////////////////
    // Static properties

    // hints associated with this widget
    widgets.tagedit.hints = [
        "SHIFT + ENTER to change tag on checked videos.",
        "SHIFT + CLICK on delete to remove all occurrences.",
        "CTRL + ENTER to change tag on search results.",
        "CTRL + CLICK on delete to remove from search results."
    ].concat(widgets.tag.hints);

    //////////////////////////////
    // Static event handlers

    function getSelf(elem) {
        return wraith.lookup(elem, '.w_tagedit');
    }

    // general button handler
    function onButton(event, service, lang, handler) {
        handler = typeof handler === 'function' ? handler : function () {};

        var self = getSelf($(this)),
            tag = self.tag(),
            mediaid = self.mediaid(),
            mediaids;

        function onSuccess() {
            handler.call(self, mediaids, tag);
        }

        switch (widgets.tag.scope(event)) {
        case 'single':
            // affecting tag on one specific video
            mediaids = [mediaid];
            service(mediaid, tag, null, onSuccess);
            break;

        case 'all':
            // affecting all tags like this one
            if (window.confirm(lang.all)) {
                mediaids = model.Media.getByTag(tag);
                service(null, tag, null, onSuccess);
            }
            break;

        case 'search':
            // affecting tags in search reaults
            mediaids = model.Media.matchedMedia();
            if (mediaids.length && window.confirm(lang.hits)) {
                service(null, tag, mediaids.join(','), onSuccess);
            }
            break;

        case 'selected':
            // affecting all tags on selected videos
            if (window.confirm(lang.sel)) {
                mediaids = jOrder.keys(widgets.media.selected);
                service(null, tag, mediaids.join(','), onSuccess);
            }
            break;
        }
    }

    function onRemove(event) {
        var self = getSelf($(this));

        onButton.call(this, event, services.tag.del, {
            sel: "Delete this tag from SELECTED videos?",
            all: "Delete ALL tags of this kind?",
            hits: "Delete this tag from SEARCH results?"
        }, function (mediaids, tag) {
            model.Media.removeTag(mediaids, tag);
            if (mediaids.length > 1) {
                widgets.media.refreshTags();
            } else {
                self.refresh();
            }
        });
        return false;
    }

    function explode(tag) {
        var tmp = tag.split(':'),
            names = tmp[0].split(' '),
            kind = tmp[1] || '',
            result = [],
            i;
        for (i = 0; i < names.length; i++) {
            result.push(names[i] + ':' + kind);
        }
        return result;
    }

    function onExplode(event) {
        var self = getSelf($(this));

        onButton.call(this, event, services.tag.explode, {
            sel: "Explode this tag in SELECTED videos?",
            all: "Explode ALL tags of this kind?",
            hits: "Explode this tag in SEARCH results?"
        }, function (mediaids, tag) {
            var tmp = explode(tag),
                i;
            model.Media.removeTag(mediaids, tag);
            for (i = 0; i < tmp.length; i++) {
                model.Media.addTag(mediaids, tmp[i]);
            }
            if (mediaids.length > 1) {
                widgets.media.refreshTags();
            } else {
                self.refresh();
            }
        });
        return false;
    }

    function onChange(event) {
        var $this = $(this),
            self = getSelf($this),
            mediaid = self.mediaid(),
            tag = self.tag(),
            before = tag,
            after = model.Tag.sanitize($this.val());

        if (event.which === 13) {
            // enter - saving values
            // discarding changes when there was no change or tag deleted
            if (after === before || !after.length) {
                return;
            }

            switch (widgets.tag.scope(event)) {
            case 'all':
                // running batch tag change
                if (window.confirm("Apply change to ALL tags of this kind?")) {
                    services.tag.set(null, before, after, function () {
                        model.Tag.set(before, after);
                        widgets.media.refreshTags();
                    });
                }
                break;

            case 'search':
                // search scope is not defined for editing
                break;

            case 'selected':
                // selected scope is not defined for editing
                break;

            case 'single':
                // running single tag change
                services.tag.set(mediaid, before, after, function () {
                    self.changetag(before, after);
                });
                break;
            }
        }
    }

    //////////////////////////////
    // Static event bindings

    $(document)
        .on('click', '.w_tagedit.edit .remove', onRemove)
        .on('click', '.w_tagedit.edit .explode', onExplode)
        .on('keyup', '.w_tagedit.edit input', onChange);

    return widgets;
}(app.widgets || {},
    jQuery,
    wraith,
    jOrder,
    app.services,
    app.model);

