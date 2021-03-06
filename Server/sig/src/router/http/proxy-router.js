/*
* 获取代理接口
* Author: Max.Chiu
* */

// 路由
const Router = require('koa-router');

// 项目公共库
const Common = require('../../lib/common');
// Redis
// const redisClient = require('../../lib/redis-connector').RedisConnector.getInstance();
// Model的Keys
const DBModelKeys = require('../../db/model-keys');

const Fs = require('fs');
const Path = require('path');
const Url = require('url');
const Exec = require('child_process');

function readDirSync(path, httpPath){
    let json = [];
    let pa = Fs.readdirSync(path);
    pa.forEach(function(file, index){
        let info = Fs.statSync(path + "/" + file)
        if( info.isDirectory() ){
            // readDirSync(path + "/"+ file);
        } else {
            let absolutePath = path + "/" + file;
            let relativePath = httpPath + "/" + file;
            // console.log("absolutePath: ". absolutePath, ", relativePath: ", relativePath);

            let rex = /.*(.jpg)/;
            let bFlag = rex.test(relativePath);
            if ( bFlag ) {
                json.push(relativePath);
            }
        }
    })
    return json;
}

// 设置路由
let proxyRouter = new Router();
// 定义为异步中间件
proxyRouter.all('/serverList', async (ctx, next) => {
    let respond = [
        {host:'127.0.0.1', port:9877},
        {host:'127.0.0.1', port:9878}
        ];
    ctx.body = respond;
});

proxyRouter.all('/verify/v1/start', async (ctx, next) => {
    let respond =
        {"errno":0,"errmsg":""}
    ;
    ctx.body = respond;
});

proxyRouter.all('/sync', async (ctx, next) => {
    let respond;

    Exec.exec('cd /root/Github/LiveServer/doc && ./autologin.sh && ./preview_8899.sh', (err, stdout, stderr) => {
        if ( err || stderr ) {
            respond = stdout;
        } else {
            respond = 'OK';
        }
    })

    ctx.body = respond;
});

proxyRouter.all('/snapshot', async (ctx, next) => {
    let respond = readDirSync(Common.AppGlobalVar.rootPath + "/static/snapshot", "snapshot");
    ctx.body = respond;
});

proxyRouter.all('/snapshot_backup', async (ctx, next) => {
    let respond = readDirSync(Common.AppGlobalVar.rootPath + "/static/snapshot_backup", "snapshot_backup");
    ctx.body = respond;
});

proxyRouter.all('/pic_jpg', async (ctx, next) => {
    let respond = readDirSync(Common.AppGlobalVar.rootPath + "/static/pic_jpg", "pic_jpg");
    ctx.body = respond;
});

proxyRouter.all('/set', async (ctx, next) => {
    let respond = {
        "errno":0,
        "errmsg":"",
        "res":-2,
        "userId":ctx.session.sessionId,
    }

    // 增加到redis
    // await redisClient.client.
    // hsetnx(
    //     'hash_user_online_' + ctx.session.sessionId,
    //     'name', ctx.session.sessionId
    // ).then( (res) => {
    //     Common.log('http', 'info', '[' + ctx.session.sessionId  + ']-hsetnx], res: ' + res);
    //     respond.res = res;
    // }).catch( (err) => {
    //     Common.log('http', 'warn', '[' + ctx.session.sessionId  + ']-hsetnx], err: ' + err);
    //     respond.errmsg = err;
    // });
    //
    // await redisClient.client.
    // expire(
    //     'hash_user_online_' + ctx.session.sessionId,
    //     300
    // ).then( (res) => {
    //     Common.log('http', 'info', '[' + ctx.session.sessionId  + ']-expire], res: ' + res);
    //     respond.res = res;
    // }).catch( (err) => {
    //     Common.log('http', 'warn', '[' + ctx.session.sessionId  + ']-expire], err: ' + err);
    //     respond.errmsg = err;
    // });

    let start = process.uptime() * 1000;

    // 随机增加时间, 防止雪崩
    let timeRnd = Math.floor(Math.random() * 30);
    // 因为使用集群, 必须保证key的hash在同一个slot, 否则不能使用事务
    // await redisClient.client.multi().
    // hset(
    //     'h_user_online_' + ctx.session.sessionId,
    //     'name', 'max-' + ctx.session.sessionId,
    //     'age', 18
    // ).expire(
    //     'h_user_online_' + ctx.session.sessionId,
    //     1800 + timeRnd
    // ).exec().then( (res) => {
    //     let all = JSON.stringify(res);
    //     Common.log('http', 'info', '[' + ctx.session.sessionId  + ']-set], res:' + all);
    //     respond.res = res;
    // }).catch( (err) => {
    //     Common.log('http', 'warn', '[' + ctx.session.sessionId  + ']-set], err:' + err);
    //     respond.errmsg = err;
    // });
    let end = process.uptime() * 1000;
    respond.time = end - start + 'ms';

    ctx.body = respond;
});

