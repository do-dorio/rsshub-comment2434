const logger = require('../utils/logger');
const config = require('../config/index.js').value;
import Fanfou from 'fanfou-sdk';

const consumerKey = config.fanfou.consumer_key;
const consumerSecret = config.fanfou.consumer_secret;
const username = config.fanfou.username;
const password = config.fanfou.password;

let fanfou_client;
let authed = false;

const getFanfou = async () => {
    if (authed === true) {
        return fanfou_client;
    } else {
        fanfou_client = new Fanfou({
            consumerKey,
            consumerSecret,
            username,
            password,
            protocol: 'https:',
            hooks: {
                baseString(str) {
                    return str.replace('https', 'http');
                },
            },
        });

        await fanfou_client.xauth();
        logger.info('Fanfou login success.');

        authed = true;
        return fanfou_client;
    }
};

module.exports = {
    getFanfou,
};
