import core from '@squarespace/core';
import controller from '@squarespace/controller';
import Util from './util';

var httpRequest;
var ajaxFired = false;
var currentEvent;
var currentTarget;

// This selector will prevent AjaxLoader from ajax loading the content of these links
var DEFAULT_ANCHORS = [
  'a[href]',
  ':not([target="_blank"])',
  ':not([href^="/s/"])',
  ':not([href^="http"])',
  ':not([href^="#"])',
  ':not([href^="/#"])',
  ':not([href^="/commerce"])',
  ':not([href^="mailto"])',
  ':not([href^="tel"])',
  ':not([href^="javascript"])',
  ':not(.nav-item-splash-page)'
].join('');

/**
 *  Constructor
 *
 *  @constructor
 */
var AjaxLoader = function(config) {

  // if no history object, no querySelector method, or you're logged in, don't run AjaxLoader.
  // window.location.pathname.match(/\b(config)\b/g)
  // mix this.runOnLogin in here somewhere
  if (!window.history || !document.querySelector) {
    console.log('returning, dont run AjaxLoader');
    return false;
  }

  if (!config) {
    config = {};
  }

  this.CONTENT = config.content || '[role="main"]';
  this.ANCHORS = config.anchors || DEFAULT_ANCHORS;
  this.SITE_CONTAINER = config.siteContainer || null;
  this.TIMEOUT = window.parseInt(config.timeout, 10) || 5000;
  this.SQS_CONTROLLER = config.sqsController || false;
  this.RUN_ON_LOGIN = config.runOnLogin || false;
  this.ACTIVE_NAV_CLASS = config.activeNavClass || 'active';
  this.pageTransition = {
    animLink: config.pageTransition.animLink || null,
    animClass: config.pageTransition.animClass || null,
    fadeInDuration: config.pageTransition.fadeInDuration || 0.78,
    fadeOutDuration: config.pageTransition.fadeOutDuration || 0.20
  };
  this.beforeRequestAnim = config.beforeRequestAnim || null;
  this.afterRequestAnim = config.afterRequestAnim || null;

  this.initialize();

};

