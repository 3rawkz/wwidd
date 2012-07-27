/**
 * Media Rating Class
 *
 * Model class managing ratings
 */
/*global troop, app, flock */
troop.promise(app.registerNameSpace('model'), 'Rating', function ($model, className, $input, $lookup) {
    var base = $model.Model,
        self;

    /**
     * @class
     * @static
     */
    self = app.model.Rating = base.extend()
        .addConstant({
            ROOT: ['rating']
        })
        .addMethod({
            //////////////////////////////
            // Model interface

            /**
             * Retrieves list of media associated with rating.
             * @param rating {number|string} Media rating value.
             * @return {object}
             * @static
             */
            getMedia: function (rating) {
                return $lookup.get(self.ROOT.concat([rating, 'items']), true);
            },

            /**
             * Retrieves media entry count associated with rating.
             * @param rating {number|string} Media rating value.
             */
            getCount: function (rating) {
                return $lookup.get(self.ROOT.concat([rating, 'count']), true);
            },

            /**
             * Sets rating on media entry
             * @param mediaId {string} Media entry ID.
             * @param rating {number|string} Media rating value.
             */
            setRating: function (mediaId, rating) {
                $input.set($model.Media.ROOT.concat([mediaId, 'rating']), rating);
            }
        })
        .addPrivateMethod({
            //////////////////////////////
            // Event handlers

            /**
             * Changes rating lookup according to before and after values of media entries.
             * @param before
             * @param before.media {object} Before value of media entry.
             * @param before.rating {boolean} Before value of media rating.
             * @param after
             * @param after.media {object} After value of media entry.
             * @param after.rating {boolean} After value of media rating.
             */
            _changeRating: function (before, after) {
                if (before.media) {
                    // removing old entry
                    $lookup
                        .unset(self.ROOT.concat([before.rating, 'items', before.media.mediaid]))
                        .add(self.ROOT.concat([before.rating, 'count']), -1);
                }

                if (after.media) {
                    // adding new entry
                    $lookup
                        .set(self.ROOT.concat([after.rating, 'items', after.media.mediaid]), after.media)
                        .add(self.ROOT.concat([after.rating, 'count']), 1);
                }
            },

            /**
             * Triggered on changing of rating *values*.
             */
            _onMediaRatingChanged: function (event, data) {
                var path = flock.path.normalize(event.target),
                    mediaEntry;

                // obtainig affected media entry
                path.pop();
                mediaEntry = $input.get(path, true);

                self._changeRating({
                    rating: data.before,
                    media: mediaEntry
                }, {
                    rating: data.after,
                    media: mediaEntry
                });
            },

            /**
             * Triggered on changing of entire media entries.
             */
            _onMediaEntryChanged: function (event, data) {
                self._changeRating({
                    rating: data.before ? data.before.rating : undefined,
                    media: data.before
                }, {
                    rating: data.after ? data.after.rating : undefined,
                    media: data.after
                });
            }
        });

    //////////////////////////////
    // Event bindings

    $input
        .delegate('media', flock.CHANGE, 'media.*.rating', self._onMediaRatingChanged)
        .delegate('media', flock.CHANGE, 'media.*', self._onMediaEntryChanged);

    return self;
}, app.input, app.lookup);
