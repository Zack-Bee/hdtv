import React from 'react'
import Button from '@material-ui/core/Button'
import Collapse from '@material-ui/core/Collapse'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import { withStyles } from '@material-ui/core/styles'
import {
    Link
} from 'react-router-dom'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'

const styles = theme => ({
    header: {
        width: "200px"
    },
    nested: {
        paddingLeft: theme.spacing.unit * 5,
        fontSize: "14px",
        paddingTop: "3px",
        paddingBottom: "3px",
        lineHeight: "1.2em"
    },
    list: {
        position: "fixed",
        top: "64px",
        right: "24px",
        backgroundColor: theme.palette.background.paper,
        zIndex: "1150",
        maxHeight: "300px",
        overflowY: "auto",
        [theme.breakpoints.only("xs")]: {
            top: "56px"
        }
    },
    text: {
        // fontSize: "18px"
    }
});

class VideoListButton extends React.Component {
    render() {
        const { classes } = this.props
        return (
            <div>
                <Button color="inherit"
                    aria-haspopup="true"
                    onClick={this.toggleList}
                >
                    节目列表
                </Button>
                <Collapse in={this.state.isListShow} timeout="auto"
                    unmountOnExit>
                    <div className={classes.list}>
                        <ClickAwayListener onClickAway={this.closeList}>
                            <List disablePadding className={classes.header}>
                                <ListItem divider button onClick={() => { this.setOpenIndex(0) }}>
                                    <ListItemText primary="7月15号" classes={{ primary: classes.text }} />
                                </ListItem>
                                <Collapse in={this.state.openIndex === 0} timeout="auto"
                                    unmountOnExit>
                                    <List component="div" disablePadding>
                                        <Link to="/list/channel/所有频道">
                                            <ListItem divider button className={classes.nested}>
                                                <ListItemText primary="16:00 新闻联播真好看哈哈哈哈哈哈哈哈哈" classes={{ primary: classes.text }} />
                                            </ListItem>
                                        </Link>
                                        <ListItem divider button className={classes.nested}>
                                            <ListItemText primary="16:00 新闻联播" classes={{ primary: classes.text }} />
                                        </ListItem>
                                        <ListItem divider button className={classes.nested}>
                                            <ListItemText primary="16:00 新闻联播" classes={{ primary: classes.text }} />
                                        </ListItem>
                                        <ListItem divider button className={classes.nested}>
                                            <ListItemText primary="16:00 新闻联播" classes={{ primary: classes.text }} />
                                        </ListItem>
                                        <ListItem button className={classes.nested}>
                                            <ListItemText primary="16:00 新闻联播" classes={{ primary: classes.text }} />
                                        </ListItem>
                                        <ListItem button className={classes.nested}>
                                            <ListItemText primary="16:00 新闻联播" classes={{ primary: classes.text }} />
                                        </ListItem>
                                        <ListItem button className={classes.nested}>
                                            <ListItemText primary="16:00 新闻联播" classes={{ primary: classes.text }} />
                                        </ListItem>
                                        <ListItem button className={classes.nested}>
                                            <ListItemText primary="16:00 新闻联播" classes={{ primary: classes.text }} />
                                        </ListItem>
                                    </List>
                                </Collapse>
                                <ListItem divider className={classes.header} button onClick={() => { this.setOpenIndex(1) }}>
                                    <ListItemText primary="7月15号" classes={{ primary: classes.text }} />
                                </ListItem>
                                <Collapse in={this.state.openIndex === 1} timeout="auto"
                                    unmountOnExit>
                                    <List component="div" disablePadding>
                                        <ListItem button className={classes.nested}>
                                            <ListItemText primary="16:00 新闻联播" classes={{ primary: classes.text }} />
                                        </ListItem>
                                        <ListItem button className={classes.nested}>
                                            <ListItemText primary="16:00 新闻联播" classes={{ primary: classes.text }} />
                                        </ListItem>
                                        <ListItem button className={classes.nested}>
                                            <ListItemText primary="16:00 新闻联播" classes={{ primary: classes.text }} />
                                        </ListItem>
                                        <ListItem button className={classes.nested}>
                                            <ListItemText primary="16:00 新闻联播" classes={{ primary: classes.text }} />
                                        </ListItem>
                                        <ListItem button className={classes.nested}>
                                            <ListItemText primary="16:00 新闻联播" classes={{ primary: classes.text }} />
                                        </ListItem>
                                        <ListItem button className={classes.nested}>
                                            <ListItemText primary="16:00 新闻联播" classes={{ primary: classes.text }} />
                                        </ListItem>
                                        <ListItem button className={classes.nested}>
                                            <ListItemText primary="16:00 新闻联播" classes={{ primary: classes.text }} />
                                        </ListItem>
                                        <ListItem button className={classes.nested}>
                                            <ListItemText primary="16:00 新闻联播" classes={{ primary: classes.text }} />
                                        </ListItem>
                                    </List>
                                </Collapse>
                            </List>
                        </ClickAwayListener>
                    </div>
                </Collapse>
            </div>
        )
    }

    constructor(props) {
        super(props)
        this.state = {
            isListShow: false,
            openIndex: -1
        }
        this.openList = this.openList.bind(this)
        this.closeList = this.closeList.bind(this)
        this.toggleList = this.toggleList.bind(this)
        this.setOpenIndex = this.setOpenIndex.bind(this)
    }

    openList() {
        this.setState({ isListShow: true })
    }

    closeList() {
        this.setState({ isListShow: false })
    }
    toggleList() {
        this.setState({ isListShow: !this.state.isListShow })
    }
    setOpenIndex(index) {
        if (this.state.openIndex === index) {
            this.setState({ openIndex: -1 })
        } else {
            this.setState({ openIndex: index })
        }
    }
}

export default withStyles(styles)(VideoListButton)