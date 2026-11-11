import React from 'react'
import Search from '@material-ui/icons/Search'
import grey from "@material-ui/core/colors/grey"
import blue from "@material-ui/core/colors/blue"
import red from "@material-ui/core/colors/red"
import { withStyles } from '@material-ui/core/styles'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import { Link } from 'react-router-dom'
import panelStyles from "./panelStyles.js"
import config from "../../config/config"

const pad2 = (n) => (n < 10 ? "0" + n : "" + n)

// 频道匹配前归一化: 忽略空格与连字符(实际数据 name="CCTV-1综合",
// keyWord="CCTV-1zh[HD]", 直接搜 cctv1 会因连字符匹配不到)
const norm = (s) => s.toLowerCase().replace(/[\s-]/g, "")

// 节目时间: 「10月18日 20:00」(与列表页日期风格一致)
const fmtTime = (ts) => {
    const d = new Date(ts * 1000)
    return (d.getMonth() + 1) + "月" + d.getDate() + "日 " +
        pad2(d.getHours()) + ":" + pad2(d.getMinutes())
}

const styles = (theme) => {
    const base = panelStyles(theme)
    return Object.assign({}, base, {
        root: {
            [theme.breakpoints.only("xs")]: {
                display: "none"
            },
            display: "flex",
            backgroundColor: blue[400],
            padding: "4px 8px",
            borderRadius: "5px"
        },
        input: {
            color: "#fff",
            border: "none",
            backgroundColor: blue[400],
            font: "inherit",
            padding: 0,
            outline: "none",
            transition: "width 0.5s",
            "&::placeholder": {
                color: "rgba(255,255,255,0.75)"
            }
        },
        // 结果面板: 复用共享面板样式(定位/圆角阴影/标题头), 仅加宽
        panel: Object.assign({}, base.panel, {
            width: "360px"
        }),
        panelBody: {
            maxHeight: "70vh",
            overflowY: "auto"
        },
        // 上部: 频道名匹配行——蓝色小竖条+加粗蓝名+正在播出的节目(灰色常规,
        // 与频道列表页「频道名蓝加粗/节目灰常规」的既有视觉语言一致),
        // 右侧浅灰「直播」提示
        // 注意: 颜色不能直接挂在 <a> 上——全局 a:link 规则(特异性更高)
        // 会用 color:inherit 把它覆盖成 AppBar 的白色, 必须挂在内部 span
        chRow: Object.assign({}, base.item, {
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            "&:last-child": {
                borderBottom: "none"
            }
        }),
        chBar: {
            flex: "0 0 auto",
            width: "3px",
            height: "12px",
            marginRight: "8px",
            borderRadius: "2px",
            backgroundColor: blue[500]
        },
        chName: {
            flex: "0 0 auto",
            maxWidth: "55%",
            color: blue[700],
            fontWeight: 600,
            fontSize: "14px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
        },
        // 正在播出的节目名: 灰色常规字重, 与加粗蓝名区分
        chTitle: {
            flex: "1 1 auto",
            minWidth: "0",
            marginLeft: "8px",
            fontSize: "13px",
            color: grey[600],
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
        },
        chGo: {
            flex: "0 0 auto",
            marginLeft: "auto",
            paddingLeft: "8px",
            fontSize: "12px",
            color: grey[400]
        },
        // 下部: 节目行(两行式: 节目名+标签 / 频道·时间)
        row: Object.assign({}, base.item, {
            display: "block",
            whiteSpace: "normal",
            textDecoration: "none",
            "&:last-child": {
                borderBottom: "none"
            }
        }),
        rowTop: {
            display: "flex",
            alignItems: "center",
            fontSize: "14px",
            whiteSpace: "nowrap",
            overflow: "hidden"
        },
        rowTitle: {
            flex: "0 1 auto",
            minWidth: "0",
            // 颜色挂 span, 避开全局 a:link 的 color:inherit 覆盖
            color: grey[900],
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
        },
        // 仍在播出(endTime=0)的节目: 红色「直播中」标签, 点击进时移
        liveTag: {
            flex: "0 0 auto",
            marginLeft: "8px",
            padding: "0 6px",
            fontSize: "12px",
            lineHeight: "18px",
            borderRadius: "3px",
            color: "#fff",
            backgroundColor: red[500]
        },
        rowSub: {
            marginTop: "2px",
            fontSize: "12px",
            color: grey[500],
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
        },
        empty: {
            padding: "8px 16px",
            fontSize: "13px",
            color: grey[500]
        }
    })
}

