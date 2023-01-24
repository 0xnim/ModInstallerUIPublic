const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const { download } = require('electron-dl');

let mainWindow;

ipcMain.handle('download-item', async (event, url, hash) => {
   downloadUrl(url, hash);
});

let downloadQueue = [];
let isDownloading = false;

const downloadUrl = (url, hash) => {
    downloadQueue.push({ url, hash });
    processQueue();
}

let folder = 'C://Program Files (x86)//Steam//steamapps//common//Spaceflight Simulator//Spaceflight Simulator Game//Mods';

const selectFolder = () => {
   dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    }).then(result => {
      console.log(result.canceled)
      arrayPath = result.filePaths;
      folder = arrayPath.toString();
      console.log(folder);
    }).catch(err => {
      console.log(err)
    })
};

const processQueue = async () => {
   if (!isDownloading && downloadQueue.length > 0) {
       isDownloading = true;
       const { url, hash } = downloadQueue.shift();
       const fileName = url.split('/').pop();
       try{
           await download(mainWindow, url, {
               filename: fileName,
               directory: folder, 
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
