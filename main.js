const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const { download } = require('electron-dl');

let mainWindow;

ipcMain.handle('download-item', async (event, url, hash, type) => {
   downloadUrl(url, hash, type);
});

let downloadQueue = [];
let isDownloading = false;

const downloadUrl = (url, hash, type) => {
    downloadQueue.push({ url, hash });
    processQueue(type);
}

let folder = 'C://Program Files (x86)//Steam//steamapps//common//Spaceflight Simulator//Spaceflight Simulator Game';

const selectFolder = () => {
   dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    }).then(result => {
      console.log(result.canceled)
      arrayPath = result.filePaths;
      folder = arrayPath.toString();
      updateDownloadPaths();
    }).catch(err => {
      console.log(err)
    })
};

const updateDownloadPaths = () => {
   downloadPaths = {
      "mod": folder.replace(/\//g, '\\') + '\\Mods',
      "pack": folder.replace(/\//g, '\\') + '\\Mods\\Parts',
      "texture": folder.replace(/\//g, '\\') + '\\Mods\\Textutre Packs'
   }
}

let downloadPaths = {
   "mod": folder.replace(/\//g, '\\') + '\\Mods',
   "pack": folder.replace(/\//g, '\\') + '\\Mods\\Custom Assets\\Parts',
   "texture": folder.replace(/\//g, '\\') + '\\Mods\\Custom Assets\\Textutre Packs'
}


const processQueue = async (type) => {
   if (!isDownloading && downloadQueue.length > 0) {
       const downloadPath = downloadPaths[type];
       console.log(downloadPath)
       isDownloading = true;
       const { url, hash } = downloadQueue.shift();
       const fileName = url.split('/').pop();
       try{
           console.log('check1');
           await download(mainWindow, url, {
               filename: fileName,
               directory: downloadPath, 
           });
       } catch (error) {
           console.log(error)
       }
       isDownloading = false;
       processQueue();
   }
};


const template = [
  {
     label: 'File',
     submenu: [
        {
            label: 'Browse Game Directory',
            click: _ => { selectFolder()
         }
        },
        {
           label: 'Exit',
           click: _ => { app.quit() }
        }
     ]
  },
  
  {
     label: 'View',
     submenu: [
        {
           role: 'reload'
        },
        {
           role: 'toggledevtools'
        },
        {
           type: 'separator'
        },
        {
           role: 'resetzoom'
        },
        {
           role: 'zoomin'
        },
        {
           role: 'zoomout'
        },
        {
           type: 'separator'
        },
        {
           role: 'togglefullscreen'
        }
     ]
  },
  
  {
     role: 'window',
     submenu: [
        {
           role: 'minimize'
        },
        {
           role: 'close'
        }
     ]
  },
  
  {
     role: 'help',
     submenu: [
        {
           label: 'Learn More'
        }
     ]
  }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

app.on('ready', () => {

   mainWindow = new BrowserWindow({
      width: 900,
      height: 600,
      webPreferences: {
         nodeIntegration: true,
         contextIsolation: false
      }   
   });

  mainWindow.loadFile('build/index.html');
});