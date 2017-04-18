import constants from '../constants';

function MobileOverlayFolders(element) {

  if (constants.DEBUG) { console.log('MobileOverlayFolders'); }

  const handleClick = (e) => {

    let target = e.target;

    while (target !== element && target.getAttribute('data-controller-folder-toggle') === null) {
      target = target.parentNode;
    }

    const folderID = target.getAttribute('data-controller-folder-toggle');

    if (folderID) {

      // FolderID, folder is being clicked
      const folder = element.querySelector('[data-controller-folder="' + folderID + '"]');

      if (folder) {
        folder.classList.toggle('is-active-folder');
        element.classList.toggle('has-active-folder');
      }

    }


  };

  const sync = () => {
    element.addEventListener('click', handleClick);
  };

  const destroy = () => {
    element.removeEventListener('click', handleClick);
  };

  sync();

  return {
    sync,
    destroy
  };

}


module.exports = MobileOverlayFolders;
