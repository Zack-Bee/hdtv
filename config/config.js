// 不指定域名时用空字符串(而非 "/"), 否则 ${host}/${apiVersion} 会拼成
// "//v2/..." 这种协议相对 URL, 浏览器把 v2 当主机名导致接口全部 404
const host = ""
const version = "v2"
// v2 API: sources 结构化(quality/canCatchup/thumbnails/timeShift 模板), 其余端点与 v1 语义一致
const apiVersion = "v2"
module.exports = {
    host,
    channels: `${host}/${apiVersion}/channels`,
    details: `${host}/${apiVersion}/details`,
    sources: `${host}/${apiVersion}/sources`,
    version,
    list: `${host}/${apiVersion}/list`,
    search: `${host}/${apiVersion}/search`
}
