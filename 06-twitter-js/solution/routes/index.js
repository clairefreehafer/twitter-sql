'use strict';
var express = require('express');
var router = express.Router();
var tweetBank = require('../tweetBank');
var client = require('../db/index');

module.exports = function makeRouterWithSockets (io) {

  // a reusable function
  function respondWithAllTweets (req, res, next){
    client.query(`SELECT *
                  FROM tweets, users
                  WHERE users.id = tweets.user_id`, function(err, result) {
      if (err) return next(err); // pass errors to express
      res.render('index', { title: 'Twitter.js', tweets: result.rows, showForm: true });
    });
  }

  // here we basically treet the root view and tweets view as identical
  router.get('/', respondWithAllTweets);
  router.get('/tweets', respondWithAllTweets);

  router.get('/users/:username', function(req, res, next){
    client.query(`SELECT *
                  FROM tweets, users
                  WHERE users.name = $1 AND tweets.user_id = users.id`, [req.params.username], function(err, result) {
      if (err) return next(err);
      res.render('index', {
        title: 'Twitter.js',
        tweets: result.rows,
        showForm: true,
        username: req.params.username
      });
    });
  });

  router.get('/tweets/:id', function(req, res, next){
    client.query(`SELECT *
                  FROM tweets, users
                  WHERE tweets.id = $1
                    AND tweets.user_id = users.id`, [+req.params.id], function(err, result) {
      if (err) return next(err);
      res.render('index', { title: 'Twitter.js', tweets: result.rows });
    });
  });
  // can use '${req.params.id}' instead of $1 etc.

  router.post('/tweets', function(req, res, next){
    client.query(`SELECT *
                  FROM tweets, users
                  WHERE users.name = $1`, [req.body.name], function(err, result) {
      if (err) return next(err);
      if (result.rows.length === 0) {
        client.query(`INSERT INTO users (name, picture_url)
                      VALUES ($1, $2)`, [req.body.name, 'https://pbs.twimg.com/media/Civ9AUkVAAAwihS.jpg'], function(err, result) {
          if (err) return next(err);
        });
      }
      client.query(`INSERT INTO tweets (user_id, content)
                      SELECT id, $1
                      FROM users
                      WHERE users.name = $2`, [req.body.text, req.body.name], function(err, result) {
        if (err) return next(err);
        res.redirect('/');
      });
    });
  });

  return router;
};
