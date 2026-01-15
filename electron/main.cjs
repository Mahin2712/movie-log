const { app, BrowserWindow } = require("electron");
const path = require("path");
const { Menu } = require("electron");
Menu.setApplicationMenu(null);


function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 820,
        minWidth: 1024,
        minHeight: 700,
        backgroundColor: "#050b18",
        webPreferences: {
            preload: path.join(__dirname, "preload.cjs"),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    win.loadFile(path.join(__dirname, "../dist/index.html"));

    // Optional: dev tools
    // win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
