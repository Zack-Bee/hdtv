import React from 'react'
import classNames from 'classnames'
import { withStyles, createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles'
import withWidth from "@material-ui/core/withWidth"
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
import Grid from "@material-ui/core/Grid"
import ViewHeadline from "@material-ui/icons/ViewHeadline"
import pink from "@material-ui/core/colors/pink"
import blue from "@material-ui/core/colors/blue"
import red from "@material-ui/core/colors/red"
import teal from "@material-ui/core/colors/teal"
import amber from "@material-ui/core/colors/amber"
import SearchInput from "../components/SearchInput.jsx"
import CategoryItem from "../components/CategoryItem.jsx"
import ChannelList from "../components/ChannelList.jsx"
import config from "../../config/config"
import Button from "@material-ui/core/Button"
import { AutoRotatingCarousel, Slide } from 'material-auto-rotating-carousel'
import partyPng from "../icon/party.png"
import classPng from "../icon/class.png"
import dancePng from "../icon/dance.png"

const drawerWidth = 240

const fetchPromise = (url, id) => {
    return new Promise((resolve, reject) => {
        fetch(url).then((res) => {
            res.json().then((data) => {
                resolve({
                    id,
                    list: data[0].list
                })
            }, (err) => {
                reject(err)
            })
        }, (err) => {
            reject(err)
        })
    })
}

const pinkTheme = createMuiTheme({
    palette: {
        primary: {
            main: pink[500],
            dark: pink[500]
        }
    }
})

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
    },
    container: {
        minHeight: "calc(100% - 340px)",
        [theme.breakpoints.only("xs")]: {
            minHeight: "0"
        }
    },
    flexAuto: {
        flex: "1 1 auto"
    },
    showPictureButtonMargin: {
        margin: "0 20px 0 10px"
    },
    footer: {
        background: blue[500],
        color: "#fff",
        marginTop: "40px",
        padding: "20px 70px 20px 70px"
    },
    alignCenter: {
        display: "flex",
        justifyContent: "center"
    },
    margin: {
        margin: "8px 0"
    }
})

