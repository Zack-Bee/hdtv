import React from "react"
import { Component } from "react"
import classNames from 'classnames'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import ErrorIcon from '@material-ui/icons/Error'
import InfoIcon from '@material-ui/icons/Info'
import CloseIcon from '@material-ui/icons/Close'
import green from '@material-ui/core/colors/green'
import amber from '@material-ui/core/colors/amber'
import IconButton from '@material-ui/core/IconButton'
import Snackbar from '@material-ui/core/Snackbar'
import SnackbarContent from '@material-ui/core/SnackbarContent'
import WarningIcon from '@material-ui/icons/Warning'
import { withStyles } from '@material-ui/core/styles'

const icons = {
    success: CheckCircleIcon,
    warning: WarningIcon,
    error: ErrorIcon,
    info: InfoIcon,
}

const colorStyles = theme => ({
    success: {
        backgroundColor: green[600],
    },
    error: {
        backgroundColor: theme.palette.error.dark,
    },
    info: {
        backgroundColor: theme.palette.primary.dark,
    },
    warning: {
        backgroundColor: amber[700],
    },
    icon: {
        fontSize: 20,
    },
    iconType: {
        opacity: 0.9,
        marginRight: theme.spacing.unit,
    },
    message: {
        display: 'flex',
        alignItems: 'center',
    },
})

let InnerSnackbar = (props) => {
    const { classes, className, message, onClose, type } = props
    const Icon = icons[type]
    return (
        <SnackbarContent
            className={classNames(classes[type], className)}
            aria-describedby="client-snackbar"
            message={
                <span id="client-snackbar" className={classes.message}>
                    <Icon className={classNames(classes.icon, classes.iconType)} />
                    {message}
                </span>
            }
            action={[
                <IconButton
                    key="close"
                    aria-label="Close"
                    color="inherit"
                    className={classes.close}
                    onClick={onClose}
                >
                    <CloseIcon className={classes.icon} />
                </IconButton>
            ]}
        />
    )
}

InnerSnackbar = withStyles(colorStyles)(InnerSnackbar)


class ColorSnackbar extends Component {
    render() {
        return (
            <Snackbar
                anchorOrigin={{
                    vertical: this.props.vertical || "top",
                    horizontal: this.props.horizontal || "center",
                }}
                open={this.props.open}
                autoHideDuration={this.props.autoHideDuration || 6000}
                onClose={this.props.onClose}
            >
                <InnerSnackbar
                    onClose={this.props.onClose}
                    type={this.props.type}
                    message={this.props.message}
                />
            </Snackbar>
        )
    }
}

export default ColorSnackbar