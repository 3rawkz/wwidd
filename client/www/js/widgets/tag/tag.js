////////////////////////////////////////////////////////////////////////////////
// Tag Control Base (Abstract)
////////////////////////////////////////////////////////////////////////////////
/*global document, jQuery, wraith, jOrder, escape */
var app = app || {};

app.widgets = function (widgets, $, wraith, jOrder, services, model) {
    // - mediaid: media identifier
    widgets.tag = function (mediaid) {
        var self = wraith.widget.create(widgets.editable()),
                base_init = self.init;
        
        self.hints = widgets.tag.hints;

        //////////////////////////////
        // Control

        // removes tag from media entry
        function remove(before) {
            if (before) {
                model.media.removeTag([mediaid], before);
            }
        }
        
        // adds tag to media entry
        function add(after) {
            var names, i;
            if (after) {
                names = model.tag.split(after);
                model.media.addTags(mediaid, names);
            }
        }
        
        // refreshes UI
        self.refresh = function () {
            // redrawing tags for media entry
            this.parent
                .build()
                .render();
            widgets.kinds
                .build()
                .render();
            widgets.discovery
                .refreshTags();
        };
        
        // changes tag to one or more tags
        // - before: value before change, either a string or null (insertion)
        // - after: value after change, comma separated string or null (deletion)
        self.changetag = function (before, after) {
            // deleting old tag if there was one
            remove(before);
            
            // adding new value(s) to buffer
            add(after);
            
            // integrity & UI
            this.refresh();
        };
                
        //////////////////////////////
        // Overrides
        
        self.init = function (elem) {
            base_init.call(self, elem);
            elem.addClass('w_tag');
        };

        return self;
    };

    //////////////////////////////
    // Static properties

    // hints associated with this widget
    widgets.tag.hints = [
        "Press ESC to exit edit mode.",
        "Use TAB and SHIFT + TAB to move between tags."
    ];
    
    //////////////////////////////
    // Static methods

    widgets.tag.scope = function (event) {
        return event.shiftKey ? !Object.isEmpty(widgets.media.selected) ? 'selected' : 'all' : event.ctrlKey ? 'search' : 'single';
    };
    
    //////////////////////////////
    // Static event handlers

    function getSelf(elem) {
        return wraith.lookup(elem, '.w_tag');
    }

    // handles navigation events
    function onNav(event) {
        var $this = $(this),
                $next;
        switch (event.which) {
        case 9:
            // tab - jump to next tag
            $next = event.shiftKey ?
                $this.closest('.w_tag').prev() :
                $this.closest('.w_tag').next();
            if ($next.length) {
                getSelf($this).toggle('display');
                getSelf($next).toggle('edit');
            }
            return false;
        case 27:
            // escape - cancel
            getSelf($this).toggle('display');
            return false;
        }
    }
    
    //////////////////////////////
    // Static event bindings

    $(document)
        .on('keydown', '.w_tag.edit input.focus', onNav);

    return widgets;
}(app.widgets || {},
    jQuery,
    wraith,
    jOrder,
    app.services,
    app.model);

