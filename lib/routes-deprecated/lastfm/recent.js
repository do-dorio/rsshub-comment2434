const got = require('../utils/got');
const config = require('../config/index.js').value;

module.exports = async (ctx) => {
    if (!config.lastfm || !config.lastfm.api_key) {
        throw new Error('Last.fm RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>');
    }

    const user = ctx.params.user;
    const api_key = config.lastfm.api_key;

    const response = await got(`http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${user}&api_key=${api_key}&format=json`);
    const data = response.data;
    const list = data.recenttracks.track;

    ctx.state.data = {
        title: `Recent Tracks by ${data.recenttracks['@attr'].user} - Last.fm`,
        link: `https://www.last.fm/user/${user}/library`,
        item: list.map((item) => ({
            title: `${item.name} - ${item.artist['#text']}`,
            author: item.artist['#text'],
            description: `<img src="${item.image.at(-1)['#text']}" />`,
            pubDate: new Date(item.date.uts * 1000),
            link: item.url,
        })),
    };
};
