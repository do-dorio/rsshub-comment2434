const got = require('../utils/got');
const config = require('../config/index.js').value;

module.exports = async (ctx) => {
    if (!config.lastfm || !config.lastfm.api_key) {
        throw new Error('Last.fm RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>');
    }

    const country = ctx.params.country;
    const api_key = config.lastfm.api_key;

    const response = await got(`http://ws.audioscrobbler.com/2.0/?method=${country ? 'geo.gettoptracks' : 'chart.gettoptracks'}${country ? '&country=' + country : ''}&api_key=${api_key}&format=json`);
    const data = response.data;
    const list = data.tracks.track;

    ctx.state.data = {
        title: `Top Tracks${country ? ' in ' + data.tracks['@attr'].country : ''} - Last.fm`,
        link: 'https://www.last.fm/charts#top-tracks',
        item: list.map((item) => ({
            title: `${item.name} - ${item.artist.name}`,
            author: item.artist.name,
            description: `<img src="${item.image.at(-1)['#text']}" />`,
            pubDate: new Date(),
            link: item.url,
        })),
    };
};
