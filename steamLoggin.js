const express = require('express')
const steamLogin = require('steam-login');
const client = require('../client.js');
const language = require('../Functions/Language');

var app = express();

app.use(require('express-session')({
    resave: false,
    saveUninitialized: false,
    secret: client.config.expressSecret
}));

app.get('/auth/discordId', (req, res) => {
    if (req.query.token === undefined) {
        res.redirect('/auth/steam/404')
        return;
    };

    app.use(steamLogin.middleware({
        realm: 'http://panel.segits.co:27016',
        verify: 'http://panel.segits.co:27016/auth/steam/return?token=' + req.query.token,
        apiKey: client.config.steamAPIKey
    }));
    res.redirect('/auth/steam')
})

app.get('/auth/steam', steamLogin.authenticate(), (req, res) => {
})

app.get('/auth/steam/return', steamLogin.verify(), function (req, res) {
    res.redirect('/auth/steam/success')

    client.emit('userSteamConnected', req.query.token, req.user["steamid"])
})

app.get('/auth/steam/success', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html>
        <head>
            <title>${language.getSentence("steamlogin", 'page_title')}</title>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <style type="text/css">
                body { text-align: center; padding: 10%; font: 20px Helvetica, sans-serif; color: #dff9fb; }
                h1 { font-size: 50px; margin: 0; }
                article { display: block; text-align: left; max-width: 650px; margin: 0 auto; }
                a { color: #dc8100; text-decoration: none; }
                a:hover { color: #dff9fb; text-decoration: none; }
                @media only screen and (max-width : 480px) {
                    h1 { font-size: 40px; }
                }
                html {
                    background-color: #130f40;
                }
            </style>
        </head>
        <body>
            <article>
                <h1>${language.getSentence("steamlogin", 'account_linked')}</h1>
                <p>${language.getSentence("steamlogin", 'can_return_discord')}</p>
            </article>
        </body>
    </html>
  `;
    res.send(html).end();
})

app.get('/404', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html>
        <head>
            <title>${language.getSentence("steamlogin", 'page_title')}</title>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <style type="text/css">
                body { text-align: center; padding: 10%; font: 20px Helvetica, sans-serif; color: #dff9fb; }
                h1 { font-size: 50px; margin: 0; }
                h2 { font-size: 25px; margin: 2; }
                article { display: block; text-align: left; max-width: 650px; margin: 0 auto; }
                a { color: #dc8100; text-decoration: none; }
                a:hover { color: #dff9fb; text-decoration: none; }
                @media only screen and (max-width : 480px) {
                    h1 { font-size: 40px; }
                }
                html {
                    background-color: #eb4d4b;
                    overflow: hidden;
                }
            </style>
        </head>
        <body>
            <article>
                <h1>${language.getSentence("steamlogin", '404_title')}</h1>
                <h2>${language.getSentence("steamlogin", '404_desc')}</h2>
            </article>
            <div style="text-align:center;">
                <img src="${client.constant.assets.media.error_404}" alt="404 img">
            </div>
        </body>
    </html>
  `;
    res.send(html).end();
})

app.get('*', (req, res) => {
    res.redirect('/404')
})

app.listen(27016)
console.log('steamLogin is online!');