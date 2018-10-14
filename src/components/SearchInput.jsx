import React from 'react'
import Search from '@material-ui/icons/Search'
import blue from "@material-ui/core/colors/blue"
import { withStyles } from '@material-ui/core/styles'

const styles = (theme) => ({
    root: {
        [theme.breakpoints.only("xs")]: {
            display: "none"
        },
        display: "flex",
        backgroundColor: blue[400],
        padding: "4px 8px",
        borderRadius: "5px"
    },
    input: {
        color: "#fff",
        border: "none",
        backgroundColor: blue[400],
        font: "inherit",
        padding: 0,
        outline: "none",
        transition: "width 0.5s"
    }
})

class SearchInput extends React.Component {
    render() {
        const {classes} = this.props
        return (
            <div className={classes.root}>
                <Search />
                <input onFocus={this.bigger} onBlur={this.smaller} 
                    className={classes.input} onChange={this.showResult} 
                    autoComplete="off" style={{width: this.state.width}}
                />
            </div>
        )
    }

    constructor(props) {
        super(props)
        this.state = {
            width: "100px"
        }
        this.smaller = this.smaller.bind(this)
        this.bigger = this.bigger.bind(this)
        this.showResult = this.showResult.bind(this)
    }
    smaller() {
        this.setState({ width: "100px" })
    }
    bigger() {
        this.setState({ width: "150px" })
    }
    showResult(event) {
        let search = event.currentTarget.value,
            channelList = this.props.channelList
        this.props.setFilter(search.trim())
        channelList.filter((channel) => (
            `${channel.name} ${channel.title} ${channel.keyWord}`.
                includes(search)
        ))
    }
}

export default withStyles(styles)(SearchInput)