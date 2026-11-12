import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Slide from '@material-ui/core/Slide'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import PauseIcon from '@material-ui/icons/Pause'
import VolumeUpIcon from '@material-ui/icons/VolumeUp'
import VolumeOffIcon from '@material-ui/icons/VolumeOff'
import FullscreenIcon from '@material-ui/icons/Fullscreen'
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit'
import Hls from 'hls.js'
import "./player.css"

// 方案B: 原生 <video> + hls.js, 单video元素由组件全程管理,
// 切换节目时销毁旧 hls 实例后复用同一个 video 元素, 从机制上杜绝双播放

const SAVE_INTERVAL = 10 * 1000
const CONTROLS_HIDE_DELAY = 3000
// 缩略图取图: v2 API 统一模板 {timestamp} 替换目标时刻绝对 Unix 秒 (直播/时移/回看共用)
// 触屏拖动进度条时按此秒数取整取图, 减少移动网络请求量
const THUMB_COARSE = 5
// 缩略图 404 失败后允许重试的间隔 (毫秒), 适配后端延迟生成截图
const THUMB_FAIL_RETRY = 10 * 1000
// 回看倍速档位: 参考主流视频网站(B站/YouTube 等)通用档位 0.5~2 倍
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2]
// 时移轴悬停放大镜: 光标周围 ±LENS_HALF 秒(共5分钟)拉伸到 LENS_W 像素宽, 便于精确选点
const LENS_W = 320
const LENS_HALF = 150
const LENS_SCALE = (LENS_HALF * 2) / LENS_W // 秒/像素 (0.9375)
// 放大镜停顿锁定: 主轴移动中不弹镜(只普通预览), 停住该时长后才冻结锚点弹出
const LENS_DWELL_MS = 1000
// 镜体弹出后, 主轴上锚点附近该像素范围内的微小抖动不收镜, 保持稳定
const LENS_STICKY_PX = 30
// 直播 24 小时时移轴范围 (秒)
const TIMESHIFT_WINDOW = 24 * 3600
// 直播式时移轴仅在有精确指针(鼠标)且大屏(≥600px)时启用:
// 小屏幕直播页=纯直播页面, 不提供时移选择 (2026-10-22 用户确认)
// 600px 与项目移动端断点一致; 函数式按需求值, 窗口宽度跨过阈值后
// 下一次渲染即生效(尺寸变化经 onWinResize→applyRatio 触发重渲染)
const hasLiveBarEnv = () => typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: fine)").matches &&
    window.matchMedia("(min-width: 600px)").matches

const isPc = (() => {
    var userAgentInfo = navigator.userAgent
    var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
    var flag = true
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
            flag = false
            break
        }
    }
    return flag
})()

const isApple = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) ||
    (/^((?!chrome|android).)*safari/i.test(navigator.userAgent))

const getFullscreenElement = () => {
    return document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
}

const requestFullscreen = (el) => {
    const fn = el.requestFullscreen || el.webkitRequestFullscreen ||
        el.mozRequestFullScreen || el.msRequestFullscreen
    if (!fn) {
        return false
    }
    try {
        const result = fn.call(el)
        if (result && result.catch) {
            result.catch(() => { })
        }
        return true
    } catch (e) {
        return false
    }
}

const exitFullscreen = () => {
    const fn = document.exitFullscreen || document.webkitExitFullscreen ||
        document.mozCancelFullScreen || document.msExitFullscreen
    if (!fn) {
        return false
    }
    try {
        const result = fn.call(document)
        if (result && result.catch) {
            result.catch(() => { })
        }
        return true
    } catch (e) {
        return false
    }
}

const fmt = (t) => {
    t = Math.floor(t || 0)
    if (!isFinite(t) || t < 0) {
        t = 0
    }
    const h = Math.floor(t / 3600)
    const m = Math.floor((t % 3600) / 60)
    const s = t % 60
    const pad = (n) => (n < 10 ? "0" + n : "" + n)
    return h > 0 ? h + ":" + pad(m) + ":" + pad(s) : m + ":" + pad(s)
}

// 回看 timeline 格式: "startTime-endTime" (Unix秒), 解析出节目开始的实际时间
// 时移 timeline 格式: "ts-{begin}-{chosenAt}", 取 begin(开始播放时间)
const getTimelineStart = (timeline) => {
    if (!timeline) {
        return 0
    }
    const start = parseInt(timeline.replace(/^ts-/, "").split("-")[0], 10)
    return isNaN(start) ? 0 : start
}

// 节目实际时钟时间 (HH:mm:ss): 起始时间戳 + 相对播放秒数
const fmtClock = (unixSeconds) => {
    if (!isFinite(unixSeconds) || unixSeconds <= 0) {
        return null
    }
    const d = new Date(unixSeconds * 1000)
    const pad = (n) => (n < 10 ? "0" + n : "" + n)
    return pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds())
}

// 带日期的时钟时间: 同一天只显示 HH:mm:ss, 跨天显示 MM-dd HH:mm:ss
const fmtClockDate = (unixSeconds) => {
    if (!isFinite(unixSeconds) || unixSeconds <= 0) {
        return null
    }
    const d = new Date(unixSeconds * 1000)
    const now = new Date()
    const pad = (n) => (n < 10 ? "0" + n : "" + n)
    const clock = pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds())
    if (d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() && d.getDate() === now.getDate()) {
        return clock
    }
    return pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + " " + clock
}

const FULLSCREEN_EVENTS = [
    "fullscreenchange",
    "webkitfullscreenchange",
    "mozfullscreenchange",
    "MSFullscreenChange"
]

const styles = (theme) => ({
    player: {
        height: "calc(100vh - 64px)",
        width: "100%",
        overflow: "hidden",
        [theme.breakpoints.only("xs")]: {
            height: "calc(100vh - 56px)"
        }
    },
    btn: {
        color: "#fff",
        padding: 6
    }
})

