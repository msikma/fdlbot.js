/**
 * fdlbot.js
 * ¯¯¯¯¯¯¯¯¯
 * Configuration module. If this is named config.sample.js, rename it
 * to config.js, which will be ignored on git push.
 */

/**
 * Bot configuration object.
 *
 * Most are for the IRC module and are passed on directly to the irc.Client
 * constructor. See <http://node-irc.readthedocs.org/en/latest/API.html>
 * for more information.
 *
 * Aside from that, the following variables can be set:
 *
 *   debug {0,1,2}      Level of debugging to use.
 *   fileDir            Directory to save downloaded files in.
 *   msgLogInterval     Amount of seconds until logging a status report.
 *   download
 *     fileExts         File extensions to listen for.
 *     listenFor        Emitter to listen for. (Recommended: 'message#'.)
 *     checkCert        Whether to check https certificates.
 *
 * All directory paths should end in a trailing slash.
 */
var config = {
    // Server settings (passed on to the IRC client directly).
    clientConfig: {
        channels: ['#fdlbottest'],
        floodProtection: true,
        floodProtectionDelay: 1000
    },
    server: 'irc.esper.net',
    name: 'DadaChan',
    debug: global.DEBUG,
    
    // Bot-specific configuration settings follow.
    fileDir: './incoming/',
    msgLogInterval: 500,
    download: {
        fileExts: ['mp3', 'wav', 'nsf', 'flac', 'ogg', 'mp4', 'm4a', 'wmv',
            'wma', 'ftm', 'mod', 'it', 's3m', 'xm'],
        listenFor: 'message#',
        checkCert: false
    }
};

exports.config = config;