//SPDX-License-Identifier: SimPL-2.0
pragma solidity >0.8.0;
//pragma experimental ABIEncoderV2;


contract music{
    struct Song{
        string songname;    //歌曲名
        string singer;  //演唱者
        string lyric;  //歌词
        string copyright;  //版权号
        uint duration;  //歌曲时长
        address receiver;   //收款地址  balance   transfer(uint)  send(uint)  0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db
        uint price;   //价格
        string  vocal;   //存音频的二进制文本
        string time;    //上块时间
        uint index;     //存在数组的索引
        uint times;     //被购买几次
        bool sign;      //判断有无被删除
    }

    struct TradeTarget{     //订单记录
        string time;
        address buyer;
        uint song_index;
        uint index;
    }
  
    struct ModifyTarget{     //管理员修改记录
        string time;
        string choose;
        uint song_index;
        uint index;
    }

    mapping(string=>uint) public benefit_target;
    mapping(address=>mapping(uint=>bool)) public purchase_target;
    uint upload_index=0;
    uint trade_index=0;
    uint modify_index=0;
    address public owner;

    constructor() {
        owner = msg.sender;        
    }

    Song[] public all_song;
    TradeTarget[] public tradetarget;   //总订单记录
    ModifyTarget[] public modifytarget;   //总修改记录
    uint[] resultbysongname;  //
    uint[] resultbysingername;
    uint[] resultbybought;
    string[] totalcopyright;

    function checkcopyright(string memory _copyright) public view returns(bool){
        for(uint i=0;i<totalcopyright.length;i++){
            if(compareStr(totalcopyright[i],_copyright)){
                return true;
            }
        }
        return false;
    }

    function getLength() public view returns(uint,uint,uint){
        return (upload_index,trade_index,modify_index);
    }

    function addSong(string memory _songname,
        string memory _singer,  //加入歌曲版权
        string memory _lyric,
        string memory _copyright,
        uint _duration,
        address _receiver,
        uint _price,
        string memory _vocal,
        string memory _time
        ) 
        public {    //更新歌曲列表
        require(checkcopyright(_copyright)==false,"this copyright have existed");
        upload_index += 1;
        Song memory _newsong=Song(_songname,_singer,_lyric,_copyright,_duration,_receiver,_price,_vocal,_time,upload_index,0,false);      
        totalcopyright.push(_copyright);
        all_song.push(_newsong);
    }

    function deleteSong(uint _index,string memory _time) public{
        _index-=1;
        require(msg.sender == owner,"Only can admin delete");
        require(0<=_index && _index<upload_index,"index is slop over");
        require(all_song[_index].sign==false,"this song has deleted");
        all_song[_index].sign=true;
        modify_index+=1;
        ModifyTarget memory temp=ModifyTarget(_time,"delete",_index,modify_index);
        modifytarget.push(temp);
    }

    function changeSong(string memory _songname,
        string memory _singer,  //加入歌曲版权
        string memory _lyric,
        string memory _copyright,
        uint _duration,
        address  _receiver,
        uint _price,
        string memory _vocal,
        string memory _time,
        uint _index,
        uint _times)
        public {
            _index-=1;
            require(msg.sender == owner,"Only can admin delete");
            require(0<=_index && _index<upload_index,"index is slop over");
            all_song[_index].songname = _songname;
            all_song[_index].singer = _singer;
            all_song[_index].lyric = _lyric;
            all_song[_index].copyright = _copyright;
            all_song[_index].duration = _duration;
            all_song[_index].receiver = _receiver;
            all_song[_index].price = _price;
            all_song[_index].vocal = _vocal;
            all_song[_index].time=_time;
            all_song[_index].times = _times;
            modify_index+=1;
            ModifyTarget memory temp=ModifyTarget(_time,"change",_index,modify_index);
            modifytarget.push(temp);
        }

    function searchBySinger(string memory _singer) public returns(uint[] memory) {     
        for(uint i=0;i<all_song.length;i++){
            Song memory song=all_song[i];
            if(compareStr(song.singer,_singer) ){
                resultbysingername.push(i+1);
            }
        }
        return resultbysingername;
    }

    function searchBought() public returns(uint[] memory){
        for(uint i=0;i<all_song.length;i++){
            if(purchase_target[msg.sender][i]==true){
                resultbybought.push(i+1);
            }
        }
        return resultbybought;
    }

    function searchBySongName(string memory _songname) public returns(uint[] memory){
        for(uint i=0;i<all_song.length;i++){
            Song memory song=all_song[i];
            if(compareStr(song.songname,_songname)){
                resultbysongname.push(i+1);
            }
        }
        return resultbysongname;
    }

    function searchByBoth(string memory _singer,string memory _songname) public view returns(uint){
        for(uint i=0;i<all_song.length;i++){
            Song memory song=all_song[i];
            if(compareStr(song.songname,_songname) && compareStr(song.singer,_singer)){
                return i+1;
            }
        }
        return 0;
    }

    function purchase(uint _index,string memory _time) public {      
        _index-=1;
        require(0<=_index && _index<upload_index,"index is slop over");
        require(all_song[_index].sign==false,"The song has been discontinued");
        require(purchase_target[msg.sender][_index]==false,"this song has bought");
        all_song[_index].times += 1;
        trade_index += 1;
        TradeTarget memory temp = TradeTarget(_time,msg.sender,_index,trade_index);
        tradetarget.push(temp);
        benefit_target[all_song[_index].singer]+=all_song[_index].price;
        purchase_target[msg.sender][_index]=true;
    } 

    function compareStr (string memory _str1, string memory _str2) public pure returns(bool) {
        if(bytes(_str1).length == bytes(_str2).length){
            if(keccak256(abi.encodePacked(_str1)) == keccak256(abi.encodePacked(_str2))) {
                return true;
            }
        }
        return false;
    }
    
    function checkRule(address _rule) public view returns(bool){
        if(_rule == owner){
            return true;
        }
        return false;
    }

    function checkBought(uint _index,address _account) public view returns(bool){
        return purchase_target[_account][_index-1];
    }
}