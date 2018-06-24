### Path: /channels
#### Method: get
#### Usage: 获取分类与频道列表, 用于列表页显示
```
// snapshot的地址默认为/snapshot/:channalId?timeStamp
// 示例: /snapshot/cctv1?12345678

response:
[
    {
        name: "所有频道",  //分类的名字
        categoryId: 0, // 分类的id, 决定了显示在页面列表中的顺序
        // 该分类下的频道列表
        channelList: [
            {
                name: "CCTV-1", // 频道的名字
                channelId: "cctv1", // 频道的id
                title: "新闻联播", // 当前时刻频道的节目名称
                viewerNum: 10, // 该频道观众的人数
                keyWord: "", // (可选)节目搜索的关键词, 如果没有则默认是title + name
            }
        ]
    },
    {
        name: "热门节目", // 收看人数最多的前十节目
        categoryId: 1,
    },
    {
        name: "央视频道",
        categoryId: 2
    },
    {
        name: "地方频道",
        categoryId: 3
    },
    {
        name: "电影频道", // 经常播放电影的频道
        categoryId: 4
    },
    {
        name: "校内直播", // 校内活动的直播等等
        categoryId: 5
    }
]
```


### Path: /list/:channelId
#### Method: get
#### Usage: 获取指定频道id的节目清单, 用于播放器页面显示节目清单
```
path示例
/list/cctv1

response:
[
    {
        date: "7月16日",
        list: [
            {
                title: "新闻联播",
                timeline: "1529424360-1529426160"
            },
            {
                title: "天气预报",
                timeline: "1529477777-1529488888"
            }
        ]
    },
    {
        date: "7月17日",
        list: [
            {
                title: "新闻联播",
                timeline: "1529424360-1529426160"
            },
            {
                title: "天气预报",
                timeline: "1529477777-1529488888"
            }
        ]
    }
]
```

### Path: /sources/:channelId/:timeline*
#### Method: get
#### Usage: 获取指定频道, (指定timeline)的播放源, 如果没有timeline则表明是获取该频道直播的播放源, 有timeline则表明是获取该频道某个节目回看的播放源
```
// 直播播放源示例
// path: /sources/cctv1

response:
[
    {
        name: "清华视频源",
        path: "https://path/to/your.m3u8"
    },
    {
        name: "北邮视频源",
        path: "https://path/to/your.m3u8"
    }
]


// 回看节目播放源示例
// path: /sources/cctv1/1529424360-1529426160

response:
response:
[
    {
        name: "清华视频源",
        path: "https://path/to/your.m3u8"
    },
    {
        name: "北邮视频源",
        path: "https://path/to/your.m3u8"
    }
]
```
