const electron = require("electron")
const {app, BrowserWindow} = electron

app.on('ready', () =>{
    let win = new BrowserWindow({
        width:800,
        height:452,
        backgroundColor: '#2e2c29',
        resizable: false
    });
    win.loadURL(`file://${__dirname}/index.html`)
    //win.webContents.openDevTools()
})

app.on('window-all-closed', function () {
    app.quit();
});

exports.openWindow = () => {
    let win = new BrowserWindow({width:400, height:200})
    win.loadURL(`file://${__dirname}/second.html`)
}
