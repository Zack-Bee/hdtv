import React from 'react'
import { withStyles, createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import { Link } from "react-router-dom"
import Tooltip from '@material-ui/core/Tooltip'
import IconButton from '@material-ui/core/IconButton'
import blue from "@material-ui/core/colors/blue"
import HomeIcon from "@material-ui/icons/Home"
import PeopleIcon from "@material-ui/icons/People"
import HistoryIcon from "@material-ui/icons/History"
import Player from "../components/Player.jsx"
import VideoListButton from "../components/VideoListButton.jsx"
import FavoriteButton from "../components/FavoriteButton.jsx"
import SourceButton from "../components/SourceButton.jsx"
import RatioButton from "../components/RatioButton.jsx"
import MobileMenuButton from "../components/MobileMenuButton.jsx"
import ColorSnackbar from "../components/ColorSnackbar.jsx"
import config from "../../config/config"

const styles = {
    root: {
        flexGrow: 1,
        height: "100vh",
        overflow: "hidden"
    },
    flex: {
        flex: 1,
    },
    // 频道名: 可收缩(noWrap 省略), 给后面的节目名让位
    titleFit: {
        minWidth: "0"
    },
    // 正在播放的节目名称: 跟在频道名后, 小号浅色与频道名区分; 非大屏不显示
    programName: {
        minWidth: "0",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        fontSize: "14px",
        fontWeight: 400,
        color: "rgba(255,255,255,0.65)",
        paddingLeft: "10px",
        ["@media (max-width: 959px)"]: {
            display: "none"
        }
    },
    menuButton: {
        marginLeft: -12,
        marginRight: 20,
    },
    appBar: {
        backgroundColor: blue[500]
    },
    // 小屏(≤600px)时顶栏四个按钮收纳为竖排三点"更多"菜单
    pcOnly: {
        ["@media (max-width: 600px)"]: {
            display: "none"
        }
    },
    mobileOnly: {
        display: "none",
        ["@media (max-width: 600px)"]: {
            display: "block"
        }
    },
    // 顶栏在线/回看人数: 标题右侧, 白色小字; marginLeft auto 保证小屏(节目名占位隐藏)下也靠右
    viewerNums: {
        display: "inline-flex",
        alignItems: "center",
        marginLeft: "auto",
        marginRight: "8px",
        fontSize: "13px",
        color: "rgba(255,255,255,0.9)",
        whiteSpace: "nowrap",
        "& svg": {
            fontSize: "15px",
            marginRight: "3px"
        },
        "& span": {
            marginRight: "8px"
        }
    }
}

const theme = createMuiTheme({
    palette: {
        primary: {
            main: blue[500],
            dark: blue[500]
        }
    }
})

// 直播源元数据缓存结构版本: 后端模板语义变更(如缩略图模板从流名 hls47 路径
// 改回频道 ID 路径)时递增, 旧缓存全部视为过期丢弃, 回看页会重新拉取直播
// sources 获得新模板——避免历史用户永久拿着过期模板请求缩略图而 404
const META_V = 2

class PlayerPage extends React.Component {
    render() {
        const { classes, match } = this.props
        // 返回到进入播放页前浏览的分类(直链进入时兜底热门频道)
        const lastCategory = localStorage.getItem("lastCategory") || "热门频道"
        return (
            <div className={classes.root}>
                <AppBar position="static" classes={{ root: classes.appBar }}>
                    <Toolbar>
                        <Tooltip title="返回频道列表">
                            <Link to={`/${config.version}/list/channel/${lastCategory}`}>
                                <IconButton className={classes.menuButton}
                                    color="inherit" aria-label="Home">
                                    <HomeIcon />
                                </IconButton>
                            </Link>
                        </Tooltip>
                        <Typography variant="title" color="inherit"
                            className={classes.titleFit} noWrap
                        >
                            {this.state.channelName || this.state.title}
                        </Typography>
                        {/* 正在播放的节目名称: 大屏跟在频道名后(小号浅色), 空时仅占位把按钮推到右侧 */}
                        <span className={classes.flex + " " + classes.programName}>
                            {this.currentProgramName()}
                        </span>
                        {/* 在线人数 + 回看人数 (details 接口, 约每分钟刷新) */}
                        <span className={classes.viewerNums} id="hp-viewer-nums">
                            <PeopleIcon />
                            <span>{this.state.viewerNum || 0}</span>
                            <HistoryIcon />
                            <span>{this.state.catchupNum || 0}</span>
                        </span>
                        <SourceButton className={classes.pcOnly}
                            name={this.state.currentSourceName}
                            setSource={this.setSource}
                            sourceList={this.state.sourceList}
                            channel={match.params.channel}
                            openSignal={this.state.mobileSignals.source} />
                        <FavoriteButton className={classes.pcOnly}
                            channel={match.params.channel}
                            toggleSignal={this.state.mobileSignals.favorite}
                            onFavoriteChange={this.handleFavChange} />
                        <VideoListButton className={classes.pcOnly}
                            color="inherit"
                            channel={match.params.channel}
                            title={this.state.title}
                            timeline={this.state.timeline}
                            videoList={this.state.videoList}
                            canCatchup={this.state.currentCanCatchup}
                            openSignal={this.state.mobileSignals.videolist} />
                        <RatioButton className={classes.pcOnly}
                            ratio={this.state.ratio}
                            setRatio={this.setRatio}
                            openSignal={this.state.mobileSignals.ratio} />
                        <MobileMenuButton className={classes.mobileOnly}
                            onPick={this.handleMobilePick}
                            isFavorite={this.state.isFav} />
                    </Toolbar>
                </AppBar>
                <MuiThemeProvider theme={theme}>
                    <Player path={this.state.currentSourcePath}
                        title={this.state.title}
                        thumbnails={this.state.currentSourceThumbnails}
                        channel={this.state.channel}
                        timeline={this.state.timeline}
                        videoList={this.state.videoList}
                        ratio={this.state.ratio}
                        sourceCount={this.state.sourceList ? this.state.sourceList.length : 1}
                        canCatchup={this.state.currentCanCatchup}
                        sourceError={this.state.sourceError}
                        onRetrySource={this.handleRetrySource}
                        onPlayEnd={this.handlePlayEnd}
                        onTimeshift={this.handleTimeshift}
                        onBackToLive={this.handleBackToLive}
                        onSourceError={this.handleSourceError}
                    />
                    <ColorSnackbar />
                </MuiThemeProvider>
            </div>
        )
    }

    constructor(props) {
        super(props)
        this.state = {
            title: "正在加载",
            sourceList: [],
            currentSourcePath: "",
            currentSourceName: "",
            currentSourceThumbnails: "",
            currentSourceIndex: "",
            currentQuality: "",
            currentCanCatchup: true,
            // 播放源加载失败/无源(无效频道等): Player 显示错误界面而非卡加载态
            sourceError: false,
            timeline: "",
            channel: "",
            ratio: "",
            videoList: [],
            isDialogOpen: false,
            isSnackbarOpen: false,
            // 小屏"更多"菜单触发信号: 数值变化一次代表请求打开对应面板/动作
            mobileSignals: {
                source: 0,
                favorite: 0,
                videolist: 0,
                ratio: 0
            },
            // 收藏状态: FavoriteButton 上报, 小屏更多菜单据此显示 收藏/取消收藏
            isFav: false,
            // 在线/回看人数 (details 接口, 约每分钟刷新)
            viewerNum: "",
            catchupNum: "",
            // 频道名: 回看响应的 title 是节目名, 顶栏频道名必须从 channels 接口取
            channelName: ""
        }
        this.setSource = this.setSource.bind(this)
        this.setRatio = this.setRatio.bind(this)
        this.playNextVideo = this.playNextVideo.bind(this)
        this.handlePlayEnd = this.handlePlayEnd.bind(this)
        this.handleTimeshift = this.handleTimeshift.bind(this)
        this.handleBackToLive = this.handleBackToLive.bind(this)
        this.handleSourceError = this.handleSourceError.bind(this)
        this.handleMobilePick = this.handleMobilePick.bind(this)
        this.handleFavChange = this.handleFavChange.bind(this)
        this.fetchDetails = this.fetchDetails.bind(this)
        this.handleRetrySource = this.handleRetrySource.bind(this)
    }

    // 错误界面"重试": 按当前路由重新拉取播放源
    handleRetrySource() {
        this.setState({ sourceError: false })
        this.loadSource(this.props.match.params.channel, this.state.timeline)
    }

    // 小屏"更多"菜单选中项: 让对应按钮组件打开面板(收藏为切换收藏状态)
    handleMobilePick(key) {
        const signals = Object.assign({}, this.state.mobileSignals)
        signals[key] = signals[key] + 1
        this.setState({ mobileSignals: signals })
    }

    // FavoriteButton 收藏状态变化上报
    handleFavChange(isFav) {
        this.setState({ isFav })
    }

    // 拉取本频道在线/回看人数 (details 接口, 约1分钟刷新一次)
    fetchDetails(channel) {
        if (!channel) {
            return
        }
        fetch(config.details).then((res) => {
            res.json().then((details) => {
                for (let i = 0; i < details.length; i++) {
                    if (details[i].channelId === channel) {
                        this.setState({
                            viewerNum: details[i].viewerNum || 0,
                            catchupNum: details[i].catchupNum || 0
                        })
                        break
                    }
                }
            })
        }).catch(() => { })
    }

    componentDidMount() {
        const channel = this.props.match.params.channel,
            timeline = this.props.match.params.timeline

        this.loadSource(channel, timeline)

        // 获取节目列表
        this.getVideoList()

        // 设置视频比例
        let ratio = localStorage.getItem("ratio")
        if (ratio) {
            this.setState({ ratio })
        } else {
            this.setState({ ratio: "16:9" })
            localStorage.setItem("ratio", "16:9")
        }

        // 在线/回看人数: 立即拉取 + 每分钟刷新 (loadSource 异步设置 channel, 定时器按 state 取)
        this.detailTimer = setInterval(() => {
            this.fetchDetails(this.state.channel)
        }, 60 * 1000)

        // 频道名: sources 接口的 title 直播=频道名/回看=节目名, 统一从 channels 取真实频道名
        this.fetchChannelName(channel)
    }

    fetchChannelName(channel) {
        fetch(config.channels).then((res) => {
            res.json().then((cats) => {
                for (let i = 0; i < cats.length; i++) {
                    const cl = cats[i].channelList || []
                    for (let j = 0; j < cl.length; j++) {
                        if (cl[j].channelId === channel) {
                            this.setState({ channelName: cl[j].name })
                            return
                        }
                    }
                }
            })
        }).catch(() => { })
    }

    componentWillUnmount() {
        clearInterval(this.detailTimer)
    }

    componentDidUpdate(prevProps, prevState) {
        let channel = this.props.match.params.channel,
            timeline = this.props.match.params.timeline,
            prevChannel = prevProps.match.params.channel,
            prevTimeline = prevProps.match.params.timeline

        if (channel === prevChannel && timeline === prevTimeline) {
            return
        }

        // 同频道内时移起点变化(ts-A -> ts-B): 无需重新请求直播源, 用当前源模板重建时移地址
        if (channel === prevChannel && this.isTimeshift(timeline) &&
            this.isTimeshift(prevTimeline) && this.state.sourceList.length) {
            this.applyTimeshiftSource(timeline)
        } else {
            this.loadSource(channel, timeline)
        }

        this.getVideoList()

        // 存储state
        if (this.state.ratio !== prevState.ratio) {
            localStorage.setItem("ratio", this.state.ratio)
        }
    }

    // timeline 是否为时移路由: "ts-{startTime}"
    isTimeshift(timeline) {
        return Boolean(timeline && timeline.indexOf("ts-") === 0)
    }

    // 时移路由 "ts-{begin}-{chosenAt}": begin=开始播放时间(节目时刻),
    // chosenAt=设置该时移点的时刻(固定值); 旧格式 "ts-{begin}" 兼容: chosenAt 用当前时间兜底
    parseTimeshift(timeline) {
        const parts = timeline.slice(3).split("-")
        const now = Math.floor(Date.now() / 1000)
        const begin = parseInt(parts[0], 10)
        const chosenAt = parseInt(parts[1], 10)
        return {
            begin: isNaN(begin) ? 0 : begin,
            chosenAt: isNaN(chosenAt) ? now : chosenAt
        }
    }

    // 时移播放地址: 用源的 timeShift 模板替换 {begin}/{chosenAt} 两个占位符 (v2 API)
    buildShiftUrl(source, ts) {
        return source.timeShift
            .replace("{begin}", ts.begin).replace("{chosenAt}", ts.chosenAt)
    }

    // 点时移轴换时移点(ts-A -> ts-B): 无需重新请求, 用当前源 timeShift 模板重建地址
    applyTimeshiftSource(timeline) {
        const ts = this.parseTimeshift(timeline)
        const source = this.state.sourceList[this.state.currentSourceIndex || 0]
        if (!ts.begin || !source || !source.timeShift) {
            return
        }
        this.setState({
            currentSourcePath: this.buildShiftUrl(source, ts),
            currentSourceThumbnails: source.thumbnails
                ? config.host + source.thumbnails : "",
            // 同步更新 timeline, 播放头位置等依赖时移起点
            timeline
        })
    }

    // 加载频道播放源: 直播/回看走后端接口, 时移(ts-)按直播源请求并重建时移地址
    // v2 API: 直播响应携带 quality/canCatchup/thumbnails({timestamp})/timeShift({begin}-{chosenAt}) 模板;
    // 回看响应仅含播放地址, 模板复用直播响应的 (按频道缓存于 localStorage, 不缓存含时效 token 的 path)
    loadSource(channel, timeline) {
        const isTs = this.isTimeshift(timeline)
        const ts = isTs ? this.parseTimeshift(timeline) : null
        // 新一轮加载: 清除上一次的"无源"错误
        this.setState({ sourceError: false })
        // 时移路由下按直播源请求 (空 timeline), 否则按回看 timeline 请求
        fetch(`${config.sources}/${channel}/${isTs ? "" : (timeline || "")}`)
            .then((res) => res.json())
            .then((data) => {
                let index = 0
                try {
                    const savedInfo = JSON.parse(localStorage.getItem(channel))
                    if (savedInfo && savedInfo.index) {
                        index =
                            savedInfo.index
                    }
                } catch (e) { }
                index = index < data.sourceList.length ? index : 0
                let meta = this.loadSourceMeta(channel)
                if (isTs && data.sourceList.length) {
                    // 直播响应: 顺便刷新源元数据缓存
                    this.saveSourceMeta(channel, data.sourceList)
                    meta = data.sourceList
                }
                if (!meta && data.sourceList.length) {
                    // 首次进回看页且无缓存: 补拉直播源元数据后应用
                    this.fetchSourceMeta(channel, data, index, timeline)
                    return
                }
                this.applySource(data.title, data.sourceList, meta,
                    index, timeline, channel, ts)
            })
            .catch(() => {
                // 接口失败/响应异常/频道不存在(sourceList 为空): 显示错误界面
                // 而非卡死在"正在加载"(applySource 空源守卫会置同一状态)
                this.setState({ sourceError: true })
            })
    }

    // 直播源元数据缓存 (name/quality/canCatchup/thumbnails/timeShift)
    // 结构带版本号 META_V, 版本不符(含旧版纯数组格式)一律返回 null 触发重拉
    loadSourceMeta(channel) {
        try {
            const saved = JSON.parse(localStorage.getItem("meta_" + channel))
            return saved && saved.v === META_V ? saved.list : null
        } catch (e) {
            return null
        }
    }

    saveSourceMeta(channel, sourceList) {
        localStorage.setItem("meta_" + channel, JSON.stringify({
            v: META_V,
            list: sourceList.map((s) => ({
                name: s.name,
                quality: s.quality,
                canCatchup: s.canCatchup,
                thumbnails: s.thumbnails,
                timeShift: s.timeShift
            }))
        }))
    }

    // 补拉直播源元数据 (回看页首次进入且无缓存时); 失败则仅用回看响应自身数据播放
    fetchSourceMeta(channel, reviewData, index, timeline) {
        const ts = this.isTimeshift(timeline) ? this.parseTimeshift(timeline) : null
        fetch(`${config.sources}/${channel}/`)
            .then((res) => res.json())
            .then((data) => {
                if (data && data.sourceList && data.sourceList.length) {
                    this.saveSourceMeta(channel, data.sourceList)
                    this.applySource(reviewData.title, reviewData.sourceList,
                        data.sourceList, index, timeline, channel, ts)
                } else {
                    this.applySource(reviewData.title, reviewData.sourceList,
                        reviewData.sourceList, index, timeline, channel, ts)
                }
            })
            .catch(() => {
                this.applySource(reviewData.title, reviewData.sourceList,
                    reviewData.sourceList, index, timeline, channel, ts)
            })
    }

    // 合并直播元数据与播放响应并应用播放源
    // 直播/时移: 响应条目即完整数据; 回看: 响应仅 name/quality/canCatchup/path, 模板从 meta 按序合并
    applySource(title, playList, metaList, index, timeline, channel, ts) {
        const sourceList = playList.map((s, i) => {
            const m = metaList && metaList[i] ? metaList[i] : {}
            return {
                name: s.name,
                path: s.path,
                quality: s.quality !== undefined ? s.quality : m.quality,
                canCatchup: s.canCatchup !== undefined ? s.canCatchup : m.canCatchup,
                thumbnails: s.thumbnails || m.thumbnails,
                timeShift: s.timeShift || m.timeShift
            }
        })
        if (!sourceList.length) {
            // 无任何可播放源(无效频道 ID/后端异常): 显示错误界面,
            // 不能往下走(下面解构 source.* 会 TypeError 且 promise 链静默死亡)
            this.setState({ sourceError: true })
            return
        }
        const source = sourceList[index] || sourceList[0]
        // 源不支持时移(无 timeShift 模板)时兜底直播流
        const path = ts && source.timeShift
            ? this.buildShiftUrl(source, ts)
            : source.path
        this.setState({
            title: title,
            sourceList: sourceList,
            currentSourceName: source.name,
            currentSourcePath: path,
            currentSourceThumbnails: source.thumbnails
                ? config.host + source.thumbnails : "",
            currentSourceIndex: index,
            currentQuality: source.quality,
            currentCanCatchup: Boolean(source.canCatchup),
            timeline,
            channel
        })
        // 播放源就绪后立即刷新在线/回看人数
        this.fetchDetails(channel)
    }

    // 直播页点击 24 小时时移轴 -> 进入该时刻开始的时移播放 (点轴最右端即回到直播)
    // chosenAt 记录设置时移点的时刻, 此后换源/重载保持不变
    handleTimeshift(tsStart) {
        const channel = this.props.match.params.channel
        this.props.history.push(
            `/${config.version}/player/${channel}/ts-${tsStart}-${Math.floor(Date.now() / 1000)}`)
    }

    // 时移页"回到直播"按钮
    handleBackToLive() {
        const channel = this.props.match.params.channel
        this.props.history.push(`/${config.version}/player/${channel}/`)
    }

    // 播放出错时自动切换到下一个节目源 (循环); 播放器会在所有源都失败后才显示错误界面
    // 时移模式的地址重建逻辑统一在 setSource 内处理
    handleSourceError() {
        const list = this.state.sourceList
        if (!list || list.length < 2) {
            return
        }
        const nextIndex = ((this.state.currentSourceIndex || 0) + 1) % list.length
        this.setSource(list[nextIndex], nextIndex)
    }

    // 回看播放结束: 自动连播下一个节目 (不弹确认框)
    // 去向由 playNextVideo 统一分类: 已播出进回看 / 正在直播转时移接着播 / 未开播停住
    handlePlayEnd() {
        // 播放结束退出全屏 (非全屏状态调用可能抛同步错误或 reject promise)
        try {
            const r = document.exitFullscreen && document.exitFullscreen()
            if (r && r.catch) {
                r.catch(() => { })
            }
        } catch (e) { }

        // 是回放的节目播放完毕 (时移路由 ts- 不参与连播逻辑)
        if (this.state.timeline && !this.isTimeshift(this.state.timeline)) {
            this.playNextVideo()
        }
    }

    // 设置选择的节目源并存储
    // 时移播放中换源: begin/chosenAt 两个时间戳都不变(时间对定义时移跨度,
    // 服务器已处理播放了多久), 只用新源的 timeShift 模板重建地址
    setSource(source, index) {
        const timeline = this.state.timeline || ""
        const ts = this.isTimeshift(timeline) ? this.parseTimeshift(timeline) : null
        const path = ts && source.timeShift
            ? this.buildShiftUrl(source, ts)
            : source.path
        this.setState({
            currentSourceName: source.name,
            currentSourcePath: path,
            currentSourceThumbnails: source.thumbnails
                ? config.host + source.thumbnails : "",
            currentSourceIndex: index,
            currentQuality: source.quality,
            currentCanCatchup: Boolean(source.canCatchup)
        })
        let channel = this.props.match.params.channel,
            savedInfo = JSON.parse(localStorage.getItem(channel))
        savedInfo = savedInfo ? savedInfo : {}
        localStorage.setItem(channel, JSON.stringify(Object.assign({}, savedInfo, {
            index
        })))
    }

    playNextVideo() {
        // 是回放的节目播放完毕 (时移路由 ts- 不参与连播逻辑)
        if (this.state.timeline && !this.isTimeshift(this.state.timeline)) {
            const timeline = this.state.timeline.split("-")
            const endTime = timeline[1]
            const videoListInOrder = this.state.videoList.slice().reverse()
            const channel = this.state.channel
            for (let i = 0, allLen = videoListInOrder.length; i < allLen; i++) {
                for (let j = 0, list = videoListInOrder[i].list,
                    len = list.length; j < len; j++) {
                    if (endTime <= list[j].endTime) {
                        // 下一节目: 同日下一条, 日末则取次日消息首条 (相邻节目保证衔接)
                        let nextVideo = null
                        if (j === len - 1) {
                            if (i !== allLen - 1) {
                                nextVideo = videoListInOrder[i + 1].list[0]
                            }
                        } else {
                            nextVideo = list[j + 1]
                        }
                        if (nextVideo) {
                            const nowMs = Date.now()
                            const s = nextVideo.startTime * 1000
                            const e = nextVideo.endTime * 1000
                            if (e > 0 && e < nowMs) {
                                // 已播出: 进入回看
                                this.props.history.push(
                                    `/${config.version}/player/${channel}/${
                                    nextVideo.startTime
                                    }-${
                                    nextVideo.endTime
                                    }`
                                )
                            } else if (s <= nowMs && (e === 0 || nowMs < e)) {
                                // 正在直播: 转入时移接着播。begin 取节目开始时刻
                                // (= 刚播完节目的 endTime), 内容与回看末尾无缝衔接;
                                // chosenAt 为切换瞬间。endTime 为 0 (无下一条) 也视为播出中
                                this.handleTimeshift(nextVideo.startTime)
                            }
                            // 未开播: 停在结束画面
                        }
                        return
                    }
                }
            }
        }
    }

    setRatio(ratio) {
        this.setState({ ratio })
    }

    // 顶栏正在播放的节目名称: 直播=当前正在播出的节目; 回看=播放头所在节目(=路由节目);
    // 时移=起点+已播秒数所在节目 (节目单数据 videoList 按天分组, 区间匹配)
    currentProgramName() {
        const list = this.state.videoList
        if (!list || !list.length) {
            return ""
        }
        const tl = this.state.timeline
        const now = Math.floor(Date.now() / 1000)
        let cur = now
        if (this.isTimeshift(tl)) {
            const video = document.querySelector("#playerContainer video")
            cur = parseInt(tl.slice(3).split("-")[0], 10) +
                (video && video.currentTime ? video.currentTime : 0)
        } else if (tl) {
            cur = parseInt(tl.split("-")[0], 10)
        }
        for (let d = 0; d < list.length; d++) {
            const programs = list[d].list || []
            for (let i = 0; i < programs.length; i++) {
                if (programs[i].startTime <= cur && cur < programs[i].endTime) {
                    return programs[i].title
                }
            }
        }
        return ""
    }

    getVideoList() {
        fetch(`${config.list}/${this.props.match.params.channel}/7`).then((res) => {
            res.json().then((list) => {
                // console.log(list)
                this.setState({
                    videoList: list.reverse()
                })
            })
        })
    }
}

export default withStyles(styles)(PlayerPage)