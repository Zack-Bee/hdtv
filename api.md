# HDTV API 文档（v2）

当前前端实际使用的 API 基址：`https://hdtv.neu6.edu.cn`，所有接口路径前缀 `/v2/`（生产环境中 `/v1/` 旧版与 v2 共存，前端路由与资源前缀亦为 `/v2/`，但 API 端点独立于前端路由）。

时间字段均为 **Unix 秒**。

---

## 1. GET /v2/channels —— 分类与频道列表

用于列表页显示。分类按 `categoryId` 升序排列（"所有频道"固定为 0）。

### 响应

```json
[
    {
        "name": "所有频道",
        "categoryId": 0,
        "channelList": [
            {
                "name": "CCTV-1综合",
                "channelId": "cctv1",
                "snapshotUrl": "/wall/img/cctv1_s.png",
                "keyWord": "CCTV-1zh[HD]",
                "canPlay": true
            }
        ]
    },
    {
        "name": "热门频道",
        "categoryId": 1,
        "channelList": [
            { "channelId": "cctv1" }
        ]
    }
]
```

### 字段说明

| 字段 | 类型 | 说明 |
|---|---|---|
| name | string | 分类名 / 频道名（如 `CCTV-1综合`，含连字符无空格） |
| categoryId | int | 分类 id，决定显示顺序 |
| channelList[].name / snapshotUrl / keyWord / canPlay | - | **仅"所有频道"分类给出完整字段**；其他分类（热门频道等）只给 `channelId`，其余字段由前端从"所有频道"查表补齐 |
| snapshotUrl | string | 缩略图路径（相对路径，需拼接 host；列表页刷新时追加 `?ts` 时间戳防缓存） |
| keyWord | string | 搜索关键词（如 `CCTV-1zh[HD]`，含画质后缀） |
| canPlay | bool | 当前是否有可播放的视频源 |

---

## 2. GET /v2/details —— 观看人数

所有频道的在线人数与回看人数（前端约每分钟刷新一次）。

### 响应

```json
[
    { "channelId": "cctv1", "viewerNum": 2, "catchupNum": 0 },
    { "channelId": "cctv2", "viewerNum": 0, "catchupNum": 0 }
]
```

| 字段 | 类型 | 说明 |
|---|---|---|
| viewerNum | int | 实时在线观看人数 |
| catchupNum | int | 回看观看人数 |

---

## 3. GET /v2/list/{channelId}/{days} —— 节目单

指定频道最近 `days` 天（1或7）的节目单，按天分组。前端用于播放页节目单面板、列表页"正在播出"标题、节目单搜索的本地兜底。

### 请求示例

`/v2/list/cctv1/7`（7 天）　`/v2/list/cctv1/1`（仅今天）


### 响应

```json
[
    {
        "date": "10月23日[五]",
        "list": [
            {
                "title": "生活早参考-特别节目（生活圈）2026-290",
                "startTime": 1792689120,
                "endTime": 1792691760
            },
            {
                "title": "晚间新闻",
                "startTime": 1792691760,
                "endTime": 1792693560
            }
        ]
    }
]
```

### 字段说明

| 字段 | 类型 | 说明 |
|---|---|---|
| date | string | 中文日期 `M月d日[周几]`（如 `10月23日[五]`），前端需解析出 MM-dd 与周几 |
| title | string | 节目名称 |
| startTime / endTime | int | 起止时间（Unix 秒）；**相邻节目后端保证 `endTime == 下一节目 startTime`** |

---

## 4. GET /v2/sources/{channelId}/ —— 直播/时移播放源

获取频道直播的播放源列表。`path` 内含时效性 hash token，**每次请求都不同**，前端不能缓存 path（缓存的仅是 name/quality/canCatchup/thumbnails/timeShift 元数据，用于回看页合并）。

### 响应示例（cctv1，path 已脱敏）

