const got = require('../utils/got');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const apiUrl = `https://app.yinxiang.com/third/discovery/client/restful/public/blog-user/homepage?encryptedUserId=${id}&lastNoteGuid=&notePageSize=20`;
    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const list = response.data.blogNote.map((item) => ({
        title: item.title,
        link: item.noteGuid,
        author: item.userNickname,
    }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: `https://app.yinxiang.com/third/discovery/client/restful/public/blog-note?noteGuid=${item.link}`,
                });

                item.link = `https://www.yinxiang.com/everhub/note/${item.link}`;
                item.pubDate = new Date(Number.parseInt(detailResponse.data.blogNote.publishTime)).toUTCString();

                const description = detailResponse.data.blogNote.htmlContent;
                item.description = description.includes('<?xml') ? description.match(/<en-note>(.*)<\/en-note>/)[1] : description;

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${response.data.blogUser.nickname} - 印象识堂`,
        link: `https://www.yinxiang.com/everhub/category/${id}`,
        description: response.data.blogUser.introduction,
        item: items,
    };
};
