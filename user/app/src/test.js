//加密
function encryptText() {
    var plain = document.getElementById("result").value;
    console.log(plain);
    plain2 = plain.replace(/\s/g, '').replace(/(.{2})/g, "$1 ");
    console.log(plain2);
    console.log(plain2.length);
    if (plain.length % 2 == 1) {
        console.log("aaa");
        plain3 = plain2.split("");
        plain3[plain3.length] = "0";
        console.log(plain3);
        plain2 = plain3.join(",");
        plain2 = plain2.replace(/,/g, '');
        console.log(typeof(plain2));
    }
    console.log(plain2);
    console.log("plain: " + plain2);
    var encrypted = encrypt(plain2);
    console.log("encrypted: " + encrypted);
    document.getElementById("encrypted").value = encrypted;
}

function decryptText() {
    var encrypted = document.getElementById("encryptedNumber").value;
    console.log("encrypted: " + encrypted);
    var decrypted = decrypt(encrypted);
    console.log("decrypted: " + decrypted);
    document.getElementById("decrypted").value = decrypted.substr(0, 119);
}

// 加解密用到的密钥
function aesKeyBytes() {
    var key_Int = new Int8Array([65, 144, 48, 53, 18, 52, 86, 120, 131, 116, 124, 139, 237, 203, 169, 135]);
    var keyBytes = int8parse(key_Int);
    return keyBytes;
}

// 十六进制字符串数组，个数如果不足16整数倍则补0
function hexTo16Hex(str) {
    var diff = 16 - (str.length + 1) / 3 % 16;
    for (var i = 0; i < diff; i++) {
        str = str + " 00";
    }
    return str;
}

// AES解密
function decrypt(str) {
    var decArray = hexStrToDecArray(str);
    var wordArray = int8parse(decArray);
    var base64Str = CryptoJS.enc.Base64.stringify(wordArray);
    var decrypted = CryptoJS.AES.decrypt(base64Str, aesKeyBytes(), {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding
    });
    return wordArrayToHexStr(decrypted.words);
}

// AES加密
function encrypt(str) {
    var decArray = hexStrToDecArray(str);
    var wordArray = int8parse(decArray);
    var encrypted = CryptoJS.AES.encrypt(wordArray, aesKeyBytes(), {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding
    });
    return wordArrayToHexStr(encrypted.ciphertext.words);
}

// 构建WordArray对象
function int8parse(u8arr) {
    var len = u8arr.length;
    var words = [];
    for (var i = 0; i < len; i++) {
        words[i >>> 2] |= (u8arr[i] & 0xff) << (24 - (i % 4) * 8);
    }
    return CryptoJS.lib.WordArray.create(words, len);
}

// 十六进制字符串(空格分割)转成十进制数字的数组
function hexStrToDecArray(str) {
    var strArray = str.split(" ");
    var decArray = [];
    for (var i = 0; i < strArray.length; i++) {
        decArray.push(parseInt(strArray[i], 16));
    }
    return arrayTo16Array(decArray);
}

// 十进制数组转成十六进制字符串
function decArrayToHexStr(array) {
    var hexStr = "";
    for (var i = 0; i < array.length; i++) {
        var str = array[i].toString(16).toUpperCase();
        if (str.length < 2) {
            str = "0" + str;
        }
        hexStr = hexStr + str + " ";
    }
    return hexStr.substr(0, hexStr.length - 1);
}

// word类型的十进制数组转成十六进制字符串
function wordArrayToHexStr(array) {
    var hexStr = "";
    for (var i = 0; i < array.length; i++) {
        var num = array[i];
        if (num < 0) {
            num = array[i] + 0x100000000;
        }
        var str = num.toString(16).toUpperCase();
        var fullStr = str;
        if (str.length < 8) {
            for (var j = 0; j < 8 - str.length; j++) {
                fullStr = "0" + fullStr;
            }
        }
        hexStr = hexStr + fullStr;
    }
    var ret = "";
    for (var i = 0; i < hexStr.length; i += 2) {
        ret = ret + hexStr.substr(i, 2) + " "
    }
    return ret.substr(0, ret.length - 1);
}

// 数组元素个数必须是16的整数倍，不足的在后面补0
function arrayTo16Array(array) {
    var len = array.length;
    var distLen = parseInt((array.length - 1) / 16) * 16 + 16;
    for (var i = array.length; i < distLen; i++) {
        array[i] = 0;
    }
    return array;
}