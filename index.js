const { Client } = require('whatsapp-web.js');
const { app, BrowserWindow, dialog } = require('electron');
const qrcode = require('qrcode-terminal');
const betaTesters = ["573053287745@c.us", "573046330863@c.us", "573045465879@c.us"];
const betaTestersName = ['Abbaro', 'Wanes']
const fs = require('fs');
const SESSION_FILE_PATH = './session.json';
let sessionData;
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionData = require(SESSION_FILE_PATH);
}
const isMentioned = (message) => {
    if (message.includes("@573330363135")) {
        return true;
    } else {
        return false;
    }
}
const client = new Client({
    session: sessionData,
    ffmpegPath: './utils/ffmpeg.exe'
});
client.initialize();
client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});
const isBetaTester = (id) => {
    for (let index = 0; index < betaTesters.length; index++) {
        const element = array[index];
        if (element == id) {
            return true
        }
    }
    return false
}
const getBetaTesterName = (id) => {
    for (let index = 0; index < betaTesters.length; index++) {
        let element = array[index];
        if (element == id) {
            return betaTestersName[index];
        }
    }
    return ""
}
let options = {
    buttons: ["Si", "No", "Cancelar"],
    message: "Desea aceptar este Sticker?"
}
const openPreview = (contact, dataType, base64, destination, image) => {
    const mainWindow = new BrowserWindow({
        autoHideMenuBar: true
    });
    mainWindow.loadURL('data:' + dataType + ';base64,' + base64);
    dialog.showMessageBox(mainWindow,{
        message: "Desea aceptar este sticker?",
        type: "warning",
        buttons: ["Si" ,"Cancelar","No"],
        defaultId: 0,
        cancelId: 1,
        title: "Solicitud de sticker",
        detail: "Datos de la solicitud: Pedido por: "+contact.pushname+", número: "+contact.number
    }).then(result => {
        if (result.response === 0) {
          // bound to buttons array
          mainWindow.hide();
          client.sendMessage(destination, image, { sendMediaAsSticker: true, stickerAuthor: "Torrober", stickerName: "Torrober Automated Stickers" });
        } else {
          // bound to buttons array
          mainWindow.hide();
        }
      }
    );
}

client.on('message', message => {

    if (message.body === "@573330363135 !makeSticker") {
        if (message.hasMedia) {
            const media = message.downloadMedia().then((image) => {
                message.getContact().then((contact)=>{
                    message.getChat().then((chat) => {
                        if(chat.isGroup) {
                            openPreview(contact,image.mimetype, image.data, message.from, image);
                        } else {
                            openPreview(contact,image.mimetype, image.data, message.from, image);
                        }                      
                    })
                })
            })
        } else {
            client.sendMessage(message.from, "Por favor envie un medio.");
        }
    } else if (message.body === "!makeSticker") {
        if (message.hasMedia) {
            const media = message.downloadMedia().then((image) => {
                message.getContact().then((contact)=>{
                    message.getChat().then((chat) => {
                        if(chat.isGroup) {
                            client.sendMessage(message.from,"¿Me llamaron?");
                            client.sendMessage(message.from,"Si estoy en un grupo recuerda mencionarme con el comando *!makeSticker* para solicitar tu sticker! :p");
                        } else {
                            openPreview(contact,image.mimetype, image.data, message.from, image);
                        }                      
                    })
                })
            })
        } else {
            client.sendMessage(message.from, "Por favor envie un medio.");
        }
    }
});
client.on('authenticated', (session) => {
    sessionData = session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
        if (err) {
            console.error(err);
        }
    });
});
