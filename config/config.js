const host = "https://hdtv.neu6.edu.cn",
    version = "v1"
module.exports = {
    host,
    channels: `${host}/${version}/channels`,
    details: `${host}/${version}/details`,
    sources: `${host}/${version}/sources`
}