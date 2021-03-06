/*
* App服务内部端口配置
* Author: Max.Chiu
* */

// 数据库配置
const AppConfig = {
    log:{
        host: 'ws://127.0.0.1',     // 服务ip地址
        port: 9875                  // 端口
    },
    http:{
        host: 'http://127.0.0.1',   // 服务ip地址
        port: 9876                  // 端口
    },
    https:{
        host: 'https://127.0.0.1',  // 服务ip地址
        port: 9877                  // 端口
    },
    exApp:{
        host: 'ws://127.0.0.1',     // 服务ip地址
        port: 19876                 // 端口
    },
    inApp:{
        host: 'ws://127.0.0.1',     // 服务ip地址
        port: 19877                 // 起始端口
    },
    exApp2:{
        host: 'wss://127.0.0.1',     // 服务ip地址
        port: 19878                 // 端口
    },
    proxy:{
        port: 9081,                             // 端口
        proxyHost: 'ws://192.168.88.133:9881',   // 代理服务ip地址
    },
}

module.exports = AppConfig;