'use strict';
var express = require('express');
var router = express.Router();
var tweetBank = require('../tweetBank');
var client = require('../db/index');

module.exports = function makeRouterWithSockets (io) {

  // a reusable function
  function respondWithAllTweets (req, res, next){
    client.query('SELECT * FROM tweets, users WHERE users.id = tweets.user_id', function(err, result) {
      if (err) return next(err); // pass errors to express
      var tweets = result.rows;
      res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
    });
  }

  // here we basically treet the root view and tweets view as identical
  router.get('/', respondWithAllTweets);
  router.get('/tweets', respondWithAllTweets);

  // single-user page
  router.get('/users/:username', function(req, res, next){
    // tweets.content, tweets.user_id, users.name
    client.query('SELECT * FROM tweets, users WHERE users.name = $1 AND tweets.user_id = users.id', [req.params.username], function(err, result) {
      if (err) return next(err);
      var tweetsForName = result.rows;
      res.render('index', {
        title: 'Twitter.js',
        tweets: tweetsForName,
        showForm: true,
        username: req.params.username
      });
    });
  });

  // single-tweet page
  router.get('/tweets/:id', function(req, res, next){
    client.query('SELECT * FROM tweets, users WHERE tweets.id = $1 AND tweets.user_id = users.id;', [+req.params.id], function(err, result) {
      if (err) return next(err);
      var tweetWithThatId = result.rows;
      res.render('index', { title: 'Twitter.js', tweets: tweetWithThatId });
    });
  });

  // create a new tweet
  router.post('/tweets', function(req, res, next){
    client.query('SELECT * FROM tweets, users WHERE users.name = $1', [req.body.name], function(err, result) {
      if (err) return next(err);
      if (result.rows.length === 0) {
        client.query('INSERT INTO users (name, picture_url) VALUES ($1, $2)', [req.body.name, 'https://pbs.twimg.com/media/Civ9AUkVAAAwihS.jpg'], function(err, result) {
          if (err) return next(err);
          res.redirect('/');
        });
      }
    });
    // var newTweet = tweetBank.add(req.body.name, req.body.text);
    // res.redirect('/');
  });

  // // replaced this hard-coded route with general static routing in app.js
  // router.get('/stylesheets/style.css', function(req, res, next){
  //   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
  // });

  return router;
};
