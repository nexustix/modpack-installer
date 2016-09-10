const remote = require('electron').remote;
const main = remote.require('./main.js');

var exec = require('child_process').exec, child;
const spawn = require('child_process').spawn;

var path = require('path');
var os = require('os');
var fs = require('fs');

let packName = "AdamantineX"
let packURL = "https://raw.githubusercontent.com/nexustix/mc-modpack-test/master/Adamantine/nxreplicator/bulks/Adamantine_0.nxrb"
let packDescription = "Tech modpack with modified gameplay-loop.\nAims to make modded-minecraft more enjoyable."

let packNameLabel = document.getElementById("modpackName");
let packDescriptionLabel = document.getElementById("modpackDescription");
let packImageLabel = document.getElementById("modpackImage");
let progressLabel = document.getElementById("progress");

let get_button = document.getElementById("getButton");
let install_button = document.getElementById("installButton");
let start_button = document.getElementById("startButton");


let nofnString = ""
let percentString = ""

let nxreplicatorCommand = ""
let mcinterfaceCommand = ""




function setAllButtons(buttonState){
    get_button.disabled = !buttonState;
    install_button.disabled = !buttonState;
    //start_button.disabled = !buttonState;
}

function setModpackName(packName){
    //document.getElementById("modpackName").innerHTML = packName;
    packNameLabel.innerHTML = packName;
}

function setModpackDescription(packDescription){
    //document.getElementById("modpackDescription").innerHTML = packDescription;
    packDescriptionLabel.innerHTML = packDescription;
}

function setModpackImage(packImage){
    //document.getElementById("modpackImage").src = packImage;
    packImageLabel.src = packImage
}

function setProgress(progressString){
    //document.getElementById("progress").innerHTML = "["+progressString+"]";
    progressLabel.innerHTML = "["+progressString+"]";
}

/*
setModpackName("Test Pack")
setModpackDescription("Test description")
setModpackImage("http://www.w3schools.com/html/pic_mountain.jpg")
setProgress("Test")
*/

function listModpacks(){
    child = exec(nxreplicatorCommand+' list',
    function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
             console.log('exec error: ' + error);
        }
    });
}

function getModpack(modpackName, modpackURL) {
    /*
    child = exec('nxreplicator get '+modpackName+' "'+modpackURL+'"',
    function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        setProgress(stdout)
        console.log('stderr: ' + stderr);
        if (error !== null) {
             console.log('exec error: ' + error);
        }
    });
    */
    setAllButtons(false)
    const bat = spawn(nxreplicatorCommand,['get',modpackName, modpackURL] );

    bat.stdout.on('data', (data) => {
        var tmpString = String(data)
        if (tmpString.indexOf(' of ') >= 0){
            console.log(String(data));
        }
      //console.log(String(data));
      //alert(String(data))
      segments = String(data).split("<->");
      setProgress(segments[segments.length-1])
    });

    bat.stderr.on('data', (data) => {
      console.log(String(data));
    });

    bat.on('exit', (code) => {
      console.log(`Child exited with code ${code}`);
      setAllButtons(true)
    });
}

function installModpack(modpackName, destination) {
    //const bat = spawn('pwd');
    setAllButtons(false)
    const bat = spawn(nxreplicatorCommand,['install',modpackName, destination] );

    bat.stdout.on('data', (data) => {
        var tmpString = String(data)
        if (tmpString.indexOf(' of ') >= 0){
            console.log(String(data));
            var segments = String(data).split("(");
            nofnString = "("+segments[segments.length-1]
            percentString = ""
            //setProgress(segments[segments.length-1])
        }else{
            var segments = String(data).split("<->");
            //setProgress(segments[segments.length-1])
            percentString = segments[segments.length-1]
        }
        setProgress(nofnString+": "+percentString)
      //console.log(String(data));
      //alert(String(data))

    });

    bat.stderr.on('data', (data) => {
      console.log(String(data));
    });

    bat.on('exit', (code) => {
      console.log(`Child exited with code ${code}`);
      setAllButtons(true)
    });
}


function fileExists(filename){
    try {
      stats = fs.statSync(filename);
      return true;
    }catch (e) {}
    return false;
}

function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}


get_button.addEventListener('click', () => {
    console.log("get");
    getModpack(packName, packURL);
}, false)

install_button.addEventListener('click', () => {
    console.log("install");
    installModpack(packName, './instances/'+packName);
}, false)

start_button.addEventListener('click', () => {
    console.log("start");
    //installModpack('AdamantineTest', './instances/cake');
}, false)


switch(os.platform()) {
    case "win32":
        if (fileExists('./bin/win32/nxreplicator.exe')) {
            nxreplicatorCommand = './bin/win32/nxreplicator.exe'
        }
        if (fileExists('./bin/win32/mcinterface.exe')) {
            mcinterfaceCommand = './bin/win32/mcinterface.exe'
        }
        break;
    case "linux":
        if (fileExists('./bin/linux/nxreplicator')) {
            nxreplicatorCommand = './bin/linux/nxreplicator'
        }
        if (fileExists('./bin/linux/mcinterface')) {
            mcinterfaceCommand = './bin/linux/mcinterface'
        }
        break;
    default:
        alert(os.platform())
}
if (mcinterfaceCommand == "") {
    alert("Using mcinterface executables on PATH")
    mcinterfaceCommand = "mcinterface"
}
if (nxreplicatorCommand == "") {
    alert("Using nxtreplicator executables on PATH")
    nxreplicatorCommand = "nxreplicator"
}

let bulkPath = getUserHome()+"/.nxreplicator/bulks/"+packName+".nxrb"

if( fileExists(bulkPath) ){
    install_button.disabled = false
}else{
    install_button.disabled = true
}
//alert(getUserHome())
/*
if ( == "win32"){

}else if (true) {

}
*/

//setAllButtons(false)
start_button.disabled = true;
//start_button.innerHTML = "Launch Modpack";
start_button.innerHTML = "________";
setModpackName(packName);
setModpackDescription(packDescription);
//setModpackImage("http://www.w3schools.com/html/pic_mountain.jpg");
setModpackImage("https://raw.githubusercontent.com/nexustix/mc-modpack-test/master/Adamantine/other/Adamantine.png");
setProgress("");

//getModpack('AdamantineTest','https://raw.githubusercontent.com/nexustix/mc-modpack-test/master/Adamantine/nxreplicator/bulks/Adamantine_0.nxrb');
//installModpack('AdamantineTest', './instances/cake');
