import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'
import IconButton from '@material-ui/core/IconButton'
import blue from "@material-ui/core/colors/blue"
import HomeIcon from "@material-ui/icons/Home"
import Player from "../components/Player.jsx"

const styles = {
    root: {
        flexGrow: 1,
        height: "100vh",
        overflow: "hidden"
    },
    flex: {
        flex: 1,
    },
    menuButton: {
        marginLeft: -12,
        marginRight: 20,
    },
    appBar: {
        backgroundColor: blue[500]
    }
}

class PlayerPage extends React.Component {
    render() {
        const { classes, match } = this.props
        console.log(match)
        return (
            <div className={classes.root}>
                <AppBar position="static" classes={{ root: classes.appBar }}>
                    <Toolbar>
                        <Tooltip title="返回频道列表">
                            <IconButton className={classes.menuButton}
                                color="inherit" aria-label="Home">
                                <HomeIcon />
                            </IconButton>
                        </Tooltip>
                        <Typography variant="title" color="inherit" className={classes.flex}>
                            {this.state.title}
                        </Typography>
                        <Button color="inherit">节目列表</Button>
                    </Toolbar>
                </AppBar>
                <Player />
            </div>
        )
    }

    constructor(props) {
        super(props)
        this.state = {
            title: "正在加载"
        }
        console.log("constructor", props)
    }
}

export default withStyles(styles)(PlayerPage)