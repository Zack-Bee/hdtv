import React from 'react'
import { withStyles, createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import { Link } from "react-router-dom"
import Tooltip from '@material-ui/core/Tooltip'
import IconButton from '@material-ui/core/IconButton'
import blue from "@material-ui/core/colors/blue"
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Slide from '@material-ui/core/Slide'
import HomeIcon from "@material-ui/icons/Home"
import Player from "../components/Player.jsx"
import VideoListButton from "../components/VideoListButton.jsx"
import FavoriteButton from "../components/FavoriteButton.jsx"
import SourceButton from "../components/SourceButton.jsx"
import RatioButton from "../components/RatioButton.jsx"
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
    menuButton: {
        marginLeft: -12,
        marginRight: 20,
    },
    appBar: {
        backgroundColor: blue[500]
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

class PlayerPage extends React.Component {
    render() {
        const { classes, match } = this.props
        return (
            <div className={classes.root}>
                <AppBar position="static" classes={{ root: classes.appBar }}>
                    <Toolbar>
                        <Tooltip title="返回频道列表">
                            <Link to={`/${config.version}/list/channel/热门频道`}>
                                <IconButton className={classes.menuButton}
                                    color="inherit" aria-label="Home">
                                    <HomeIcon />
                                </IconButton>
                            </Link>
                        </Tooltip>
                        <Typography variant="title" color="inherit"
                            className={classes.flex} noWrap
                        >
                            {this.state.title}
                        </Typography>
                        <SourceButton name={this.state.currentSourceName}
                            setSource={this.setSource}
                            sourceList={this.state.sourceList}
                            channel={match.params.channel} />
                        <FavoriteButton channel={match.params.channel} />
                        <VideoListButton color="inherit"
                            channel={match.params.channel}
                            timeline={this.state.timeline}
                            videoList={this.state.videoList} />
                        <RatioButton ratio={this.state.ratio}
                            setRatio={this.setRatio} />
                    </Toolbar>
                </AppBar>
                <MuiThemeProvider theme={theme}>
                    <Player path={this.state.currentSourcePath}
                        title={this.state.title}
                        isLive={!Boolean(this.state.timeline)}
                        thumbnails={this.state.currentSourceThumbnails}
                        channel={this.state.channel}
                        timeline={this.state.timeline}
                        ratio={this.state.ratio}
                        onPlayEnd={this.openDialog}
                    />
                    <ColorSnackbar />
                    <Dialog
                        open={this.state.isDialogOpen}
                        TransitionComponent={Slide}
                        keepMounted
                        onClose={this.closeDialog}
                        aria-labelledby="alert-dialog-slide-title"
                        aria-describedby="alert-dialog-slide-description"
                    >
                        <DialogTitle id="alert-dialog-slide-title">
                            {"是否播放下一个节目?"}
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-slide-description">
                                当前视频已经播放完毕.
                        </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={this.closeDialog} color="default">
                                取消
                        </Button>
                            <Button onClick={this.playNextVideo} color="primary">
                                播放
                        </Button>
                        </DialogActions>
                    </Dialog>
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
            timeline: "",
            channel: "",
            ratio: "",
            videoList: [],
            isDialogOpen: false,
            isSnackbarOpen: false
        }
        console.log(props)
        this.setSource = this.setSource.bind(this)
        this.setRatio = this.setRatio.bind(this)
        this.playNextVideo = this.playNextVideo.bind(this)
        this.openDialog = this.openDialog.bind(this)
        this.closeDialog = this.closeDialog.bind(this)
    }

    componentDidMount() {
        let channel = this.props.match.params.channel,
            timeline = this.props.match.params.timeline,
            savedInfo = JSON.parse(localStorage.getItem(channel)),
            index = 0

        if (savedInfo) {
            if (savedInfo.index) {
                index = savedInfo.index
            }
        }

        // 获取视频源
        fetch(`${config.sources}/${channel}/${timeline || ""}`).then((res) => {
            res.json().then((data) => {
                // console.log(data)
                index = index < data.sourceList.length ? index : 0
                this.setState({
                    title: data.title,
                    sourceList: data.sourceList,
                    currentSourceName: data.sourceList[index].name,
                    currentSourcePath: data.sourceList[index].path,
                    timeline,
                    channel,
                    currentSourceThumbnails:
                        config.host + data.sourceList[index].thumbnails
                })
            })
        })

        // 获取节目列表
        this.getVideoList()

        // 设置视频比例
        let ratio = localStorage.getItem("ratio")
        if (ratio) {
            this.setState({ ratio })
        } else {
            this.setState({ ratio: "自动" })
            localStorage.setItem("ratio", "自动")
        }
    }

    componentDidUpdate(prevProps, prevState) {
        let channel = this.props.match.params.channel,
            timeline = this.props.match.params.timeline,
            prevChannel = prevProps.match.params.channel,
            prevTimeline = prevProps.match.params.timeline

        if (channel === prevChannel && timeline === prevTimeline) {
            return
        }

        this.getVideoList()

        // 从存储中获得播放源的index
        let savedInfo = JSON.parse(localStorage.getItem(channel)),
            index = 0
        if (savedInfo) {
            if (savedInfo.index) {
                index = savedInfo.index
            }
        }
        fetch(`${config.sources}/${channel}/${timeline || ""}`).then((res) => {
            res.json().then((data) => {
                // console.log(data)
                index = index < data.sourceList.length ? index : 0
                this.setState({
                    title: data.title,
                    sourceList: data.sourceList,
                    currentSourceName: data.sourceList[index].name,
                    currentSourcePath: data.sourceList[index].path,
                    timeline,
                    channel,
                    currentSourceThumbnails:
                        config.host + data.sourceList[index].thumbnails
                })
            })
        })

        // 存储state
        if (this.state.ratio !== prevState.ratio) {
            localStorage.setItem("ratio", this.state.ratio)
        }
    }

    openDialog() {
        // 播放结束退出全屏
        document.exitFullscreen()

        // 是回放的节目播放完毕
        if (this.state.timeline && this.state.timeline.includes("-")) {
            const timeline = this.state.timeline.split("-")
            const endTime = timeline[1]
            const videoListInOrder = this.state.videoList.slice().reverse()
            for (let i = 0, allLen = videoListInOrder.length; i < allLen; i++) {
                for (let j = 0, list = videoListInOrder[i].list,
                    len = list.length; j < len; j++) {
                    if (endTime <= list[j].endTime) {
                        if (j === len - 1) {
                            if (i !== allLen - 1) {
                                const nextVideo = videoListInOrder[i + 1].list[0]
                                if (nextVideo.endTime * 1000 >= Date.now()) {
                                    return
                                }
                            } else {
                                return
                            }
                        } else {
                            if (list[j + 1].endTime * 1000 >= Date.now()) {
                                return
                            }
                        }
                        this.setState({
                            isDialogOpen: true
                        })
                        return
                    }
                }
            }
        }
    }

    closeDialog() {
        this.setState({
            isDialogOpen: false
        })
    }

    // 设置选择的节目源并存储
    setSource(name, path, thumbnails, index) {
        this.setState({
            currentSourceName: name,
            currentSourcePath: path,
            currentSourceThumbnails: thumbnails,
            currentSourceIndex: index
        })
        let channel = this.props.match.params.channel,
            savedInfo = JSON.parse(localStorage.getItem(channel))
        savedInfo = savedInfo ? savedInfo : {}
        localStorage.setItem(channel, JSON.stringify(Object.assign({}, savedInfo, {
            index
        })))
        // console.log(savedInfo)
    }

    playNextVideo() {
        console.log("here")
        // 是回放的节目播放完毕
        console.log(this.state.timeline)
        console.log(this.state.channel)
        if (this.state.timeline && this.state.timeline.includes("-")) {
            const timeline = this.state.timeline.split("-")
            const endTime = timeline[1]
            const videoListInOrder = this.state.videoList.slice().reverse()
            const channel = this.state.channel
            for (let i = 0, allLen = videoListInOrder.length; i < allLen; i++) {
                for (let j = 0, list = videoListInOrder[i].list,
                    len = list.length; j < len; j++) {
                    if (endTime <= list[j].endTime) {
                        if (j === len - 1) {
                            if (i !== allLen - 1) {
                                const nextVideo = videoListInOrder[i + 1].list[0]
                                if (nextVideo.endTime * 1000 < Date.now()) {
                                    this.props.history.push(
                                        `/${config.version}/player/${channel}/${
                                        nextVideo.startTime
                                        }-${
                                        nextVideo.endTime
                                        }`
                                    )
                                }
                            }
                        } else {
                            if (list[j + 1].endTime * 1000 < Date.now()) {
                                this.props.history.push(
                                    `/${config.version}/player/${channel}/${
                                    list[j + 1].startTime
                                    }-${
                                    list[j + 1].endTime
                                    }`
                                )
                            }
                        }
                        this.closeDialog()
                        return
                    }
                }
            }
        }
    }

    setRatio(ratio) {
        this.setState({ ratio })
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