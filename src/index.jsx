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
import ListPage from "./pages/ListPage.jsx"
import PlayerPage from "./pages/PlayerPage.jsx"

const App = () => (
    <React.Fragment>
        <CssBaseline />
        <Switch>
            <Route path="/list/channel/:category" render={({ match }) => (
                <ListPage category={match.params.category} />
            )} />
            <Route path="/player/live/:channel" render={(some) => (
                <PlayerPage match={some} />
            )} />
            <Route path="/">
                <Redirect to="/list/channel/所有频道" />
            </Route>
        </Switch>
    </React.Fragment>
)

const AppWithStyle = withStyles(null, { withTheme: true })(App)

ReactDOM.render((
    <Router>
        <AppWithStyle />
    </Router>
), document.getElementById("root"))