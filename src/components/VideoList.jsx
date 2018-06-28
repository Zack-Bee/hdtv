import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import ListItem from '@material-ui/core/ListItem'
import Collapse from '@material-ui/core/Collapse'
import ListItemText from '@material-ui/core/ListItemText'
import { Link } from 'react-router-dom'
import List from '@material-ui/core/List'
import config from "../../config/config"


const styles = (theme) => ({
    nested: {
        paddingLeft: theme.spacing.unit * 5,
        fontSize: "14px",
        paddingTop: "3px",
        paddingBottom: "3px",
        lineHeight: "1.2em"
    }
})

const VideoList = (props) => {
    const { classes } = props
    return (
        <React.Fragment>
            <ListItem divider button
                onClick={() => {
                    props.setOpenIndex(props.index)
                }}>
                <ListItemText
                    primary={props.list.date} />
            </ListItem>
            <Collapse
                in={props.openIndex === props.index}
                timeout="auto"
                unmountOnExit>
                <List component="div" disablePadding>
                    {props.list.list.map((videoInfo) => {
                        let startTime = new Date(videoInfo.startTime * 1000),
                            hour = startTime.getHours(),
                            minute = startTime.getMinutes()
                        if (props.now > videoInfo.endTime) {
                            return (
                                <Link to={`/${config.version}/player/${props.channel}/${
                                    videoInfo.startTime}-${videoInfo.endTime}`
                                } key={`${props.channel}-${videoInfo.startTime}`}>
                                    <ListItem divider button className={
                                        classes.nested
                                    }>
                                        <ListItemText
                                            primary={`${hour}:${minute} ${
                                                videoInfo.title
                                                }`}
                                        />
                                    </ListItem>
                                </Link>
                            )
                        } else {
                            return (
                                <ListItem
                                    key={`${props.channel}-${videoInfo.startTime}`}
                                    divider button className={
                                        classes.nested
                                    } >
                                    <ListItemText
                                        primary={`${hour}:${minute} ${
                                            videoInfo.title
                                            }`}
                                    />
                                </ListItem>
                            )
                        }
                    })}
                </List>
            </Collapse>
        </React.Fragment>
    )
}

export default withStyles(styles)(VideoList)