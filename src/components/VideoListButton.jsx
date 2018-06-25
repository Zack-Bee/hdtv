import React from 'react'
import Button from '@material-ui/core/Button'
import Collapse from '@material-ui/core/Collapse'
import List from '@material-ui/core/List'
import { withStyles } from '@material-ui/core/styles'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import VideoList from "./VideoList.jsx"

const styles = (theme) => ({
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
    }
})

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
                                {
                                    this.state.videoList.map((list, index) => (
                                        <VideoList list={list} 
                                            key={`${this.props.channel}-${
                                                list.date}
                                            `}
                                            setOpenIndex={this.setOpenIndex}
                                            channel={this.props.channel}
                                            index={index} 
                                            openIndex={this.state.openIndex}/>
                                    ))
                                }
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
            openIndex: -1,
            videoList: [
                {
                    date: "7月18日",
                    list: [
                        {
                            title: "新闻联播",
                            timeline: "7:30"
                        },
                        {
                            title: "天气预报",
                            timeline: "8:40"
                        }
                    ]
                },
                {
                    date: "7月17日",
                    list: [
                        {
                            title: "新闻联播",
                            timeline: "4:10"
                        },
                        {
                            title: "天气预报",
                            timeline: "8:40"
                        }
                    ]
                }
            ]
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
    componentDidUpdate(prevProps, prevState) {
        // console.log(prevProps, prevState)
    }
}

export default withStyles(styles)(VideoListButton)