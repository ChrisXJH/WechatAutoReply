const wchat4u = require('wechat4u');
const qrcode = require('qrcode-terminal');
let Wechat = new wchat4u();
const Robot = require('./robot')(Wechat);

Wechat.start();

// Keep wechat session active
function keepAlive() {
    setInterval(() => {
        Wechat.sendMsg('', 'filehelper')
        .catch(err => {
            console.error(err);
        });
    }, 5 * 60 * 1000);
}

Wechat.on('uuid', uuid => {
    qrcode.generate('https://login.weixin.qq.com/l/' + uuid, {
        small: true
    });
    console.log('QR Code URL: ', 'https://login.weixin.qq.com/qrcode/' + uuid);
});


Wechat.on('login', () => {
    console.log('Logged in successfully!');
    Robot.start();
    keepAlive();
});

Wechat.on('logout', () => {
    console.log('Logged out successfully!');
});
