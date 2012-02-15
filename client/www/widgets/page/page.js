/**
 * Wwidd Page
 *
 * Despatches:
 * - selectAll: targeted to widgets.media, selects or deselects all media entries
 *
 * Captures:
 * - mediumExpanded: for recalculating page dimensions
 * - mediaInvalidated: for recalculating page dimensions
 */
/*global document, jQuery, wraith, window */
var app = app || {};

app.widgets = (function (widgets, $) {
    //////////////////////////////
    // Static event handlers

    var recalcDims;

    $(function () {
        var $header = $('#header'),
            $footer = $('#footer'),
            $library = $('#library'),
            $media = $('#media'),
            $discovery = $('#discovery'),

            // volatile dimensions
            headerHeight = $header.outerHeight(),
            footerHeight = $footer.outerHeight(),
            headerPadding = $header.outerWidth() - $header.width();

        // re-calculates and applies container dimensions
        recalcDims = function () {
            var fullWidth = $library.width(),
                sideBarWidth = $discovery.width(),
                mediaHeight = $media.outerHeight(true);

            $media.css({
                top: headerHeight,
                left: sideBarWidth,
                width: fullWidth - sideBarWidth
            });

            $discovery.css({
                top: headerHeight,
                height: mediaHeight
            });

            $header.add($footer)
                .width(fullWidth - headerPadding);

            $library.css('height', headerHeight + mediaHeight + footerHeight);
            $footer.css('top', headerHeight + mediaHeight);
        };

        // reacts to window resizing
        $(window).resize(recalcDims);

        // reacting to media expansion
        $(document)
            .on('mediumExpanded', recalcDims)
            .on('mediaInvalidated', recalcDims);
    });

    /**
     * Fires when an individual media item is checked
     */
    function onMediumChecked() {
        var $this = $(this),
            $checkboxes = $this.find('.w_media .w_checkbox'),
            $checked = $checkboxes.filter('.checked'),
            $checker = $this.find('.w_checker .w_checkbox');

        // refreshing main checker widget
        $checker
            .trigger('checkboxCheck', {
                state: {0: 'unchecked', 1: 'checked'}[$checked.length / $checkboxes.length] || 'mixed'
            });

        // updating actions widget state
        widgets.actions
            .disabled({checker: $checked.length === 0})
            .render();
    }

    /**
     * Fires when checker widget is checked or unchecked
     * @param event jQuery event object
     * @param data custome event data {state: 'checked'/'unchecked'}
     */
    function onCheckerChecked(event, data) {
        // triggering select all on media items
        $(this).find('.w_media')
            .trigger('selectAll', {mode: {'checked': 'select'}[data.state] || 'deselect'});

        // updating actions widget state
        widgets.actions
            .disabled({checker: data.state !== 'checked'})
            .render();
    }

    //////////////////////////////
    // Static event bindings

    $(document)
        .on('mediumChecked', onMediumChecked)
        .on('checkerChecked', onCheckerChecked);

    //////////////////////////////
    // Class

    widgets.page = (function () {
        var self = {},
            pager;

        // initializes page
        self.init = function () {
            // initializing pager widget
            widgets.pager
                .build()
                .render($('#pager').empty());
            
            // adding search box to page
            widgets.search
                .render($('#search')
                    .empty()
                    .append('&nbsp;')); // helps vertical alignment
            
            // adding select all
            widgets.checker
                .render($('#checker').empty());
                
            // adding actions
            widgets.actions
                .build()
                .render($('#checker'));

            // adding select all
            widgets.view
                .build()
                .render($('#views').empty());
                
            // adding library switcher
            widgets.discovery
                .build()
                .render($('#discovery').empty());

            // adding library switcher
            widgets.library
                .build()
                .render($('#switcher').empty());
                
            // adding hints container to page
            widgets.hints
                .render($('#footer').empty());
            
            // adding progress indicator to page
            widgets.progress
                .render($('#footer'));
            
            // initializing and adding library to page
            widgets.media
                .load()
                .render($('#media').empty());

            return self;
        };

        return self;
    }());

    return widgets;
}(app.widgets || {},
    jQuery));

