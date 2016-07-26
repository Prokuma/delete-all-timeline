var express = require('express');
var router = express.Router();
var https = require('https');
var request = require('request');

/* GET home page. */
router.get('/', function(req, res, next) {
    var session = null;
    if(req.session.token){
        session = req.session.name;
    }
    res.render('index', { session: session });
});

router.get('/introduction', function(req, res, next) {
    var session = null;
    if(req.session.token){
        session = req.session.name;
    }
    res.render('introduction', { session: session });
});

router.get('/private_policy', function(req, res, next){
    var session = null;
    if(req.session.token){
        session = req.session.name;
    }
    res.render('private_policy', { session: session });
});

router.get('/login',function(req, res, next){
    res.redirect('/facebook/oauth');

});

router.get('/logout', function(req, res, next){
    req.session.name = null;
    req.session.token = null;
    req.session.next = null;
    res.redirect('/');
});

router.get('/posts', function(req, res, next){
    if(req.session.token == null || req.session.token == undefined){
        var resData = {"error":"Not logined!"};
        res.json(resData);
    }else{
        var jsonToken = JSON.parse(req.session.token);
        if(req.body.next){
            getPost25(req.session.next, function(data){
                req.session.next = data.paging.next;
                data.paging = null;
                res.json(data);
            });
        }else{
            getPost25('https://graph.facebook.com/v2.7/me/feed?access_token=' + jsonToken.access_token, function(data){
                req.session.next = data.paging.next;
                data.paging = null;
                res.json(data);
            });
        }
    }
});

router.get('/remove/:post_id', function(req, res, next){
    deleteOnePost(req.params.post_id, JSON.parse(req.session.token).access_token, function(err){
        if(err){
            res.json({"status":"error", "message":err});
        }else{
            res.json({"status":"success"});
        }
    });
});

var getPost25 = function(url, fn){
    //var data = '';
    request({
        url: url,
        method: 'GET'
        },function(err, res, body){
            if(err){
                console.error(err);
                fn(err);
            }else {
                var jsonData = JSON.parse(body);
                if(jsonData.error){
                    console.error(jsonData.error);
                }
                fn(jsonData);
                //res.on('data', function (d) {
                //    data += d;
                //});
                //res.on('end', function(){
                //    var jsonData = JSON.parse(body);
                //    if(jsonData.error){
                //        console.error(jsonData.error);
                //    }
                //    fn(jsonData);
                //});
            }
        }
    );
};

var deleteOnePost = function(post_id, token, fn){
    request({
        url:'https://graph.facebook.com/v2.7/' + post_id + '?access_token=' + token,
        method: 'DELETE'
    },function(err, res, body){
        if(err){
            console.error(err);
        }else{
            var jsonData = JSON.parse(body);
            if(jsonData.error) {
                console.error(jsonData.error);
                fn(jsonData.error);
            }else{
                console.info(jsonData.success);
                fn(null);
            }
            /*res.on('data', function(d){
                var jsonData = JSON.parse(d);
                if(jsonData.error) {
                    console.error(jsonData.error);
                    fn(jsonData.error);
                }else{
                    console.info(jsonData.success);
                    fn(null);
                }
            });*/
        }
    });
};

/*router.get('/remove', function(req, res, next){
    if(req.session.token == null || req.session.token == undefined){
        res.redirect('/facebook/oauth');
    }
    var jsonToken = JSON.parse(req.session.token);
    var pData = {value:''};
    getPost('https://graph.facebook.com/v2.7/me/feed?access_token=' + jsonToken.access_token, pData, function(){
        console.info(pData.value);
        var jsonResponse = JSON.parse(pData.value);
        sendDeleteRequest(jsonResponse, jsonResponse.data.length, 0, jsonToken.access_token, function(err){
            res.redirect('/');
        });
    });
});

var getPost = function(url, pData, fn){
    var tmpData = '';
    https.get(url, function(res_s){
        res_s.on('data', function(d){
            tmpData += d;
        });
        res_s.on('end', function(){
            var jsonResponse = JSON.parse(tmpData);

            if(jsonResponse.error != null || jsonResponse.error != undefined){
                console.error(jsonResponse.error);
            }

            var jsonData;
            if(pData.value == ''){
                pData.value = tmpData;
            }else{
                jsonData = JSON.parse(pData.value);
                for(var i = 0; i < jsonResponse.size; i++){
                    jsonData.data[jsonData.size + i] = jsonResponse.data[i];
                }
                jsonData.paging = jsonResponse.paging;
                pData.value = JSON.stringify(jsonData);
            }

            if(jsonResponse.data.length == 0){
                fn();
            }else{
                getPost(jsonResponse.paging.next, pData, fn);
            }
        });
    });
};

var sendDeleteRequest = function(jsonResponse, size, top, token, fn){
    if(size > top) {
        console.log('https://graph.facebook.com/v2.7/' + jsonResponse.data[top].id + '?access_token=' + token);
        request({
            url:'https://graph.facebook.com/v2.7/' + jsonResponse.data[top].id + '?access_token=' + token,
            method: 'DELETE'
        },function(err, res, body){
            if(err){
                console.error(err);
            }else{
                res.on('data', function(d){
                    var jsonData = JSON.parse(d);
                    if(jsonData.error){
                        console.error(jsonData.error);
                        fn(jsonData.error);
                    }else{
                        console.info(jsonData.success);
                        sendDeleteRequest(jsonResponse, size, top + 1, token, fn);
                    }
                });
            }
        });

    }else{
        fn(null);
    }
};*/

module.exports = router;
