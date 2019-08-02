// 异步框架
const Koa = require('koa');
// Websocket
const websockify = require('koa-websocket');
// Websocket
const wss = require('koa-wss');
const WebSocketClient = require('ws');
// Http框架
const Http = require('http');
// 公共库
const Fs = require('fs');
const Path = require('path');
// SocketIO
const SocketIO = require('socket.io');
const jsonParser = require('socket.io-json-parser');
// 项目公共库
const Common = require('./lib/common');
const AppConfig = require('./config/app-config');

// module.exports = class ProxyService {
class ProxyService {
    constructor() {
        // 创建外部服务
        this.createExternalServer();
    }

    createExternalServer(code, data) {
        // SSL options
        const options = {
            key: Fs.readFileSync('./ssl/server.key'),  // ssl文件路径
            cert: Fs.readFileSync('./ssl/server.crt')  // ssl文件路径
        };

        // 创建异步框架
        // WSS
        let koa_wss = new Koa();
        this.app = wss(koa_wss, {}, options);
        this.app.ws.use( async (ctx, next) => {
            // return `next` to pass the context (ctx) on to the next ws middleware
            // 新的连接, 生成SocketId
            ctx.socketId = 'SOCKETID-' + Math.random().toString(36).substr(2).toLocaleUpperCase();
            Common.log('im', 'info', '[' + ctx.socketId + ']-Client.connected');

            var proxy = new WebSocketClient(AppConfig.proxy.proxyHost);
            proxy.on('message', (message) => {
                Common.log('im', 'info', '[' + ctx.socketId + ']-Proxy.message, ' + message);
                ctx.websocket.send(message);
            });
            proxy.on('close', () => {
                Common.log('im', 'info', '[' + ctx.socketId + ']-Proxy.close, [代理断开]');
                ctx.websocket.close();
            });

            ctx.websocket.on('message', async (message) => {
                Common.log('im', 'info', '[' + ctx.socketId + ']-Client.message, '+ message);
                if ( proxy.readyState == proxy.OPEN ) {
                    proxy.send(message);
                } else {
                    await new Promise(function (resolve) {
                        proxy.on('open', () => {
                            Common.log('im', 'info', '[' + ctx.socketId + ']-Client.message, [await Proxy.open]');
                            proxy.send(message);
                            resolve();
                        });
                    });
                }
            });
            ctx.websocket.on('close', function (err) {
                Common.log('im', 'info', '[' + ctx.socketId + ']-Client.close, [客户端断开], ' + err);
                proxy.close(1000, err.toString());
            });
            ctx.websocket.on('error', function (err) {
                Common.log('im', 'error', '[' + ctx.socketId + ']-Client.error, [客户端断开], ' + err);
                proxy.close(1000, err.toString());
            });
            // 等待其他中间件处理的异步返回
            await next();
            // 所有中间件处理完成
        });
    }

    start(opts) {
        // 启动服务器
        opts = opts || {};

        let port = AppConfig.proxy.port;
        if( !Common.isNull(opts.number) ) {
            port += parseInt(opts.number);
        }
        AppConfig.proxy.port = port;
        this.app.listen(port);

        Common.log('im', 'fatal', 'Proxy service start in port : ' + port);
    }
}

function handle(signal) {
    Common.log('main', 'fatal', 'Proxy service exit pid : ' + process.pid + ', env : ' + process.env.NODE_ENV);
    // 退出程序
    process.exit();
}

process.on('SIGINT', handle);
process.on('SIGTERM', handle);
process.on('SIGTERM', handle);

let number;
if( process.argv.length > 2 ) {
    number = parseInt(process.argv[2], 10);
}

// 启动Im
proxy = new ProxyService();
proxy.start({number:number});