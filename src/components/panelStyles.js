import grey from "@material-ui/core/colors/grey"
import blue from "@material-ui/core/colors/blue"

// 右上角弹出面板共享样式: 节目单/节目源/屏幕比例三个面板
// 定位、圆角阴影、标题头、行样式完全一致
const panelStyles = (theme) => ({
    list: {
        position: "fixed",
        top: "64px",
        right: "24px",
        zIndex: "1150",
        [theme.breakpoints.only("xs")]: {
            top: "56px",
            right: "8px"
        }
    },
    panel: {
        width: "300px",
        maxWidth: "calc(100vw - 32px)",
        backgroundColor: theme.palette.background.paper,
        borderRadius: "8px",
        boxShadow: theme.shadows[8],
        overflow: "hidden"
    },
    panelHead: {
        padding: "8px 12px",
        fontSize: "13px",
        color: grey[600],
        backgroundColor: grey[50],
        borderBottom: "1px solid " + theme.palette.divider,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
    },
    item: {
        padding: "6px 16px",
        fontSize: "14px",
        color: grey[900],
        borderBottom: "1px solid " + theme.palette.divider,
        cursor: "pointer",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        userSelect: "none",
        "&:hover": {
            backgroundColor: "rgba(0,0,0,0.04)"
        }
    },
    itemLast: {
        padding: "6px 16px",
        fontSize: "14px",
        color: grey[900],
        borderBottom: "none",
        cursor: "pointer",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        userSelect: "none",
        "&:hover": {
            backgroundColor: "rgba(0,0,0,0.04)"
        }
    },
    itemOn: {
        padding: "6px 16px",
        fontSize: "14px",
        color: blue[500],
        fontWeight: 500,
        borderBottom: "1px solid " + theme.palette.divider,
        cursor: "pointer",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        userSelect: "none",
        backgroundColor: blue[50],
        "&:hover": {
            backgroundColor: blue[50]
        }
    },
    itemOnLast: {
        padding: "6px 16px",
        fontSize: "14px",
        color: blue[500],
        fontWeight: 500,
        borderBottom: "none",
        cursor: "pointer",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        userSelect: "none",
        backgroundColor: blue[50],
        "&:hover": {
            backgroundColor: blue[50]
        }
    }
})

export default panelStyles
