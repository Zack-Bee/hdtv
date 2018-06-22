import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Grid from '@material-ui/core/Grid'
import PeopleIcon from "@material-ui/icons/People"
import grey from "@material-ui/core/colors/grey"
import { Transition, TransitionGroup } from 'react-transition-group'

const styles = {
    root: {
        cursor: "pointer"
    },
    media: {
        height: 0,
        paddingTop: '56.25%', // 16:9
    },
    content: {
        padding: "8px!important"
    },
    icon: {
        fontSize: "18px"
    }
}

const duration = 200

const defaultStyle = {
    transition: `width ${duration}ms ease-in-out,
        opacity ${duration}ms ease-in-out`,
    opacity: 1,
    width: "100%"
}

const transitionStyles = {
    exiting: { opacity: 1 },
    exited: { 
        opacity: 0,
        width: "0"
    }
}


const ChannelItem = (props) => {
    const { classes } = props
    console.log("render")
    return (
        <Grid item xs={12} sm={6} md={4} lg={3}>
            <div className="ChannelListWrapper">
                <Card classes={{ root: classes.root }}>
                    <Transition in={!props.isHidePicture} timeout={duration}
                        >
                        {(state) => (
                            <div style={Object.assign({}, defaultStyle, 
                                transitionStyles[state])}>
                                <CardMedia
                            className={classes.media}
                            image="https://iptv2.cic.tsinghua.edu.cn/snapshot/cctv1hd.jpg?12747009"
                            title={props.name}
                        />
                            </div>
                        )}
                    </Transition>
                    <CardContent classes={{ root: classes.content }}>
                        {/* <Typography gutterBottom component="h4">
                            {props.name}
                        </Typography>
                        <Typography component="h5">
                            {props.start}
                        </Typography> */}

                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            color: grey[600]
                        }}>
                            <div>{props.name}</div>
                            <div style={{
                                display: "flex",
                                lineHeight: "18px",
                                fontSize: "18px",
                                color: grey[500],
                                height: "18px"
                            }}>
                                <PeopleIcon classes={{ root: classes.icon }} />
                                <span>11</span>
                            </div>
                        </div>
                        <div style={{ color: grey[700] }}>{props.title}</div>
                    </CardContent>
                </Card>
            </div>
        </Grid>
    )
}

const ChannelItemWidthStyles = withStyles(styles)(ChannelItem)

class ChannelList extends React.Component {
    render() {
        let isHidePicture = this.props.isHidePicture
        return (
            <div>
                <style>
                    {
                        `.ChannelListWrapper {
                            transition: box-shadow 0.4s;
                            box-shadow: 0 3px 0 0 rgba(0, 0, 0, 0.2);
                        }`
                        + `
                        .ChannelListWrapper:hover {
                            box-shadow: 0 3px 8px 8px rgba(0, 0, 0, 0.2);
                        }`
                    }
                </style>
                <Grid container spacing={isHidePicture ? 0 : 24}>
                    <ChannelItemWidthStyles isHidePicture={isHidePicture}
                        name="CCTV-1" title="新闻联播" />
                    <ChannelItemWidthStyles isHidePicture={isHidePicture}
                        name="CCTV-1" title="新闻联播" />
                    <ChannelItemWidthStyles isHidePicture={isHidePicture}
                        name="CCTV-1" title="新闻联播" />
                    <ChannelItemWidthStyles isHidePicture={isHidePicture}
                        name="CCTV-1" title="新闻联播" />
                    <ChannelItemWidthStyles isHidePicture={isHidePicture}
                        name="CCTV-1" title="新闻联播" />
                    <ChannelItemWidthStyles isHidePicture={isHidePicture}
                        name="CCTV-1" title="新闻联播" />
                    <ChannelItemWidthStyles isHidePicture={isHidePicture}
                        name="CCTV-1" title="新闻联播" />
                    <ChannelItemWidthStyles isHidePicture={isHidePicture}
                        name="CCTV-1" title="新闻联播" />
                    <ChannelItemWidthStyles isHidePicture={isHidePicture}
                        name="CCTV-1" title="新闻联播" />
                </Grid>
            </div>
        )
    }
}

export default ChannelList