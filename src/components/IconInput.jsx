import React from 'react'
import Search from '@material-ui/icons/Search'
import blue from "@material-ui/core/colors/blue"

class SearchInput extends React.Component {
    render() {
        return (
            <div style={{
                display: "flex",
                backgroundColor: blue[400],
                padding: "4px 8px",
                borderRadius: "5px"
            }}>
                <Search />
                <input onFocus={this.bigger} onBlur={this.smaller} style={{
                    color: "#fff",
                    border: "none",
                    backgroundColor: blue[400],
                    font: "inherit",
                    padding: 0,
                    outline: "none",
                    width: this.state.width,
                    transition: "width 0.5s"
                }} onChange={this.showResult} autoComplete="off"/>
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
    }
    smaller() {
        this.setState({width: "100px"})
    }
    bigger() {
        this.setState({width: "150px"})
    }
    showResult(event) {
        let search = event.currentTarget.value,
            channelList = this.props.channelList
        this.props.setSearch(search)
        channelList.filter((channel) => (
            `${channel.name} ${channel.title} ${channel.keyWord}`.
                includes(search)
        ))
    }
}

export default SearchInput