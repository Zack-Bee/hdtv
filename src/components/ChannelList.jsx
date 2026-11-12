import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Grid from '@material-ui/core/Grid'
import PeopleIcon from "@material-ui/icons/People"
import HistoryIcon from "@material-ui/icons/History"
import grey from "@material-ui/core/colors/grey"
import blue from "@material-ui/core/colors/blue"
import config from "../../config/config"
import { Link } from 'react-router-dom'

// 图片模式: 卡片网格; 文字模式: 紧凑三列行列表(频道/正在播出/观看人数)
const styles = (theme) => ({
    root: {
        cursor: "pointer"
    },
    media: {
        paddingTop: "56.25%"
    },
    content: {
        padding: "8px!important"
    },
    icon: {
        fontSize: "16px"
    },
    firstLineWrapper: {
        display: "flex",
        justifyContent: "space-between",
        color: grey[600],
        alignItems: "center"
    },
    viewPoepleWrapper: {
        display: "flex",
        lineHeight: "16px",
        fontSize: "16px",
        color: grey[500],
        height: "16px"
    },
    title: {
        color: grey[700],
        // 节目名超宽时省略, 保证所有卡片单行等高
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
    },
    channelListWrapper: {
        transition: "box-shadow 0.3s",
        boxShadow: "0 3px 0 0 rgba(0, 0, 0, 0.2)",
        "&:hover": {
            boxShadow: "0 3px 8px 8px rgba(0, 0, 0, 0.2)"
        }
    },
    // ------- 文字模式(纯节目信息): 白底圆角面板 + 自适应多列行网格 -------
    // rowsGrid 用 1px gap 露出背景色形成网格线, 列数随宽度自动变化(宽屏2~3列, 窄屏1列)
    textList: {
        backgroundColor: theme.palette.background.paper,
        borderRadius: "8px",
        boxShadow: theme.shadows[2],
        overflow: "hidden"
    },
    rowsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))",
        gap: "1px",
        backgroundColor: theme.palette.divider
    },
    row: {
        display: "flex",
        alignItems: "center",
        padding: "10px 16px",
        backgroundColor: theme.palette.background.paper,
        cursor: "pointer",
        textDecoration: "none",
        "&:hover": {
            backgroundColor: "rgba(25, 118, 210, 0.06)",
            textDecoration: "none"
        }
    },
    rowName: {
        flex: "0 0 auto",
        width: "150px",
        fontWeight: 600,
        fontSize: "14px",
        color: blue[700],
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        // 频道名左侧蓝色小竖条, 与后面的节目名明确区分
        "&:before": {
            content: '""',
            display: "inline-block",
            width: "3px",
            height: "12px",
            marginRight: "6px",
            borderRadius: "2px",
            backgroundColor: blue[500],
            verticalAlign: "middle"
        }
    },
    rowTitle: {
        flex: "1 1 auto",
        minWidth: "0",
        marginLeft: "12px",
        fontSize: "14px",
        color: grey[600],
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
    },
    rowNum: {
        flex: "0 0 auto",
        minWidth: "96px",
        marginLeft: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        fontSize: "13px",
        color: grey[500],
        whiteSpace: "nowrap"
    }
})

// 观看人数: 在线人数 + 回看人数 (details 接口双字段, 简洁并排展示)
const ViewerNums = (props) => (
    <React.Fragment>
        <PeopleIcon classes={{ root: props.classes.icon }} />
        <span>{props.viewerNum ? props.viewerNum : 0}</span>
        <HistoryIcon classes={{ root: props.classes.icon }} />
        <span>{props.catchupNum ? props.catchupNum : 0}</span>
    </React.Fragment>
)

const ChannelItem = (props) => {
    const { classes } = props
    const isText = props.isHidePicture
    // 缩略图双重背景: 新图在上, 上一次的旧图(浏览器已缓存)垫底;
    // 新图加载完成前旧图一直显示, 加载完成后自然覆盖, 消除整页刷新闪动
    // (首次加载无旧图, 只放单层)
    const host = config.host
    const mediaStyle = props.prevCacheNum
        ? {
            backgroundImage: `url("${host}${props.imageSrc}?${props.cacheNum}"), url("${host}${props.imageSrc}?${props.prevCacheNum}")`
        }
        : {
            backgroundImage: `url("${host}${props.imageSrc}?${props.cacheNum}")`
        }
    // console.log("ChannelItem render")
    return (isText ? (
        <Link to={`/${config.version}/player/${props.channelId}`}
            className={classes.row}>
            <span className={classes.rowName}>
                {props.name}
            </span>
            <span className={classes.rowTitle}>
                {props.title}
            </span>
            <span className={classes.rowNum}>
                <ViewerNums classes={classes}
                    viewerNum={props.viewerNum}
                    catchupNum={props.catchupNum} />
            </span>
        </Link>
    ) : (
        <Grid item xs={12} sm={6} md={4} lg={3}>
            <Link to={`/${config.version}/player/${props.channelId}`}>
                <div className={classes.channelListWrapper}>
                    <Card classes={{ root: classes.root }}>
                        <CardMedia
                            className={classes.media}
                            style={mediaStyle}
                            title={props.name ? props.name : "正在加载"}
                        />
                        <CardContent classes={{ root: classes.content }}>
                            <div className={classes.firstLineWrapper}>
                                <div>{props.name}</div>
                                <div className={classes.viewPoepleWrapper}>
                                    <ViewerNums classes={classes}
                                        viewerNum={props.viewerNum}
                                        catchupNum={props.catchupNum} />
                                </div>
                            </div>
                            <div className={classes.title}>{props.title}</div>
                        </CardContent>
                    </Card>
                </div>
            </Link>
        </Grid>
    ))
}

const ChannelItemWidthStyles = withStyles(styles)(ChannelItem)

class ChannelList extends React.Component {
    render() {
        let isHidePicture = this.props.isHidePicture
        return (
            <div>
                {isHidePicture ? (
                    <div className={this.props.classes.textList}>
                        <div className={this.props.classes.rowsGrid}>
                            {this.props.channelList.map((channel) => (
                                <ChannelItemWidthStyles key={channel.channelId}
                                    isHidePicture={isHidePicture}
                                    name={channel.name} title={channel.title}
                                    cacheNum={this.props.cacheNum}
                                    prevCacheNum={this.props.prevCacheNum}
                                    channelId={channel.channelId}
                                    viewerNum={channel.viewerNum} catchupNum={channel.catchupNum}
                                    imageSrc={channel.snapshotUrl}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <Grid container spacing={24}>
                        {this.props.channelList.map((channel) => (
                            <ChannelItemWidthStyles key={channel.channelId}
                                isHidePicture={isHidePicture}
                                name={channel.name} title={channel.title}
                                cacheNum={this.props.cacheNum}
                                prevCacheNum={this.props.prevCacheNum}
                                channelId={channel.channelId}
                                viewerNum={channel.viewerNum} catchupNum={channel.catchupNum}
                                imageSrc={channel.snapshotUrl}
                            />
                        ))}
                    </Grid>
                )}
            </div>
        )
    }
}

export default withStyles(styles)(ChannelList)
