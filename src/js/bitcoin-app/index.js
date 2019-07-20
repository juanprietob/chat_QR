const BitcoinLib = require("@juanprietob/bitcoin-lib");
const ChatQrLib = require("chat-qr-lib");

const path = require('path');
const Promise = require('bluebird');
const argv = require('minimist')(process.argv.slice(2));
const os = require('os');
const fs = require('fs');


const help = function(){
    console.error("Help: Download tasks from the server.");
    console.error("\nOptional parameters:");
    console.error("--txid  transaction id");
    console.error("--block blockhash");
}

const bitlibconfig = path.join(os.homedir(), '.bitlib.json');
const chatqrlibconfig = path.join(os.homedir(), '.chatqrlib.json');

if(argv["h"] || argv["help"]){
    help();
    process.exit(1);
}

var bitlib = new BitcoinLib();
var chatqrlib = new ChatQrLib();

var agentoptions = {
    rejectUnauthorized: false
}

chatqrlib.setAgentOptions(agentoptions);

if(argv["txid"] !== undefined){
    var transactionid = argv["txid"];

    bitlib.start(bitlibconfig)
    .then(function(){
        return chatqrlib.start(chatqrlibconfig);
    })
    .then(function(){
        return bitlib.getrawtransaction([transactionid, true]);
    })
    .then(function(res){
        if(res && res.result){
            var txout = res.result;
            return chatqrlib.newTransaction(transactionid, txout);
        }else{
            return Promise.reject(res);
        }
    })
}

if(argv["block"] !== undefined){
    var blockhash = argv["block"];
    bitlib.start(bitlibconfig)
    .then(function(){
        return chatqrlib.start(chatqrlibconfig);
    })
    .then(function(){
        return bitlib.getblock([blockhash]);
    })
    .then(function(res){
        if(res && res.result){
            var block = res.result;
            return chatqrlib.newBlock(blockhash, block);
        }else{
            return Promise.reject(res);
        }
    })
}