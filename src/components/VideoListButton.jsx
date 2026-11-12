import React from 'react'
import Button from '@material-ui/core/Button'
import Collapse from '@material-ui/core/Collapse'
import List from '@material-ui/core/List'
import { withStyles } from '@material-ui/core/styles'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import VideoList from "./VideoList.jsx"
import panelStyles from "./panelStyles.js"
import blue from "@material-ui/core/colors/blue"
import grey from "@material-ui/core/colors/grey"

// 节目单面板: 顶部横向日期切换 + 当天节目平铺 (方案B, 2026-10-18 确认)
// 面板定位/圆角阴影/标题头使用共享 panelStyles, 与节目源/屏幕比例面板一致
const styles = (theme) => Object.assign({}, panelStyles(theme), {
    // 节目单比其他面板宽: 8 个日期 chips 需一行放下
    // (Object.assign 是浅覆盖, panel 需写全样式, 不能只写 width)
    panel: {
        width: "580px",
        maxWidth: "calc(100vw - 32px)",
        backgroundColor: theme.palette.background.paper,
        borderRadius: "8px",
        boxShadow: theme.shadows[8],
        overflow: "hidden"
    },
    chips: {
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        padding: "8px 12px",
        borderBottom: "1px solid " + theme.palette.divider
    },
    chip: {
        flex: "0 0 auto",
        padding: "2px 10px",
        margin: "0 6px 4px 0",
        fontSize: "12px",
        lineHeight: "18px",
        borderRadius: "999px",
        border: "1px solid " + theme.palette.divider,
        color: grey[700],
        whiteSpace: "nowrap",
        cursor: "pointer",
        userSelect: "none"
    },
    chipOn: {
        flex: "0 0 auto",
        padding: "2px 10px",
        margin: "0 6px 4px 0",
        fontSize: "12px",
        lineHeight: "18px",
        borderRadius: "999px",
        border: "1px solid " + blue[500],
        color: blue[500],
        backgroundColor: blue[50],
        whiteSpace: "nowrap",
        cursor: "pointer",
        userSelect: "none"
    },
    programs: {
        maxHeight: "60vh",
        overflowY: "auto"
    }
})

class VideoListButton extends React.Component {
    render() {
        const { classes, timeline, videoList, title } = this.props
        // 回看/时移模式定位当前播放内容所在节目; 直播不定位
        const currentStartTime = this.currentStart()
        const isTs = Boolean(timeline && timeline.indexOf("ts-") === 0)
        const day = videoList[this.state.activeIndex]
        return (
            // className 只加在触发按钮上: 面板必须留在未隐藏的根 div 里,
            // 否则小屏下根 div display:none 会连带 position:fixed 的面板一起隐藏
            <div>
                <Button color="inherit"
                    className={this.props.className}
                    aria-haspopup="true"
                    onClick={this.toggleList}
                >
                    节目单
                </Button>
                <Collapse in={this.state.isListShow} timeout="auto"
                    unmountOnExit onEntered={this.scrollToCurrent}>
                    <div className={classes.list}>
                        <ClickAwayListener onClickAway={this.closeList}>
                            <div className={classes.panel} id="hp-vl-panel">
                                <div className={classes.panelHead}>
                                    节目单{title ? " · " + title : ""}
                                </div>
                                <div className={classes.chips}>
                                    {videoList.map((item, index) => (
                                        <span key={item.date}
                                            className={index === this.state.activeIndex
                                                ? classes.chipOn : classes.chip}
                                            onClick={() => this.setActiveDay(index)}>
                                            {this.dayLabel(item.date, index)}
                                        </span>
                                    ))}
                                </div>
                                {day ? (
                                    <List disablePadding className={classes.programs}>
                                        <VideoList list={day.list}
                                            now={this.state.now}
                                            currentStartTime={currentStartTime}
                                            timeshift={isTs}
                                            live={!this.props.timeline}
                                            canCatchup={this.props.canCatchup}
                                            channel={this.props.channel}
                                            onVideoClick={this.closeList} />
                                    </List>
                                ) : null}
                            </div>
                        </ClickAwayListener>
                    </div>
                </Collapse>
            </div>
        )
    }

