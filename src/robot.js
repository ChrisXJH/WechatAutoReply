const config = require('./config');
const Utils = require('./utils');
module.exports = (function (http, Utils) {

    return function (Wechat) {

        let messageMap;

        let currentState;

        let contactSessionTimeout = 10;

        let refreshInterval = 3600;

        let contactSessions = {};

        let ready = false;

        // Load configuration from the config server
        let readyPromise = updateConfig();

        function Contact(username) {
            this.username = username;
            this.receivedMsgNum = 1;
            this.msgSent = 0;
            this.active = false;
        }

        Contact.prototype.deactivate = function () {
            this.active = false;
        };

        Contact.prototype.activate = function () {
            this.active = true;
        };

        Contact.prototype.incrementMsgNum = function () {
            this.receivedMsgNum++;
        };

        Contact.prototype.timeout = function (seconds) {
            let _this = this;
            setTimeout(() => {
                (function (seconds) {
                    _this.deactivate();
                    console.log(`Contact session timed out(${seconds} s): `, _this.username);
                })(seconds)
            }, seconds * 1000);
        };

        Contact.prototype.isActive = function () {
            return this.active;
        };

        Contact.prototype.getReceivedMsgNum = function () {
            return this.receivedMsgNum;
        };

        Contact.prototype.incrementMsgSent = function () {
            this.msgSent++;
        };

        Contact.prototype.getMsgSent = function () {
            return this.msgSent;
        };

        function updateConfig() {
            return new Promise((resolve, reject) => {

                config.fetchMyInfo().then(info => {
                    currentState = info['currentState'];
                }).then(() => {
                    config.fetchRobotConfig().then(conf => {
                        messageMap = conf['stateMessageMap'];
                        contactSessionTimeout = conf['contactSessionTimeout'];
                        refreshInterval = conf['refreshInterval'];
                        ready = true;
                        resolve();
                    }).catch(err => {
                        console.log(err);
                    });
                }).catch(err => {
                    console.error(err);
                });
            });
        }

        function sendReplyMessage(fromUserName) {
            updateConfig().then(() => {
                if (messageMap[currentState] != null) {
                    let reply;
                    if (contactSessions[fromUserName].getReceivedMsgNum() <= 2) {
                        reply = `【自动回复】${messageMap[currentState]}`;
                    }
                    else {
                        reply = `【自动回复】都说了${messageMap[currentState]}！`;
                    }

                    console.log('Reply: ', reply);
                    Wechat.sendMsg(reply, fromUserName)
                    .catch(err => {
                        console.error(err);
                    });
                    contactSessions[fromUserName].incrementMsgSent();
                }
            }).catch(err => {
                console.error(err);
            });
        }

        function startListener() {

            Wechat.on('message', msg => {
                console.log("Message: ", JSON.stringify(msg, null, 2));
                let fromUserName = msg['FromUserName'];
                if (!Utils.isGroupUserName(fromUserName) && (msg['MsgType'] === 1 || msg['MsgType'] === 34)) {

                    if (contactSessions[fromUserName] == null) {
                        contactSessions[fromUserName] = new Contact(fromUserName);
                    }

                    if (!msg['isSendBySelf'] && !contactSessions[fromUserName].isActive()) {
                        sendReplyMessage(fromUserName);

                        contactSessions[fromUserName].activate();
                        contactSessions[fromUserName].timeout(contactSessions[fromUserName].getMsgSent() * 10);
                    }
                    contactSessions[fromUserName].incrementMsgNum();
                }
                else if (msg['MsgType'] !== 1) {
                    console.log('Ignore message with type: ' + msg['MsgType'] + '.');
                }
            });
        }

        function start() {
            if (ready) startListener();
            else readyPromise.then(startListener);
        }


        function refresh() {
            console.log('Clear cached contact sessions.');
            contactSessions = {};
        }

        // Clear contact sessions after an hour
        setInterval(refresh, refreshInterval * 1000);

        return {
            start: start,
            refresh: refresh
        };
    };

})(config, Utils);
