var core = require('@squarespace/core');


/**
 * Constructor.
 *
 * @constructor
 */
var Ancillary = function (config) {

  // Get config
  this.base = config.base;

  // Set base name constant
  this.BASE_NAME = this.base.getAttribute('data-nc-base').toLowerCase();

  // Get position settings
  this._getPositions();

  // Get elements & containers
  this._getElements();
  this._getContainers();

  // Sync elements
  for (var elementName in this.elements) {
    this.syncElement(elementName, this.positions[elementName]);
  }

  // Tweak handler
  this.handleTweak();

};

Ancillary.prototype = {

  /**
   * Grab all nc-elements from the DOM, and
   * store in object with element names as
   * keys for accessibility purposes.
   *
   * @method _getElements
   * @private
   */
  _getElements: function () {

    // Clear elements object
    this.elements = {};

    // Get elements
    var elementNodes = this.base.querySelectorAll('[data-nc-element]');
    for (var i = 0; i < elementNodes.length; i++) {
      var element = elementNodes[i];
      var elementName = element.getAttribute('data-nc-element');
      if (elementName.length > 0) {
        this.elements[elementName] = element;
      }
    }

  },


  /**
   * Grab all nc-containers from the DOM,
   * store in object with container names
   * as keys for accessibility purposes.
   * Elements in the container are also
   * stored as a nodelist.
   *
   * @method _getContainers
   * @private
   */
  _getContainers: function () {

    // Clear containers object
    this.containers = {};

    // Get containers
    var containerNodes = this.base.querySelectorAll('[data-nc-container]');
    for (var i = 0; i < containerNodes.length; i++) {
      var container = containerNodes[i];
      var containerName = container.getAttribute('data-nc-container');
      if (containerName.length > 0) {
        this.containers[containerName] = container;
      }
    }

  },


  /**
   * Match strings in className of body
   * that may be valid positions, parse,
   * and insert into object.
   *
   * @method _getPositions
   * @private
   */
  _getPositions: function () {

    // Clear positions
    this.positions = {};

    // Get body classes and parse into
    var re = new RegExp('ancillary-' + this.BASE_NAME + '-(.{1,20})-position-(.+?)(?=(\\s|$))', 'gi');
    var bodyClasses = document.body.className.match(re);

    // Check to see if bodyClasses is empty
    if (bodyClasses && bodyClasses[0]) {

      // Loop through all ancillary classes
      bodyClasses.forEach(function (className) {

        // Parse class
        var info = this.parse(className);

        // Create k/v pairs for each element/position
        this.positions[info.elementName] = info.containerName;

      }, this);

    }

  },

  /**
   * Given an element name and container
   * name, insert the element into the
   * proper container. If no element is
   * provided, nothing happens. If no
   * container is provided, remove the
   * element from the DOM.
   *
   * @method syncElement
   * @public
   */
  syncElement: function (elementName, containerName) {

    var element = this.elements[elementName];
    var container = this.containers[containerName];

    if (element) {

      if (container) {

        // Element and container are valid, insert element
        container.appendChild(element);

      } else {

        // No container, remove element
        element.parentNode.removeChild(element);

        // Issue warning
        console.warn('Container "' + containerName + '" not found. Removing element "' + elementName + '".');

      }

    } else {

      // Element not found, issue error
      console.error('Element "' + elementName + '"" not found.');

    }

  },


  /**
   * Given a setting string for this
   * ancillary base, validate and parse
   * the string into an object with an
   * elementName and containerName.
   *
   * @method parse
   * @public
   */
  parse: function (string) {

    // Convert to lowercase
    string = string.toLowerCase();

    // Check if ancillary
    if (string.indexOf('ancillary-') >= 0) {

      // Remove 'ancillary' from string
      string = string.replace('ancillary-', '');

      // Check if correct base
      if (string.indexOf(this.BASE_NAME + '-') >= 0) {

        // Remove base name from string
        string = string.replace(this.BASE_NAME + '-', '');

        // Split string
        var array = string.split(/-position-|-position/);

        if (array.length === 2) {

          return {
            elementName: array[0],
            containerName: array[1]
          };

        }

        console.error('Invalid position string: "' + string + '".');

      }

    }

    return null;

  },


  /**
   * Handletweak
   *
   * @method handleTweak
   * @public
   */
  handleTweak: function () {

    // Core exists

    var tweaks = [];
    for (var elementName in this.elements) {
      tweaks.push('ancillary-' + this.BASE_NAME + '-' + elementName + '-position');
    }

    core.Tweak.watch(tweaks, function (tweak) {

      var tweakName = tweak.name;
      var tweakValue = tweak.value;

      var info = this.parse(tweakName);

      if (info.elementName) {
        if (!info.containerName) {
          // No containerName from the parse, which means
          // it's a dropdown tweak and containerName is
          // the value instead of part of the tweakName.
          info.containerName = tweakValue.toLowerCase().split(' ').join('-');
        }

        if (tweakValue !== 'false') {
          this.syncElement(info.elementName, info.containerName);
        } else {
          this.syncElement(info.elementName);
        }
      }

    }.bind(this));

  }


};

module.exports = Ancillary;
