/**
 * Search Index
 *
 * Builds and queries search tree.
 * Unit is self-contained, Flock being its sole dependency. Has its own cache,
 * which is exposed on the object for direct access.
 *
 * (c) 2011-2012 by Dan Stocker, under MIT license.
 */
/*global flock */
var app = app || {};

app.model = function (model) {
    var RE_SPLIT_CHAR = '',             // regex that splits along each character
        RE_SPLIT_WHITE = /\s+/,         // regex that splits along whitespace

        // search cache must not be evented
        cache = flock({}, flock.COMPAT),

        // method shortcut
        keys = flock.utils.keys;

    /**
     * Processes terms.
     * Calls handler on each individual word and each complete term.
     * @param terms {string[]|string} Term(s).
     * @param handler {function} Called on each word.
     */
    function processTerms(terms, handler) {
        if (typeof terms === 'string') {
            terms = [terms];
        }

        var i, term, words,
            j;

        for (i = 0; i < terms.length; i++) {
            term = terms[i].toLowerCase();
            words = term.split(RE_SPLIT_WHITE);

            if (words.length > 1) {
                // there are multiple words in term
                // adding full term to list of words
                words.push(term);
            }

            for (j = 0; j < words.length; j++) {
                handler.call(this, terms[i], words[j]);
            }
        }
    }

    model.search = (function () {
        var self = {
            //////////////////////////////
            // Exposed privates

            cache: cache,

            //////////////////////////////
            // Control

            /**
             * Adds search terms to the search index.
             * @param terms {string|string[]} Exact search term(s).
             * @param path {string[]} Custom path identifying node type.
             * @param [node] {object} Custom object to be added as leaf node.
             */
            addTerms: function (terms, path, node) {
                processTerms.call(this, terms, function(term, word) {
                    cache.set(
                        word.split(RE_SPLIT_CHAR)
                            .concat(path)
                            .concat([word, term]),
                        node || true
                    );
                });
            },

            /**
             * Removes search terms from search index.
             * @param terms {string} Exact search term.
             * @param path {string[]} Custom path between search term and affected cache node.
             */
            removeTerms: function (terms, path) {
                processTerms.call(this, terms, function(term, word) {
                    cache.cleanup(
                        word.split(RE_SPLIT_CHAR)
                            .concat(path)
                            .concat([word, term])
                    );
                });
            },

            /**
             * Clears search index cache.
             */
            clear: function () {
                self.cache = cache = flock({}, flock.COMPAT);
            },

            /**
             * Retrieves indexed words matching prefix.
             * @param prefix {string} Search term prefix.
             * @param path {string[]} Custom path identifying node type.
             * @param [withLeafs] {boolean} Whether to include search index leaf nodes.
             * @returns {string[]} Unique list of matches.
             */
            matchingWords: function (prefix, path, withLeafs) {
                prefix = prefix.toLowerCase();

                var hits = cache.mget(
                    prefix.split(RE_SPLIT_CHAR)
                        .concat([null])
                        .concat(path)
                        .concat(['*']),
                    flock.BOTH
                );

                return withLeafs ?
                    hits :
                    keys(hits);
            },

            /**
             * Retrieves full expressions (as added to index) that match the prefix.
             * @param prefix {string} Search term prefix.
             * @param path {string[]} Custom path identifying node type.
             * @returns {string[]} Unique list of matches.
             */
            matchingTerms: function (prefix, path) {
                prefix = prefix.toLowerCase();

                var hits = cache.mget(
                    prefix.split(RE_SPLIT_CHAR)
                        .concat([null])
                        .concat(path)
                        .concat(['*', '*']),
                    flock.BOTH
                );

                return keys(hits);
            }
        };

        return self;
    }());

    return model;
}(app.model || {});