class Player extends React.Component {
    render() {
        const { classes } = this.props
        const s = this.state
        const mode = this.mode() // live / timeshift / review
        const hasDuration = s.duration > 0 && isFinite(s.duration)
        // 回看进度条: 相对时长轴; 直播/时移共用直播式界面(24h 时移轴, 无进度显示)
        let playedPct = 0
        let bufferedPct = 0
        if (mode === "review" && hasDuration) {
            playedPct = (s.currentTime / s.duration) * 100
            bufferedPct = Math.min(100, (s.buffered / s.duration) * 100)
        }
        const volumePct = (s.muted ? 0 : s.volume) * 100
        // 直播式时移轴仅在电脑端大屏显示; 源不支持回看(canCatchup=false)时直播页无轴
        const showLiveBar = (mode === "live" || mode === "timeshift") &&
            hasLiveBarEnv() && this.props.canCatchup !== false
        // 时移页播放头位置: 时移起点 + 已播秒数 在 24h 轴上的百分比
        let playheadPct = 0
        if (mode === "timeshift") {
            const shiftStart = getTimelineStart(this.props.timeline)
            const axisStartTs = Date.now() / 1000 - TIMESHIFT_WINDOW
            playheadPct = Math.min(100, Math.max(0,
                ((shiftStart + s.currentTime - axisStartTs) / TIMESHIFT_WINDOW) * 100))
        }

        return (
            <React.Fragment>
                <div id="playerContainer"
                    ref={this.containerRef}
                    className={`${classes.player} hdtv-player${s.controlsVisible ? "" : " hp-hidden"}`}
                    onMouseMove={this.showControls}
                    onMouseLeave={this.onContainerMouseLeave}
                    onTouchStart={this.showControls}
                >
                    <div className="hp-frame" ref={this.frameRef}>
                        <video ref={this.videoRef} className="hp-video"
                            onClick={this.onVideoClick}
                            onTouchEnd={this.onVideoTouchEnd}
                        />
                    </div>

                    {/* 移动端标题: 优先显示当前正在直播的节目名, 无节目单时回退频道名 */}
                    {!isPc && s.controlsVisible && (this.props.programName || this.props.title)
                        ? <div className="hp-title">{this.props.programName || this.props.title}</div>
                        : null}

                    {s.loading && !s.error && !this.props.sourceError ? (
                        <div className="hp-center">
                            <div className="hp-spinner" />
                        </div>
                    ) : null}

                    {this.props.path && !s.loading && !s.playing && !s.error &&
                        !this.props.sourceError ? (
                        <div className="hp-center">
                            <button type="button" className="hp-bigplay"
                                onClick={this.togglePlay} aria-label="播放">
                                <PlayArrowIcon />
                            </button>
                        </div>
                    ) : null}

                    {/* 播放器内部错误(s.error) 或 上层无播放源(sourceError) 统一错误界面 */}
                    {s.error || this.props.sourceError ? (
                        <div className="hp-error">
                            <div className="hp-error-text">
                                {s.error || "无法获取播放源, 请稍后重试"}
                            </div>
                            <Button className={classes.btn + " hp-error-btn"}
                                onClick={s.error ? this.retry : this.props.onRetrySource}>
                                重试
                            </Button>
                        </div>
                    ) : null}

                    {s.showUnmuteHint && s.muted ? (
                        <div className="hp-hint" onClick={this.unmute}>
                            已自动静音, 点击开启声音
                        </div>
                    ) : null}

                    <div className="hp-controls">
                        {mode === "review" && hasDuration ? (
                            // 触摸事件用原生非 passive 监听(bindBarTouch): React 16 对
                            // document 级 touchstart/touchmove 强制 passive, 合成事件里的
                            // preventDefault 无效, 真机上浏览器会接管手势(滚动/touchcancel)
                            // 导致拖动预览中断; 原生监听才能阻止默认行为
                            <div className="hp-progress" ref={this.barRef}
                                onMouseDown={this.onBarMouseDown}
                                onMouseMove={this.onBarMouseMove}
                                onMouseLeave={this.onBarMouseLeave}
                            >
                                <div className="hp-progress-inner">
                                    <div className="hp-buffered"
                                        style={{ width: bufferedPct + "%" }} />
                                    <div className="hp-played"
                                        style={{ width: playedPct + "%" }} />
                                </div>
                                {s.thumb ? (
                                    <div className="hp-thumb" style={{ left: s.thumb.x + "px" }}>
                                        {s.thumb.ok ? (
                                            <div className="hp-thumb-img"
                                                style={{ backgroundImage: 'url("' + s.thumb.url + '")' }} />
                                        ) : null}
                                        <div className="hp-thumb-time">{this.fmtTime(s.thumb.time)}</div>
                                    </div>
                                ) : null}
                            </div>
                        ) : null}
                        {showLiveBar ? (
                            <div className="hp-progress" ref={this.barRef}
                                onMouseDown={this.onBarMouseDown}
                                onMouseMove={this.onBarMouseMove}
                                onMouseLeave={this.onBarMouseLeave}
                            >
                                <div className="hp-progress-inner">
                                    {/* 直播页: 红点=直播边缘(轴最右端); 时移页: 红点=当前播放头(start+已播),
                                        落后于轴右端(时间轴当前时间), 用户仍可点击轴上任意时刻切换时移点 */}
                                    {mode === "timeshift" ? (
                                        <div className="hp-live-edge" style={{
                                            left: playheadPct + "%",
                                            right: "auto"
                                        }} />
                                    ) : (
                                        <div className="hp-live-edge" />
                                    )}
                                </div>
                                {s.thumb ? (
                                    <div className="hp-thumb hp-lens" ref={this.thumbRef}
                                        style={{ left: s.thumb.x + "px" }}>
                                        {s.thumb.ok ? (
                                            <div className="hp-thumb-img"
                                                style={{ backgroundImage: 'url("' + s.thumb.url + '")' }} />
                                        ) : null}
                                        <div className="hp-thumb-time">{this.fmtTime(s.thumb.time)}</div>
                                        {/* 放大镜刻度尺: 仅停顿锁定后显示(lensOpen), 镜体±150秒(5分钟)跨度,
                                            时间标注镜内均布5个(间隔75秒), 蓝线=当前精确悬停位置 */}
                                        {this.lensTicks && this.lensOpen ? (
                                            <div className="hp-lens-ruler">
                                                {this.lensTicks.map((t, i) => (
                                                    <span key={i}
                                                        className={t.major
                                                            ? "hp-lens-tick hp-lens-major"
                                                            : "hp-lens-tick"}
                                                        style={{ left: t.x + "px" }}>
                                                        {t.label
                                                            ? <span className="hp-lens-label" style={{
                                                                // 镜端标注改内侧对齐, 避免文本半溢出镜体
                                                                transform: t.x < 26 ? "none" :
                                                                    (t.x > LENS_W - 26
                                                                        ? "translateX(-100%)" : undefined)
                                                            }}>{t.label}</span>
                                                            : null}
                                                    </span>
                                                ))}
                                                <span className="hp-lens-marker" style={{
                                                    left: ((s.thumb.time - this.lensAnchor.ts) /
                                                        LENS_SCALE +
                                                        (this.lensAnchor.px - this.lensLeftPx)) + "px"
                                                }} />
                                            </div>
                                        ) : null}
                                    </div>
                                ) : null}
                            </div>
                        ) : null}
                        <div className="hp-buttons">
                            <IconButton className={classes.btn}
                                onClick={this.togglePlay}
                                aria-label={s.playing ? "暂停" : "播放"}>
                                {s.playing ? <PauseIcon /> : <PlayArrowIcon />}
                            </IconButton>
                            {mode === "review" ? (
                                <div className="hp-time">
                                    {this.fmtTime(s.currentTime)}{hasDuration ? " / " + this.fmtTime(s.duration) : ""}
                                </div>
                            ) : (
                                <React.Fragment>
                                    <div className="hp-live">
                                        <span className="hp-live-dot" />{mode === "timeshift" ? "时移" : "直播"}
                                        {/* 直播: 当前真实时间; 时移: 当前播放的内容时刻(跨天带日期) */}
                                        {mode === "timeshift" ? (
                                            this.contentBase > 0 ? (
                                                <span className="hp-live-clock">
                                                    {fmtClockDate(this.contentBase + s.currentTime)}
                                                </span>
                                            ) : null
                                        ) : (
                                            <span className="hp-live-clock">
                                                {fmtClock(s.now / 1000)}
                                            </span>
                                        )}
                                    </div>
                                    {/* 时移页提供一键回到直播(点击时移轴最右端也可以) */}
                                    {mode === "timeshift" && this.props.onBackToLive ? (
                                        <button type="button" className="hp-backlive"
                                            onClick={this.props.onBackToLive}>
                                            回到直播
                                        </button>
                                    ) : null}
                                </React.Fragment>
                            )}
                            <div className="hp-spacer" />
                            {/* 回看倍速: 靠右放置(与音量/全屏同侧), 仅回看模式显示, 弹出面板选档(0.5~2) */}
                            {mode === "review" ? (
                                <ClickAwayListener onClickAway={this.closeSpeedPanel}>
                                    <div className="hp-speed">
                                        <button type="button" className="hp-speed-btn hdtv-speed-btn"
                                            onClick={this.toggleSpeedPanel} aria-label="倍速播放">
                                            {s.speed !== 1 ? s.speed + "x" : "倍速"}
                                        </button>
                                        {s.speedOpen ? (
                                            <div className="hp-speed-pop hdtv-speed-pop">
                                                {SPEEDS.map((v) => (
                                                    <div key={v}
                                                        className={"hp-speed-item" + (s.speed === v ? " on" : "")}
                                                        onClick={this.setSpeed.bind(this, v)}>
                                                        {v === 1 ? "1.0x" : v + "x"}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : null}
                                    </div>
                                </ClickAwayListener>
                            ) : null}
                            {isPc ? (
                                <React.Fragment>
                                    <IconButton className={classes.btn}
                                        onClick={this.toggleMute}
                                        aria-label={s.muted ? "取消静音" : "静音"}>
                                        {s.muted || s.volume === 0
                                            ? <VolumeOffIcon />
                                            : <VolumeUpIcon />}
                                    </IconButton>
                                    <div className="hp-volume" ref={this.volumeRef}
                                        onMouseDown={this.onVolumeMouseDown}
                                        onMouseMove={this.onVolumeMouseMove}
                                    >
                                        <div className="hp-volume-inner">
                                            <div className="hp-volume-fill"
                                                style={{ width: volumePct + "%" }} />
                                        </div>
                                    </div>
                                </React.Fragment>
                            ) : null}
                            <IconButton className={classes.btn}
                                onClick={this.toggleFullscreen}
                                aria-label={s.isFullscreen ? "退出全屏" : "全屏"}>
                                {s.isFullscreen
                                    ? <FullscreenExitIcon />
                                    : <FullscreenIcon />}
                            </IconButton>
                        </div>
                    </div>
                </div>
                <Dialog
                    open={this.state.isDialogOpen}
                    TransitionComponent={Slide}
                    keepMounted
                    onClose={this.closeDialog}
                    aria-labelledby="alert-dialog-slide-title"
                    aria-describedby="alert-dialog-slide-description"
                >
                    <DialogTitle id="alert-dialog-slide-title">
                        {"是否跳转到上次播放的进度?"}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-slide-description">
                            我们检测到你的本地存储中有此节目的播放记录
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.closeDialog} color="default">
                            取消
                        </Button>
                        <Button onClick={this.continuePlayProcess} color="primary">
                            跳转
                        </Button>
                    </DialogActions>
                </Dialog>
            </React.Fragment>
        )
    }

    constructor(props) {
        super(props)
        this.state = {
            isDialogOpen: false,
            playing: false,
            loading: false,
            error: "",
            muted: false,
            volume: 1,
            currentTime: 0,
            duration: 0,
            buffered: 0,
            controlsVisible: true,
            isFullscreen: false,
            thumb: null,
            showUnmuteHint: false,
            now: Date.now(),
            // 回看倍速: 记忆上次选择, 仅回看模式生效(直播/时移恒为 1 倍)
            speed: (function () {
                try {
                    const v = parseFloat(localStorage.getItem("speed"))
                    if (SPEEDS.indexOf(v) !== -1) return v
                } catch (e) { }
                return 1
            })(),
            speedOpen: false
        }

        this.containerRef = React.createRef()
        this.frameRef = React.createRef()
        this.videoRef = React.createRef()
        this.barRef = React.createRef()
        this.volumeRef = React.createRef()
        this.thumbRef = React.createRef()

        this.hls = null
        this.savedInfo = {}
        this.timer = null
        this.hideTimer = null
        // 每秒时钟: 直播页显示当前时间 / 时移页显示当前播放的内容时刻
        this.clockTimer = null
        // 时移内容时刻基准 (unix秒): 载入时按 {begin}-{chosenAt} 跨度校准,
        // 内容时刻 = contentBase + currentTime (切源重载/暂停均正确)
        this.contentBase = 0
        this.thumbCache = {}
        this.lastThumbSecond = -1
        this.thumbSeq = 0
        // 时移轴最后一次悬停显示的时间: 点击以它为 begin (所见即所得, 与缩略图一致)
        this.lastAxisTs = 0
        // 悬停放大镜锚点 {ts, px}(主轴悬停时记录, 镜内移动不重算) + 刻度与镜左沿
        this.lensAnchor = null
        this.lensTicks = null
        this.lensLeftPx = 0
        // 停顿锁定: false=扫动中(不显示刻度尺), true=停住后已弹镜(锚点冻结)
        this.lensOpen = false
        this.dwellTimer = null
        this.dragging = false
        this.volumeDragging = false
        this.touchedAt = 0
        // 进度条触摸监听当前挂载的原生元素(随模式分支更换重挂, 见 bindBarTouch)
        this.boundBar = null
        this.retryNetwork = 0
        this.retryMedia = 0
        // 多节目源自动切换: 连续失败计数(成功播放后归零) + 切换中标志(防重复跳源)
        this.sourceFails = 0
        this.switchingSource = false
        this.resumeChecked = false
        this.tsStarted = false

        this.closeDialog = this.closeDialog.bind(this)
        this.continuePlayProcess = this.continuePlayProcess.bind(this)
        this.keyupHandler = this.keyupHandler.bind(this)

        this.showControls = this.showControls.bind(this)
        this.onContainerMouseLeave = this.onContainerMouseLeave.bind(this)
        this.onVideoClick = this.onVideoClick.bind(this)
        this.onVideoTouchEnd = this.onVideoTouchEnd.bind(this)
        this.togglePlay = this.togglePlay.bind(this)
        this.toggleMute = this.toggleMute.bind(this)
        this.unmute = this.unmute.bind(this)
        this.retry = this.retry.bind(this)
        this.toggleFullscreen = this.toggleFullscreen.bind(this)
        this.onFullscreenChange = this.onFullscreenChange.bind(this)

        this.setupVideo = this.setupVideo.bind(this)
        this.saveProgress = this.saveProgress.bind(this)
        this.onLoadedMetadata = this.onLoadedMetadata.bind(this)
        this.onTimeUpdate = this.onTimeUpdate.bind(this)
        this.onDurationChange = this.onDurationChange.bind(this)
        this.onProgress = this.onProgress.bind(this)
        this.onPlay = this.onPlay.bind(this)
        this.onPause = this.onPause.bind(this)
        this.onEnded = this.onEnded.bind(this)
        this.onWaiting = this.onWaiting.bind(this)
        this.onPlaying = this.onPlaying.bind(this)
        this.onCanPlay = this.onCanPlay.bind(this)
        this.onVideoError = this.onVideoError.bind(this)
        this.onVolumeChange = this.onVolumeChange.bind(this)
        this.onHlsError = this.onHlsError.bind(this)
        this.applyRatio = this.applyRatio.bind(this)
        this.onWinResize = this.onWinResize.bind(this)
        this.seekRelative = this.seekRelative.bind(this)
        this.setVolume = this.setVolume.bind(this)
        this.toggleSpeedPanel = this.toggleSpeedPanel.bind(this)
        this.closeSpeedPanel = this.closeSpeedPanel.bind(this)
        this.setSpeed = this.setSpeed.bind(this)

        this.onBarMouseDown = this.onBarMouseDown.bind(this)
        this.onBarMouseMove = this.onBarMouseMove.bind(this)
        this.onBarMouseLeave = this.onBarMouseLeave.bind(this)
        this.onBarTouchStart = this.onBarTouchStart.bind(this)
        this.onBarTouchMove = this.onBarTouchMove.bind(this)
        this.onBarTouchEnd = this.onBarTouchEnd.bind(this)
        this.onBarTouchCancel = this.onBarTouchCancel.bind(this)
        this.bindBarTouch = this.bindBarTouch.bind(this)
        this.onDocMouseMove = this.onDocMouseMove.bind(this)
        this.onDocMouseUp = this.onDocMouseUp.bind(this)

        this.onVolumeMouseDown = this.onVolumeMouseDown.bind(this)
        this.onVolumeMouseMove = this.onVolumeMouseMove.bind(this)
        this.onVolumeDocMove = this.onVolumeDocMove.bind(this)
        this.onVolumeDocUp = this.onVolumeDocUp.bind(this)

        // video 元素全程只有一个, 事件监听挂一次即可
        this.boundVideoHandlers = [
            ["loadedmetadata", this.onLoadedMetadata],
            ["timeupdate", this.onTimeUpdate],
            ["durationchange", this.onDurationChange],
            ["progress", this.onProgress],
            ["play", this.onPlay],
            ["pause", this.onPause],
            ["ended", this.onEnded],
            ["waiting", this.onWaiting],
            ["playing", this.onPlaying],
            ["canplay", this.onCanPlay],
            ["error", this.onVideoError],
            ["volumechange", this.onVolumeChange]
        ]
    }

    componentDidMount() {
        const video = this.videoRef.current
        if (video) {
            // 移动端内联播放 (iOS 需要这两个属性)
            video.setAttribute("playsinline", "")
            video.setAttribute("webkit-playsinline", "")
            this.boundVideoHandlers.forEach((pair) => {
                video.addEventListener(pair[0], pair[1])
            })

            // 恢复上次的音量
            let savedVolume = null
            try {
                savedVolume = JSON.parse(localStorage.getItem("volume"))
            } catch (e) { }
            if (typeof savedVolume === "number" && savedVolume >= 0 && savedVolume <= 1) {
                try {
                    video.volume = savedVolume
                } catch (e) { }
            }
        }

        FULLSCREEN_EVENTS.forEach((name) => {
            document.addEventListener(name, this.onFullscreenChange)
        })

        document.addEventListener("keyup", this.keyupHandler)

        // 每秒刷新时钟 (直播: 当前时间; 时移: 当前播放的内容时刻; 回看不依赖)
        this.clockTimer = setInterval(() => {
            if (this.mode() !== "review") {
                this.setState({ now: Date.now() })
            }
        }, 1000)

        // 窗口尺寸变化(含旋转)后按新容器尺寸重算已选比例
        window.addEventListener("resize", this.onWinResize)

        // 进度条触摸: 原生非 passive 监听(真机上才能阻止页面滚动手势)
        this.bindBarTouch()
    }

    onWinResize() {
        this.applyRatio(this.props.ratio)
    }

    componentDidUpdate(prevProps) {
        // 进度条元素可能随模式分支更换(回看/直播轴是不同 div), 触摸监听重挂
        this.bindBarTouch()
        if (prevProps.ratio !== this.props.ratio) {
            this.applyRatio(this.props.ratio)
        }
        if (!this.props.path) {
            return
        }
        if (this.props.path === prevProps.path &&
            this.props.timeline === prevProps.timeline) {
            return
        }

        try {
            this.savedInfo = JSON.parse(localStorage.getItem(this.props.channel)) || {}
        } catch (e) {
            this.savedInfo = {}
        }

        // 只有同一节目内换源(手动/自动)才记住播放点续播;
        // 跨节目切换(timeline 变)一律从头播, 否则会把上一个节目的播放头
        // 误 seek 到新节目上(超出时长还会立即触发连播跳回)
        const sameTimeline = this.props.timeline === prevProps.timeline
        this.setupVideo(this.props.path, sameTimeline)

        clearInterval(this.timer)

        // 回看节目定期记录播放进度 (时移是延迟的直播, 不记录)
        if (this.props.timeline && this.mode() === "review") {
            this.timer = setInterval(this.saveProgress, SAVE_INTERVAL)
        }
    }

    componentWillUnmount() {
        document.removeEventListener("keyup", this.keyupHandler)
        window.removeEventListener("resize", this.onWinResize)
        FULLSCREEN_EVENTS.forEach((name) => {
            document.removeEventListener(name, this.onFullscreenChange)
        })
        if (this.boundBar) {
            this.boundBar.removeEventListener("touchstart", this.onBarTouchStart)
            this.boundBar.removeEventListener("touchmove", this.onBarTouchMove)
            this.boundBar.removeEventListener("touchend", this.onBarTouchEnd)
            this.boundBar.removeEventListener("touchcancel", this.onBarTouchCancel)
            this.boundBar = null
        }

        // 返回主页前存储信息 (视频不存在时安全跳过, 修复原版此处崩溃导致播放器无法卸载的问题)
        this.saveProgress()

        clearInterval(this.timer)
        clearInterval(this.clockTimer)
        clearTimeout(this.hideTimer)
        clearTimeout(this.dwellTimer)

        const video = this.videoRef.current
        if (video) {
            video.pause()
            this.boundVideoHandlers.forEach((pair) => {
                video.removeEventListener(pair[0], pair[1])
            })
        }

        // 销毁 hls 实例, 彻底停止拉流
        if (this.hls) {
            this.hls.destroy()
            this.hls = null
        }
        if (video) {
            video.removeAttribute("src")
            try {
                video.load()
            } catch (e) { }
        }
    }

    // ------- 播放核心 -------

    setupVideo(path, resume) {
        const video = this.videoRef.current
        if (!video) {
            return
        }
        // 回看切源: 记住当前播放点, 新源就绪后无缝续播(不弹续播询问);
        // 直播无进度概念, 时移由服务器按时间对定位, 跨节目切换(resume=false)从头播
        this.pendingSeek = 0
        if (resume && this.mode() === "review" && video.currentTime > 1) {
            this.pendingSeek = video.currentTime
        }
        this.resumeChecked = false
        this.retryNetwork = 0
        this.retryMedia = 0
        // 新的源已开始加载, 自动切源流程结束
        this.switchingSource = false
        this.tsStarted = false
        this.thumbCache = {}
        this.lastThumbSecond = -1
        this.lastAxisTs = 0
        this.lensAnchor = null
        this.lensTicks = null
        this.thumbSeq++
        this.setState({
            error: "",
            currentTime: 0,
            duration: 0,
            buffered: 0,
            loading: true,
            playing: false,
            thumb: null
        })

        // 倍速仅回看生效: 直播/时移恒为 1 倍(video 元素复用, 防旧倍速残留到直播流)
        try {
            video.playbackRate = this.mode() === "review" ? this.state.speed : 1
        } catch (e) { }

        // 先销毁旧的 hls 实例再挂新流, video 元素复用, 不会出现两路同时播放
        if (this.hls) {
            this.hls.destroy()
            this.hls = null
        }

        const canNative = video.canPlayType("application/vnd.apple.mpegurl")
        // Safari/iOS 使用原生 HLS, 其它支持 MSE 的浏览器使用 hls.js
        if (Hls.isSupported() && !(canNative && isApple)) {
            const hlsConf = {
                xhrSetup: (xhr) => {
                    xhr.withCredentials = false
                },
                // 已播数据超出播放头后 60 秒即从 SourceBuffer 清除。
                // hls.js 默认 backBufferLength=Infinity 永不清理后置缓冲,
                // 长时间直播/回看内存线性增长导致浏览器越来越慢
                backBufferLength: 60
            }
            if (this.mode() === "timeshift") {
                // 时移流是无 endlist 的直播型流: 默认会从直播边缘开播,
                // startPosition=0 从 playlist 起点(时移开始时刻)开播;
                // liveSyncDurationCount=10 追上直播边缘后仍从窗口前部跟随, 不跳丢
                hlsConf.startPosition = 0
                hlsConf.liveSyncDurationCount = 10
            }
            const hls = new Hls(hlsConf)
            this.hls = hls
            hls.loadSource(path)
            hls.attachMedia(video)
            hls.on(Hls.Events.ERROR, this.onHlsError)
        } else if (canNative) {
            video.src = path
            video.load()
        } else {
            this.setState({
                error: "当前浏览器不支持 HLS 视频播放",
                loading: false
            })
            return
        }

        this.tryPlay(video)
        this.showControls()
    }

    tryPlay(video) {
        const promise = video.play()
        if (promise && promise.catch) {
            promise.catch(() => {
                // 自动播放被浏览器拦截: 静音后重试 (Chrome 自动播放策略兜底)
                if (!video.muted) {
                    video.muted = true
                    const retry = video.play()
                    if (retry && retry.catch) {
                        retry.catch(() => {
                            this.setState({
                                loading: false,
                                playing: false,
                                showUnmuteHint: true
                            })
                        })
                    }
                    this.setState({ showUnmuteHint: true })
                } else {
                    this.setState({
                        loading: false,
                        playing: false,
                        showUnmuteHint: true
                    })
                }
            })
        }
    }

    saveProgress() {
        // 只有回看需要记忆播放进度; 时移是"延迟的直播", 刷新/重进总是从所选时刻开播
        if (this.mode() !== "review") {
            return
        }
        const video = this.videoRef.current
        if (!video) {
            return
        }
        const info = Object.assign({}, this.savedInfo, {
            time: video.currentTime || 0,
            timeline: this.props.timeline
        })
        try {
            localStorage.setItem(this.props.channel, JSON.stringify(info))
        } catch (e) { }
    }

    // 播放出错时请求切换到下一个节目源(由 PlayerPage 换源);
    // 只有单一源或所有源都已轮询失败时返回 false, 由调用方显示错误界面
    tryNextSource() {
        // 已触发过切换但新源尚未加载(切换期间旧流的残留错误直接忽略)
        if (this.switchingSource) {
            return true
        }
        const count = this.props.sourceCount || 1
        this.sourceFails++
        if (count > 1 && this.sourceFails < count && this.props.onSourceError) {
            this.switchingSource = true
            this.props.onSourceError()
            return true
        }
        return false
    }

    onHlsError(ev, data) {
        if (!data || !data.fatal) {
            return
        }
        const hls = this.hls
        if (!hls) {
            return
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            // 源清单(manifest)加载失败说明整个源不可用, startLoad 无法恢复,
            // 直接自动切换到下一个节目源; 其他网络错误(分片/playlist)先重试
            if (data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR ||
                data.details === Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT) {
                if (this.tryNextSource()) {
                    return
                }
            } else if (this.retryNetwork < 2) {
                this.retryNetwork++
                hls.startLoad()
                return
            }
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            if (this.retryMedia < 2) {
                this.retryMedia++
                hls.recoverMediaError()
                return
            }
        }
        // 重试无效: 自动切换到下一个节目源, 所有源都失败后才显示错误界面
        if (this.tryNextSource()) {
            return
        }
        hls.destroy()
        this.hls = null
        this.setState({
            error: "视频播放出错, 请重试",
            loading: false,
            playing: false
        })
    }

    // ------- video 事件 -------

    onLoadedMetadata() {
        const video = this.videoRef.current
        if (!video) {
            return
        }
        this.setState({
            duration: isFinite(video.duration) ? video.duration : 0,
            loading: false
        })

        let savedVolume = null
        try {
            savedVolume = JSON.parse(localStorage.getItem("volume"))
        } catch (e) { }
        if (typeof savedVolume === "number" && savedVolume >= 0 && savedVolume <= 1) {
            try {
                video.volume = savedVolume
            } catch (e) { }
        }

        this.applyRatio(this.props.ratio)

        // 恢复回看倍速(video.load()/换源会把 playbackRate 重置回默认 1 倍)
        if (this.mode() === "review") {
            try {
                video.playbackRate = this.state.speed
            } catch (e) { }
        }

        // 时移流: 原生 HLS(Safari)会从直播边缘开播, 回到流起点(时移开始时刻)
        if (this.mode() === "timeshift" && !this.tsStarted) {
            this.tsStarted = true
            // 服务器按 {begin}-{chosenAt} 跨度生成延迟直播流, 播放头恒等于 实时-跨度,
            // 以载入时刻校准内容基准: 内容时刻 = contentBase + currentTime
            const begin = getTimelineStart(this.props.timeline)
            const parts = this.props.timeline.replace(/^ts-/, "").split("-")
            const chosenAt = parseInt(parts[1], 10)
            const span = (isNaN(chosenAt) ? Math.floor(Date.now() / 1000) : chosenAt) - begin
            this.contentBase = Date.now() / 1000 - span
            if (video.currentTime > 10) {
                try {
                    video.currentTime = 0
                } catch (e) { }
            }
        }

        // 回看切源: 有待续播的播放点, 直接 seek 接着播, 不弹续播询问
        if (this.mode() === "review" && this.pendingSeek > 0) {
            try {
                video.currentTime = this.pendingSeek
            } catch (e) { }
            this.pendingSeek = 0
            this.resumeChecked = true
        } else if (!this.resumeChecked) {
            this.resumeChecked = true
            const info = this.savedInfo
            if (this.mode() === "review" && info &&
                info.timeline === this.props.timeline && info.time > 0) {
                this.setState({ isDialogOpen: true })
            }
        }
    }

    onTimeUpdate() {
        const video = this.videoRef.current
        if (video) {
            this.setState({ currentTime: video.currentTime || 0 })
        }
    }

    onDurationChange() {
        const video = this.videoRef.current
        if (video && isFinite(video.duration)) {
            this.setState({ duration: video.duration })
        }
    }

    onProgress() {
        const video = this.videoRef.current
        if (video && video.buffered && video.buffered.length > 0) {
            this.setState({
                buffered: video.buffered.end(video.buffered.length - 1)
            })
        }
    }

    onPlay() {
        this.setState({ playing: true })
        this.showControls()
    }

    onPause() {
        this.setState({ playing: false })
        this.showControls()
    }

    onEnded() {
        this.setState({ playing: false })
        // 播完停止进度保存并清除该节目的播放点:
        // 否则下次回看该节目会定位到结尾, 立即又触发连播
        clearInterval(this.timer)
        this.clearSavedProgress()
        if (this.props.onPlayEnd) {
            this.props.onPlayEnd()
        }
    }

    // 清除当前频道保存的播放进度(只删 time/timeline, 保留默认源 index 等字段)
    clearSavedProgress() {
        try {
            const info = JSON.parse(localStorage.getItem(this.props.channel))
            if (info) {
                delete info.time
                delete info.timeline
                localStorage.setItem(this.props.channel, JSON.stringify(info))
            }
        } catch (e) { }
    }

    onWaiting() {
        this.setState({ loading: true })
    }

    onPlaying() {
        // 播放成功, 重置多源切换的连续失败计数
        this.sourceFails = 0
        this.setState({ playing: true, loading: false })
    }

    onCanPlay() {
        this.setState({ loading: false })
    }

    onVideoError() {
        // hls.js 场景下错误由 onHlsError 处理; 忽略主动清空 src 触发的错误
        if (this.hls) {
            return
        }
        const video = this.videoRef.current
        if (!video || !video.currentSrc) {
            return
        }
        // 原生 HLS 播放失败: 同样自动切换到下一个节目源
        if (this.tryNextSource()) {
            return
        }
        this.setState({
            error: "视频加载失败, 请重试",
            loading: false,
            playing: false
        })
    }

    onVolumeChange() {
        const video = this.videoRef.current
        if (!video) {
            return
        }
        this.setState((state) => ({
            volume: video.volume,
            muted: video.muted,
            showUnmuteHint: video.muted ? state.showUnmuteHint : false
        }))
    }

    // ------- 交互 -------

    showControls() {
        if (!this.state.controlsVisible) {
            this.setState({ controlsVisible: true })
        }
        clearTimeout(this.hideTimer)
        const video = this.videoRef.current
        if (video && !video.paused && !this.dragging && !this.volumeDragging) {
            this.hideTimer = setTimeout(() => {
                this.setState({ controlsVisible: false })
            }, CONTROLS_HIDE_DELAY)
        }
    }

    onContainerMouseLeave() {
        clearTimeout(this.hideTimer)
        const video = this.videoRef.current
        if (video && !video.paused && !this.dragging && !this.volumeDragging) {
            this.setState({ controlsVisible: false })
        }
    }

    onVideoTouchEnd() {
        this.touchedAt = Date.now()
    }

    onVideoClick() {
        // 触屏后紧跟的合成 click 忽略, 触屏交互由 touch 事件完成
        if (Date.now() - this.touchedAt < 700) {
            return
        }
        const video = this.videoRef.current
        if (!video || this.state.error || !this.props.path) {
            return
        }
        if (this.state.controlsVisible) {
            this.togglePlay()
        } else {
            this.showControls()
        }
    }

    togglePlay() {
        const video = this.videoRef.current
        if (!video || !this.props.path || this.state.error) {
            return
        }
        if (video.paused || video.ended) {
            this.tryPlay(video)
        } else {
            video.pause()
        }
    }

    toggleMute() {
        const video = this.videoRef.current
        if (!video) {
            return
        }
        if (video.muted) {
            video.muted = false
            if (video.volume === 0) {
                this.setVolume(0.5)
            }
        } else {
            video.muted = true
        }
    }

    unmute() {
        const video = this.videoRef.current
        if (video) {
            video.muted = false
        }
        this.setState({ showUnmuteHint: false })
    }

    retry() {
        // 手动重试: 重新从当前源开始轮询
        this.sourceFails = 0
        if (this.props.path) {
            this.setupVideo(this.props.path)
        }
    }

    setVolume(volume) {
        const video = this.videoRef.current
        if (!video) {
            return
        }
        try {
            video.volume = Math.min(1, Math.max(0, volume))
            if (video.volume > 0 && video.muted) {
                video.muted = false
            }
            localStorage.setItem("volume", JSON.stringify(video.volume))
        } catch (e) { }
    }

    toggleSpeedPanel() {
        this.setState({ speedOpen: !this.state.speedOpen })
    }

    closeSpeedPanel() {
        if (this.state.speedOpen) {
            this.setState({ speedOpen: false })
        }
    }

    // 选择倍速: 仅回看模式真正改 playbackRate, 持久化到 localStorage
    setSpeed(speed) {
        const video = this.videoRef.current
        if (video && this.mode() === "review") {
            try {
                video.playbackRate = speed
            } catch (e) { }
        }
        try {
            localStorage.setItem("speed", String(speed))
        } catch (e) { }
        this.setState({ speed, speedOpen: false })
    }

    seekRelative(delta) {
        const video = this.videoRef.current
        // 直播/时移(即"延迟的直播")没有固定时长, 不支持键盘相对 seek
        if (!video || this.mode() !== "review") {
            return
        }
        const duration = this.state.duration
        if (!duration || !isFinite(duration)) {
            return
        }
        let target = video.currentTime + delta
        if (target < 0) {
            target = 0
        }
        if (target > duration) {
            target = duration
        }
        video.currentTime = target
    }

    toggleFullscreen() {
        const container = this.containerRef.current
        const video = this.videoRef.current
        if (getFullscreenElement()) {
            exitFullscreen()
            return
        }
        // iOS iPhone 不支持元素全屏, 退回视频原生全屏
        const requested = container ? requestFullscreen(container) : false
        if (!requested && video && video.webkitEnterFullscreen) {
            video.webkitEnterFullscreen()
        }
    }

    onFullscreenChange() {
        this.setState({ isFullscreen: Boolean(getFullscreenElement()) })
    }

    keyupHandler(event) {
        const video = this.videoRef.current
        if (!video || !this.props.path || this.state.error) {
            return
        }
        switch (event.key) {
            case "ArrowUp": {
                this.setVolume(Math.min(1, video.volume + 0.1))
                break
            }
            case "ArrowDown": {
                this.setVolume(Math.max(0, video.volume - 0.1))
                break
            }
            case "ArrowLeft": {
                this.seekRelative(-10)
                break
            }
            case "ArrowRight": {
                this.seekRelative(10)
                break
            }
            case " ": {
                this.togglePlay()
                break
            }
        }
    }

    // ------- 进度条与缩略图 -------

    // 播放模式: live 直播 / timeshift 时移(路由 ts-{start}, 即延迟的直播) / review 回看
    mode() {
        const tl = this.props.timeline || ""
        if (tl.indexOf("ts-") === 0) {
            return "timeshift"
        }
        return tl ? "review" : "live"
    }

    // 回看时显示节目实际播放时间(时钟), 直播/时移轴显示带日期的绝对时钟, 无时间线时显示相对时长
    fmtTime(value) {
        const mode = this.mode()
        if (mode === "timeshift" || mode === "live") {
            // thumb.time 为绝对时间戳(秒)
            return fmtClockDate(value) || ""
        }
        const start = getTimelineStart(this.props.timeline)
        if (start > 0 && isFinite(value)) {
            return fmtClock(start + value) || fmt(value)
        }
        return fmt(value)
    }

    // 计算鼠标/触点在进度条上的位置比例
    barRatio(e) {
        const bar = this.barRef.current
        if (!bar) {
            return null
        }
        let clientX = e.clientX
        if (clientX === undefined) {
            const t = (e.touches && e.touches[0]) ||
                (e.changedTouches && e.changedTouches[0])
            if (!t) {
                return null
            }
            clientX = t.clientX
        }
        const rect = bar.getBoundingClientRect()
        let ratio = (clientX - rect.left) / rect.width
        if (ratio < 0) {
            ratio = 0
        }
        if (ratio > 1) {
            ratio = 1
        }
        return { ratio: ratio, clientX: clientX }
    }

    rectWidth(bar) {
        const rect = bar.getBoundingClientRect()
        return rect.width
    }

    // 回看模式: 事件位置 -> 直接 seek (按下即跳, 支持拖动)
    seekByEvent(e) {
        const bar = this.barRef.current
        const video = this.videoRef.current
        if (!bar || !video) {
            return
        }
        const duration = this.state.duration
        if (!duration || !isFinite(duration)) {
            return
        }
        const pos = this.barRatio(e)
        if (!pos) {
            return
        }
        video.currentTime = pos.ratio * duration
        this.setState({ currentTime: pos.ratio * duration })
    }

    // 事件位置 -> 直播式轴上的目标时间戳 ([当前-24h, 当前], 直播/时移页共用)
    axisTsByEvent(e) {
        const pos = this.barRatio(e)
        if (!pos) {
            return NaN
        }
        const nowTs = Date.now() / 1000
        return nowTs - TIMESHIFT_WINDOW + pos.ratio * TIMESHIFT_WINDOW
    }

    // 主轴选择粒度: 对齐到整分钟(向前取最近整分, 秒级选择由放大镜承担,
    // 2026-10-26)。向前取整越过当前时刻(轴右缘=实时)时改为向后取整,
    // 保证 begin 不越过 now 而请求不存在的未来时移流
    snapAxisTs(ts) {
        ts = Math.round(ts / 60) * 60
        if (ts > Date.now() / 1000) {
            ts = Math.floor(ts / 60) * 60
        }
        return ts
    }

    onBarMouseDown(e) {
        // 直播/时移页共用轴: 点击某时刻 -> 进入该时刻开始的时移播放
        // begin 优先取悬停缩略图显示的时间(lastAxisTs, 所见即所得, 已对齐整分);
        // 无悬停记录(触屏直接点)时兜底按点击位置计算后同样对齐整分
        // chosenAt 仍为点击当下(handleTimeshift 内取 Date.now())
        const mode = this.mode()
        if (mode === "live" || mode === "timeshift") {
            let ts = this.lastAxisTs > 0 ? this.lastAxisTs : this.axisTsByEvent(e)
            if (isFinite(ts) && this.props.onTimeshift) {
                if (this.lastAxisTs <= 0) {
                    ts = this.snapAxisTs(ts)
                }
                this.props.onTimeshift(Math.floor(ts))
            }
            return
        }
        // 回看: 按下即 seek 并支持拖动
        if (!this.state.duration) {
            return
        }
        this.hideThumb()
        this.dragging = true
        this.seekByEvent(e)
        document.addEventListener("mousemove", this.onDocMouseMove)
        document.addEventListener("mouseup", this.onDocMouseUp)
    }

    onDocMouseMove(e) {
        if (this.dragging) {
            this.seekByEvent(e)
        }
    }

    onDocMouseUp() {
        this.dragging = false
        document.removeEventListener("mousemove", this.onDocMouseMove)
        document.removeEventListener("mouseup", this.onDocMouseUp)
        this.showControls()
    }

    onBarTouchStart(e) {
        if (this.mode() !== "review" || !this.state.duration) {
            return
        }
        // 阻止页面滚动与合成鼠标事件, 拖动预览由 touch 事件完成
        e.preventDefault()
        this.dragging = true
        // 触屏拖动: 先预览(缩略图+时间), 松手才跳转
        this.updateThumb(e, true)
    }

    onBarTouchMove(e) {
        if (this.dragging) {
            e.preventDefault()
            this.updateThumb(e, true)
        }
    }

    onBarTouchEnd(e) {
        if (!this.dragging) {
            return
        }
        // 阻止合成鼠标事件(mousedown/click), 避免松手后误触发 seek/暂停
        e.preventDefault()
        this.dragging = false
        // 松手: 跳转到预览位置(即拖动时显示的当前时间)
        const thumb = this.state.thumb
        const video = this.videoRef.current
        if (thumb && isFinite(thumb.time) && video) {
            video.currentTime = thumb.time
        }
        if (e && e.changedTouches && e.changedTouches[0]) {
            this.touchedAt = Date.now() // 避免松手后的合成点击触发视频暂停
        }
        this.hideThumb()
        this.showControls()
    }

    // 手势被浏览器接管(滚动等)时收尾: 结束拖动, 收起预览
    onBarTouchCancel() {
        if (this.dragging) {
            this.dragging = false
            this.hideThumb()
            this.showControls()
        }
    }

    // 进度条触摸事件挂原生非 passive 监听(渲染处注释): React 16 的合成
    // touch 事件是 passive, preventDefault 无效, 真机上浏览器会接管手势
    // 导致拖动预览中断。回看/直播轴是不同 DOM 节点, 元素更换时重挂
    bindBarTouch() {
        const bar = this.barRef.current
        if (bar === this.boundBar) {
            return
        }
        if (this.boundBar) {
            this.boundBar.removeEventListener("touchstart", this.onBarTouchStart)
            this.boundBar.removeEventListener("touchmove", this.onBarTouchMove)
            this.boundBar.removeEventListener("touchend", this.onBarTouchEnd)
            this.boundBar.removeEventListener("touchcancel", this.onBarTouchCancel)
        }
        this.boundBar = bar
        if (bar) {
            bar.addEventListener("touchstart", this.onBarTouchStart, { passive: false })
            bar.addEventListener("touchmove", this.onBarTouchMove, { passive: false })
            bar.addEventListener("touchend", this.onBarTouchEnd, { passive: false })
            bar.addEventListener("touchcancel", this.onBarTouchCancel)
        }
    }

    onBarMouseMove(e) {
        if (this.dragging) {
            this.seekByEvent(e)
            return
        }
        this.updateThumb(e)
    }

    onBarMouseLeave() {
        this.hideThumb()
    }

    // 统一入口: 根据 mode 计算悬停点对应的时间, 并加载该点的缩略图与时间显示
    updateThumb(e, coarse) {
        const bar = this.barRef.current
        if (!bar) {
            return
        }
        const mode = this.mode()
        const pos = this.barRatio(e)
        if (!pos) {
            return
        }
        if (mode === "live" || mode === "timeshift") {
            // 直播/时移共用轴: 悬停点为绝对时间戳
            const barW = this.rectWidth(bar)
            const px = pos.ratio * barW
            const thumbEl = this.thumbRef.current
            // 放大镜内(气泡即镜体, pointer-events:auto): 光标相对锚点的位移
            // 换算精确时间; 锚点不动(镜不跟随), 否则原地踏步永远选不准
            const inLens = Boolean(thumbEl && e && e.target &&
                thumbEl.contains(e.target) && this.lensAnchor)
            let ts
            if (inLens) {
                ts = Math.floor(this.lensAnchor.ts +
                    (px - this.lensAnchor.px) * LENS_SCALE)
            } else {
                // 主轴悬停: 移动中只做普通预览(不显示刻度尺), 停住 LENS_DWELL_MS
                // 后才冻结锚点弹出放大镜——主轴约百秒/px, 镜体逐像素跟随会疯狂
                // 跳变且无法稳定进入镜体精调 (2026-10-22 停顿锁定方案)
                if (this.lensOpen) {
                    if (this.lensAnchor &&
                        Math.abs(px - this.lensAnchor.px) <= LENS_STICKY_PX) {
                        // 镜体已弹出: 锚点附近的微小抖动不动镜体, 保持稳定
                        return
                    }
                    // 大幅移动 = 想换位置: 收起镜体回到扫动态
                    this.lensOpen = false
                }
                // 以当前位置预备锚点/刻度数据(是否显示由 lensOpen 决定)
                // 主轴悬停即对齐整分: 显示时间=点击 begin=缩略图请求时刻一致;
                // 镜体以整分锚点为中心放大, 镜内点击仍为秒级
                ts = Math.floor(this.axisTsByEvent({ clientX: pos.clientX }))
                if (!isFinite(ts)) {
                    return
                }
                ts = this.snapAxisTs(ts)
                this.lensAnchor = { ts: ts, px: px }
                const left = Math.min(Math.max(px - LENS_W / 2, 0),
                    Math.max(0, barW - LENS_W))
                this.lensLeftPx = left
                const pxPer10 = 10 / LENS_SCALE
                const ticks = []
                // 镜体贴轴端钳制后锚点会偏离镜中心, 最大偏移整个镜宽,
                // 故生成 ±镜宽秒数格再按镜宽裁剪, 避免远端一侧刻度缺失出现空白
                // (格数随 LENS_SCALE 自适应, 硬编码会随尺度调整回归)
                const dMax = Math.ceil(LENS_W / pxPer10)
                for (let d = -dMax; d <= dMax; d++) {
                    const tx = (px - left) + d * pxPer10
                    if (tx < 0 || tx > LENS_W) {
                        continue
                    }
                    ticks.push({ x: tx, major: false, label: "" })
                }
                // 时间标注共 5 个: 按镜内固定位置(左缘起每 1/4 镜宽 = 80px)生成,
                // 间隔 = 80px * LENS_SCALE = 75 秒。不能按锚点 ±150 秒生成:
                // 镜体贴轴端钳制后锚点偏离镜中心, 外侧标注会越出镜体被裁掉
                // (两端悬停时数字显示不全); 按镜左缘生成则任意位置都恰好 5 个,
                // 锚点居中(未钳制)时镜左缘 = 锚点-150秒, 与锚点±75/±150 完全一致
                const t0 = Math.floor(ts - (px - left) * LENS_SCALE) // 镜左缘时刻
                for (let n = 0; n <= 4; n++) {
                    const tx = n * LENS_W / 4
                    ticks.push({
                        x: tx,
                        major: true,
                        label: fmtClock(t0 + tx * LENS_SCALE)
                    })
                }
                this.lensTicks = ticks
                // 重置停顿计时: 停住 LENS_DWELL_MS 后弹出刻度尺
                if (this.dwellTimer) {
                    clearTimeout(this.dwellTimer)
                }
                if (!coarse) {
                    this.dwellTimer = setTimeout(() => {
                        this.dwellTimer = null
                        if (this.lensAnchor && this.lensTicks && !this.lensOpen) {
                            this.lensOpen = true
                            this.forceUpdate()
                        }
                    }, LENS_DWELL_MS)
                }
            }
            if (isFinite(ts)) {
                // 气泡(镜体)水平位置: 以锚点为中心钳制在轴宽内, 镜内移动保持不动
                const cx = Math.min(Math.max(this.lensAnchor.px - LENS_W / 2, 0),
                    Math.max(0, barW - LENS_W)) + LENS_W / 2
                this.loadThumb(ts, coarse, cx)
            }
            return
        }
        // 回看: 统一模板按节目实际时钟换算绝对时间戳取图 (thumb.time 为相对秒)
        if (!this.props.thumbnails) {
            return
        }
        const duration = this.state.duration
        if (!duration || !isFinite(duration)) {
            return
        }
        const seconds = Math.floor(pos.ratio * duration)
        // 节目实际时钟起点 (回看 timeline "start-end")
        const videoStartTs = getTimelineStart(this.props.timeline)
        const barW = this.rectWidth(bar)
        const x = Math.min(Math.max(pos.ratio * barW, 84),
            Math.max(84, barW - 84))

        // 触屏拖动按 THUMB_COARSE 秒粒度取图(减少请求量), 时间仍显示精确秒
        // 缓存键用绝对时间戳 (节目实际时钟), 避免跨节目回看时键冲突
        const cacheKey = coarse
            ? videoStartTs + Math.floor(seconds / THUMB_COARSE) * THUMB_COARSE
            : videoStartTs + seconds

        // ok=false 时只显示时间不显示图片(加载中或加载失败)
        const setThumb = (url, ok) => {
            this.setState({ thumb: { url: url, x: x, time: seconds, ok: ok } })
        }

        // thumbCache: 字符串=成功url; {failAt}=失败时刻, 10秒内不重试, 过期后自动重试
        const cached = this.thumbCache[cacheKey]
        if (typeof cached === "string") {
            setThumb(cached, true)
            this.lastThumbSecond = seconds
            return
        }
        if (cached && Date.now() - cached.failAt < THUMB_FAIL_RETRY) {
            setThumb(null, false)
            this.lastThumbSecond = seconds
            return
        }
        this.lastThumbSecond = seconds
        const seq = ++this.thumbSeq
        const url = this.props.thumbnails.replace("{timestamp}", cacheKey)
        setThumb(null, false) // 立即显示时间, 图片加载成功后再显示
        const img = new Image()
        img.onload = () => {
            this.thumbCache[cacheKey] = url
            if (seq === this.thumbSeq) {
                setThumb(url, true)
            }
        }
        img.onerror = () => {
            this.thumbCache[cacheKey] = { failAt: Date.now() }
            if (seq === this.thumbSeq) {
                setThumb(null, false)
            }
        }
        img.src = url
    }

    // 直播/时移轴的缩略图: 悬停时间戳 -> 统一模板替换绝对时间戳 (v2 API, thumb.time 为绝对时间戳)
    // x: 气泡(放大镜)中心在轴内的像素位置, 由 updateThumb 按锚点计算并钳制
    loadThumb(ts, coarse, x) {
        const bar = this.barRef.current
        if (!bar) {
            return
        }
        const cacheKey = coarse ? Math.floor(ts / THUMB_COARSE) * THUMB_COARSE : ts
        // 记录悬停显示的时间: 点击该轴以此为时移 begin (轴随真实时间右移,
        // 点击瞬间重算会比显示值晚, 与缩略图对不上)
        this.lastAxisTs = ts

        const setThumb = (url, ok) => {
            this.setState({ thumb: { url: url, x: x, time: ts, ok: ok } })
        }

        const cached = this.thumbCache[cacheKey]
        if (typeof cached === "string") {
            setThumb(cached, true)
            return
        }
        if (cached && Date.now() - cached.failAt < THUMB_FAIL_RETRY) {
            setThumb(null, false)
            return
        }
        if (!this.props.thumbnails) {
            setThumb(null, false)
            return
        }
        const seq = ++this.thumbSeq
        const url = this.props.thumbnails.replace("{timestamp}", cacheKey)
        setThumb(null, false)
        const img = new Image()
        img.onload = () => {
            this.thumbCache[cacheKey] = url
            if (seq === this.thumbSeq) {
                setThumb(url, true)
            }
        }
        img.onerror = () => {
            this.thumbCache[cacheKey] = { failAt: Date.now() }
            if (seq === this.thumbSeq) {
                setThumb(null, false)
            }
        }
        img.src = url
    }

    hideThumb() {
        this.thumbSeq++
        this.lastThumbSecond = -1
        // 悬停结束清记录: 之后无 mousemove 直接点击(触屏)走兜底计算
        this.lastAxisTs = 0
        if (this.dwellTimer) {
            clearTimeout(this.dwellTimer)
            this.dwellTimer = null
        }
        this.lensOpen = false
        this.lensAnchor = null
        this.lensTicks = null
        if (this.state.thumb) {
            this.setState({ thumb: null })
        }
    }

    // ------- 音量条 -------

    setVolumeByEvent(e) {
        const el = this.volumeRef.current
        if (!el) {
            return
        }
        const rect = el.getBoundingClientRect()
        let ratio = (e.clientX - rect.left) / rect.width
        if (ratio < 0) {
            ratio = 0
        }
        if (ratio > 1) {
            ratio = 1
        }
        this.setVolume(ratio)
    }

    onVolumeMouseDown(e) {
        this.volumeDragging = true
        this.setVolumeByEvent(e)
        document.addEventListener("mousemove", this.onVolumeDocMove)
        document.addEventListener("mouseup", this.onVolumeDocUp)
    }

    onVolumeMouseMove(e) {
        if (this.volumeDragging || (e.buttons && (e.buttons & 1))) {
            this.setVolumeByEvent(e)
        }
    }

    onVolumeDocMove(e) {
        if (this.volumeDragging) {
            this.setVolumeByEvent(e)
        }
    }

    onVolumeDocUp() {
        this.volumeDragging = false
        document.removeEventListener("mousemove", this.onVolumeDocMove)
        document.removeEventListener("mouseup", this.onVolumeDocUp)
        this.showControls()
    }

    // ------- 画面比例 -------

    applyRatio(ratio) {
        const player = this.frameRef.current
        const video = this.videoRef.current
        if (!player || !video) {
            return
        }
        localStorage.setItem("ratio", ratio)
        switch (ratio) {
            case "自动": {
                video.style["object-fit"] = ""
                Object.assign(player.style, {
                    "margin": "",
                    "height": "",
                    "width": "",
                    "left": "",
                    "right": ""
                })
                break
            }
            case "铺满": {
                video.style["object-fit"] = "fill"
                Object.assign(player.style, {
                    "height": "100%",
                    "width": "100%",
                    "margin": "0 auto"
                })
                break
            }
            case "16:9": {
                this.applyFixedRatio(16, 9)
                break
            }
            case "4:3": {
                this.applyFixedRatio(4, 3)
                break
            }
            case "3:2": {
                this.applyFixedRatio(3, 2)
                break
            }
            default: {
                video.style["object-fit"] = ""
                Object.assign(player.style, {
                    "margin": "",
                    "height": "",
                    "width": "",
                    "left": "",
                    "right": "",
                    "top": ""
                })
            }
        }
    }

    // 固定比例: 在容器内等比完整显示画面 (以宽高较小的一边为基准, 不足处留黑边),
    // 竖屏手机上若按高度算宽会远超屏宽导致画面被裁掉
    applyFixedRatio(rw, rh) {
        const player = this.frameRef.current
        const box = this.containerRef.current
        const video = this.videoRef.current
        if (!player || !box || !video) {
            return
        }
        const cw = box.clientWidth
        const ch = box.clientHeight
        let width = cw
        let height = cw / rw * rh
        if (height > ch) {
            height = ch
            width = ch / rh * rw
        }
        video.style["object-fit"] = "fill"
        Object.assign(player.style, {
            "margin": "0 auto",
            "left": 0,
            "right": 0,
            "top": Math.floor((ch - height) / 2) + "px",
            "height": height + "px",
            "width": width + "px"
        })
    }

    closeDialog() {
        this.setState({
            isDialogOpen: false
        })
    }

    continuePlayProcess() {
        const video = this.videoRef.current
        if (video && this.savedInfo) {
            try {
                video.currentTime = this.savedInfo.time
            } catch (e) { }
        }
        this.closeDialog()
    }
}

export default withStyles(styles)(Player)
