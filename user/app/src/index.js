import Web3 from "web3";
import music_artifacts from "../../build/contracts/music.json";

const ClientReceipt = web3.eth.contract(music_artifacts.abi);
const clientReceipt = ClientReceipt.at("0x9D634E290f57264B3Cf94A4EA593bdF171239F92");
let acc;
let sign = false;
const App = {
    web3: null,
    account: null,
    meta: null,
    start: async function() {
        const { web3 } = this;

        try {
            // 获得合约事例
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = music_artifacts.networks[networkId];
            this.meta = new web3.eth.Contract(
                music_artifacts.abi,
                deployedNetwork.address
            );

            // 得到账户
            const accounts = await web3.eth.getAccounts();
            this.account = accounts[0];
            const numbers = await web3.eth.getBlockNumber()
            const balance = await web3.eth.getBalance(this.account)
            const Protocol = await web3.eth.getProtocolVersion();
            const Block = await web3.eth.getBlock(numbers,true);
            acc = "账户为："+this.account +'\n'+'\n'+"当前区块号："+numbers+'\n'+'\n'+"当前账户余额："+balance+'\n'+'\n'+"当前协议版本："+Protocol+'\n'+'\n'+"区块哈希："+Block.hash+'\n'+'\n'+"出块的unix时间戳："+Block.timestamp+'\n'+'\n'+"块中所有交易使用的gas总量："+Block.gasUsed+'\n'+'\n'+"区块大小（字节）："+Block.size;
            await this.update_length();
        } catch (error) {
            alert("Could not connect to contract or chain.");
        }
    },
    upload: async function() {
        const song_name = document.getElementById("song_name").value;
        const singer = document.getElementById("singer").value;
        const copyright = document.getElementById("copyright").value;
        const duration = parseInt(document.getElementById("duration").value);
        const receiver = $("#receiver").val();
        const receiver_again = $("#receiver_again").val();
        const song_address=document.getElementById("song_address").value;
        if (receiver!==receiver_again){
            alert("两次输入地址不一致")
            return
        }
        const song_price = parseInt(document.getElementById("song_price").value);
        let vocal;
        const time =new Date();
        let lyric='';
        lyric=document.getElementById("lyric_target").value;
        const file = document.getElementById('file').files[0];
        vocal = URL.createObjectURL(file);
        document.getElementById("audio_id").src = vocal;
        const { addSong } = this.meta.methods;
        await addSong(song_name,singer,lyric,copyright,duration,receiver,song_price,song_address,time.toString()).send({ from: this.account })
        alert("上传信息完毕");
    },
    search_song: async function() {
        sign=true
        const myselect = document.getElementById("choose_select");
        const index=myselect.selectedIndex;
        const choose=myselect.options[index].value
        const info = document.getElementById("search").value;
        const { searchBySinger,searchBySongName,searchByBoth,all_song } = this.meta.methods;
        let i;
        let cmp;
        let temp;
        let price;
        let res;
        let buy_info;
        switch (choose){
            case '1':  //歌曲名查询
                temp='';
                price=0;
                res =await searchBySongName(info).call();
                for (i = 0; i<res.length; i++){
                    cmp=await all_song(res[i]-1).call();
                    buy_info='';
                    if(cmp.sign===true){
                        buy_info="(已停止售卖)";
                    }
                    temp+="编号："+cmp.index+"; 歌名："+cmp.songname+"; 歌手名："+cmp.singer+"; 版权号："+cmp.copyright+"; 歌曲时长："+cmp.duration+"秒; 歌曲价格："+cmp.price+"*1e10 Wei; 上传时间："+cmp.time+buy_info+';\n';
                    price+=parseInt(cmp.price);
                }
                document.getElementById('total_price').value=price+"Wei";
                document.getElementById("search_info").value=temp;
                break
            case '2':    //歌名查询
                temp = '';
                price = 0;
                res =await searchBySinger(info).call();
                for (i = 0; i<res.length; i++){
                    cmp=await all_song(res[i]-1).call();
                    buy_info='';
                    if(cmp.sign===true){
                        buy_info="(已停止售卖)";
                    }
                    temp+="编号："+cmp.index+"; 歌名："+cmp.songname+"; 歌手名："+cmp.singer+"; 版权号："+cmp.copyright+"; 歌曲时长："+cmp.duration+"秒; 歌曲价格："+cmp.price+"1e10 Wei; 上传时间："+cmp.time+buy_info+';\n';
                    price+=parseInt(cmp.price);
                }
                document.getElementById('total_price').value=price+"Wei";
                document.getElementById("search_info").value=temp;
                break
            case '3':   //索引查询
                cmp=await all_song(parseInt(info)-1).call();
                temp='';
                buy_info='';
                if(cmp.sign===true){
                    buy_info="(已停止售卖)";
                }
                temp+="编号："+cmp.index+"; 歌名："+cmp.songname+"; 歌手名："+cmp.singer+"; 版权号："+cmp.copyright+"; 歌曲时长："+cmp.duration+"秒; 歌曲价格："+cmp.price+"1e10 Wei; 上传时间："+cmp.time+buy_info+';\n';
                document.getElementById('total_price').value=cmp.price+"Wei";
                document.getElementById("search_info").value=temp;
                break
            case '4':     //同时歌曲名，歌手名查询
                let abc = info.split(',');
                res = await searchByBoth(abc[1], abc[0]).call();
                cmp=await all_song(res-1).call();
                console.log(cmp);
                temp='';
                buy_info='';
                if(cmp.sign===true){
                    buy_info="(已停止售卖)";
                }
                temp+="编号："+cmp.index+"; 歌名："+cmp.songname+"; 歌手名："+cmp.singer+"; 版权号："+cmp.copyright+"; 歌曲时长："+cmp.duration+"秒; 歌曲价格："+cmp.price+"1e10 Wei; 上传时间："+cmp.time+buy_info+';\n';
                document.getElementById('total_price').value=cmp.price+"Wei";
                document.getElementById("search_info").value=temp;
                break
            default:
                document.getElementById('total_price').value=0+"Wei";
                document.getElementById("search_info").value="输入信息有误";
        }
    },
    close: function(){
        sign=false;
        document.getElementById('total_price').value=0;
        document.getElementById("search_info").value='';
    },
    close_detail: function(){
        sign=false;
        document.getElementById('song_target').value='';
        document.getElementById("lyric_target").value='';
    },
    buy_1:async function() {
        if (sign === true) {
            const time = Date().toString();
            const myselect = document.getElementById("choose_select");
            const index=myselect.selectedIndex;
            const choose=myselect.options[index].value
            const info = document.getElementById("search").value;
            const {
                searchBySinger,
                searchBySongName,
                searchByBoth,
                purchase
            } = this.meta.methods;
            let res;
            let i;switch (choose) {
                case '1':  //歌曲名查询
                    res =await searchBySongName(info).call();
                    for (i = 0; i < res.length; i++) {
                        
                        if(this.buy(res[i])===0){
                            break;
                        }
                        await purchase(res[i], time).send({from: this.account})
                    }
                    alert('购买成功');
                    break
                case '2':    //歌名查询
                    res =await searchBySinger(info).call();
                    for (i = 0; i < res.length; i++) {
                        
                        if(this.buy(res[i])===0){
                            break;
                        }
                        await purchase(res[i], time).send({from: this.account})
                    }
                    alert('购买成功');
                    break
                case '3':   //索引查询
                    
                    if(this.buy(parseInt(info))===0){
                        break;
                    }
                    await purchase(parseInt(info), time).send({from: this.account})
                    alert('购买成功');
                    break
                case '4':     //同时歌曲名，歌手名查询
                    const temp = info.split(',');
                    res = await searchByBoth(temp[1], temp[0]).call();
                    
                    if(this.buy(res)===0){
                        break;
                    }
                    await purchase(res, time).send({from: this.account})
                    alert('购买成功');
                    break
                default:
                    document.getElementById('total_price').value=0;
                    document.getElementById("search_info").value = "输入信息有误";
                }
        }
        else {
            alert('没有歌曲需要购买')
        }
    },
    buy_2:async function(){
            const time = Date().toString();
            const info = document.getElementById("purchase").value;
            const {
                purchase
            } = this.meta.methods;
            let temp=info.split(',');
            for(let i=0;i<temp.length;i++){
                
                if(this.buy(temp[i])===0){
                    break;
                }
                await purchase(parseInt(temp[i]), time).send({from: this.account})
            }
            alert('购买成功');
    },
    buy:async function(i){
        const { all_song,checkBought } = this.meta.methods;
        let cmp=await all_song(i-1).call();
        if(cmp.sign===true){
            alert("编号为"+i+"的歌曲已经停止售卖了")
            return 0
        }
        let res=checkBought(i,this.account).call();
        if(res===true){
            alert("编号为"+i+"的歌曲已经买过了")
            return 0
        }
        var message = { from: this.account, to: cmp[5], value: parseInt(cmp[6])*1e10 };
        web3.eth.sendTransaction(message, (err, res) => {
            if (err) {
                alert("余额不足");
                return;
            } else {
                console.log(res);
            }
        });
    },
    search_bought:async function(){
        let i;
        const { searchBought,all_song } = this.meta.methods;
        let temp = '';
        let res =await searchBought().call();
        for (i = 0; i<res.length; i++){
            let cmp=await all_song(res[i]-1).call();
            temp+="编号："+cmp.index+"; 歌名："+cmp.songname+"; 歌手名："+cmp.singer+"; 版权号："+cmp.copyright+"; 歌曲时长："+cmp.duration+'秒\n';
        }
        if(temp===''){
            temp='该账户没有购买记录'
        }
        document.getElementById("search_target_info").value=temp;
    },
    get_times:async function(){
        let index = $("#trade_times").val();
        index = parseInt(index)
        const { all_song } = this.meta.methods;
        let temp=await all_song(index-1).call();
        document.getElementById("trade_times_info").value ="编号为"+index+"的歌已经被购买了"+temp.times+"次.";
        if(document.getElementById("trade_times_info").value ===''){
          document.getElementById("trade_times_info").value ='输入的编号有误';
        }
    },
    get_benefit:async function(){
        let info=document.getElementById("singer_name").value;
        const { benefit_target } = this.meta.methods;
        let res =await benefit_target(info).call();
        document.getElementById("money_info").value="该歌手已经获益了"+res+"1e10 Wei.";
        if(document.getElementById("money_info").value ===''){
          document.getElementById("money_info").value ='输入的歌手有误';
        }
    },
    get_trade:async function(){
        let index=document.getElementById("trade_index").value;
        const { tradetarget } = this.meta.methods;
        let trade=await tradetarget(parseInt(index)-1).call();
        document.getElementById("trade_target").value="编号为"+trade.song_index+"的歌曲在"+trade.time+"被购买.";
        if(document.getElementById("trade_target").value ===''){
          document.getElementById("trade_target").value ='输入的编号有误';
        }
    },
    get_modify_length:async function(){
      const { getLength } = this.meta.methods;
      const v=await getLength().call();
      document.getElementById("modify_index").value="目前已经有"+v[2]+"条修改记录";
    },
    update_length: async function() {
      const { getLength } = this.meta.methods;
      const v=await getLength().call();
      document.getElementById("song_length_info").value='目前已经有'+v[0]+'首歌';
      document.getElementById("trade_length_info").value='目前已经有'+v[1]+'条交易';
    },
    search_modify:async function(){
        let index=document.getElementById("modify_info").value;
        const { modifytarget } = this.meta.methods;
        let modify=await modifytarget(parseInt(index)-1).call();
        document.getElementById("modify_target").value="编号为"+modify.song_index+"的歌曲在"+modify.time+"被"+modify.choose+"了。";
    },
    delete_song:async function(){
        let index=document.getElementById("delete_index").value;
        const { deleteSong,checkRule } = this.meta.methods;
        if(await checkRule(this.account).call()===false){
          alert("只有管理员才能停止售卖歌曲");
          return;
        }
        let time=new Date();
        await deleteSong(parseInt(index),time.toString()).send({from: this.account});
        alert("停止售卖成功");
    },
    modify_song:async function(){
        const index=document.getElementById("new_index").value;
        const song_name = document.getElementById("new_song_name").value;
        const singer = document.getElementById("new_singer").value;
        const copyright = document.getElementById("new_copyright").value;
        const duration = parseInt(document.getElementById("new_duration").value);
        const new_receiver = $("#new_receiver").val();
        const new_receiver_again = $("#new_again_receiver").val();
        if (new_receiver!==new_receiver_again){
            alert("两次输入密码不一致")
            return
        }
        const song_address=document.getElementById("new_song_address").value;
        const song_price = parseInt(document.getElementById("new_song_price").value);
        let lyric=document.getElementById("lyric_target").value;
        let vocal;
        const times = document.getElementById("new_times").value;
        const time =new Date();
        const file = document.getElementById('new_vocal').files[0];
        vocal = URL.createObjectURL(file);
        document.getElementById("audio_id").src = vocal;
        const { changeSong,checkRule } = this.meta.methods;
        if(await checkRule(this.account).call()===false){
          alert("只有管理员才能修改歌曲信息");
          return;
        }
        await changeSong(song_name,singer,lyric,copyright,duration,new_receiver,song_price,song_address,time.toString(),parseInt(index),parseInt(times)).send({ from: this.account })
        alert("更改信息完毕");
    },
    search_detail:async function(){
        let index=document.getElementById("detail_info").value;
        const {checkRule,checkBought } = this.meta.methods;
        if(await checkRule(this.account).call()===false && await checkBought(parseInt(index),this.account).call()===false){
          alert("只有管理员和已经购买该歌曲的用户才能查看该歌曲的详细信息");
          return;
        }
        console.log("1");
        const { all_song } = this.meta.methods;
        let cmp =await all_song(parseInt(index)-1).call();
        console.log(cmp);
        let buy_info='';
        if(cmp.sign===true){
            buy_info="(已停止售卖)";
        }
        console.log(cmp);
        document.getElementById("song_target").value="编号："+cmp.index+"; 歌名："+cmp.songname+"; 歌手名："+cmp.singer+"; 版权号："+cmp.copyright+"; 歌曲时长："+cmp.duration+"秒; 歌曲价格："+cmp.price+"1e10 Wei; 歌曲收款地址："+cmp[5]+"; 上传时间："+cmp.time+"; 已经被购买了"+cmp.times+"次"+buy_info;
        document.getElementById("lyric_target").value=cmp.lyric;      
    },
    getInfo: function(){
        document.getElementById("account").value=acc;
    },
    closeInfo: function(){
        document.getElementById("account").value='';
    },
    bf:async function(){
      let index=document.getElementById("detail_info").value;       
      const { all_song,checkRule,checkBought } = this.meta.methods;
      
        if(await checkRule(this.account).call()===false && await checkBought(parseInt(index),this.account).call()===false){
          alert("只有管理员和已经购买该歌曲的用户才能播放该歌曲");
          return;
        }
      let cmp =await all_song(parseInt(index)-1).call();
      const audio = document.getElementById("audio_id");
      audio.src =cmp.vocal;
      audio.play();       
  },
};
    window.App = App;

//MetaMask在网页页面中注入了自己的web3实例，所以我们先做一个检查，通常这个检查在页面加载之后进行，检查方法如下：
    window.addEventListener("load", function() {
        if (window.ethereum) {
            // use MetaMask's provider
            App.web3 = new Web3(window.ethereum);
            window.ethereum.enable(); // get permission to access accounts
        } else {
            console.warn(
                "No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live"
            );
            // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
            App.web3 = new Web3(
                new Web3.providers.HttpProvider("http://127.0.0.1:8545")
            );
        }
        App.start();
    });