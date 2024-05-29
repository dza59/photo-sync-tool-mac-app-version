const selectRawFolderButton = document.getElementById('selectRawFolder');
const rawFolderDisplay = document.getElementById('rawFolder');
const selectJpgFolderButton = document.getElementById('selectJpgFolder');
const jpgFolderDisplay = document.getElementById('jpgFolder');
const processFoldersButton = document.querySelector('.pushable');
const syncResultDisplay = document.getElementById('syncResult');
const deleteTempButton = document.getElementById('deleteTemp');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');

let rawFolder = '';
let jpgFolder = '';

const addAnimation = (element, animation) => {
  element.classList.add('animate__animated', animation);
  element.addEventListener(
    'animationend',
    () => {
      element.classList.remove('animate__animated', animation);
    },
    { once: true },
  );
};

selectRawFolderButton.addEventListener('click', async () => {
  rawFolder = await window.electron.selectFolder();
  rawFolderDisplay.textContent = `Raw Folder: ${rawFolder}`;
  addAnimation(rawFolderDisplay, 'animate__fadeIn');
  selectRawFolderButton.classList.add('selected');
});

selectJpgFolderButton.addEventListener('click', async () => {
  jpgFolder = await window.electron.selectFolder();
  jpgFolderDisplay.textContent = `JPG Folder: ${jpgFolder}`;
  addAnimation(jpgFolderDisplay, 'animate__fadeIn');
  selectJpgFolderButton.classList.add('selected');
});

processFoldersButton.addEventListener('click', async () => {
  progressContainer.style.display = 'block';
  syncResultDisplay.textContent = '';
  progressBar.style.width = '0%';
  progressBar.textContent = '0%';
  let progress = 0;

  const interval = setInterval(() => {
    if (progress < 100) {
      progress += 10;
      progressBar.style.width = `${progress}%`;
      progressBar.textContent = `${progress}%`;
    }
  }, 500);

  const response = await window.electron.syncFolders(rawFolder, jpgFolder);

  clearInterval(interval);
  progressBar.style.width = '100%';
  progressBar.textContent = '100%';

  syncResultDisplay.textContent = response.message;
  addAnimation(syncResultDisplay, 'animate__fadeIn');

  progressContainer.style.display = 'none';

  if (response.unmatchedRaw.length || response.unmatchedJpg.length) {
    deleteTempButton.classList.remove('hidden');
    addAnimation(deleteTempButton, 'animate__fadeIn');
  } else {
    deleteTempButton.classList.add('hidden');
  }
});

deleteTempButton.addEventListener('click', async () => {
  const response = await window.electron.deleteTemp(rawFolder);
  syncResultDisplay.textContent = response.message;
  addAnimation(syncResultDisplay, 'animate__fadeIn');
  deleteTempButton.classList.add('hidden');
});