class MiniDrawer extends React.Component {
    render() {
        const { classes, theme } = this.props
        const isMobile = this.props.width === "xs"

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
                                aria-label="显示文字"
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
                        <div className={classes.flexAuto}></div>
                        <SearchInput className={classes.input}
                            channelList={this.getAllChannels()} />
                        <div className={classes.showPictureButtonMargin}>
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
                        <CategoryItem key="101" name="我的收藏"
                            isActive={this.state.category === "我的收藏"} />
                    </List>
                </Drawer>
                <article className={classes.content}>
                    <div className={classes.toolbar}
                        style={{ height: 0, minHeight: 0 }}
                    />
                    <div className={classes.container}>
                        {/* {(this.props.category === "校内直播") &&
                            <MuiThemeProvider theme={pinkTheme}>
                                <div className={classes.alignCenter}>
                                    <a href="https://github.com/Zack-Bee/hdtv-admin/blob/master/README.md">
                                        <Button color="primary"  className={classes.margin}>
                                            校内直播使用教程
                                        </Button>
                                    </a>
                                </div>
                                <div className={classes.alignCenter}>
                                    <a href="http://v.neu6.edu.cn">
                                        <Button color="primary" className={classes.margin}>
                                            校内直播入口
                                        </Button>
                                    </a>
                                </div>
                            </MuiThemeProvider>
                        } */}
                        <ChannelList isHidePicture={this.state.isHidePicture}
                            channelList={this.state.currentChannelList}
                            cacheNum={this.state.timestamp}
                            prevCacheNum={this.state.prevTimestamp}
                        />
                        {/* <AutoRotatingCarousel open={this.state.isCarouselOpen}
                            label="现在就开始直播" onClose={this.closeCarousel}
                            mobile={isMobile} onStart={this.gotoLive}> 
                            <Slide media={<img src={partyPng}/>}
                                title="校内直播功能上线"
                                subtitle="无需流量, 让精彩尽收眼底"
                                mediaBackgroundStyle={{ backgroundColor: red[400] }}
                                style={{ backgroundColor: red[600] }}
                            />
                            <Slide media={<img src={dancePng}/>}
                                title="晚会直播"
                                subtitle="你的舞台, 从现在无处不在"
                                mediaBackgroundStyle={{ backgroundColor: amber[400] }}
                                style={{ backgroundColor: amber[600] }}
                            />
                            <Slide media={<img src={classPng}/>}
                                title="视频培训"
                                subtitle="方便快捷, 足不出户技能++"
                                mediaBackgroundStyle={{ backgroundColor: teal[400] }}
                                style={{ backgroundColor: teal[600] }}
                            />
                        </AutoRotatingCarousel> */}
                    </div>
                    <footer className={classes.footer}>
                        <Grid container alignContent="space-around">
                            <Grid item xs={12} sm={6} >
                                <Typography variant="headline" paragraph color="inherit">
                                    联系我们
                                </Typography>
                                <a href="http://xwb.neu.edu.cn/">
                                    <Typography variant="subheading" color="inherit">
                                        信网办
                                    </Typography>
                                </a>
                                <a href="https://github.com/Zack-Bee/hdtv">
                                    <Typography variant="subheading" color="inherit">
                                        Github
                                    </Typography>
                                </a>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="headline" paragraph color="inherit">
                                    其他链接
                                </Typography>
                                <a href="https://hdtv.neu6.edu.cn/soft/neu_diyp.apk">
                                    <Typography variant="subheading" color="inherit">
                                        安卓客户端
                                </Typography>
                                </a>
                            </Grid>
                        </Grid>
                    </footer>
                </article>
            </div>
        )
    }

    constructor(props) {
        super(props)

        const version = localStorage.getItem("version")
        let isCarouselOpen = false

        // 当存储的版本号与当前版本不同时显示轮播图
        // if (version === null || version !== config.versionDetail) {
            // localStorage.setItem("version", config.versionDetail)
            // isCarouselOpen = true
        // }

        let isHidePicture = localStorage.getItem("isHidePicture")

        if (isHidePicture) {
            isHidePicture = JSON.parse(isHidePicture)
        } else {
            isHidePicture = false
            localStorage.setItem("isHidePicture", JSON.stringify(false))
        }

        this.state = {
            open: false,
            category: this.props.category,
            search: "",
            isHidePicture,
            currentChannelList: [],
            categoryList: [],
            timestamp: Date.now(),
            // 上一次的 cacheNum: 缩略图双重背景垫底层, 新图加载完成前旧图不消失, 避免整页闪动
            prevTimestamp: 0,
            isCarouselOpen
        }
        this.closeDrawer = this.closeDrawer.bind(this)
        this.openDrawer = this.openDrawer.bind(this)
        this.setCategory = this.setCategory.bind(this)
        this.setIsHidePicture = this.setIsHidePicture.bind(this)
        this.freshTitle = this.freshTitle.bind(this)
        this.freshDetail = this.freshDetail.bind(this)
        this.closeCarousel = this.closeCarousel.bind(this)
        this.gotoLive = this.gotoLive.bind(this)
        this.merryChristmas()
    }

    componentDidMount() {
        // 记住当前分类: 播放页左上角返回按钮回到进入播放页前的分类
        localStorage.setItem("lastCategory", this.props.category)

        fetch(config.channels).then((res) => {
            return res.json()
        }).then((channels) => {
            this.freshFavoriteListInfo(channels)
            this.setState({
                categoryList: channels
            }, () => {
                this.freshDetail()
                this.getVideoMap(channels).then(this.freshTitle)
            })

            this.applySelectCategory()
        }).catch(() => {
            // 频道列表拉取失败: 页面骨架保留, 避免未处理 rejection
        })

        // 周期性更新信息 (缩略图/人数/标题, 每分钟刷新一次)
        this.timer = setInterval(() => {
            // console.log("change")
            this.bumpCache()
            this.freshDetail()
            this.getVideoMap(this.state.categoryList).then(this.freshTitle)
        }, 1000 * 60)
    }

    componentDidUpdate(prevProps) {
        if (prevProps.category === this.props.category) {
            return
        }

        // 分类切换时同样更新记忆, 返回按钮跟随最新分类
        localStorage.setItem("lastCategory", this.props.category)
        this.applySelectCategory()
    }

    componentWillUnmount() {
        clearInterval(this.timer)
    }

    // 跳转到校内直播
    gotoLive() {
        this.closeCarousel()
        this.props.history.push(`/${config.version}/list/channel/校内直播`)
    }

    // 关闭轮播图
    closeCarousel() {
        this.setState({
            isCarouselOpen: false
        })
    }

    // 打开侧面导航栏
    openDrawer() {
        this.setState({ open: true })
    }

    // 关闭侧面导航栏
    closeDrawer() {
        this.setState({ open: false })
    }

    // 设置分类
    setCategory(category) {
        this.setState({ category })
    }

    // 设置是否隐藏图片
    setIsHidePicture(isHidePicture) {
        localStorage.setItem("isHidePicture", JSON.stringify(isHidePicture))
        this.setState({ isHidePicture })
    }

    // 搜索面板用的全量频道列表("所有频道"分类), 频道名匹配在面板内本地完成
    getAllChannels() {
        for (let i = 0, list = this.state.categoryList, len = list.length;
            i < len; i++) {
            if (list[i].name === "所有频道") {
                return list[i].channelList
            }
        }
        return this.state.currentChannelList
    }

    // 换缩略图缓存参数: 旧值挪给 prevTimestamp 作垫底背景, 新值拉取新图
    bumpCache() {
        this.setState((s) => ({
            prevTimestamp: s.timestamp,
            timestamp: Date.now()
        }))
    }

    // 获取节目观看人数等详细信息
    freshDetail() {
        let channels = this.state.categoryList
        fetch(config.details).then((res) => {
            return res.json()
        }).then((details) => {
            let detailsMap = {}

            // 使用map存储, 将查找修改的复杂度从O(n^2)降低到O(n)
            for (let i of details) {
                detailsMap[i.channelId] = i
            }
            for (let i = 0, len1 = channels.length;
                i < len1; i++) {
                for (let j = 0, list = channels[i].channelList,
                    len2 = list.length; j < len2; j++) {
                    // details 双字段: viewerNum 实时在线, catchupNum 回看人数
                    const d = detailsMap[list[j].channelId] || {}
                    list[j].viewerNum = d.viewerNum
                    list[j].catchupNum = d.catchupNum
                }
            }

            this.setState({
                categoryList: channels
            })
        }).catch(() => {
            // 人数接口失败: 保留上一轮数据, 等下一分钟周期重试
        })

        // 注意: 这里不能再 bumpCache——定时器已显式调用, 若在此重复调用,
        // 每周期会连续生成两个几乎同时的 ts, 每张缩略图短时间请求 2 次
    }

    // 根据节目单刷新标题
    freshTitle(videoMap) {
        let currentMap = {},
            now = Math.floor(Date.now() / 1000)

        // 根据节目单map得到当前播放的节目的名称
        for (let i in videoMap) {
            for (let j = 0, len = videoMap[i].length; j < len; j++) {
                if ((now <= videoMap[i][j].endTime) &&
                    (now >= videoMap[i][j].startTime)) {
                    currentMap[i] = videoMap[i][j].title
                    break
                }
            }
        }
        for (let i = 0, categoryList = this.state.categoryList;
            i < categoryList.length; i++) {
            for (let j = 0; j < categoryList[i].channelList.length; j++) {
                let channel = categoryList[i].channelList[j]
                channel.title = currentMap[channel.channelId] || " "
            }
        }
        this.setState({
            categoryList: this.state.categoryList
        })
    }

    freshFavoriteListInfo(channels) {

        // 获取收藏的节目
        let favoriteList = localStorage.getItem("favoriteList")
        if (!favoriteList) {
            localStorage.setItem("favoriteList", JSON.stringify([]))
            this.favoriteCategory = []
        } else {

            // 从所有频道中得到收藏节目的信息
            favoriteList = JSON.parse(favoriteList)
            for (let i = 0, categoryList = channels,
                len = categoryList.length; i < len; i++) {
                if (categoryList[i].name === "所有频道") {
                    this.favoriteCategory = []
                    favoriteList.forEach((id) => {
                        for (let j = 0; j < categoryList[i].channelList.length;
                            j++) {
                            if (categoryList[i].channelList[j].channelId ===
                                id) {
                                this.favoriteCategory.push(
                                    categoryList[i].channelList[j]
                                )
                            }
                        }
                    })
                    break
                }
            }
        }
    }

    // 获取所有节目的节目单的map
    getVideoMap(channels) {
        return new Promise((resolve) => {
            let storeSaveTime = sessionStorage.getItem("saveTime"),
                saveTime = Number(storeSaveTime),
                saveDate = new Date(saveTime).getDate(),
                currentDate = new Date().getDate(),
                videoMap = sessionStorage.getItem("videoMap")

            // 如果节目单信息过期(超过 40 分钟)或跨天, 则发送请求更新节目单
            // 注意比较方向: Date.now() - saveTime 才是已缓存时长(原写法恒为假,
            // 缓存永不按 40 分钟失效, 同一天内节目标题一直用旧数据)
            if (!storeSaveTime || !videoMap ||
                (Date.now() - saveTime > 40 * 60 * 1000) ||
                currentDate !== saveDate) {
                for (let i = 0, list = channels, len = list.length;
                    i < len; i++) {
                    if (list[i].name === "所有频道") {
                        let fetchAllPromise = []
                        for (let j = 0;
                            j < list[i].channelList.length;
                            j++) {
                            let channelId = list[i].channelList[j].channelId
                            fetchAllPromise.push(
                                fetchPromise(
                                    `${config.list}/${channelId}/1`,
                                    list[i].channelList[j].channelId
                                )
                            )
                        }
                        let allVideo = {}
                        Promise.all(fetchAllPromise).then((list) => {
                            list.forEach((info) => {
                                allVideo[info.id] = info.list
                            })
                            sessionStorage.setItem("saveTime", Date.now())
                            sessionStorage.setItem("videoMap",
                                JSON.stringify(allVideo))
                            resolve(allVideo)
                        }).catch(() => {
                            // 任一频道节目单拉取失败: 本轮以空 map 收场,
                            // 不写缓存, 下个刷新周期整体重试
                            resolve({})
                        })
                    }
                }
            } else {

                // 直接使用本地存储中的节目map
                resolve(JSON.parse(videoMap))
            }
        })
    }

    applySelectCategory() {

        // 切换到收藏的节目单
        if (this.props.category === "我的收藏") {
            this.setState({
                currentChannelList: this.favoriteCategory || []
            })
            return
        }

        // 切换不同的分类
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

    // 圣诞节, 平安夜彩蛋
    merryChristmas() {
        const _date = new Date()
        const month = _date.getMonth()
        const date = _date.getDate()
        if (month === 11 && date == 25) {
            document.title = "HDTV: Merry Christmas! : )"
        } else if (month == 11 && date == 24) {
            document.title = "HDTV: Happy Christmas Eve! : )"
        }
    }

    // 元旦彩蛋
    happyNewYears() {
        const _date = new Date()
        const year = _date.getFullYear()
        const month = _date.getMonth()
        const date = _date.getDate()
        if (month === 0 && date == 1) {
            document.title = `HDTV: 元旦快乐, ${year}更加精彩`
        } else if (month === 11 && date === 31) {
            document.title = `HDTV: 元旦快乐, ${year}感谢有你`
        }
    }
}

export default withWidth()(withStyles(styles, { withTheme: true })(MiniDrawer))
