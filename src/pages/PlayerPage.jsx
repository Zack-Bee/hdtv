import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import { Link } from "react-router-dom"
import Tooltip from '@material-ui/core/Tooltip'
import IconButton from '@material-ui/core/IconButton'
import blue from "@material-ui/core/colors/blue"
import HomeIcon from "@material-ui/icons/Home"
import Player from "../components/Player.jsx"
import VideoListButton from "../components/VideoListButton.jsx"
import FavoriteButton from "../components/FavoriteButton.jsx"
import SourceButton from "../components/SourceButton.jsx"
import RatioButton from "../components/RatioButton.jsx"
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
                            channel={match.params.channel}/>
                        <FavoriteButton channel={match.params.channel}/>
                        <VideoListButton color="inherit" 
                            channel={match.params.channel}
                            timeline={this.state.timeline}/>
                        <RatioButton ratio={this.state.ratio}
                            setRatio={this.setRatio}/>
                    </Toolbar>
                </AppBar>
                <Player path={this.state.currentSourcePath}
                    title={this.state.title}
                    isLive={!Boolean(this.state.timeline)}
                    thumbnails={this.state.currentSourceThumbnails}
                    channel={this.state.channel}
                    timeline={this.state.timeline}
                    ratio={this.state.ratio}/>
                />
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
            ratio: ""
        }

        this.setSource = this.setSource.bind(this)
        this.setRatio = this.setRatio.bind(this)
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

        // 获取数据
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

        // 设置视频比例
        let ratio = localStorage.getItem("ratio")
        if (ratio) {
            this.setState({ratio})
        } else {
            this.setState({ratio: "自动"})
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

    setRatio(ratio) {
        this.setState({ratio})
    }
}

export default withStyles(styles)(PlayerPage)