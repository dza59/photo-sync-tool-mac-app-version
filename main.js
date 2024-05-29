const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'src/preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  mainWindow.loadFile('src/index.html');

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
  return result.filePaths[0];
});

ipcMain.handle('sync-folders', async (event, rawFolderPath, jpgFolderPath) => {
  const rawFolder = path.resolve(rawFolderPath);
  const jpgFolder = path.resolve(jpgFolderPath);
  const tempFolder = path.resolve(path.dirname(rawFolderPath), 'temp');

  const rawFiles = fs
    .readdirSync(rawFolder)
    .filter((file) => path.extname(file).toLowerCase() === '.cr3');
  const jpgFiles = fs
    .readdirSync(jpgFolder)
    .filter((file) => path.extname(file).toLowerCase() === '.jpg');

  const rawFileNames = rawFiles.map((file) => path.parse(file).name);
  const jpgFileNames = jpgFiles.map((file) => path.parse(file).name);

  const unmatchedRaw = rawFileNames.filter(
    (fileName) => !jpgFileNames.includes(fileName),
  );
  const unmatchedJpg = jpgFileNames.filter(
    (fileName) => !rawFileNames.includes(fileName),
  );

  if (!unmatchedRaw.length && !unmatchedJpg.length) {
    return {
      message: 'JPG and RAW photos are already synced. No sync needed.',
      unmatchedRaw: [],
      unmatchedJpg: [],
    };
  }

  if (!fs.existsSync(tempFolder)) {
    fs.mkdirSync(tempFolder);
  }

  unmatchedRaw.forEach((fileName) => {
    fs.renameSync(
      path.join(rawFolder, fileName + '.CR3'),
      path.join(tempFolder, fileName + '.CR3'),
    );
  });

  unmatchedJpg.forEach((fileName) => {
    fs.renameSync(
      path.join(jpgFolder, fileName + '.jpg'),
      path.join(tempFolder, fileName + '.jpg'),
    );
  });

  return {
    message:
      'Unmatched files moved to temporary folder. Please review before final deletion.',
    unmatchedRaw,
    unmatchedJpg,
  };
});

ipcMain.handle('delete-temp', async (event, rawFolderPath) => {
  const tempFolder = path.resolve(path.dirname(rawFolderPath), 'temp');
  fs.rmdirSync(tempFolder, { recursive: true });
  return { message: 'Temporary folder deleted.' };
});
