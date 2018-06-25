import React from "react"
import FavoriteIcon from "@material-ui/icons/Favorite"
import UnFavoriteIcon from "@material-ui/icons/FavoriteBorder"
import IconButton from '@material-ui/core/IconButton'

export default class FavoriteButton extends React.Component {
    render() {
        return (
            <IconButton onClick={this.toggleFavorite} color="inherit">
                {this.state.isFavorite ? <FavoriteIcon/> : <UnFavoriteIcon/>}
            </IconButton>
        )
    }

    constructor(props) {
        super(props)
        this.state = {
            isFavorite: false
        }
        this.toggleFavorite = this.toggleFavorite.bind(this)
    }

    componentDidMount() {
        let favorateList = localStorage.getItem("favoriteList")
        if (favorateList) {
            this.favorateList = JSON.parse(favorateList)
            if (this.favorateList.includes(this.props.channel)) {
                this.setState({
                    isFavorite: true
                })
            }
        } else {
            this.favorateList = []
            localStorage.setItem("favoriteList", JSON.stringify([]))
        }
    }

    toggleFavorite() {
        let channel = this.props.channel
        if (this.state.isFavorite) {
            this.favorateList.splice(
                this.favorateList.indexOf(channel), 1
            )
            localStorage.setItem("favoriteList",
                JSON.stringify(this.favorateList))
            this.setState({
                isFavorite: false
            })
        } else {
            if (!this.favorateList.includes(channel)) {
                this.favorateList.push(channel)
            }
            localStorage.setItem("favoriteList",
                JSON.stringify(this.favorateList))
            this.setState({
                isFavorite: true
            })
        }
    }
}