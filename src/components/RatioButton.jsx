import React from 'react';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import config from "../../config/config"

const ratioList = ["自动", "铺满", "16:9", "4:3", "3:2"]

class RatioButton extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            anchorEl: null
        }

        this.handleClick = this.handleClick.bind(this)
        this.handleClose = this.handleClose.bind(this)
    }

    handleClick(event) {
        this.setState({ anchorEl: event.currentTarget })
    }

    handleClose() {
        this.setState({ anchorEl: null })
    }

    render() {
        const { anchorEl } = this.state

        return (
            <div>
                <Button
                    aria-owns={anchorEl ? 'ratio-menu' : null}
                    aria-haspopup="true"
                    onClick={this.handleClick}
                    color="inherit"
                >
                    {this.props.ratio}
                </Button>
                <Menu
                    id="ratio-menu"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={this.handleClose}
                >
                    {
                        ratioList.map((ratio) => (
                            <MenuItem key={ratio} onClick={() => {
                                this.handleClose()
                                this.props.setRatio(ratio)
                            }}>
                                {ratio}
                            </MenuItem>
                        ))
                    }
                </Menu>
            </div>
        );
    }
}

export default RatioButton