```json
{
    "title": "CCTV-1综合",
    "sourceList": [
        {
            "name": "1.清华源",
            "quality": "hd",
            "canCatchup": true,
            "path": "https://media.neu6.edu.cn/hls/1792715909-<hash>/cctv1hd.m3u8",
            "thumbnails": "/v2/thumbnails/cctv1/{timestamp}.png",
            "timeShift": "https://media2.neu6.edu.cn/review/{begin}-{chosenAt}-cctv1hd.m3u8"
        },
        {
            "name": "2.吉大源",
            "quality": "hd",
            "canCatchup": true,
            "path": "https://media.neu6.edu.cn/hls/1792715909-<hash>/jlu_cctv1hd.m3u8",
            "thumbnails": "/v2/thumbnails/cctv1/{timestamp}.png",
            "timeShift": "https://media2.neu6.edu.cn/review/{begin}-{chosenAt}-jlu_cctv1hd.m3u8"
        }
    ]
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|---|---|---|
| title | string | 频道名称 |
| sourceList[].name | string | 源名称（如 `1.清华源`），**不再携带 [HD]/[4K]/[回] 标记**，画质用独立 quality 字段 |
| quality | string | 画质：`sd` / `hd` / `4k` |
| canCatchup | bool | 是否支持回看/时移。**false 时前端降级**：直播页不显示时移轴，节目单中已结束节目仅展示不可点击 |
| path | string | 直播流 m3u8 地址（含时效 token） |
| thumbnails | string | 缩略图模板（相对路径，前端拼 host），`{timestamp}` 占位符替换为 Unix 秒；见第 6 节 |
| timeShift | string | 时移地址模板，`{begin}`=开始播放的节目时刻、`{chosenAt}`=设置时移点的时刻（均为 Unix 秒，设置后全程不变，换源只替换节目名部分） |

### 异常响应

频道 ID 不存在时返回 `{"title": "", "sourceList": []}`（HTTP 200），前端据此显示"无法获取播放源"错误界面。

---

## 5. GET /v2/sources/{channelId}/{startTime}-{endTime} —— 回看播放源

获取某节目回看的播放源，时间区间为节目单中的 `startTime-endTime`。响应**不含** thumbnails/timeShift 模板，前端复用直播响应（`/v2/sources/{channelId}/`）按下标合并的元数据（按频道缓存于 localStorage）。

### 响应示例

```json
{
    "title": "生活早参考-特别节目（生活圈）2026-290",
    "sourceList": [
        {
            "name": "1.清华源",
            "quality": "hd",
            "canCatchup": true,
            "path": "https://media2.neu6.edu.cn/review/program-1792689120-1792691760-cctv1hd.m3u8"
        }
    ]
}
```

| 字段 | 类型 | 说明 |
|---|---|---|
| title | string | **节目名称**（注意与直播响应的频道名不同，前端顶栏频道名须从 channels 接口另取） |

---

## 6. GET /v2/thumbnails/{channelId}/{timestamp}.png —— 缩略图

地址来自直播 sources 响应的 `thumbnails` 模板，把 `{timestamp}` 替换为对应时刻的 Unix 秒。直播/时移/回看三种场景共用同一模板。

示例：`/v2/thumbnails/cctv1/1792690000.png`

- 服务端对**近期节目**按需生成；过老节目任意时间戳均 404
- 404 / 加载失败时前端仍显示时间、不显示图片，失败结果缓存 10 秒后自动重试（适配后端延迟生成）；成功缓存永久

---

## 7. GET /v2/search/{keyword} —— 节目单搜索（回看）

按关键字匹配**近 7 天**（当前时间至前 7 天）的节目单，供前端搜索回看节目。仅对节目单标题（`list` 字段）做匹配；频道中文名的匹配由前端本地实现（拿到 `channelName` 后自行过滤）。

### 请求

`/v2/search/%E6%96%B0%E9%97%BB`（keyword 为 URL 编码后的关键字，如 `新闻`）

### 响应

```json
{
    "keyword": "新闻",
    "from": 1791307200,
    "to": 1791912000,
    "total": 200,
    "list": [
        {
            "channelName": "CCTV13 新闻",
            "channelId": "cctv13",
            "title": "新闻直播间",
            "startTime": 1791888000,
            "endTime": 1791891600
        }
    ]
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|---|---|---|
| keyword | string | 解码后的搜索关键字 |
| from / to | int | 搜索时间窗（Unix 秒）：`to` = 当前时间，`from` = `to - 7×86400` |
| total | int | 本次返回条数（命中上限 200 时为 200） |
| list[].channelName | string | 节目中文名（如 `CCTV1 综合`）。频道无中文映射时为空字符串 |
| list[].channelId | string | 节目英文名（`tvguide.channel` 原值，如 `cctv1`），可与其它接口的 `{channelId}` 对接 |
| list[].title | string | 节目名称（节目单 `list` 字段） |
| list[].startTime | int | 节目开始时间（Unix 秒），落在 `[from, to]` 窗口内 |
| list[].endTime | int | 节目结束时间（Unix 秒）= 同频道下一条节目的开始时间；**无下一条（仍在播或数据缺失）时为 `0`** |

### 规则与限制

- 结果按 `startTime` **倒序**（越新越靠前），单次最多返回 **200** 条
- 关键字做子串匹配（不区分大小写），匹配范围**仅 `title`**
- 关键字为空：HTTP 200 + `total: 0` + 空 `list`
- 数据库故障：记日志并降级返回空列表，不输出错误细节（与其它接口一致）
- **前端跳转约定**：结果项点击后，`endTime > 0` 且早于当前时刻 → 进入回看 `/v2/player/{channelId}/{startTime}-{endTime}`；`endTime = 0` **或结束时间晚于当前时刻**（仍在播出）→ 进入时移 `/v2/player/{channelId}/ts-{startTime}-{当前时刻}`

---

## 前端路由约定（与 API 配合）

| 路由 | 说明 |
|---|---|
| `/v2/list/channel/{分类名}` | 频道列表页 |
| `/v2/player/{channelId}` | 直播 |
| `/v2/player/{channelId}/{startTime}-{endTime}` | 回看 |
| `/v2/player/{channelId}/ts-{begin}-{chosenAt}` | 时移（begin=开始播放的节目时刻，chosenAt=设置时移点的时刻；旧单时间戳 `ts-{begin}` 兼容，chosenAt 用当前时间兜底） |
| 其余残缺/未知路由 | 重定向到热门频道 |