proxyRouter.all('/get', async (ctx, next) => {
    let respond = {
        errno:0,
        errmsg:"",
        res:-2,
        user_id:ctx.session.sessionId,
    }

    let url = Url.parse(decodeURI(ctx.originalUrl.toLowerCase()),true);
    let user_id = url.query.user_id;
    let start = process.uptime() * 1000;
    // 可以在这里增加hash filter, 减少缓存穿透
    await redisClient.client.multi().
    hgetall(
        'hash_user_online_' + user_id
    ).exec().then( (res) => {
        let all = JSON.stringify(res);
        Common.log('http', 'info', '[' + ctx.session.sessionId  + ']-get], res:' + all);
        respond.res = res;
    }).catch( (err) => {
        Common.log('http', 'warn', '[' + ctx.session.sessionId  + ']-get], err:' + err);
        respond.errmsg = err;
    });
    let end = process.uptime() * 1000;
    respond.time = end - start + 'ms';

    ctx.body = respond;
});

proxyRouter.all('/nodes', async (ctx, next) => {
    let respond = {
        "errno":0,
        "errmsg":"",
        "res":-2,
        "userId":ctx.session.sessionId,
    }

    let start = process.uptime() * 1000;
    let nodes = redisClient.client.nodes('slave');
    await Promise.all(
        nodes.map(function (node) {
           return node.keys('*');
        })
    ).then( (res) => {
        // respond.res = res;
    });
    await Promise.all(
        nodes.map(function (node) {
            return node.dbsize();
        })
    ).then( (res) => {
        respond.res = res;
    });
    let end = process.uptime() * 1000;
    respond.time = end - start + 'ms';

    ctx.body = respond;
});

proxyRouter.all('/nodes_dbsize', async (ctx, next) => {
    let respond = {
        "errno":0,
        "errmsg":"",
        "res":-2,
        "userId":ctx.session.sessionId,
    }

    let start = process.uptime() * 1000;
    let nodes = redisClient.client.nodes('slave');
    await Promise.all(
        nodes.map(function (node) {
            return node.dbsize();
        })
    ).then( (res) => {
        respond.res = res;
    });
    let end = process.uptime() * 1000;
    respond.time = end - start + 'ms';

    ctx.body = respond;
});

proxyRouter.all('/rnd', async (ctx, next) => {
    let respond = {
        "errno":0,
        "errmsg":"",
        "res":-2,
        "userId":ctx.session.sessionId,
    }

    let start = process.uptime() * 1000;

    // 可以在这里增加hash filter, 减少缓存穿透
    let nodes = redisClient.client.nodes('slave');
    let index = Math.floor(Math.random() * 10) % nodes.length;
    let cursor = -1;
    await nodes[index].dbsize().then( (res) => {
        if ( res > 0 ) {
            cursor = Math.floor(Math.random() * 10) % res;
        }
    }).catch( (err) => {
        Common.log('http', 'warn', '[' + ctx.session.sessionId  + ']-rnd], err:' + err);
    });

    if ( cursor > -1 ) {
        Common.log('http', 'info', '[' + ctx.session.sessionId  + ']-rnd], index:' + index + ', cursor:'+ cursor);
        await nodes[index].multi().
        scan(
            cursor, 'match', 'hash_user_online_*', 'count', 10
        ).exec().then( (res) => {
            let all = JSON.stringify(res);
            Common.log('http', 'info', '[' + ctx.session.sessionId  + ']-rnd], res:' + all);
            respond.res = res;
        }).catch( (err) => {
            Common.log('http', 'warn', '[' + ctx.session.sessionId  + ']-rnd], err:' + err);
            respond.errmsg = err;
        });
    }

    let end = process.uptime() * 1000;
    respond.time = end - start + 'ms';

    ctx.body = respond;
});

proxyRouter.all('/test', async (ctx, next) => {
    let respond = {
        "errno":0,
        "errmsg":"",
        "userId":ctx.session.sessionId,
    }

    let start = process.uptime() * 1000;
    let end = process.uptime() * 1000;
    respond.time = end - start + 'ms';

    // ctx.session.data = new Array(1e7).join('*');

    ctx.body = respond;
});

proxyRouter.all('/gc', async (ctx, next) => {
    let respond = {
        "errno":0,
        "errmsg":"",
        "userId":ctx.session.sessionId,
    }

    let start = process.uptime() * 1000;
    gc();
    // const Heapdump = require('heapdump');
    // Heapdump.writeSnapshot('./heapsnapshot/heapsnapshot-' + Date.now());
    let end = process.uptime() * 1000;
    respond.time = end - start + 'ms';

    ctx.body = respond;
});

module.exports = proxyRouter;