import React from 'react'
import blue from "@material-ui/core/colors/blue"
import { withStyles } from '@material-ui/core/styles'
import Hls from 'hls.js'
import swf from 'flowplayer/dist/flowplayer.swf'
import swfHls from 'flowplayer/dist/flowplayerhls.swf'
import "flowplayer/dist/skin/skin.css"
import flowplayer from 'flowplayer'
import thumbnails from "../plugins/flowplayer.thumbnails"

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
    constructor(props) {
        super(props)
        this.state = {
            sourceList: [],
            currentSourcePath: "",
            currentSourceName: ""
        }
    }

    render() {
        return (
            <React.Fragment>
                <style>
                    {`
                    #player .fp-color {
                        background-color: ${blue[500]};
                    }
                    #player .fp-bar, #player .fp-volumebar {
                        cursor: pointer;
                    }
                    `}
                </style>
                <div id="player" ref={(ref) => { this.playerNode = ref }}
                    className={`${this.props.classes.player}`} />
            </React.Fragment>
        )
    }

    componentWillUnmount() {
        // 卸载播放器
        console.log("will unmount")
        if (this.player.engine) {
            this.player.unload()
        }

        this.player.shutdown()
    }

    componentDidUpdate(prevProps) {
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
        this.player = loadNewVideo(this.playerNode, this.props.isLive,
            this.props.path, this.props.title, this.props.thumbnails)
        console.log("did update")
        console.log("path: ", this.props.path)
    }
}

export default withStyles(styles)(Player)