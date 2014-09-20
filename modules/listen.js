/**
 * fdlbot.js
 * ¯¯¯¯¯¯¯¯¯
 * Module that listens for incoming IRC messages and downloads
 * file URLs automatically.
 */

var fs = require('fs');
var http = require('http');
var exec = require('child_process').exec;

/**
 * Direct a client to listen for files of a specific type,
 * and download them if they are found.
 *
 * This function does most of the main work. All messages pass through
 * its listener and are checked against a regular expression.
 * If a URL of a particular filetype is found, it is handed over to
 * the download function, which then downloads it using either
 * the Node.js internal HTTP request functionality, or wget.
 */
var fileListen = function(client, config)
{
    // List all extensions that we need to capture.
    var exts = config.download.fileExts;
    config.debug && console.log('Will listen for the following file extensions:', exts.join(', '));
    
    // This regexp is simple by design. Rigorous error checking is not needed.
    var urlFileMatch = new RegExp('\\b(https?|ftp)://[^\\s]*('+exts.join('|')+')(\\?[^\\s]*)?\\b', 'ig');
    config.debug > 1 && console.log('Matching regex:', urlFileMatch);
    
    var msgInfo = {
        msgCount: 0,
        matchCount: 0
    };
    
    // Add the actual listener function.
    client.addListener(config.download.listenFor, function(nick, channel, text, message)
    {
        // The raw message object will look like this:
        //
        // { prefix: 'dada_!~dada@1.2.3.4',
        //   nick: 'dada_',
        //   user: '~dada',
        //   host: '1.2.3.4',
        //   command: 'PRIVMSG',
        //   rawCommand: 'PRIVMSG',
        //   commandType: 'normal',
        //   args: ['#channel', 'message is here']}
        
        msgInfo.msgCount += 1;
        
        // Log the entire raw event if needed.
        config.debug > 1 && console.log(message);
        
        // If the message contains a file, download and store it.
        var n;
        var url, urls = text.match(urlFileMatch);
        if (urls == null) {
            return;
        }
        msgInfo.matchCount += 1;
        
        // Iterate over all files and download them.
        for (n = 0; n < urls.length; ++n) {
            url = urls[n];
            file = decodeURI(url.split('/').pop().split('?').shift());
            dest = config.fileDir+file;
            
            config.debug && console.log('Found file:', file+'.');
            
            if (fs.existsSync(dest)) {
                config.debug && console.log('This file has already been retrieved.');
                continue;
            }
            
            // Download the file. The method is automatically chosen.
            downloadFile(url, dest, config, function()
            {
                config.debug && console.log('File', file, 'has been downloaded to', dest+'.');
                
                // Save a log file with the message that led to this download.
                logFileContext(url, dest, config, nick, channel, text, message);
            });
        }
    });
    
    /**
     * Logs the status of the bot. For use in a setInterval.
     */
    var statusLog = function()
    {
        // Initialize the extra counters.
        if (msgInfo.msgCountLast == null) {
            msgInfo.msgCountLast = 0;
            msgInfo.matchCountLast = 0;
        }
        
        var msgCountSinceLast = msgInfo.msgCount - msgInfo.msgCountLast;
        var matchCountSinceLast = msgInfo.matchCount - msgInfo.matchCountLast;
        
        config.debug && console.log('Since the last', config.msgLogInterval, 'second'+(config.msgLogInterval != 1 ? 's' : '')+',', msgCountSinceLast, 'message'+(msgCountSinceLast != 1 ? 's have' : ' has')+' been processed, in which', matchCountSinceLast, 'file match'+(matchCountSinceLast != 1 ? 'es were' : ' was')+' found.');
        
        msgInfo.msgCountLast = msgInfo.msgCount;
        msgInfo.matchCountLast = msgInfo.matchCount;
    }
    
    // Initialize a cron job to log our status every once in a while.
    // Note: converting from seconds to milliseconds.
    var cronLog;
    if (config.debug) {
        cronLog = setInterval(statusLog, config.msgLogInterval * 1000);
    }
}

/**
 * Saves a text file to disk with the contextual information
 * pertaining to a download.
 */
var logFileContext = function(url, dest, config, nick, channel, text, message)
{
    var fileData = {
        fileURL: url,
        fileDestination: dest,
        rawMessage: message
    };
    var fileContents = channel+'\n<'+nick+'> '+text+'\n\n'+JSON.stringify(fileData, null, 2);
    var logFileDest = dest+'.txt';
    
    fs.writeFile(logFileDest, fileContents, function(err)
    {
        if (err) {
            config.debug > 0 && console.log('Couldn\'t save download meta information. Error code:', err.code+'.');
            config.debug > 1 && console.log('Raw error object:', JSON.stringify(err, null, 2));
        } else {
            config.debug && console.log('Saved download meta information to', logFileDest+'.');
        }
    }); 
}

/**
 * Downloads a file using whatever method deemed appropriate.
 */
var downloadFile = function(url, dest, config, cb)
{
    // We'll download the file using either Node.js's http library,
    // or we'll use wget.
    var protocol = url.split('://').shift();
    if (protocol == 'http') {
        return _downloadUsingNode(url, dest, config, cb);
    }
    else {
        config.debug && console.log('Downloading using wget.');
        return _downloadUsingWget(url, dest, config, cb);
    }
    return;
}

/**
 * Downloads a file using wget.
 */
var _downloadUsingWget = function(url, dest, config, cb)
{
    var cmd = 'wget'+(config.download.checkCert ? '' : ' --no-check-certificate')+(' -O "'+dest+'"')+(' "'+url+'"');
    var child = exec(cmd, function(err, stdout, stderr)
    {
        if (err) {
            config.debug > 0 && console.log('Couldn\'t download the file using wget. Error code:', err.code+'.');
            config.debug > 1 && console.log('Raw error object:', JSON.stringify(err, null, 2));
        }
        else {
            cb.call();
        }
    });
}

/**
 * Downloads a file using Node.js's http.get() function.
 */
var _downloadUsingNode = function(url, dest, config, cb)
{
    var request = http.get(url, function(response)
    {
        // Ensure that we get a status 200 rather than an error (e.g. 404).
        if (response.statusCode != 200) {
            config.debug && console.log('Received HTTP status', response.statusCode+'. The file ('+dest+') has not been saved to disk.');
            return;
        }
        var file = fs.createWriteStream(dest);
        response.pipe(file);
        file.on('finish', function()
        {
            file.close(cb);
        });
    });
}

exports.fileListen = fileListen;