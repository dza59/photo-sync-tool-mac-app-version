const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  syncFolders: (rawFolder, jpgFolder) =>
    ipcRenderer.invoke('sync-folders', rawFolder, jpgFolder),
  deleteTemp: (rawFolder) => ipcRenderer.invoke('delete-temp', rawFolder),
});
