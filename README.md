### 功能特性

* 支持校内直播
* 支持节目回看
* 支持节目直播
* 支持视频略缩图
* 支持收藏节目
* 兼容主流浏览器

### v2 新增功能（由 AI 生成）

以下功能在 v2 新版前端（`/v2/` 路由，可与 v1 旧版共存）中实现，由 AI（Trae + GLM）辅助生成：

* 全新自绘播放器：基于原生 video + hls.js 替代 flowplayer，多节目源一键切换，播放出错自动轮换下一个源
* 直播时移：24 小时时移轴，悬停放大镜秒级精确定位，一键回到直播
* 回看增强：倍速播放（0.5x~2x）、播放进度记忆、节目播完自动连播、同节目换源无缝续播
* 节目单面板：近 7 天节目单，上午/下午分列展示，当前观看内容自动定位与凸显，点击跳转回看/直播
* 列表页增强：频道与节目单搜索弹出面板（命中节目可直接进入回看/时移）、在线人数与回看人数实时显示、自适应多列纯信息布局、缩略图防闪动
* PC 键盘操作：方向键调节音量/快进快退，空格暂停/播放
* 移动端适配：小屏"更多"菜单收纳、触屏拖动进度条实时缩略图预览（5 秒粗粒度取图省流量）
* 兼容性：Safari 原生 HLS 与 hls.js 双引擎，旧浏览器经 core-js polyfill 支持

### 配置自己的hdtv
1. 下载代码到本地
```
git clone git@github.com:Zack-Bee/hdtv.git
cd hdtv
```

2. 修改相关配置

将config/config.js中的相关配置改成适合于自己服务器的配置,
修改src/index.html中的title, config/webpack.common.js中manifest插件相关配置
(服务器的api示例在[api.md](https://github.com/Zack-Bee/hdtv/blob/master/api.md))中

3. 打包生成代码

```
npm run build
// 生成的代码在dist中
```

4. 二次开发

```
npm start
```

### 将要做的改进
* 对移动端用户的交互支持更友好(考虑加入手势)
* 在不影响性能的情况下增加适量动画
* 增加最近观看功能
* 将配置抽离出来, 使配置自己的hdtv更方便

### 校内直播　
对校内直播服务感兴趣, 可以看看[hdtv-admin](https://github.com/Zack-Bee/hdtv-admin)

### 使用本项目的其他站点
* [辽宁师范大学HDTV](http://iptv.lnnu.edu.cn:8080/v1/list/channel/%E7%83%AD%E9%97%A8%E9%A2%91%E9%81%93)
* [西北农林大学IPTV](https://iptv.nwafu.edu.cn/)

### 其他
[东北大学HDTV](https://hdtv.neu6.edu.cn/v1/list/channel/%E7%83%AD%E9%97%A8%E9%A2%91%E9%81%93)

[东北大学先锋网络中心](https://about.neupioneer.com/)