var core = require('@squarespace/core');

var Util = {

  resizeEnd: function(fn) {
    var RESIZE_TIMEOUT = 100;
    var isDragging = false;
    var _resizeMeasureTimer;

    window.addEventListener('resize', function (){
      if (!isDragging) {
        isDragging = true;
      }

      if (_resizeMeasureTimer) {
        clearTimeout(_resizeMeasureTimer);
      }

      _resizeMeasureTimer = setTimeout(function () {
        fn();

        isDragging = false;
      }, RESIZE_TIMEOUT);
    });
  },

  reloadImages: function (selector, options) {
    for (var i = 0; i < selector.length; i++) {
      core.ImageLoader.load(selector[i], options);
    }
  },

  getClosest: function(elem, selector) {

    var firstChar = selector.charAt(0);

    // Get closest match
    for (; elem && elem !== document; elem = elem.parentNode) {

      // If selector is a class
      if (firstChar === '.') {
        if (elem.classList.contains(selector.substr(1))) {
          return elem;
        }
      }

      // If selector is an ID
      if (firstChar === '#') {
        if (elem.id === selector.substr(1)) {
          return elem;
        }
      }

      // If selector is a data attribute
      if (firstChar === '[') {
        if (elem.hasAttribute(selector.substr(1, selector.length - 2))) {
          return elem;
        }
      }

      // If selector is a tag
      if (elem.tagName.toLowerCase() === selector) {
        return elem;
      }

    }

    return false;
  },

  determineCollectionType: function() {
    var type;
    var elClasses = Array.prototype.slice.apply(document.body.classList);

    elClasses.forEach(function(className) {
      if (className.indexOf('collection-type-') === 0) {
        type = className.split('-')[2];
      }
    });

    return type;
  },

  shouldShowBanner: function(type) {
    type = type || this.determineCollectionType();
    var showCurrentPageTypeBanner = document.body.classList.contains('show-' + type + '-banner');
    var isHomepage = document.body.classList.contains('homepage');
    var showHomepageBanner = document.body.classList.contains('show-homepage-banner');

    return showCurrentPageTypeBanner || (isHomepage && showHomepageBanner);
  },

  replaceAttributes: function(element, referenceElement) {
    var elementAttributes = Array.from(element.attributes);
    for (let i = 0; i < elementAttributes.length; i++) {
      element.removeAttribute(elementAttributes[i].name);
    }
    for (let i = 0; i < referenceElement.attributes.length; i++) {
      element.setAttribute(referenceElement.attributes[i].name, referenceElement.attributes[i].value);
    }
  },

  replaceScript: function(element, referenceElement) {
    var parentElement = element.parentElement;
    var newScriptElement = document.createElement('script');
    newScriptElement.innerHTML = referenceElement.innerHTML;
    this.replaceAttributes(newScriptElement, element);
    parentElement.removeChild(element);
    parentElement.appendChild(newScriptElement);
  }

};

module.exports = Util;
