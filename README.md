### 功能特性

* 支持节目回看
* 支持节目直播
* 支持视频略缩图
* 支持收藏节目
* 兼容流行浏览器

### 配置自己的hdtv
1. 下载代码到本地
```
git clone git@github.com:Zack-Bee/hdtv.git
cd hdtv
```

2. 修改相关配置

将config/config.js中的相关配置改成适合于自己服务器的配置,
修改src/index.html中的title, config/webpack.common.js中manifest插件相关配置
(服务器的api示例在[api.md]中(https://github.com/Zack-Bee/hdtv/blob/master/api.md))

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
* 增加pc端的键盘操作
* 增加对校内直播更多的支持
* 增加最近观看功能
* 将配置抽离出来, 使配置自己的hdtv更方便

### 其他
[东北大学HDTV](https://hdtv.neu6.edu.cn/v1/list/channel/%E7%83%AD%E9%97%A8%E9%A2%91%E9%81%93)

[东北大学先锋网络中心](https://about.neupioneer.com/)
