import * as constractsObject from './contract'
import BigNumber from 'bignumber.js'
import { notification } from 'antd'

export class App {
    constructor (defaultAccount, web3, version) {
        this.defaultAccount = defaultAccount
        this.web3 = web3
        this.version = version
    }
    /**
     * 判断是否有盲盒授权
     * @returns {Promise} res
     */
    async allowance (constractAddress = constractsObject.Templar.address) {
        const constractMethods = new this.web3.eth.Contract(
            constractsObject.Dge20.abi,
            constractsObject.Dge20.address
        )
        return await constractMethods.methods
            .allowance(this.defaultAccount, constractAddress)
            .call({
                from: this.defaultAccount
            })
    }
    /**
     * 余额
     * @returns {Promise} res
     */
    balanceOf () {
        const constractMethods = new this.web3.eth.Contract(
            constractsObject.Dge20.abi,
            constractsObject.Dge20.address
        )
        return constractMethods.methods
            .balanceOf(this.defaultAccount)
            .call({
                from: this.defaultAccount
            })
    }
    /**
     * 盲盒授权方法（恐龙盲盒、彩票盲盒）
     * @returns {Promise} res
     */
    approve (constractAddress = constractsObject.Templar.address) {
        const constractMethods = new this.web3.eth.Contract(
            constractsObject.Dge20.abi,
            constractsObject.Dge20.address
        )
        return constractMethods.methods
            .approve(constractAddress, '115792089237316195423570985008687907853269984665640564039457584007913129639935')
            .send({
                from: this.defaultAccount
            })
    }
    /**
     * 购买恐龙盲盒
     * @param {number} nftAmount 购买的恐龙盲盒数量
     * @param {number} supplyId 恐龙盲盒的种类数量，暂定为1
     * @returns {Promise} res
     */
    async multMint (nftAmount = 1, supplyId = 1) {
        console.log(arguments)
        const constractMethods = new this.web3.eth.Contract(
            constractsObject.Templar.abi,
            constractsObject.Templar.address
        )
        let obj = {}
        if (Number(supplyId) === 2) {
            let res = await this.getSupplyInfo(2)
            obj = { value: new BigNumber(res.fee).multipliedBy(nftAmount).toFixed(0) }
        }
        console.log(`{
            from: this.defaultAccount,
            ...obj
        }`,{
            from: this.defaultAccount,
            ...obj
        })
        return constractMethods.methods
            .multMint(nftAmount, supplyId)
            .send({
                from: this.defaultAccount,
                ...obj
            })
    }
    /**
     * 查询恐龙盲盒信息
     * @param {number} id --恐龙盲盒id
     * @returns {Promise<{}>} {
     *  fee  //购买所需价格，结果需/1e18;
        total  //盲盒总数量;
        left   //盲盒剩余数量;
        token  //盲盒token地址;
        levelCode  //恐龙等级数组;
        levelOffSet  //抽奖概率}
     *  
     */
    getSupplyInfo (id) {
        const constractMethods = new this.web3.eth.Contract(
            constractsObject.Templar.abi,
            constractsObject.Templar.address
        )
        return constractMethods.methods
            .getSupplyInfo(id)
            .call({
                from: this.defaultAccount
            })
    }
    /**
     * 打开彩票盲盒
     * @param {number} nftAmount 购买的彩票盲盒数量
     * @returns {Promise} Promise
     */
    openLottery (nftAmount) {
        const constractMethods = new this.web3.eth.Contract(
            constractsObject.Templar.abi,
            constractsObject.Templar.address
        )
        return this.multMint(nftAmount, 1)
    }
    /**
     * 查询彩票盲盒价格
     * @returns 彩票盲盒信息
     */
    lotteryAmount (id = 1) {
        const constractMethods = new this.web3.eth.Contract(
            constractsObject.Templar.abi,
            constractsObject.Templar.address
        )
        return constractMethods.methods
            .getSupplyInfo(id)
            .call({
                from: this.defaultAccount
            })
    }
    /**
     * 我的背包查询全部盲盒信息
     * @returns 我的背包信息 ，此方法会获取一个数组，数组存储的是tokenid，需要调用openAble方法来判断该卡牌是否已经打开过
     */
    getTokens () {
        const constractMethods = new this.web3.eth.Contract(
            constractsObject.Dge721.abi,
            constractsObject.Dge721.address
        )
        return constractMethods.methods
            .getTokens(this.defaultAccount)
            .call({
                from: this.defaultAccount
            })
    }
    /**
     * 用来判断卡牌是否已经开启
     * @param {number} tokenId 唯一标识 
     * @returns 
     */
    openAble (tokenId) {
        const constractMethods = new this.web3.eth.Contract(
            constractsObject.Templar.abi,
            constractsObject.Templar.address
        )
        return constractMethods.methods
            .openAble(tokenId)
            .call({
                from: this.defaultAccount
            })
    }
    /**
     * 打开恐龙盲盒方法
     * @param {number} tokenId 卡牌唯一标识
     * @returns 
     */
    open (tokenId) {
        const constractMethods = new this.web3.eth.Contract(
            constractsObject.Templar.abi,
            constractsObject.Templar.address
        )
        return constractMethods.methods
            .open(tokenId)
            .send({
                from: this.defaultAccount
            })
    }
    /**
     * 查询是否授权我的背包合约
     */
    isApprovedForAll () {
        const constractMethods = new this.web3.eth.Contract(
            constractsObject.Dge721.abi,
            constractsObject.Dge721.address
        )
        return constractMethods.methods
            .isApprovedForAll(this.defaultAccount, constractsObject.Order.address)
            .call({
                from: this.defaultAccount
            })
    }
    /**
     * 授权我的背包合约
     * @returns 
     */
    setApprovalForAll () {
        const constractMethods = new this.web3.eth.Contract(
            constractsObject.Dge721.abi,
            constractsObject.Dge721.address
        )
        return constractMethods.methods
            .setApprovalForAll(constractsObject.Order.address, true)
            .send({
                from: this.defaultAccount
            })
    }
    /**
     * 获取卡牌信息
     * @param {number} tokenId 恐龙卡牌唯一标识
     * @returns {Promise<{
                fightAt:'最后一次战斗时间', //最后一次战斗时间
                energy:'剩余体力值 （max体力值为120）'   //剩余体力值 （max体力值为120）
                todayUsed:'已使用生命值 （max生命值为12，若当天已使用12点生命值，则当天不可继续作战）'  //已使用生命值 （max生命值为12，若当天已使用12点生命值，则当天不可继续作战）
                winCount:'胜利次数'   //胜利次数
                dgeeCount:'失败次数'  //失败次数
                levelCode:'卡牌等级'   //卡牌等级
            }>} 
     */
    getTokenInfo (tokenId) {
        const constractMethods = new this.web3.eth.Contract(
            constractsObject.Templar.abi,
            constractsObject.Templar.address
        )
        return constractMethods.methods
            .getTokenInfo(tokenId)
            .call({
                from: this.defaultAccount
            })
    }
    /**
     * 查询恐龙卡牌属性
     * @param {number} levelCode 传参为1-6，表示6个等级的卡牌
     * @returns {Promise<{
     winRateAdd:'PVE胜率加成', //PVE胜率加成
     rewardAdd:'PVE奖励加成'   //PVE奖励加成
     recoveryFee:'恢复1点体力值所需费用（需/1e18）'   //恢复1点体力值所需费用（需/1e18）
     reMintFee:'重铸所需费用'    //重铸所需费用
     reMintCount:'重铸次数'  //重铸次数
     * }>
     * }
     */
    levelInfo (levelCode) {
        const constractMethods = new this.web3.eth.Contract(
            constractsObject.Templar.abi,
            constractsObject.Templar.address
        )
        return constractMethods.methods
            .levelInfo(levelCode)
            .call({
                from: this.defaultAccount
            })
    }
    /**
     * 购买体力值
     * @param {number} tokenId 恐龙卡牌标识
     * @param {number} energy 购买数量，最大体力值120
     * @returns 
     */
    recovery (tokenId, energy) {
        const constractMethods = new this.web3.eth.Contract(
            constractsObject.Templar.abi,
            constractsObject.Templar.address
        )
        return constractMethods.methods
            .recovery(tokenId, energy)
            .send({
                from: this.defaultAccount
            })
    }/**
         * 查询可用的卡牌
         * @returns 结果返回available为可用的，marketplace为出售中
         */
    myInventory () {
        const constractMethods = new this.web3.eth.Contract(
            constractsObject.Order.abi,
            constractsObject.Order.address
        )
        return constractMethods.methods
            .myInventory(this.defaultAccount)
            .call({ from: this.defaultAccount })
    }
    /**
     * 出售卡牌 --出售之前先把体力值补充完全。
     * @param {number} tokenId 卡牌唯一标识
     * @param {number} price 出售价格
     * @returns 
     */
    placeOrder (tokenId, price) {
        let pricetoBN = new BigNumber(price)
        price = pricetoBN.multipliedBy(1e18).toFixed()
        console.log(price)
        const constractMethods = new this.web3.eth.Contract(
            constractsObject.Order.abi,
            constractsObject.Order.address
        )
        return constractMethods.methods
            .placeOrder(tokenId, price)
            .send({ from: this.defaultAccount })
    }
    /**
     * 取消出售
     * @param {*} tokenId 卡牌唯一标识
     * @returns {Promise} 返回结果
     */
    cancelOrder (tokenId) {
        const constractMethods = new this.web3.eth.Contract(
            constractsObject.Order.abi,
            constractsObject.Order.address
        )
        return constractMethods.methods
            .cancelOrder(tokenId)
            .send({ from: this.defaultAccount })
    }
    /***
     * 交易市场 全部
     */
    allMarketplace () {
        const constractMethods = new this.web3.eth.Contract(
            constractsObject.Order.abi,
            constractsObject.Order.address
        )
        return constractMethods.methods
            .allMarketplace()
            .call({ from: this.defaultAccount })
    }
    /**
     * 卡牌买卖金额
     * @param {number}} tokenId 卡牌唯一标识
     * @returns {Array<number>} 结果返回一个数组，取第一个数据,需 /1e18
     */
    orderSale (tokenId) {
        const constractMethods = new this.web3.eth.Contract(
            constractsObject.Order.abi,
            constractsObject.Order.address
        )
        return constractMethods.methods
            .orderSale(tokenId)
            .call({ from: this.defaultAccount })
    }
    /**
     * 购买卡牌
     * @param {number} tokenId 
     * @returns 
     */
    fillOrder (tokenId, price) {
        let pricetoBN = new BigNumber(price)
        price = pricetoBN.multipliedBy(1e18).toFixed()
        console.log(price)
        const constractMethods = new this.web3.eth.Contract(
            constractsObject.Order.abi,
            constractsObject.Order.address
        )
        return constractMethods.methods
            .fillOrder(tokenId, price)
            .send({ from: this.defaultAccount })
    }
    /**
     * 孵化池孵化战斗
     * @param {*} tokenId 卡牌唯一标识
     * @param {*} mission boss的序号
     * @param {*} times 战斗次数
     */
    multFight (tokenId, mission, times = 1) {
        const constractMethods = new this.web3.eth.Contract(
            constractsObject.Templar.abi,
            constractsObject.Templar.address
        )
        console.log(constractMethods.methods)
        return constractMethods.methods
            .multiFight(tokenId, mission, times)
            .send({
                from: this.defaultAccount
            })
    }
    /**
     * 邀请好友，绑定父级账号
     * @description 获取邀请链接需要满足开恐龙盲盒的次数大于5，需要判断开盲盒的次数是否大于5 抵用accountInfo（userAddress）获取返回结果中的mintCount开盲盒次数
     * @param {*} parent 绑定目标父级的地址
     * @returns 
     */
    bind (parent) {
        const constractMethods = new this.web3.eth.Contract(
            constractsObject.Templar.abi,
            constractsObject.Templar.address
        )
        return constractMethods.methods
            .bind(parent)
            .send({
                from: this.defaultAccount
            })
    }
    /**
     * 查询用户信息
     * @param {string} userAddress 查询用户的钱包地址
     * @returns {
     claimAt  //最后一次提取时间 （下次提取必须是24小时后）
     totalClaim  //已提取金额
     dgeReward  //邀请所获得的奖励
     Inviter     //上级地址
     reward   //待提取金额
    }
     */
    accountInfo (userAddress = this.defaultAccount) {
        const constractMethods = new this.web3.eth.Contract(
            constractsObject.Templar.abi,
            constractsObject.Templar.address
        )
        return constractMethods.methods
            .accountInfo(userAddress)
            .call({
                from: this.defaultAccount
            })
    }
    /**
     * 查询用户下级
     * @param {string} userAddress 用户地址
     * @returns 取结果中的invitees
     */
    getAccountInfo (userAddress = this.defaultAccount) {
        const constractMethods = new this.web3.eth.Contract(
            constractsObject.Templar.abi,
            constractsObject.Templar.address
        )
        return constractMethods.methods
            .getAccountInfo(userAddress)
            .call({
                from: this.defaultAccount
            })
    }
    /**
     * 提取奖励
     * @returns 
     */
    claim () {
        const constractMethods = new this.web3.eth.Contract(
            constractsObject.Templar.abi,
            constractsObject.Templar.address
        )
        return constractMethods.methods
            .claim()
            .send({
                from: this.defaultAccount
            })
    }
    /**复制地址 */
    copyAddress (url) {
        let input = document.querySelector("#copyinput")
        input.setAttribute("value", url)
        input.select()
        document.execCommand("copy")
        notification.success({
            message: 'copied!'
        })
    }
}