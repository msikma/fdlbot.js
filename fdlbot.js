/**
 * fdlbot.js
 * ¯¯¯¯¯¯¯¯¯
 * This simple bot will sit on IRC and listen for specific file links.
 * If a file is detected, is will be downloaded and saved for later processing.
 *
 *
 *   The MIT License (MIT)
 *
 *   (C) 2014 Michiel Sikma <michiel@sikma.org>
 *
 *   For a full list of contributors, view the project commit history.
 *
 *   Permission is hereby granted, free of charge, to any person obtaining a
 *   copy of this software and associated documentation files (the "Software"),
 *   to deal in the Software without restriction, including without limitation
 *   the rights to use, copy, modify, merge, publish, distribute, sublicense,
 *   and/or sell copies of the Software, and to permit persons to whom the
 *   Software is furnished to do so, subject to the following conditions:
 *   
 *   The above copyright notice and this permission notice shall be included in
 *   all copies or substantial portions of the Software.
 *   
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 *   THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 *   FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 *   DEALINGS IN THE SOFTWARE.
 *
 *
 * For more information, visit <https://github.com/msikma/fdlbot.js/>.
 */

var irc = require('irc');
var assert = require('assert');

// Global debugging switch. {0,1,2}
global.DEBUG = 1;

var listenModule = require('./modules/listen.js')
var configModule = require('./modules/config.js')

// Print some information about the current bot to the console.
console.log("fdlbot.js <http://github.com/msikma/fdlbot.js/>");
console.log("(C) 2014 Michiel Sikma <michiel@sikma.org>, MIT license");

var config = configModule.config;

// Create the IRC client.
var client = new irc.Client(config.server, config.name, config.clientConfig);

// Listen for file downloads ad infinitum.
listenModule.fileListen(client, config);
