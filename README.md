Catalog
=================

   * [WebRTC流媒体网关服务器](#WebRTC流媒体网关服务器)
   		* [功能](#功能)
      * [第三方开源](#第三方开源)
      
      
# WebRTC流媒体网关服务器
## 功能
- 接收客户端SDP信令(Websocket)
- 接收WebRTC客户端推送音视频流(SRTP/SRTCP), 并转发到Nginx(RTMP)
- 视频只支持接收H264, 不是Baseline profile的会进行转码, 音频只支持Opus, 转码AAC

### 时序图
![](https://github.com/KingsleyYau/WebRTC-Server/blob/master/Server/doc/MediaServer_Call_Sequence.png?raw=true)

### 测试页面
https://github.com/KingsleyYau/WebRTC-Server/blob/master/Server/sig/src/static/index.html

## 第三方开源
[nice](https://github.com/libnice/libnice)</br>
[srtp](https://github.com/cisco/libsrtp)</br>
[websocket](https://github.com/zaphoyd/websocketpp)</br>