import React from 'react'
import classNames from 'classnames'
import { withStyles } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import List from '@material-ui/core/List'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import Tooltip from '@material-ui/core/Tooltip'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import ViewModule from "@material-ui/icons/ViewModule"
import ViewHeadline from "@material-ui/icons/ViewHeadline"
import blue from "@material-ui/core/colors/blue"
import SearchInput from "../components/SearchInput.jsx"
import CategoryItem from "../components/CategoryItem.jsx"
import ChannelList from "../components/ChannelList.jsx"
import config from "../../config/config"

const drawerWidth = 240

const styles = (theme) => ({
    root: {
        flexGrow: 1,
        height: "100vh",
        zIndex: 1,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        backgroundColor: blue[500]
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginLeft: 12,
        marginRight: 36,
    },
    hide: {
        display: 'none',
    },
    drawerPaper: {
        position: 'relative',
        whiteSpace: 'nowrap',
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerPaperClose: {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing.unit * 7,
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing.unit * 9,
        },
    },
    toolbar: Object.assign({}, {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px'
    }, theme.mixins.toolbar),
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        padding: `32px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px`,
        overflowY: "auto",
        marginTop: 56
    }
})

class MiniDrawer extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            open: false,
            category: this.props.category,
            search: "",
            isHidePicture: false,
            currentChannelList: [{
                name: "CCTV-1",
                channelId: "cctv1hd",
                title: "新闻联播",
                viewerNum: 10,
                keyWord: "CCTV-1 新闻联播",
            }, {
                name: "CCTV-2",
                channelId: "cctv2hd",
                title: "新闻联播",
                viewerNum: 20,
                keyWord: "CCTV-2 新闻联播"
            }, {
                name: "CCTV-3",
                channelId: "cctv3hd",
                title: "天气预报",
                viewerNum: 20,
                keyWord: "CCTV-3 天气预报"
            }, {
                name: "CCTV-3",
                channelId: "cctv4hd",
                title: "天气预报",
                viewerNum: 20,
                keyWord: "CCTV-3 天气预报"
            }, {
                name: "CCTV-3",
                channelId: "cctv5hd",
                title: "天气预报",
                viewerNum: 20,
                keyWord: "CCTV-3 天气预报"
            }, {
                name: "CCTV-3",
                channelId: "cctv6hd",
                title: "天气预报",
                viewerNum: 20,
                keyWord: "CCTV-3 天气预报"
            }],
            categoryList: [

            ],
            timestamp: Date.now(),
            filter: ""
        }
        this.closeDrawer = this.closeDrawer.bind(this)
        this.openDrawer = this.openDrawer.bind(this)
        this.setCategory = this.setCategory.bind(this)
        this.setIsHidePicture = this.setIsHidePicture.bind(this)
        this.setFilter = this.setFilter.bind(this)
    }

    openDrawer() {
        this.setState({ open: true })
    }

    closeDrawer() {
        this.setState({ open: false })
    }

    setCategory(category) {
        this.setState({ category })
    }

    setIsHidePicture(isHidePicture) {
        this.setState({ isHidePicture })
    }

    setFilter(filter) {
        this.setState({ filter })
    }

    freshDetail() {
        console.log("i will fresh")
        let channels = this.state.categoryList

        fetch(config.details).then((res) => {
            res.json().then((details) => {
                let detailsMap = {}

                // 使用map存储, 将修改的复杂度从O(m * n)降低到O(m + n)
                for (let i of details) {
                    detailsMap[i.channelId] = i
                }
                for (let i = 0, len1 = channels.length;
                    i < len1; i++) {
                    for (let j = 0, list = channels[i].channelList,
                        len2 = list.length; j < len2; j++) {
                        list[j].viewerNum = detailsMap[list[j].channelId].viewerNum
                    }
                }
                console.log(channels)

                this.setState({
                    categoryList: channels
                })
            })
        })

        this.setState({
            timestamp: Date.now()
        })
    }

    render() {
        const { classes, theme } = this.props

        return (
            <div className={classes.root}>
                <AppBar
                    position="absolute"
                    className={classNames(classes.appBar,
                        this.state.open && classes.appBarShift)}
                >
                    <Toolbar disableGutters={!this.state.open}>
                        <Tooltip title="显示文字">
                            <IconButton
                                color="inherit"
                                aria-label="open drawer"
                                onClick={this.openDrawer}
                                className={classNames(classes.menuButton,
                                    this.state.open && classes.hide)}
                            >
                                <MenuIcon />
                            </IconButton>
                        </Tooltip>
                        <Typography variant="title" color="inherit" noWrap>
                            {this.props.category}
                        </Typography>
                        <div style={{ flex: "1 1 auto" }}></div>
                        <SearchInput className={classes.input}
                            channelList={this.state.currentChannelList}
                            setFilter={this.setFilter} />
                        <div style={{ margin: "0 20px 0 10px" }}>
                            <IconButton onClick={() => {
                                this.setIsHidePicture(!this.state.isHidePicture)
                            }}>
                                {this.state.isHidePicture ?
                                    <ViewHeadline /> : <ViewModule />}
                            </IconButton>
                        </div>
                    </Toolbar>
                </AppBar>
                <Drawer
                    variant="permanent"
                    classes={{
                        paper: classNames(classes.drawerPaper,
                            !this.state.open && classes.drawerPaperClose),
                    }}
                    open={this.state.open}
                >
                    <div className={classes.toolbar}>
                        <IconButton onClick={this.closeDrawer}>
                            {theme.direction === 'rtl' ?
                                <ChevronRightIcon /> : <ChevronLeftIcon />}
                        </IconButton>
                    </div>
                    <Divider />
                    <List>
                        {this.state.categoryList.map((category) => (
                            <CategoryItem key={category.categoryId}
                                name={category.name}
                                isActive={
                                    this.state.category === category.name
                                }
                            />
                        ))}
                    </List>
                    <Divider />
                    <List>
                        <CategoryItem key="100" name="最近观看"
                            isActive={this.state.category === "最近观看"} />
                        <CategoryItem key="101" name="我的收藏"
                            isActive={this.state.category === "我的收藏"} />
                    </List>
                </Drawer>
                <main className={classes.content}>
                    <div className={classes.toolbar}
                        style={{ height: 0, minHeight: 0 }}
                    />
                    <div>
                        <ChannelList isHidePicture={this.state.isHidePicture}
                            channelList={this.state.currentChannelList}
                            cacheNum={this.state.timestamp}
                            filter={this.state.filter} />
                    </div>
                </main>
            </div>
        )
    }

    componentDidMount() {
        console.log(this.props)
        fetch(config.channels).then((res) => {
            res.json().then((channels) => {

                fetch(config.details).then((res) => {
                    res.json().then((details) => {
                        let detailsMap = {}

                        // 使用map存储, 将修改的复杂度从O(m * n)降低到O(m + n)
                        for (let i of details) {
                            detailsMap[i.channelId] = i
                        }
                        for (let i = 0, len1 = channels.length;
                            i < len1; i++) {
                            for (let j = 0, list = channels[i].channelList,
                                len2 = list.length; j < len2; j++) {
                                list[j].viewerNum = detailsMap[list[j].channelId].viewerNum
                            }
                        }
                        console.log(channels)

                        this.setState({
                            categoryList: channels
                        })

                        // 初始化当前选择的channelsList
                        for (let i = 0, list = channels, len = list.length;
                            i < len; i++) {
                            if (list[i].name === this.props.category) {
                                this.setState({
                                    currentChannelList: list[i].channelList
                                })
                                console.log(list[i])
                                return
                            }
                            
                        }
                    })
                })
            })
        })

        this.timer = setInterval(() => {
            console.log("change")
            this.setState({
                timestamp: Date.now()
            })
        }, 1000 * 120)
    }

    componentDidUpdate(prevProps, prevState) {
        console.log(prevProps, prevState)
        if (prevProps.category === this.props.category &&
            prevState.timestamp === this.state.timestamp) {
            return
        }
        for (let i = 0, list = this.state.categoryList, len = list.length;
            i < len; i++) {
            if (list[i].name === this.props.category) {
                this.setState({
                    currentChannelList: list[i].channelList
                })
                return
            }
        }
    }

    componentWillUnmount() {
        clearInterval(this.timer)
    }
}


export default withStyles(styles, { withTheme: true })(MiniDrawer)
