/**
 * Template.Constants holds all constants, such
 * as breakpoints, timeouts, etc.
 *
 * @memberof Template
 * @inner
 */
var constants = {
  BREAKPOINT_MOBILE_BAR: 768,
  AUTHENTICATED: document.documentElement.classList.contains('authenticated-account'),
  COVER_PAGE: document.querySelector('.sqs-slide-container'),
  DEBUG: false
};

module.exports = constants;
