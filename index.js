const wchat4u = require('wechat4u');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
let Wechat = new wchat4u();
const Robot = require('./robot')(Wechat);

Wechat.start();

Wechat.on('uuid', uuid => {
    qrcode.generate('https://login.weixin.qq.com/l/' + uuid, {
        small: true
    });
    console.log('QR Code URL: ', 'https://login.weixin.qq.com/qrcode/' + uuid);
});


Wechat.on('login', () => {
    console.log('Logged in successfully!');
    Robot.start();
});

Wechat.on('logout', () => {
    console.log('Logged out successfully!');
});
