### Path: /channels
#### Method: get
#### Usage: 获取分类与频道列表
```

response:
[
    {
        name: "所有频道",  //分类的名字
        categoryId: 0, // 分类的id, 决定了显示在页面列表中的顺序
        // 该分类下的频道列表
        channelList: [
            {
                name: "CCTV-1", // 频道的名字
                snapshotUrl: "someUrl", // 频道当前时刻的snapshot
                channelId: 0, // 频道的id
                title: "新闻联播", // 当前时刻频道的节目名称
                viewerNum: 10, // 该频道观众的人数
                keyWord: "", // 节目搜索的关键词

                // 节目源的列表
                sourceList: [
                    {
                        name: "测试",
                        path: "https://media2.neu6.edu.cn/hls/cctv1hd.m3u8"
                    },
                    {
                        name: "吉大",
                        path: "https://media2.neu6.edu.cn/hls/hls27.m3u8"
                    }
                ]
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


### Path: /review/:channelName
#### Method: get
#### Usage: 获取指定频道名字的回看列表
```
path示例
/review/CCTV-1

response:
[
    {
        data: "7月16日",
        list: [
            {
                title: "新闻联播",
                startTime: "19:00",
                endTime: "19:30",
                sourceList: [
                    {
                        name: "东北大学",
                        path: "https://media2.neu6.edu.cn/hls/cctv1hd.m3u8"
                    },
                    {
                        name: "吉大",
                        path: "https://media2.neu6.edu.cn/hls/cctv1hd.m3u8"
                    }
                ]
            },
            {
                title: "天气预报",
                startTime: "19:30",
                endTime: "19:40",
                sourceList: [
                    {
                        name: "东北大学",
                        path: "https://media2.neu6.edu.cn/hls/cctv1hd.m3u8"
                    },
                    {
                        name: "吉大",
                        path: "https://media2.neu6.edu.cn/hls/cctv1hd.m3u8"
                    }
                ]
            }
        ]
    }
]
```