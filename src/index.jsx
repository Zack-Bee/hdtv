// polyfill: 兼容不支持新 API 的浏览器 (IE11 / 旧 Safari 等)
// 需在最前面引入, 顺序不能变
import "core-js/es/promise"
import "core-js/es/object/assign"
import "core-js/es/array/includes"
import "core-js/es/array/find"
import "core-js/es/array/find-index"
import "core-js/es/string/includes"
import "whatwg-fetch"

import React from 'react'
import ReactDOM from "react-dom"
import {
    BrowserRouter as Router,
    Route,
    Redirect
} from 'react-router-dom'
import CssBaseline from '@material-ui/core/CssBaseline'
import { withStyles } from '@material-ui/core/styles'
import "./index.css"
import 'typeface-roboto'
import ListPage from "./pages/ListPage.jsx"
import PlayerPage from "./pages/PlayerPage.jsx"
import config from "../config/config"
// import { Transition } from 'react-transition-group'

// const defaultListStyle = {
//     position: "fixed",
//     transition: "left 500ms",
//     left: "-100vw",
//     top: "0",
//     width: "100vw",
//     height: "100vh"
// }

// const defaultPlayerStyle = {
//     position: "fixed",
//     transition: "left 500ms",
//     left: "100vw",
//     top: "0",
//     width: "100vw",
//     height: "100vh"
// }

// const transitionListStyle = {
//     entering: {
//         left: "0"
//     },
//     entered: {
//         left: "0"
//     },
//     exiting: {
//         left: "-100vw"
//     },
//     exited: {
//         left: "-100vw"
//     }
// }

// const transitionPlayerStyle = {
//     entering: {
//         left: "0vw"
//     },
//     entered: {
//         left: "0vw"
//     },
//     exiting: {
//         left: "100vw"
//     },
//     exited: {
//         left: "100vw",
//     }
// }

console.log("%c  github: https://github.com/Zack-Bee/hdtv  ", 
    `color: #333; 
    font-size: 20px; 
    background-image: linear-gradient(to right, #4facfe, #00f2fe); 
    padding: 10px; 
    border-radius: 20px;`
)

const App = () => (
    <React.Fragment>
        <CssBaseline />
        <Route path={`/${config.version}/list/channel/:category`}
            children={({ match, history }) => (
            // <Transition mountOnEnter unmountOnExit timeout={500} in={Boolean(match)} >
            //     {
            //         (state) => (
                        match &&
                        (<div id="list">
                            <ListPage category={match.params.category} 
                                history={history} 
                            />
                        </div>)
            //         )
            //     }
            // </Transition>
        )} />
        <Route path={`/${config.version}/player/:channel/:timeline*`} 
            children={({ match, history }) => (
            // <Transition mountOnEnter unmountOnExit timeout={500} in={Boolean(match)}>
            //     {
            //         (state) => (
                        match &&
                        (<div id="player">
                            <PlayerPage match={match} history={history}/>
                        </div>)
            //         )
            //     }
            // </Transition>
        )} />
        <Route path={`/${config.version}/:page*`} 
            render={({match}) => {
                let page = match.params.page
                if (page === undefined) {
                    return (
                        <Redirect to={`/${config.version}/list/channel/热门频道`}
                        /> 
                    )
                }
                if (!page.startsWith("player") && !page.startsWith("list")) {
                    return (
                        <Redirect to={`/${config.version}/list/channel/热门频道`}
                        />
                    )
                }
                // 只有完整有效结构才放行: list/channel/<分类> 或 player/<频道>[/<时间>]
                // 结构残缺(/v2/list、/v2/list/channel、/v2/player)或伪前缀(/v2/playerxyz)
                // 时上面 startsWith 放行但两个内容 Route 都匹配不上, 会渲染空白页,
                // 这里按段校验, 不完整一律重定向热门频道
                const seg = page.split("/")
                const isList = seg[0] === "list" && seg[1] === "channel" &&
                    seg.length === 3 && seg[2] !== ""
                const isPlayer = seg[0] === "player" && seg.length >= 2 && seg[1] !== ""
                if (!isList && !isPlayer) {
                    return (
                        <Redirect to={`/${config.version}/list/channel/热门频道`}
                        />
                    )
                }

                return (<React.Fragment/>)
        }}>
        </Route>
    </React.Fragment>
)

const AppWithStyle = withStyles(null, { withTheme: true })(App)

ReactDOM.render((
    <Router>
        <AppWithStyle />
    </Router>
), document.getElementById("root"))