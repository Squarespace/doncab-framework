var Ancillary = require('./ancillary');


/**
 * Constructor.
 *
 * @constructor
 */
var AncillaryCollapse = function (config) {

  Ancillary.call(this, config);

  // Set constants
  this.MIN_WIDTH = config.minWidth;
  this.MAX_WIDTH = config.maxWidth;

  // Get groups
  this._getGroups();

  // Collapse on init
  this.sync();

  // Resize handler
  this.handleResize();

};

// Inheritance
var F = function () {};
F.prototype = Ancillary.prototype;
AncillaryCollapse.prototype = new F();

/**
 * Resize
 *
 * @method resize
 * @private
 */

AncillaryCollapse.prototype.handleResize = function () {

  var RESIZE_TIMEOUT = 100;
  var isDragging = false;
  var _resizeMeasureTimer;
  var _this = this;

  window.addEventListener('resize', function (){
    if (!isDragging) {
      isDragging = true;
    }

    if (_resizeMeasureTimer) {
      clearTimeout(_resizeMeasureTimer);
    }

    _resizeMeasureTimer = setTimeout(function () {
      _this.sync();

      console.log('resize end');

      isDragging = false;
    }, RESIZE_TIMEOUT);
  });
};

/**
 * Sync
 *
 * @method sync
 * @private
 */
AncillaryCollapse.prototype.sync = function () {

  if (this.inRange()) {

    for (var groupName in this.groups) {

      var group = this.groups[groupName];

      if (window.innerWidth > group.breakpoint.min && window.innerWidth <= group.breakpoint.max) {

        // group.node.classList.remove('nc-collapse');
        group.node.removeAttribute('data-nc-collapse');

        if (this.shouldCollapse(groupName)) {

          group.node.setAttribute('data-nc-collapse', '');

        }

      } else if (window.innerWidth <= group.breakpoint.min) {

        group.node.setAttribute('data-nc-collapse', '');

      } else if (window.innerWidth > group.breakpoint.max) {

        group.node.removeAttribute('data-nc-collapse');

      }

      console.log('breakpoint min: ' + group.breakpoint.min);
      console.log('breakpoint max: ' + group.breakpoint.max);

    }
  }


};

/**
 * inRange
 *
 * @method inRange
 * @private
 */
AncillaryCollapse.prototype.inRange = function () {

  if (this.MIN_WIDTH && this.MAX_WIDTH) {
    return window.innerWidth > parseFloat(this.MIN_WIDTH) && window.innerWidth <= parseFloat(this.MAX_WIDTH);
  } else if (this.MIN_WIDTH) {
    return window.innerWidth > parseFloat(this.MIN_WIDTH);
  } else if (this.MAX_WIDTH) {
    return window.innerWidth <= parseFloat(this.MAX_WIDTH);
  }

  return true;


};

/**
 * Get all collapse groups from the DOM.
 *
 * @method _getGroups
 * @private
 */
AncillaryCollapse.prototype._getGroups = function () {

  // Clear elements object
  this.groups = {};

  // Get elements
  var groupNodes = this.base.querySelectorAll('[data-nc-group]');
  for (var i = 0; i < groupNodes.length; i++) {
    var group = groupNodes[i];
    var groupName = group.getAttribute('data-nc-group');
    if (groupName.length > 0) {
      this.groups[groupName] = {
        node: group,
        containers: group.querySelectorAll('[data-nc-container]'),
        breakpoint: {
          min: 0,
          max: 999999
        }
      };
    }
  }

};

/**
 * Collapse method cycles through each
 * container in a collapse group and sees
 * if the combined width of its children
 * exceeds its width (in horizontal mode),
 * or if the width of any one of its
 * children exceeds its width (in stacked
 * mode). If so, it adds the nc-collapse
 * class to the group; if not, it removes.
 *
 * @method collapse
 * @private
 */
AncillaryCollapse.prototype.shouldCollapse = function (groupName) {

  var group = this.groups[groupName];

  // Loop through all containers in group
  for (var i = 0; i < group.containers.length; i++) {

    var container = group.containers[i];
    var containerWidth = Math.ceil(parseFloat(window.getComputedStyle(container).width));
    var elements = container.querySelectorAll('[data-nc-element]');
    var isStacked = false; // TEMP
    var totalWidth = 0;

    // Loop through all elements in container
    for (var j = 0; j < elements.length; j++) {
      var element = elements[j];
      var elementWidth = element.offsetWidth;

      if (elementWidth > 0 && !isStacked) {
        totalWidth += elementWidth;
      }

      if (isStacked && elementWidth > containerWidth ||
        !isStacked && totalWidth > containerWidth) {

        // Should collapse here.

        if (window.innerWidth > group.breakpoint.min) {
          group.breakpoint.min = window.innerWidth;
        }

        // Collapse
        return true;

      }

    }

  }


  if (window.innerWidth < group.breakpoint.max) {
    group.breakpoint.max = window.innerWidth;
  }

  return false;

};

var handleTweak = AncillaryCollapse.prototype.handleTweak;
AncillaryCollapse.prototype.handleTweak = function () {

  handleTweak.call(this);

  this.sync();

};


module.exports = AncillaryCollapse;
