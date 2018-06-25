import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import ListItem from '@material-ui/core/ListItem'
import Collapse from '@material-ui/core/Collapse'
import ListItemText from '@material-ui/core/ListItemText'
import { Link } from 'react-router-dom'
import List from '@material-ui/core/List'


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
                    {props.list.list.map((videoInfo) => (
                        <Link to={`/player/${props.channel}/${
                            videoInfo.timeline}`
                        } key={`${props.channel}-${videoInfo.timeline}`}>
                            <ListItem divider button className={
                                classes.nested
                            }>
                                <ListItemText
                                    primary={`${videoInfo.timeline} ${
                                        videoInfo.title
                                        }`}
                                />
                            </ListItem>
                        </Link>
                    )
                    )}
                </List>
            </Collapse>
        </React.Fragment>
    )
}

export default withStyles(styles)(VideoList)