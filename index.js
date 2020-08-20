
const app = require('express')();
const port = 1001;
const bp = require('body-parser');
const asyncHandler = require('express-async-handler');
const $activityLog = require('../users/model/activity_log.model');
const randomString = require('randomstring');
const hashSecret = 'T@!10R5@N5$@17';
const jwt = require('jsonwebtoken');

app.use(bp.json());
app.use(bp.urlencoded({extended : true}));


app.use(function(req, res , next){
    let rand = randomString.generate({length: 24, charset: 'alphanumeric'});
    const header = req.headers['authorization'];
    let tokens = {};
    let user;
    if(header && header.authorization && typeof header !== 'undefined'){
        const bearer = header.split(' ');
        const token = bearer[1];
        jwt.verify(token, hashSecret, function(err, decoded) {
            tokens = decoded;
            if(decoded.userType == 'user'){
                user = decoded.user_id;
            }else{
                user = decoded._business_id
            }
        });

        $activityLog.create({
            activity_log_id: rand,
            url: req.url,
            user: user,
            token: req.headers.token,
            //file: f,
            requestBody: req.body,
            //roles: req.login.roles,
            ip: (req.headers['x-forwarded-for'] || req.connection.remoteAddress).split(',').map(i => i.trim()).pop(),
            userAgent: req.headers['user-agent'],
            headers: "'" + JSON.parse(req.headers) +"'",
            method: req.method
        }).then(data => {
            next();
        }).catch(err => {
            res.status(500).json({message: err});
        })
    }else{
        $activityLog.create({
            activity_log_id: rand,
            url: req.url,
            //token: req.headers.token,
            //file: f,
            headers: "'" + JSON.parse(req.headers) +"'",
            requestBody: req.body,
            ip: (req.headers['x-forwarded-for'] || req.connection.remoteAddress).split(',').map(i => i.trim()).pop(),
            userAgent: req.headers['user-agent'],
            method: req.method
        }).then(data => {
            next();
        }, err => {
            res.status(500).json({message: err});
        }).catch(err => {
            res.status(500).json({message: err});
        })
    }
})

app.all("/admin/*", asyncHandler(async (req, res, next) => {
    res.redirect(307, "http://localhost:1002"+req.url);
}))

app.all("/application/*", asyncHandler(async (req, res, next) => {
    res.redirect(307, "http://localhost:1003"+req.url);
}))

app.all("/auth/*", asyncHandler(async (req, res, next) => {
    let url = "http://localhost:1004"+req.url;
    res.redirect(307, url);
}))

app.all("/users/*", asyncHandler(async (req, res, next) => {
    let url = "http://localhost:1005"+req.url;
    res.redirect(307, url);
}))

app.all("/payments/*", asyncHandler(async (req, res, next) => {
    let url = "http://localhost:1006"+req.url;
    res.redirect(307, url);
}))

app.listen(port, () => {
    console.log(`${port}`);
})


