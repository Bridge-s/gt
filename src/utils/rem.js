const baseSize = 58
function setRem () {
    // 当前页面宽度相对于375宽的缩放比例
    const scale = document.documentElement.clientWidth / 375
    // 设置根节点字体大小
    document.documentElement.style.fontSize = baseSize * Math.min(scale, 1) + 'px'
    document.documentElement.style.fontFamily="PingFangSC-Medium, PingFang SC"
}
setRem()
console.log('setRem')

window.onresize = function () {
    setRem()
}