    constructor(props) {
        super(props)
        this.state = {
            isListShow: false,
            activeIndex: 0,
            videoList: [
            ],
            now: Math.floor(Date.now() / 1000)
        }
        this.closeList = this.closeList.bind(this)
        this.toggleList = this.toggleList.bind(this)
        this.setActiveDay = this.setActiveDay.bind(this)
        this.scrollToCurrent = this.scrollToCurrent.bind(this)
    }

    // 返回"当前播放内容时刻"(秒): 用于节目单凸显/日期定位/进度背景填充
    // 直播: 播放头=实时边缘(now); 回看: 节目start + 已播秒数; 时移: begin + 已播秒数
    currentStart() {
        const { timeline } = this.props
        if (!timeline) {
            return String(Math.floor(Date.now() / 1000))
        }
        let base = 0
        if (timeline.indexOf("ts-") === 0) {
            base = parseInt(timeline.slice(3).split("-")[0], 10)
        } else if (timeline.includes("-")) {
            base = parseInt(timeline.split("-")[0], 10)
        }
        if (isNaN(base) || base <= 0) {
            return ""
        }
        const video = document.querySelector("#playerContainer video")
        const played = video && isFinite(video.currentTime)
            ? Math.floor(video.currentTime) : 0
        return String(base + played)
    }

    // 日期 chip 文案: 今天 / 昨天 / 其余 "MM-dd 周几"
    // 后端 date 格式为 "10月16日[五]"
    dayLabel(date, index) {
        if (index === 0) {
            return "今天"
        }
        if (index === 1) {
            return "昨天"
        }
        const m = /^(\d{1,2})月(\d{1,2})日\[(.+?)\]/.exec(date || "")
        return m ? m[1] + "-" + m[2] + " " + m[3] : (date || "")
    }

    closeList() {
        this.setState({ isListShow: false })
    }
    toggleList() {
        if (this.state.isListShow) {
            this.closeList()
        } else {
            this.openList()
        }
    }

    // 打开节目单: 每次打开默认定位到今天; 回看/时移模式自动切到当前播放内容所在日期
    openList() {
        let activeIndex = 0
        const currentStartTime = this.currentStart()
        if (currentStartTime) {
            const cur = Number(currentStartTime)
            const idx = this.props.videoList.findIndex((day) =>
                day.list.some((v) => cur >= v.startTime && cur < v.endTime))
            if (idx > -1) {
                activeIndex = idx
            }
        }
        this.setState({
            isListShow: true,
            activeIndex,
            now: Math.floor(Date.now() / 1000)
        })
    }

    // 小屏"更多"菜单选择节目单时通过 openSignal 数值变化触发打开
    componentWillReceiveProps(nextProps) {
        if (nextProps.openSignal !== this.props.openSignal) {
            this.openList()
        }
    }
    setActiveDay(index) {
        this.setState({ activeIndex: index }, this.scrollToCurrent)
    }

    // 面板展开/切换日期后, 滚动到正在播出(或回看定位)的节目行
    scrollToCurrent() {
        setTimeout(() => {
            const panel = document.querySelector("#hp-vl-panel")
            if (!panel) {
                return
            }
            const target = panel.querySelector(".hp-vl-current")
            if (target) {
                target.scrollIntoView({ block: "center" })
            }
        }, 80)
    }

    componentDidMount() {
        // 定时刷新 now(5秒): 面板打开期间"正在播出"高亮与进度背景填充随播放/时间更新;
        // 面板关闭时跳过 setState, 避免无谓重渲染
        this.timer = setInterval(() => {
            if (this.state.isListShow) {
                this.setState({
                    now: Math.floor(Date.now() / 1000)
                })
            }
        }, 5000)
    }

    componentWillUnmount() {
        clearInterval(this.timer)
    }
}

export default withStyles(styles)(VideoListButton)
