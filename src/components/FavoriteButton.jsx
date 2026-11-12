import React from "react"
import FavoriteIcon from "@material-ui/icons/Favorite"
import UnFavoriteIcon from "@material-ui/icons/FavoriteBorder"
import IconButton from '@material-ui/core/IconButton'

export default class FavoriteButton extends React.Component {
    render() {
        return (
            <IconButton onClick={this.toggleFavorite} color="inherit"
                className={this.props.className}>
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

    // 小屏"更多"菜单选择收藏时通过 toggleSignal 数值变化触发切换
    componentWillReceiveProps(nextProps) {
        if (nextProps.toggleSignal !== this.props.toggleSignal) {
            this.toggleFavorite()
        }
    }

    componentDidMount() {
        let favorateList = localStorage.getItem("favoriteList")
        if (favorateList) {
            this.favorateList = JSON.parse(favorateList)
            if (this.favorateList.includes(this.props.channel)) {
                this.setState({
                    isFavorite: true
                })
                this.notifyFavorite(true)
            }
        } else {
            this.favorateList = []
            localStorage.setItem("favoriteList", JSON.stringify([]))
        }
    }

    // 通知父组件收藏状态(小屏更多菜单据此显示 收藏/取消收藏)
    notifyFavorite(isFavorite) {
        if (this.props.onFavoriteChange) {
            this.props.onFavoriteChange(isFavorite)
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
            this.notifyFavorite(false)
        } else {
            if (!this.favorateList.includes(channel)) {
                this.favorateList.push(channel)
            }
            localStorage.setItem("favoriteList",
                JSON.stringify(this.favorateList))
            this.setState({
                isFavorite: true
            })
            this.notifyFavorite(true)
        }
    }
}