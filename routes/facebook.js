/**
 * Created by Kim on 2016. 7. 19..
 */
var express = require('express');
var router = express.Router();
var https = require('https');

var client_id = 'client_id';
var client_secret = 'client_secret';

var redirect_uri_user_oauth = 'http://deletealltimeline.prokuma.kr/facebook/oauth/authentication';
var scope = 'public_profile, user_posts, publish_actions';

//OAuth
router.get('/oauth', function(req, res, next) {
    res.redirect('https://www.facebook.com/dialog/oauth?client_id='+ client_id +'&redirect_uri='+ encodeURIComponent(redirect_uri_user_oauth) +'&scope='
        + encodeURIComponent(scope));
});

router.get('/oauth/authentication', function(req, res, next) {
    https.get('https://graph.facebook.com/v2.7/oauth/access_token?client_id=' + client_id + '&client_secret=' + client_secret + '&redirect_uri='
        + encodeURIComponent(redirect_uri_user_oauth) + '&code=' + req.query.code,function(res_s){
            res_s.on('data', function(d){
                var jsonToken = JSON.parse(d);
                console.log(jsonToken.access_token);
                https.get('https://graph.facebook.com/me?access_token=' + jsonToken.access_token, function(res_ss) {
                    res_ss.on('data', function(dd){
                        var jsonData = JSON.parse(dd);
                        req.session.name = jsonData.name;
                        req.session.token = JSON.stringify(jsonToken);
                        res.redirect('/');
                    });
                });
            });
    });
});

module.exports = router;