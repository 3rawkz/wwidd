/**
 * Tree Widget
 */
/*global document, jQuery, wraith */
var app = app || {};

app.widgets = function (widgets, $, wraith) {
    //////////////////////////////
    // Static event handlers

    /**
     * Node selection handler.
     * @param event {object} jQuery event.
     * @param data {object} Custom event data
     * @param data.elem {object} jQuery object for node.
     * @param data.node {object} Node widget being affected.
     */
    function onSelected(event, data) {
        var $node = data.elem,
            node = data.node,
            path = '/' + node.path().join('/'),
            $this = $(this),
            self = wraith.lookup($this);

        // setting selected status on current node
        $this
            .find('span.selected')
                .text(path)
                .attr('title', path)
            .end()
            .find('li')
                .removeClass('selected')
            .end();

        $node.addClass('selected');

        // storing selected path
        self.selected(node.path());
    }

    //////////////////////////////
    // Static event bindings

    $(document)
        .on('nodeSelected', '.w_tree', onSelected);

    //////////////////////////////
    // Class

    widgets.tree = function () {
        var self = wraith.widget.create(),
            json,
            rootNode,
            simple = false,
            selected = [],

            // transormation functions
            display, // determines what to display
            order;      // determines the order of sub-nodes

        //////////////////////////////
        // Setters / getters

        self.json = function (value) {
            if (typeof value === 'object') {
                json = value;
                return self;
            } else {
                return json;
            }
        };

        self.simple = function (value) {
            if (typeof value === 'boolean') {
                simple = value;
                return self;
            } else {
                return simple;
            }
        };

        self.selected = function (value) {
            if (typeof value !== 'undefined') {
                selected = value;
                return self;
            } else {
                return selected;
            }
        };

        self.display = function (value) {
            if (typeof value === 'function') {
                display = value;
                return self;
            } else if (typeof display === 'function') {
                return display.apply(self, arguments);
            }
        };

        self.order = function (value) {
            if (typeof value === 'function') {
                order = value;
                return self;
            } else if (typeof order === 'function') {
                return order.apply(self, arguments);
            }
        };

        //////////////////////////////
        // Overrides

        self.build = function () {
            self.clear();
            rootNode = widgets.node(display ? display([]) || '/' : '/', self)
                .json(json)
                .appendTo(self);
            return self;
        };

        self.html = function () {
            return [
                '<div id="', self.id, '" class="w_tree">',
                    simple ?
                        '' :
                        [
                            '<table class="status">',
                                '<colgroup>',
                                    '<col class="key">',
                                    '<col class="value">',
                                '</colgroup>',
                                '<tr>', '<td><span>', "Selected:", '</span></td>', '<td><span class="selected">&nbsp;</span></td>',
                                '</tr>',
                            '</table>'
                        ].join(''),
                    rootNode ? '<ul class="root">' + rootNode.html() + '</ul>' : '',
                '</div>'
            ].join('');
        };

        return self;
    };

    return widgets;
}(app.widgets,
    jQuery,
    wraith);

