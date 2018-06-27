### Path: /:version/channels
#### Method: get
#### Usage: 获取分类与频道列表, 用于列表页显示
```
示例path: /v1/channels

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
                snapshotUrl: "/snapshot/xxxx.png", // 节目snapshot的地址
                keyWord: "", // (可选)节目搜索的关键词, 如果没有则默认是title + name
                canPlay: true // 是否当前有能够播放的视频源
            }
        ]
    },
    {
        name: "热门节目", // 收看人数最多的前十节目
        categoryId: 1,
        channelList: [
            {
                channelId: "cctv1" // 除了所有频道, 其他的可以只给id, 由前端自己计算其他数据
            }
        ]
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

### Path: /:version/details
#### Method: get
#### Usage: 获取所有频道的观看人数
```
示例path: /v1/details

[
    {
        channelId: "cctv1",
        viewerNum: 10
    },
    {
        channelId: "cctv2",
        viewerNum: 20
    }
]
```

### Path: /:version/list/:channelId/:number
#### Method: get
#### Usage: 获取指定频道id的节目清单, 用于播放器页面显示节目清单
```
path示例: /v1/list/cctv1/7
// 七天的数据
response:
[
    {
        date: "7月16日",
        list: [
            {
                title: "新闻联播",
                startTime: 1529424360,
                endTime: 1529426160
            },
            {
                title: "天气预报",
                startTime: 1529477777,
                endTime: 1529488888
            }
        ]
    },
    {
        date: "7月17日",
        list: [
            {
                title: "新闻联播",
                startTime: 1529424360,
                endTime: 1529426160
            },
            {
                title: "天气预报",
                startTime: 1529477777,
                endTime: 1529488888
            }
        ]
    }
]

path示例: v1/list/cctv1/1
// 今天的数据
[
    {
        date: "7月17日",
        list: [
            {
                title: "新闻联播",
                startTime: 1529424360,
                endTime: 1529426160
            },
            {
                title: "天气预报",
                startTime: 1529477777,
                endTime: 1529488888
            }
        ]
    }
]
```

### Path: /:version/sources/:channelId/:timeline*
#### Method: get
#### Usage: 获取指定频道, (指定timeline)的播放源, 如果没有timeline则表明是获取该频道直播的播放源, 有timeline则表明是获取该频道某个节目回看的播放源
```
// 直播播放源示例
// path: /v1/sources/cctv1

response:
{   
    title: "CCTV-1", // 频道名称
    sourceList: [
        {
            name: "清华视频源",
            path: "https://path/to/your.m3u8",
            thumbnails: "https://true/path/in/flowplayer/{time}.png" // 直接用于flowplayer的略缩图格式字符串
        },
        {
            name: "北邮视频源",
            path: "https://path/to/your.m3u8",
            thumbnails: "https://true/path/in/flowplayer/{time}.png"
        }
    ]
}


// 回看节目播放源示例
// path: /v1/sources/cctv1/1529424360-1529426160

response:
{
    title: "新闻联播", // 节目名称
    sourceList: [
        {
            name: "清华视频源",
            path: "https://path/to/your.m3u8",
            thumbnails: "https://true/path/in/flowplayer/{time}.png"
        },
        {
            name: "北邮视频源",
            path: "https://path/to/your.m3u8",
            thumbnails: "https://true/path/in/flowplayer/{time}.png"
        }
    ]
}
```

### Path: /:version/thumbnails/:channelId/:thumbnailsTime/{time}.png
#### Method: get
#### Usage: 获取节目的略缩图
```
示例path: /v1/thumbnails/cctv1/1212313123/1232312.png
```