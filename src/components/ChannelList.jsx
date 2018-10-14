import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Grid from '@material-ui/core/Grid'
import PeopleIcon from "@material-ui/icons/People"
import grey from "@material-ui/core/colors/grey"
import Collapse from '@material-ui/core/Collapse'
import { Transition } from 'react-transition-group'
import config from "../../config/config"
import { Link } from 'react-router-dom'

const styles = {
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
    entering: {
        opacity: "0!important"
    },
    entered: {
        opacity: "1!important"
    },
    exiting: {
        opacity: "0!important"
    },
    exited: {
        opacity: "0!important"
    },
    default: {
        transition: `opacity 300ms linear`,
        opacity: "1"
    },
    viewPoepleWrapper: {
        display: "flex",
        lineHeight: "16px",
        fontSize: "16px",
        color: grey[500],
        height: "16px"
    },
    title: {
        color: grey[700]
    },
    channelListWrapper: {
        transition: "box-shadow 0.3s",
        boxShadow: "0 3px 0 0 rgba(0, 0, 0, 0.2)",
        "&:hover": {
            boxShadow: "0 3px 8px 8px rgba(0, 0, 0, 0.2)"
        }
    }
}

const ChannelItem = (props) => {
    const { classes } = props
    // console.log("ChannelItem render")
    return (
        <Transition in={props.isShow} unmountOnExit timeout={300}>
            {(state) => (
                <Grid item xs={12} sm={6} md={4} lg={3} 
                    classes={{ item: `${classes.default} ${classes[state]}` }}>
                    <Link to={`/${config.version}/player/${props.channelId}`}>
                        <div className={classes.channelListWrapper}>
                            <Card classes={{ root: classes.root }}>
                                <Collapse in={!props.isHidePicture} timeout="auto"
                                    unmountOnExit>
                                    <CardMedia
                                        className={classes.media}
                                        image={`${config.host}${props.imageSrc}?${props.cacheNum}`}
                                        title={props.name ? props.name : "正在加载"}
                                    />
                                </Collapse>
                                <CardContent classes={{ root: classes.content }}>
                                    <div className={classes.viewPoepleWrapper}>
                                        <div>{props.name}</div>
                                        <div className={classes.viewPoepleWrapper}>
                                            <PeopleIcon classes={{ root: classes.icon }} />
                                            <span>{props.viewerNum ? props.viewerNum : 0}</span>
                                        </div>
                                    </div>
                                    <div className={classes.title}>{props.title}</div>
                                </CardContent>
                            </Card>
                        </div>
                    </Link>
                </Grid>)}
        </Transition>
    )
}

const ChannelItemWidthStyles = withStyles(styles)(ChannelItem)

class ChannelList extends React.Component {
    render() {
        let isHidePicture = this.props.isHidePicture
        // console.log(this.props.filter)
        return (
            <div>
                <Grid container spacing={isHidePicture ? 0 : 24}>
                    {this.props.channelList.map((channel) => (
                        <ChannelItemWidthStyles key={channel.channelId}
                            isHidePicture={isHidePicture}
                            name={channel.name} title={channel.title}
                            cacheNum={this.props.cacheNum}
                            channelId={channel.channelId}
                            viewerNum={channel.viewerNum}
                            imageSrc={channel.snapshotUrl}
                            isShow={`${channel.name} ${channel.title}`.
                                toLowerCase().includes(this.props.filter)} />
                    ))}
                </Grid>
            </div>
        )
    }
}

export default ChannelList