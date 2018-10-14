import React from 'react'
import blue from "@material-ui/core/colors/blue"
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Slide from '@material-ui/core/Slide'
import Hls from 'hls.js'
import swf from 'flowplayer/dist/flowplayer.swf'
import swfHls from 'flowplayer/dist/flowplayerhls.swf'
import "flowplayer/dist/skin/skin.css"
import flowplayer from 'flowplayer'
import thumbnails from "../plugins/flowplayer.thumbnails"
import config from "../../config/config"

window.Hls = Hls

// 增加进度条预览图片扩展
thumbnails(flowplayer)

const styles = (theme) => ({
    player: {
        height: "calc(100vh - 64px)",
        width: "100%",
        overflow: "hidden",
        [theme.breakpoints.only("xs")]: {
            height: "calc(100vh - 56px)"
        }
    }
})

const loadNewVideo = (container, isLive, src, title, thumbnails) => {
    const option = {
        share: false,
        autoplay: true,
        clip: {
            sources: [{
                type: "application/x-mpegurl",
                src
            }]
        },
        live: isLive,
        keyboard: false,
        chromecast: false,
        swf,
        swfHls,
        hlsjs: {
            xhrSetup: (xhr) => {
                xhr.withCredentials = false
            },
        },
        native_fullscreen: true
    }

    if (!isPc) {
        option.clip.title = title
    }

    if (!isLive) {
        option.clip.thumbnails = {
            template: thumbnails,
            interval: 1,
            startIndex: 1,
            preload: false
        }
    }

    return flowplayer(container, option)
}

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

class Player extends React.Component {
    render() {
        return (
            <React.Fragment>
                {/* 对flowplayer的hack, 没有使用css in js */}
                <style>
                    {`
                    #playerContainer .fp-color {
                        background-color: ${blue[500]};
                    }
                    #playerContainer .fp-bar, #playerContainer .fp-volumebar {
                        cursor: pointer;
                    }
                    `}
                </style>
                <div id="playerContainer" ref={(ref) => { this.playerNode = ref }}
                    className={`${this.props.classes.player} fp-mute`} />
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
            sourceList: [],
            currentSourcePath: "",
            currentSourceName: "",
            isDialogOpen: false
        }

        this.savedInfo = {}

        this.closeDialog = this.closeDialog.bind(this)
        this.continuePlayProcess = this.continuePlayProcess.bind(this)
        this.keyupHandler = this.keyupHandler.bind(this)
    }

    componentDidMount() {
        console.log("mount")
        document.addEventListener("keyup", this.keyupHandler)
    }

    
    componentDidUpdate(prevProps) {
        if (prevProps.ratio !== this.props.ratio) {
            this.applyRatio(this.props.ratio)
        }
        if (!this.props.path) {
            return
        }
        if (this.props.path === prevProps.path) {
            return
        }
        if (this.player) {
            if (this.player.engine) {
                this.player.unload()
            }
            this.player.shutdown()
        }
        console.log("update")

        // thumbnails(flowplayer)
        this.player = loadNewVideo(this.playerNode, this.props.isLive,
            this.props.path, this.props.title, this.props.thumbnails)
        this.savedInfo = JSON.parse(localStorage.getItem(this.props.channel))
        this.player.on("ready", () => {

            // 回看时, 如果之前回看过该内容, 询问是否接着回看
            if (this.props.timeline) {
                if (this.savedInfo) {
                    if (this.savedInfo.timeline === this.props.timeline && this.savedInfo.time > 0) {
                        this.setState({isDialogOpen: true})
                    }
                }
            }
            this.applyRatio(this.props.ratio)
            const video = document.querySelector(".fp-player video")
            video.addEventListener("ended", this.props.onPlayEnd)
        })

        clearInterval(this.timer)

        // 如果是回看节目, 记录timeline
        if (this.props.timeline) {
            this.timer = setInterval(() => {
                let newInfo = Object.assign({}, this.savedInfo, {
                    time: this.player.video.time,
                    timeline: this.props.timeline
                })
                localStorage.setItem(this.props.channel, JSON.stringify(newInfo))
            }, 10 * 1000)
        }
    }

