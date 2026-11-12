import React from 'react';
import Button from '@material-ui/core/Button';
import Collapse from '@material-ui/core/Collapse';
import { withStyles } from '@material-ui/core/styles';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import HistoryIcon from '@material-ui/icons/History';
import panelStyles from "./panelStyles.js"

// 节目源面板: 与节目单一致(固定右上角、圆角阴影、标题头、行分隔、选中高亮)
// v2 API: 源条目含 quality(sd/hd/4k)/canCatchup 结构化字段, 行内渲染画质徽章+回看图标
// 注意 panelStyles 是 (theme)=>({}) 形式, 必须先调用再合并(直接 Object.assign 会丢掉全部共享样式)
const styles = (theme) => Object.assign({}, panelStyles(theme), {
    badge: {
        display: "inline-block",
        marginLeft: "6px",
        padding: "1px 5px",
        borderRadius: "3px",
        fontSize: "11px",
        lineHeight: "14px",
        verticalAlign: "1px",
        border: "1px solid #90a4ae",
        color: "#607d8b"
    },
    badge4k: {
        border: "1px solid #7b1fa2",
        backgroundColor: "#7b1fa2",
        color: "#fff"
    },
    catchupIcon: {
        marginLeft: "4px",
        fontSize: "15px",
        verticalAlign: "-2px",
        color: "#607d8b"
    },
    // 顶栏按钮上的变体: 蓝底 AppBar 需要白色系徽章/图标保证对比度
    barBadge: {
        display: "inline-block",
        marginLeft: "6px",
        padding: "1px 5px",
        borderRadius: "3px",
        fontSize: "11px",
        lineHeight: "14px",
        verticalAlign: "1px",
        border: "1px solid rgba(255,255,255,0.8)",
        color: "#fff"
    },
    barBadge4k: {
        border: "1px solid #fff",
        backgroundColor: "#fff",
        color: "#7b1fa2"
    },
    barIcon: {
        marginLeft: "4px",
        fontSize: "15px",
        verticalAlign: "-2px",
        color: "#fff"
    }
})

class SourceButton extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isShow: false
        }

        this.toggleList = this.toggleList.bind(this)
        this.closeList = this.closeList.bind(this)
    }

    toggleList() {
        this.setState({ isShow: !this.state.isShow })
    }

    closeList() {
        this.setState({ isShow: false })
    }

    // 小屏"更多"菜单选择节目源时通过 openSignal 数值变化触发打开
    componentWillReceiveProps(nextProps) {
        if (nextProps.openSignal !== this.props.openSignal) {
            this.setState({ isShow: true })
        }
    }

    // 画质徽章: 4k 紫色实底, hd/sd 蓝灰描边; quality 为 null(本地视频)不显示
    // onBar=true 时用 AppBar 蓝底白色系变体
    renderBadge(quality, onBar) {
        if (!quality) {
            return null
        }
        const q = String(quality).toLowerCase()
        const text = q === "4k" ? "4K" : q.toUpperCase()
        const { classes } = this.props
        const base = onBar ? classes.barBadge : classes.badge
        const cls = q === "4k"
            ? base + " " + (onBar ? classes.barBadge4k : classes.badge4k)
            : base
        return <span className={cls}>{text}</span>
    }

    render() {
        const { classes } = this.props
        const last = this.props.sourceList.length - 1
        // 当前源条目: 顶栏按钮同样显示画质徽章与回看图标
        let current = null
        for (let i = 0; i < this.props.sourceList.length; i++) {
            if (this.props.sourceList[i].name === this.props.name) {
                current = this.props.sourceList[i]
                break
            }
        }

        return (
            // className 只加在触发按钮上: 面板必须留在未隐藏的根 div 里,
            // 否则小屏下根 div display:none 会连带 position:fixed 的面板一起隐藏
            <div>
                <Button
                    className={this.props.className}
                    aria-haspopup="true"
                    onClick={this.toggleList}
                    color="inherit"
                >
                    {this.props.name}
                    {this.renderBadge(current ? current.quality : null, true)}
                    {current && current.canCatchup
                        ? <HistoryIcon className={classes.barIcon} />
                        : null}
                </Button>
                <Collapse in={this.state.isShow} timeout="auto"
                    unmountOnExit>
                    <div className={classes.list}>
                        <ClickAwayListener onClickAway={this.closeList}>
                            <div className={classes.panel} id="hp-src-panel">
                                <div className={classes.panelHead}>选择节目源</div>
                                {
                                    this.props.sourceList.map((source, index) => {
                                        const isOn = source.name === this.props.name
                                        const cls = isOn
                                            ? (index === last ? classes.itemOnLast : classes.itemOn)
                                            : (index === last ? classes.itemLast : classes.item)
                                        return (
                                            <div key={source.path || source.name}
                                                className={cls}
                                                onClick={() => {
                                                    this.closeList()
                                                    this.props.setSource(source, index)
                                                }}>
                                                {source.name}
                                                {this.renderBadge(source.quality)}
                                                {source.canCatchup
                                                    ? <HistoryIcon className={classes.catchupIcon} />
                                                    : null}
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </ClickAwayListener>
                    </div>
                </Collapse>
            </div>
        );
    }
}

export default withStyles(styles)(SourceButton)
