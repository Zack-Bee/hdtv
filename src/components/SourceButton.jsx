import React from 'react';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import config from "../../config/config"

class SourceButton extends React.Component {
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
                    aria-owns={anchorEl ? 'simple-menu' : null}
                    aria-haspopup="true"
                    onClick={this.handleClick}
                    color="inherit"
                >
                    {this.props.name}
                </Button>
                <Menu
                    id="simple-menu"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={this.handleClose}
                >
                    {
                        this.props.sourceList.map((source) => (
                            <MenuItem key={source.path} onClick={() => {
                                this.handleClose()
                                this.props.setSource(source.name, source.path, 
                                    config.host + source.thumbnails)
                            }}>
                                {source.name}
                            </MenuItem>
                        ))
                    }
                </Menu>
            </div>
        );
    }
}

export default SourceButton