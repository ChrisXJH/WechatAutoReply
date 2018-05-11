const http = require('https');

module.exports = (function (http) {

    const myInfoEndpoint = process.env.CONFIG_SERVER
            ? process.env.CONFIG_SERVER + '/info.json'
            : 'https://raw.githubusercontent.com/ChrisXJH/config-server/master/info.json';

    const robotConfigEndpoint = process.env.CONFIG_SERVER
            ? process.env.CONFIG_SERVER + '/inwechat_robotfo.json'
            :'https://raw.githubusercontent.com/ChrisXJH/config-server/master/wechat_robot.json';

    function fetchMyInfo() {
        return httpGet(myInfoEndpoint);
    }

    function fetchRobotConfig() {
        return httpGet(robotConfigEndpoint);
    }

    function httpGet(endpoint) {
        return new Promise((resolve, reject) => {
            http.get(endpoint, res => {
                if (res.statusCode !== 200) {
                    reject(new Error('Expect http status 200, but received: ', res.statusCode));
                }

                let body = '';
                res.on('data', chunk => {
                    body += chunk;
                });

                res.on('end', () => {
                    resolve(JSON.parse(body));
                });

            }).on('error', err => {
                throw err;
            });
        });
    }


    return {
        fetchMyInfo: fetchMyInfo,
        fetchRobotConfig: fetchRobotConfig
    };

})(http);
