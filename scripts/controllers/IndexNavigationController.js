import { Tweak } from '@squarespace/core';

function IndexNavigationController() {

  const tweaks = [
    'index-link-style',
    'show-index-navigation'
  ];

  // This is to be used to bind an argument to the revealIndexNextLink function,
  // so that we can removeEventListener on the same function signature later
  let revealFn;

  let revealIndexLinkTimeout;

  /* This controller handles the 'link-next-up' class on the Index Navigation links */
  const indexLinkNextUp = () => {
    const body = document.body;
    let activeLink;
    let indexNav;

    const isNextInline = body.classList.contains('index-link-style-next-inline');
    const isNextStacked = body.classList.contains('index-link-style-next-stacked');
    if (isNextInline || isNextStacked) {
      indexNav = document.querySelector('#indexNext');
    }

    const isListInline = body.classList.contains('index-link-style-list-inline');
    const isListStacked = body.classList.contains('index-link-style-list-stacked');
    if (isListInline || isListStacked) {
      indexNav = document.querySelector('#indexNav');
    }

    indexNav.classList.remove('hide');
    activeLink = indexNav.querySelector('.active-link');

    if (activeLink.nextElementSibling) {
      activeLink.nextElementSibling.classList.add('link-next-up');
    } else {
      indexNav.querySelector('nav').firstElementChild.classList.add('link-next-up');
    }

    return indexNav;
  };

  const isElementInViewport = (el) => {
    const rect = el.getBoundingClientRect();
    return (
      (rect.top >= window.innerHeight / 1.25 && rect.top <= window.innerHeight / 1.1) ||
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
    );
  };

  const revealIndexNextLink = (nav) => {
    const inView = isElementInViewport(nav);
    if (inView) {
      nav.classList.add('reveal-index-nav');
    }
  };

  const sync = () => {
    const indexNav = indexLinkNextUp();
    revealFn = revealIndexNextLink.bind(null, indexNav);
    indexNav.classList.remove('reveal-index-nav');

    revealIndexLinkTimeout = window.setTimeout(() => {
      revealIndexNextLink(indexNav);
    }, 250);

    window.addEventListener('scroll', revealFn);
  };

  Tweak.watch(tweaks, (tweak) => {
    const nav = indexLinkNextUp();
    revealIndexNextLink(nav);
  });

  sync();

  return {
    sync: sync,
    destroy: () => {
      window.removeEventListener('scroll', revealFn);
      window.clearTimeout(revealIndexLinkTimeout);
    }
  };
}

export default IndexNavigationController;