    componentWillUnmount() {
        console.log("unmount")
        // 停止监听键盘事件
        document.removeEventListener("keyup", this.keyupHandler)

        // 返回主页前存储信息
        let newInfo = Object.assign({}, this.savedInfo, {
            time: this.player.video.time,
            timeline: this.props.timeline
        })
        localStorage.setItem(this.props.channel, JSON.stringify(newInfo))

        // 卸载播放器
        console.log("player will unmount")
        let hlsEngine = flowplayer.engine('hlsjs-lite')

        if (hlsEngine && hlsEngine.hls) {
            console.log("hls stopLoad")
            hlsEngine.hls.stopLoad();
        }
        if (this.player) {
            this.player.shutdown()
        }
        let video = document.querySelector("#playerContainer video")
        if (video) {
            video.src = ""
            video.load()
        }

        // 停止interval
        clearInterval(this.timer)
    }

    closeDialog() {
        this.setState({
            isDialogOpen: false
        })
    }

    continuePlayProcess() {
        if (this.savedInfo) {
            this.player.seek(this.savedInfo.time)
        }
        this.closeDialog()
    }

    applyRatio(ratio) {
        const player = document.querySelector(".fp-player")
        if (!player) {
            return
        }
        // console.log(container.clientHeight, container.clientWidth)
        localStorage.setItem("ratio", ratio)
        switch (ratio) {
            case "自动":{
                player.querySelector("video").style["object-fit"] = ""
                Object.assign(player.style, {
                    "margin": null,
                    "height": null,
                    "width": null,
                    "left": null,
                    "right": null
                })
                break
            }
            case "铺满":{
                player.querySelector("video").style["object-fit"] = "fill"
                Object.assign(player.style, {
                    "height": "100%",
                    "width": "100%",
                    "margin": "0 auto"
                })
                break
            }
            case "16:9":{
                player.querySelector("video").style["object-fit"] = "fill"
                Object.assign(player.style, {
                    "margin": "0 auto",
                    "left": 0,
                    "right": 0,
                    "height": "100%",
                    "width": player.clientHeight / 9 * 16 + "px"
                })
                break
            }
            case "4:3":{
                player.querySelector("video").style["object-fit"] = "fill"
                Object.assign(player.style, {
                    "margin": "0 auto",
                    "left": 0,
                    "right": 0,
                    "height": "100%",
                    "width": player.clientHeight / 3 * 4 + "px"
                })
                break
            }
            case "3:2":{
                player.querySelector("video").style["object-fit"] = "fill"
                Object.assign(player.style, {
                    "margin": "0 auto",
                    "left": 0,
                    "right": 0,
                    "height": "100%",
                    "width": player.clientHeight / 2 * 3 + "px"
                })
                break
            }
            default :{
                player.querySelector("video").style["object-fit"] = ""
                Object.assign(player.style, {
                    "margin": null,
                    "height": null,
                    "width": null,
                    "left": null,
                    "right": null
                })
            }
        }
    }

    keyupHandler(event) {
        if (!this.player) {
            return
        }
        let volume = JSON.parse(localStorage.getItem("volume"))
        switch (event.key) {
            case "ArrowUp": {
                if (volume === null) {
                    this.player.volume(1)
                    localStorage.setItem("volume", 1)
                } else {
                    volume = Math.min(1, Number(volume) + 0.1)
                    this.player.volume(volume)
                }
                break
            }
            case "ArrowDown": {
                if (volume === null) {
                    this.player.volume(0.9)
                } else {
                    volume = Math.max(0, volume - 0.1)
                    this.player.volume(volume)
                }
                break
            }
            case "ArrowLeft": {
                this.player.seek(false)
                break
            }
            case "ArrowRight": {
                this.player.seek(true)
                break
            }
            case " ": {
                this.player.toggle()
                break
            }
        }
    }
}

export default withStyles(styles)(Player)