AjaxLoader.prototype = {

  initialize: function () {

    // Storing our own scroll position, so we set this to manual.
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    this.replaceHistory();
    this.bind();
  },

  // Fires all the bind methods
  bind: function() {
    var body = document.body;
    this.bindAjaxAttr(document);
    this.bindMetaTags(this.findMetaTags());

    body.addEventListener('click', this.bindLinks.bind(this));
    window.addEventListener('popstate', this.bindPopState.bind(this));
  },

  bindAjaxAttr: function (parent) {
    if (!parent){
      parent = document;
    }

    document.body.dataset.ajaxLoader = 'loaded';

    var anchors = parent.querySelectorAll(this.ANCHORS);
    if (anchors.length <= 0){
      return;
    }

    for (var i = 0; i < anchors.length; i++){
      anchors[i].dataset.ajaxLoader = 'ajax-loader-binded';
    }
  },

  // For event delegation - walk up the dom til you find an anchor tag
  walkUpDOM: function(element, tagName) {
    var currentElement = element;
    while (currentElement !== null && currentElement.tagName !== tagName.toUpperCase()){
      currentElement = currentElement.parentNode;
    }
    return currentElement;
  },

  bindLinks: function (e) {
    var link = this.walkUpDOM(e.target || e.srcElement, 'A');
    if (link && link.getAttribute('data-ajax-loader') === 'ajax-loader-binded') {

      // If control, alt, or shift are pressed, return false and let default browser behavior happen
      if (this.modifierKeyPressed(e)) {
        return false;
      }

      e.preventDefault();

      // If there's not already an ajax request in progress, do this
      if (!ajaxFired){
        currentEvent = e;
        currentTarget = e.target;
        var url = link.getAttribute('href');
        this.fireRequest(url);
      }
    }
  },

  findMetaTags: function(head) {
    if (!head) {
      head = document.head;
    }

    var metaTagArray = Array.prototype.filter.call(head.childNodes, function(node){
      if (node.nodeType !== Node.ELEMENT_NODE) {
        return null;
      }

      var nodeName = node.nodeName.toUpperCase();
      var hasPropertyAttr = node.hasAttribute('property');
      var hasItempropAttr = node.hasAttribute('itemprop');
      var hasNameAttr = node.hasAttribute('name');
      var name;
      if (hasNameAttr) {
        name = node.getAttribute('name');
      }
      var hasRelAttr = node.hasAttribute('rel');

      var isElement = (
        ( nodeName === 'META' || (nodeName === 'LINK' && node.getAttribute('rel') === 'canonical') ) &&
        ( hasPropertyAttr || hasItempropAttr || ( hasNameAttr && name !== 'viewport' ) || hasRelAttr )
      );

      return isElement;
    });

    return metaTagArray;
  },

  bindMetaTags: function(arr) {
    arr.forEach(function(metaTag){
      metaTag.setAttribute('data-ajax-meta', 'binded');
    });
  },

  modifyLinkState: function(url){

    Array.prototype.forEach.call(document.querySelectorAll('.' + this.ACTIVE_NAV_CLASS), function(el){
      el.classList.remove(this.ACTIVE_NAV_CLASS);
    }.bind(this));

    Array.prototype.forEach.call(document.querySelectorAll('[href="' + url + '"]'), function(el){
      el.parentNode.classList.add(this.ACTIVE_NAV_CLASS);
    }.bind(this));

  },

  modifierKeyPressed: function(e) {
    if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) {
      return true;
    }
    return false;
  },

  hasSomeParentTheClass: function (element, classname) {
    if (element.className && element.className.split && element.className.split(' ').indexOf(classname) >= 0) {
      return true;
    }
    return element.parentNode && this.hasSomeParentTheClass(element.parentNode, classname);
  },

  fireRequest: function (url) {
    ajaxFired = true;
    // this.destroySqsBlocks();
    this.toggleLoadingAttr('add');
    // this.toggleWillChange(document.querySelector(this.SITE_CONTAINER), ['transform', 'opacity']);

    if (currentEvent.type === 'click') {

      if (this.isPageTransitionEnabled() && this.hasSomeParentTheClass(currentTarget, this.pageTransition.animLink) ) {
        // Index link click, with Page Transition Animation Enabled
        if (this.beforeRequestAnim) {
          this.beforeRequestAnim();
        }
        // No before request animation
        this.animations.fadeOut(this.SITE_CONTAINER, this.pageTransition.fadeOutDuration, function() {
          this.modifyLinkState(url);
          this.destroySqsBlocks();
          this.ajax(url);
        }.bind(this));

      } else if (this.hasSomeParentTheClass(currentTarget, this.pageTransition.animLink)) {
        // Index Link click with Page Transition disabled
        this.animations.fadeOut(this.SITE_CONTAINER, this.pageTransition.fadeOutDuration, function() {
          this.modifyLinkState(url);
          this.destroySqsBlocks();
          this.ajax(url);
        }.bind(this));

      } else {
        // Normal page link click
        this.animations.fadeOut(this.SITE_CONTAINER, 0.12, function() {
          this.modifyLinkState(url);
          this.destroySqsBlocks();
          this.ajax(url);
        }.bind(this));

      }
    } else {
      // Back button click
      this.animations.fadeOut(this.SITE_CONTAINER, 0.12, function() {
        this.modifyLinkState(url);
        this.destroySqsBlocks();
        this.ajax(url);
      }.bind(this));

    }
  },

  ajax: function (url) {

    httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', url);
    httpRequest.timeout = this.TIMEOUT;
    httpRequest.onreadystatechange = this.handleRequest.bind(this, url);
    httpRequest.ontimeout = this.handleTimeout.bind(this, url);
    httpRequest.send(null);
  },

  handleRequest: function (url) {
    if (httpRequest.readyState === 4) {
      if (httpRequest.status === 200) {
        var pageData = this.createDummyDom(httpRequest.responseText);
        if (!pageData.container || !pageData.content) {
          this.handleTimeout(url);
        } else {
          // if the clicked link is the same as current page, don't update the history
          if (url !== window.location.pathname){
            this.replaceHistory();
            this.updateHistory(url, document.querySelector('title').textContent);
          }

          this.updatePage(pageData);
        }
      } else {
        this.handleTimeout(url);
      }
    }
  },

  handleTimeout: function(url) {
    ajaxFired = false;
    window.location.href = url;
  },

  createDummyDom: function(data) {
    var html = document.createElement('html');
    html.innerHTML = data;

    var bodyClasses = html.querySelector('body').classList;

    var docTitle = html.querySelector('title').textContent;
    var head = html.querySelector('head');
    var staticContext = head.querySelector('script[data-name="static-context"]');

    var headMeta = this.findMetaTags(head);
    this.bindMetaTags(headMeta);

    var docFrag = document.createDocumentFragment();
    Array.prototype.forEach.call(headMeta, function(node){
      docFrag.appendChild(node);
    });

    var bodyId = html.querySelector('body').id;

    this.bindAjaxAttr(html);

    var dataObj = {
      newHeadChildren: docFrag,
      docTitle: docTitle,
      staticContext: staticContext,
      bodyClasses: bodyClasses,
      bodyId: bodyId,
      content: html.querySelector(this.CONTENT) ? html.querySelector(this.CONTENT).outerHTML : null,
      container: html.querySelector(this.SITE_CONTAINER) ? html.querySelector(this.SITE_CONTAINER).innerHTML : null
    };

    html = null;

    return dataObj;
  },

  updatePage: function (data) {
    var body = document.querySelector('body');
    var head = document.querySelector('head');
    var staticContext = head.querySelector('script[data-name="static-context"]');

    Array.prototype.forEach.call(head.querySelectorAll('[data-ajax-meta="binded"]'), function(node){
      head.removeChild(node);
    });

    head.appendChild(data.newHeadChildren);

    document.title = data.docTitle;
    body.className = data.bodyClasses;
    body.id = data.bodyId;

    document.querySelector(this.SITE_CONTAINER).innerHTML = data.container;
    Util.replaceScript(staticContext, data.staticContext);

    this.initializeSqsBlocks();

    if (this.SQS_CONTROLLER){
      this.refireTemplateControllers();
    }

    this.toggleLoadingAttr('remove');

    if (currentEvent.type === 'click' && ( this.hasSomeParentTheClass(currentTarget, this.pageTransition.animLink))) {
      if (this.afterRequestAnim) {
        this.afterRequestAnim();
        this.animations.fadeIn(this.SITE_CONTAINER, this.pageTransition.fadeInDuration);
      }
    } else {
      this.animations.fadeIn(this.SITE_CONTAINER, this.pageTransition.fadeInDuration);
    }

    // Determine scroll position - if coming from a link click, go to top, else, scroll to history position
    if (currentEvent.type === 'click') {
      this.scrollToPosition(0, 0);
      this.replaceHistory();
    } else {
      // this.scrollToPosition(window.history.state.position.x, window.history.state.position.y);
      this.scrollToPosition(0, 0);
    }

    // this.toggleWillChange(document.querySelector(this.SITE_CONTAINER), ['auto']);
    ajaxFired = false;
  },

  initializeSqsBlocks: function () {
    core.Lifecycle.init();
  },

  destroySqsBlocks: function () {
    core.Lifecycle.destroy();
    httpRequest = null;
  },

  refireTemplateControllers: function() {
    controller.refresh();
  },

  updateHistory: function (url, docTitle) {
    var state = {
      url: url,
      search: window.location.search,
      docTitle: docTitle,
      position: {
        x: window.scrollX,
        y: window.scrollY
      }
    };
    window.history.pushState(state, docTitle, url);
  },

  replaceHistory: function () {
    window.history.replaceState({
      url: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash, // hash is used to direct link to slides in galleries
      docTitle: document.title,
      position: {
        x: window.scrollX,
        y: window.scrollY
      }
    }, document.title, window.location.pathname + window.location.search);
  },

  bindPopState: function(e){

    if (!e.state) {
      // If there's no state property on the event, do nothing
      // because Safari treats initial page load as a popstate.
    } else if (!ajaxFired) {
      currentEvent = e;
      this.fireRequest(e.state.url + e.state.search);

    } else {
      console.log('uh oh something wrong with bindPopState');
    }
  },

  scrollToPosition: function (x, y) {
    window.scrollTo(x, y);
  },

  toggleLoadingAttr: function(method) {
    if (method === 'add') {
      document.body.setAttribute('data-ajax-loader', 'loading');
    } else if (method === 'remove') {
      document.body.setAttribute('data-ajax-loader', 'loaded');
    }
  },

  toggleWillChange: function (el, valueArr) {
    var value = valueArr.map(function(val, index, arr) {
      return index < arr.length - 1 ? val + ', ' : val;
    }).toString();
    el.style.willChange = value;
  },

  isPageTransitionEnabled: function () {
    if (document.body.classList.contains(this.pageTransition.animClass)) {
      return true;
    }
    return false;
  },

  animations: {
    fadeIn: function(el, duration, cb) {
      var container = document.querySelector('[data-ajax-loader="loaded"] ' + el);
      container.setAttribute('style', [
        'opacity: 1;',
        '-webkit-transition: opacity ' + duration + 's;',
        'transition: opacity ' + duration + 's;'
      ].join(''));
      if (cb) {
        window.setTimeout(cb, duration);
      }
    },

    fadeOut: function(el, duration, cb) {
      var container = document.querySelector('[data-ajax-loader="loading"] ' + el);
      container.setAttribute('style', [
        'opacity: 0;',
        '-webkit-transition: opacity ' + duration + 's;',
        'transition: opacity ' + duration + 's;'
      ].join(''));
      if (cb) {
        window.setTimeout(cb, duration * 1000);
      }
    },

    fade: function(type, el, duration) {
      var opacity;
      var elementLoadState;
      if (type === 'in') {
        opacity = 1;
        elementLoadState = '[data-ajax-loader="loaded"]';
      } else {
        opacity = 0;
        elementLoadState = '[data-ajax-loader="loading"]';
      }

      document.querySelector(elementLoadState + ' ' + el).setAttribute('style', [
        'opacity: ' + opacity + ';',
        '-webkit-transition: opacity ' + duration + 's;',
        'transition: opacity ' + duration + 's;'
      ].join(''));
    },

    slideUp: function (el, duration, cb) {
      document.querySelector(el).classList.add('slide-up');
      if (cb){
        window.setTimeout(cb, duration * 1000);
      }
    },

    slideIntoView: function(el, duration, cb) {
      document.querySelector(el).classList.add('slide-into-view');
      if (cb) {
        cb();
      }
    }
  }

};

export default AjaxLoader;
