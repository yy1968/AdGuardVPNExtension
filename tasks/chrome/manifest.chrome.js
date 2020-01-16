module.exports = {
    minimum_chrome_version: '55.0',
    options_page: 'options.html',
    permissions: [
        'storage',
        'unlimitedStorage',
        'proxy',
        'notifications',
        'activeTab',
        'management',
        'webRequest',
        'webRequestBlocking',
        '<all_urls>',
    ],
};
