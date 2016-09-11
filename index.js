const remote = require('electron').remote;
const main = remote.require('./main.js');

var exec = require('child_process').exec, child;
const spawn = require('child_process').spawn;

var path = require('path');
var os = require('os');
var fs = require('fs');

function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

function fileExists(filename){
    try {
      stats = fs.statSync(filename);
      return true;
    }catch (e) {}
    return false;
}

//XXX 3rd
deleteFolderRecursive = function(path) {
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

let packName = "AdamantineAlpha"
let packURL = "https://raw.githubusercontent.com/nexustix/mc-modpack-test/master/Adamantine/nxreplicator/bulks/Adamantine_0.nxrb"
let packDescription = "Tech modpack with modified gameplay-loop.\
                    \nAims to make modded-Minecraft more enjoyable by tweaking Risk/Reward factors."

let installDir = getUserHome()+"/.nxreplicator/instances/minecraft/"+packName+"/"

let packNameLabel = document.getElementById("modpackName");
let packDescriptionLabel = document.getElementById("modpackDescription");
let packImageLabel = document.getElementById("modpackImage");
let progressLabel = document.getElementById("progress");

let get_button = document.getElementById("getButton");
let install_button = document.getElementById("installButton");
let clean_button = document.getElementById("startButton");


let nofnString = ""
let percentString = ""

let nxreplicatorCommand = ""
let mcinterfaceCommand = ""




function setAllButtons(buttonState){
    get_button.disabled = !buttonState;
    install_button.disabled = !buttonState;
    clean_button.disabled = !buttonState;
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
        console.log(String(data));
        setProgress(String(data))
    });

    bat.stderr.on('data', (data) => {
      console.log(String(data));
    });

    bat.on('exit', (code) => {
      console.log(`Child exited with code ${code}`);
      setAllButtons(true)
    });
}

function setupProfile(){
    const bat = spawn(mcinterfaceCommand,['setupprofile', packName, "1.10", installDir] );

    bat.stdout.on('data', (data) => {
        console.log(String(data));
        setProgress(String(data))
    });

    bat.stderr.on('data', (data) => {
        console.log(String(data));
    });

    bat.on('exit', (code) => {
        console.log(`Child exited with code ${code}`);
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
      setupProfile()
      setProgress("Installation Done")
      setAllButtons(true)
    });
}

function cleanModpack(){
    setAllButtons(false)
    try{
        deleteFolderRecursive(installDir+"config")
        deleteFolderRecursive(installDir+"mods")
    }catch (e) {}
    setAllButtons(true)
}

get_button.addEventListener('click', () => {
    console.log("get");
    getModpack(packName, packURL);
}, false)

install_button.addEventListener('click', () => {
    console.log("install");
    installModpack(packName, installDir);
}, false)

clean_button.addEventListener('click', () => {
    console.log("clean");
    cleanModpack()
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

clean_button.style.background='#F69C55'
clean_button.style.color='#000000'

install_button.style.background='#4CAF50'
install_button.style.color='#000000'

get_button.style.background='#4CAF50'
get_button.style.color='#000000'

if( fileExists(bulkPath) ){
    install_button.disabled = false
}else{
    install_button.disabled = true
}

if (fileExists(installDir)){
    clean_button.disabled = false
}else{
    clean_button.disabled = true
}
//alert(getUserHome())
/*
if ( == "win32"){

}else if (true) {

}
*/

//setAllButtons(false)
//clean_button.disabled = true;
//clean_button.innerHTML = "Launch Modpack";
//clean_button.innerHTML = "________";
setModpackName(packName);
setModpackDescription(packDescription);
//setModpackImage("http://www.w3schools.com/html/pic_mountain.jpg");
setModpackImage("https://raw.githubusercontent.com/nexustix/mc-modpack-test/master/Adamantine/other/Adamantine.png");
setProgress("");

//getModpack('AdamantineTest','https://raw.githubusercontent.com/nexustix/mc-modpack-test/master/Adamantine/nxreplicator/bulks/Adamantine_0.nxrb');
//installModpack('AdamantineTest', './instances/cake');