class SearchInput extends React.Component {
    render() {
        const { classes } = this.props
        const st = this.state
        // 频道名本地即时匹配(name+channelId+keyWord 归一化包含), 每次渲染重算
        const kw = norm(st.keyword)
        const channels = kw === "" ? [] : this.props.channelList.filter((c) =>
            norm(`${c.name || ""} ${c.channelId || ""} ${c.keyWord || ""}`)
                .includes(kw))
        return (
            <ClickAwayListener onClickAway={this.closePanel}>
                <div className={classes.root}>
                    <Search />
                    <input ref={this.setInputRef}
                        onFocus={this.handleFocus} onBlur={this.smaller}
                        onKeyDown={this.handleKey}
                        className={classes.input} onChange={this.handleChange}
                        placeholder="搜索"
                        autoComplete="off" style={{ width: st.width }} />
                    {st.open && (
                        <div className={classes.list}>
                            <div className={classes.panel + " hdtv-search-pop"}>
                                <div className={classes.panelBody}>
                                    <div className={classes.panelHead}>频道</div>
                                    {channels.length ? (
                                        <div>
                                            {channels.map((c) => (
                                                <Link key={c.channelId}
                                                    className={classes.chRow + " hdtv-search-chrow"}
                                                    to={`/${config.version}/player/${c.channelId}`}
                                                    onClick={this.closePanel}>
                                                    <span className={classes.chBar} />
                                                    <span className={classes.chName}>{c.name}</span>
                                                    {c.title ? (
                                                        <span className={classes.chTitle}>{c.title}</span>
                                                    ) : null}
                                                    <span className={classes.chGo}>直播</span>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className={classes.empty}>无匹配频道</div>
                                    )}
                                    <div className={classes.panelHead}>节目 (近7天)</div>
                                    {st.loading ? (
                                        <div className={classes.empty}>搜索中…</div>
                                    ) : st.programs.length ? (
                                        <div>
                                            {st.programs.map((p) => (
                                                <Link key={p.channelId + "-" + p.startTime}
                                                    className={classes.row + " hdtv-search-row"}
                                                    to={this.programTarget(p)}
                                                    onClick={this.closePanel}>
                                                    <div className={classes.rowTop}>
                                                        <span className={classes.rowTitle}>{p.title}</span>
                                                        {this.isLiveNow(p) && (
                                                            <span className={classes.liveTag}>直播中</span>
                                                        )}
                                                    </div>
                                                    <div className={classes.rowSub}>
                                                        {(p.channelName || p.channelId) + " · " +
                                                            fmtTime(p.startTime)}
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className={classes.empty}>无匹配节目</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </ClickAwayListener>
        )
    }

    constructor(props) {
        super(props)
        this.state = {
            width: "100px",
            open: false,
            keyword: "",
            programs: [],
            loading: false
        }
        // 竞态守卫: 每次新请求自增, 旧响应回来时序号对不上则丢弃
        this.searchSeq = 0
        this.debounceTimer = null
        this.inputRef = null
        // 存活标记: 卸载后在途搜索响应不再 setState(如输完立即点进播放页)
        this.alive = true
        this.smaller = this.smaller.bind(this)
        this.bigger = this.bigger.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.handleFocus = this.handleFocus.bind(this)
        this.handleKey = this.handleKey.bind(this)
        this.closePanel = this.closePanel.bind(this)
        this.handleGlobalKey = this.handleGlobalKey.bind(this)
        this.doSearch = this.doSearch.bind(this)
        this.programTarget = this.programTarget.bind(this)
        this.setInputRef = this.setInputRef.bind(this)
    }

    setInputRef(el) {
        this.inputRef = el
    }

    smaller() {
        this.setState({ width: "100px" })
    }

    bigger() {
        this.setState({ width: "150px" })
    }

    // 输入: 频道即时匹配 + 节目单 API 防抖查询; 清空时关闭面板
    handleChange(event) {
        const keyword = event.currentTarget.value.trim()
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer)
            this.debounceTimer = null
        }
        if (keyword === "") {
            this.searchSeq++ // 作废在途请求
            this.setState({
                keyword, open: false,
                programs: [], loading: false
            })
            return
        }
        this.setState({ keyword, open: true })
        this.debounceTimer = setTimeout(() => {
            this.doSearch(keyword)
        }, 300)
    }

    // 近7天节目单搜索: /v2/search/{keyword}
    doSearch(keyword) {
        const seq = ++this.searchSeq
        this.setState({ loading: true })
        fetch(config.search + "/" + encodeURIComponent(keyword)).then((res) => {
            return res.json()
        }).then((data) => {
            if (!this.alive || seq !== this.searchSeq) return
            this.setState({
                programs: data.list || [],
                loading: false
            })
        }, () => {
            if (!this.alive || seq !== this.searchSeq) return
            this.setState({ programs: [], loading: false })
        })
    }

    // 仍在播出: 无下一条(endTime=0)或节目单结束时间晚于当前时刻
    isLiveNow(p) {
        return p.endTime === 0 || p.endTime > Math.floor(Date.now() / 1000)
    }

    // 跳转目标: 仍在播出 → 时移(该节目开播时刻起播); 已结束 → 回看(起止区间)
    programTarget(p) {
        if (this.isLiveNow(p)) {
            return `/${config.version}/player/${p.channelId}/ts-${p.startTime}-${Math.floor(Date.now() / 1000)}`
        }
        return `/${config.version}/player/${p.channelId}/${p.startTime}-${p.endTime}`
    }

    // 再聚焦时关键字还在则重新打开结果面板
    handleFocus() {
        this.bigger()
        if (this.state.keyword !== "") {
            this.setState({ open: true })
        }
    }

    handleKey(event) {
        if (event.key === "Escape") {
            this.closePanel()
            if (this.inputRef) this.inputRef.blur()
        }
    }

    // 全局快捷键: 光标不在任何输入框时敲 "/" 自动聚焦搜索框并吞掉该字符,
    // 用户接着直接输入关键字(同 GitHub/YouTube 惯例)。
    // 输入框内正常输入 "/"; 移动端搜索框隐藏(xs: display none)时忽略
    handleGlobalKey(event) {
        if (event.key !== "/" || event.ctrlKey || event.metaKey ||
            event.altKey || event.isComposing) {
            return
        }
        const el = document.activeElement
        const tag = el && el.tagName ? el.tagName.toLowerCase() : ""
        if (tag === "input" || tag === "textarea" || tag === "select" ||
            (el && el.isContentEditable)) {
            return
        }
        // 搜索框当前不可见(隐藏元素聚焦无效)时不处理
        if (!this.inputRef || !this.inputRef.getClientRects().length) {
            return
        }
        event.preventDefault()
        this.inputRef.focus()
    }

    closePanel() {
        this.setState({ open: false })
    }

    componentDidMount() {
        document.addEventListener("keydown", this.handleGlobalKey)
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.handleGlobalKey)
        this.alive = false
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer)
            this.debounceTimer = null
        }
        this.searchSeq++
    }
}

export default withStyles(styles)(SearchInput)
