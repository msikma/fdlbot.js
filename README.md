fdlbot.js
=========

This simple bot will sit on IRC and listen for specific file links.
If a file is detected, is will be downloaded and saved for later processing.

This is my first [Node.js](http://nodejs.org/) project, so feedback is
appreciated.


Usage guide
-----------

By default, we only include a `config.sample.js` file, which will not be
changed unless we introduce new configuration options. To use the bot,
you will need to copy it to `config.js` (which is set to be ignored by Git).

We have two dependencies: [node-irc](http://node-irc.readthedocs.org/) and
`wget` for FTP and HTTPS downloads (which is standard on most Unix systems).
To install node-irc:

```
npm install irc
```

Then, simply run the bot:

```
node fdlbot.js
```


License
-------

This project's source code is governed by the
[MIT license](http://opensource.org/licenses/MIT).
