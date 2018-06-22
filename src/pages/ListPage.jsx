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
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import blue from "@material-ui/core/colors/blue"
import IconInput from "../components/IconInput.jsx"
import CategoryItem from "../components/CategoryItem.jsx"

const drawerWidth = 240

const styles = (theme) => ({
    root: {
        flexGrow: 1,
        height: "100vh",
        zIndex: 1,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        currentChannelList: [{
            name: "CCTV-1",
            snapshotUrl: "someUrl",
            channelId: 0,
            title: "新闻联播",
            viewerNum: 10,
            keyWord: "",
            sourceList: [
                {
                    name: "测试",
                    path: "https://media2.neu6.edu.cn/hls/cctv1hd.m3u8"
                },
                {
                    name: "吉大",
                    path: "https://media2.neu6.edu.cn/hls/hls27.m3u8"
                }
            ]
        }]
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
        padding: theme.spacing.unit * 3,
    },
})

class MiniDrawer extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            open: false,
            category: this.props.category,
            search: ""
        }
        this.closeDrawer = this.closeDrawer.bind(this)
        this.openDrawer = this.openDrawer.bind(this)
        this.setCategory = this.setCategory.bind(this)
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
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            onClick={this.openDrawer}
                            className={classNames(classes.menuButton,
                                this.state.open && classes.hide)}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="title" color="inherit" noWrap>
                            {this.props.category}
                        </Typography>
                        <div style={{ flex: "1 1 auto" }}></div>
                        <IconInput />
                    </Toolbar>
                </AppBar>
                <Drawer
                    variant="permanent"
                    classes={{
                        paper: classNames(classes.drawerPaper, !this.state.open && classes.drawerPaperClose),
                    }}
                    open={this.state.open}
                >
                    <div className={classes.toolbar}>
                        <IconButton onClick={this.closeDrawer}>
                            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                        </IconButton>
                    </div>
                    <Divider />
                    <List>
                        <CategoryItem key="0" categoryId="0" name="所有频道"
                            isActive={this.state.category === "所有频道"} />
                        <CategoryItem key="1" categoryId="1" name="热门节目"
                            isActive={this.state.category === "热门节目"} />
                        <CategoryItem key="2" categoryId="2" name="央视频道"
                            isActive={this.state.category === "央视频道"} />
                        <CategoryItem key="3" categoryId="3" name="地方频道"
                            isActive={this.state.category === "地方频道"} />
                        <CategoryItem key="4" categoryId="4" name="电影频道"
                            isActive={this.state.category === "电影频道"} />
                        <CategoryItem key="5" categoryId="5" name="校内直播"
                            isActive={this.state.category === "校内直播"} />
                    </List>
                    <Divider />
                    <List>
                        <CategoryItem key="6" categoryId="6" name="最近观看"
                            isActive={this.state.category === "最近观看"}/>
                        <CategoryItem key="7" categoryId="7" name="我的收藏"
                            isActive={this.state.category === "我的收藏"} />
                    </List>
                </Drawer>
                <main className={classes.content}>
                    <div className={classes.toolbar} />
                    <Typography noWrap>{'You think water moves fast? You should see ice.'}</Typography>
                </main>
            </div>
        )
    }
}


const ListPage = withStyles(styles, { withTheme: true })(MiniDrawer)
export default ListPage
