import React from 'react'
import ReactDOM from "react-dom"
import {
    BrowserRouter as Router,
    Route,
    Redirect,
    Switch
} from 'react-router-dom'
import CssBaseline from '@material-ui/core/CssBaseline'
import { withStyles } from '@material-ui/core/styles'
import "./reset.css"
import 'typeface-roboto'
import ListPage from "./pages/ListPage.jsx"
import PlayerPage from "./pages/PlayerPage.jsx"
import Collapse from '@material-ui/core/Collapse'
import { Transition } from 'react-transition-group'

const defaultListStyle = {
    position: "fixed",
    transition: "left 500ms",
    left: "-100vw",
    top: "0",
    width: "100vw",
    height: "100vh"
}

const defaultPlayerStyle = {
    position: "fixed",
    transition: "left 500ms",
    left: "100vw",
    top: "0",
    width: "100vw",
    height: "100vh"
}

const transitionListStyle = {
    entering: {
        left: "0"
    },
    entered: {
        left: "0"
    },
    exiting: {
        left: "-100vw"
    },
    exited: {
        left: "-100vw"
    }
}

const transitionPlayerStyle = {
    entering: {
        left: "0"
    },
    entered: {
        left: "0"
    },
    exiting: {
        left: "100vw"
    },
    exited: {
        left: "100vw"
    }
}

const App = () => (
    <React.Fragment>
        <CssBaseline />
        <Route path="/list/channel/:category" children={({ match }) => (
            <Transition unmountOnExit timeout={500} in={Boolean(match)} >
                {
                    (state) => (
                        match &&
                        (<div style={Object.assign({},
                            defaultListStyle, transitionListStyle[state])}>
                            <ListPage category={match.params.category} />
                        </div>)
                    )
                }
            </Transition>
        )} />
        <Route path="/player/:channel/:video*" children={({ match }) => (
            <Transition unmountOnExit timeout={500} in={Boolean(match)}>
                {
                    (state) => (
                        match &&
                        (<div style={Object.assign({},
                            defaultPlayerStyle, transitionPlayerStyle[state])}>
                            <PlayerPage match={match} />
                        </div>)
                    )
                }
            </Transition>
        )} />
        <Route path="/:page*" render={({match}) => {
            let page = match.params.page
            if (page === undefined) {
                return (
                    <Redirect to="/list/channel/所有频道"/> 
                )
            }
            if (!page.startsWith("player") && !page.startsWith("list")) {
                return (
                    <Redirect to="/list/channel/所有频道"/> 
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