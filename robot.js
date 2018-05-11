const config = require('./config');

module.exports = (function (http) {

    return function (Wechat) {

        let messageMap;

        let currentState;

        let contactSessionTimeout = 10;

        let refreshInterval = 3600;

        let contactSessions = {};

        let ready = false;

        // Load configuration from the config server
        let readyPromise = new Promise((resolve, reject) => {

            config.fetchMyInfo().then(info => {
                currentState = info['currentState'];
            }).then(() => {
                config.fetchRobotConfig().then(config => {
                    messageMap = config['stateMessageMap'];
                    contactSessionTimeout = config['contactSessionTimeout'];
                    refreshInterval = config['refreshInterval'];
                    ready = true;
                    resolve();
                }).catch(err => {
                    console.log(err);
                });
            }).catch(err => {
                console.error(err);
            });
        });

        function Contact(username) {
            this.username = username;
            this.receivedMsgNum = 1;
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
                _this.deactivate();
                console.log("Contact session timed out: ", _this.username);
            }, seconds * 1000);
        };

        Contact.prototype.isActive = function () {
            return this.active;
        };

        Contact.prototype.getReceivedMsgNum = function () {
            return this.receivedMsgNum;
        };

        function startListener() {

            Wechat.on('message', msg => {
                console.log("Message: ", JSON.stringify(msg, null, 2));
                if (!msg['isSendBySelf'] && messageMap[currentState] != null) {
                    let fromUserName = msg['FromUserName'];
                    if (contactSessions[fromUserName] == null) {
                        contactSessions[fromUserName] = new Contact(fromUserName);
                    }
                    else if (contactSessions[fromUserName].isActive()) {
                        contactSessions[fromUserName].incrementMsgNum();
                    }

                    if (!contactSessions[fromUserName].isActive()) {
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


                        contactSessions[fromUserName].activate();
                        contactSessions[fromUserName].timeout(contactSessionTimeout);
                    }
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

})(config);
