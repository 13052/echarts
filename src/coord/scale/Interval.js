/**
 * Interval scale
 * @module echarts/coord/scale/Interval
 *
 * http://en.wikipedia.org/wiki/Level_of_measurement
 */

define(function (require) {

    var arraySlice = Array.prototype.slice;

    /**
     * @alias module:echarts/coord/scale/Interval
     * @param {Array.<number>} data
     * @constructor
     */
    var IntervalScale = function (data) {

        /**
         * Extent
         * @type {Array.<number>}
         * @private
         */
        this._extent = [-Infinity, Infinity];

        if (data) {
            this.setExtentFromData(data);
        }

        /**
         * Step is calculated in adjustExtent
         * @type {Array.<number>}
         * @private
         */
        this._interval = 0;
    };

    IntervalScale.prototype = {

        constructor: IntervalScale,

        type: 'interval',

        /**
         * Normalize given value to linear [0, 1]
         * @return {number} val
         */
        normalize: function (val) {
            var extent = this._extent;
            return (val - extent[0]) / (extent[1] - extent[0]);
        },

        /**
         * Set extent from data
         */
        setExtentFromData: function (data) {
            var max = -Infinity;
            var min = Infinity;
            var i = 0;
            for (; i < data.length; i++) {
                max = Math.max(data[i], max);
                min = Math.min(data[i], min);
            }
            this.setExtent(min, max);
        },

        /**
         * Get extent
         * @return {Array.<number>}
         */
        getExtent: function () {
            return arraySlice.call(this._extent);
        },

        /**
         * Set extent
         * @param {number} start
         * @param {number} end
         */
        setExtent: function (start, end) {
            var thisExtent = this._extent;
            thisExtent[0] = start;
            thisExtent[1] = end;
        },

        /**
         * Get interval
         */
        getInterval: function () {
            if (! this._interval) {
                this.niceTicks();
            }
            return this._interval;
        },

        /**
         * Set interval
         * @param {number} interval
         */
        setInterval: function (interval) {
            this._interval = interval;
        },

        /**
         * @return {Array.<number>}
         */
        getTicks: function () {            
            var interval = this.getInterval();
            var extent = this._extent;
            var ticks = [];
            var niceExtent = this._niceExtent;
            if (extent[0] < niceExtent[0]) {
                ticks.push(extent[0]);
            }
            var tick = niceExtent[0];
            while (tick <= niceExtent[1]) {
                ticks.push(tick);
                tick += interval;
            }
            if (extent[1] > niceExtent[1]) {
                ticks.push(extent[1]);
            }

            return ticks;
        },

        /**
         * Update interval and extent of intervals for nice ticks
         * Algorithm from d3.js
         * @param  {number} [approxTickNum = 10] Given approx tick number
         */
        niceTicks: function (approxTickNum) {
            approxTickNum = approxTickNum || 10;
            var extent = this._extent;
            var span = extent[1] - extent[0];
            // Figure out step quantity, for example 0.1, 1, 10, 100
            var interval = Math.pow(10, Math.floor(Math.log(span / approxTickNum) / Math.LN10));
            var err = approxTickNum / span * interval;

            // Filter ticks to get closer to the desired count.
            if (err <= .15) {
                interval *= 10;
            }
            else if (err <= .35) {
                interval *= 5;
            }
            else if (err <= .75) {
                interval *= 2;
            }

            var niceExtent = [];
            niceExtent[0] = Math.ceil(extent[0] / interval) * interval;
            niceExtent[1] = Math.floor(extent[1] / interval) * interval;

            this._interval = interval;
            this._niceExtent = niceExtent;
        },

        /**
         * Nice extent.
         */
        niceExtent: function () {
            var niceExtent = this._niceExtent;
            if (! niceExtent) {
                this.niceTicks();
            }
            this.setExtent(niceExtent[0], niceExtent[1]);
        }
    };

    return IntervalScale;
});