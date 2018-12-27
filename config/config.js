const host = "https://hdtv.neu6.edu.cn"
const version = "v1"
const versionDetail = "1.1.0"
module.exports = {
    host,
    channels: `${host}/${version}/channels`,
    details: `${host}/${version}/details`,
    sources: `${host}/${version}/sources`,
    version,
    list: `${host}/${version}/list`,
    versionDetail
}