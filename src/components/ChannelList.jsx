import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'

const styles = {
    media: {
        height: 0,
        paddingTop: '56.25%', // 16:9
    }
}

const theme = createMuiTheme({
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 960,
            lg: 1400,
            xl: 1920
        }
    }
})

const ChannelItem = (props) => {
    const { classes } = props
    return (
        <Grid item xs={12} sm={6} md={4} lg={3}>
            <Card>
                <CardMedia
                    className={classes.media}
                    image="https://iptv2.cic.tsinghua.edu.cn/snapshot/cctv1hd.jpg?12747009"
                    title="cctv"
                />
                <CardContent>
                    <Typography gutterBottom variant="headline" component="h2">
                        Lizard
                </Typography>
                    <Typography component="p">
                        you are a fool
                </Typography>
                </CardContent>
                <CardActions>
                    <Button size="small" color="primary">
                        Share
                    </Button>
                    <Button size="small" color="primary">
                        Learn More
                </Button>
                </CardActions>
            </Card>
        </Grid>
    )
}

const ChannelItemWidthStyles = withStyles(styles)(ChannelItem)