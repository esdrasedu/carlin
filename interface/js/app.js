var meetup;
var web3;
var connected_interval;

function message(title, msg, type){
    $("#messages").html('<div class="ui '+type+' big message"><i class="close icon"></i><div class="header">'+title+'</div><p>'+msg+'</p></div>')
}

function populateAccounts(accounts){
    var opts = "";
    for(var i in accounts){
        opts += '<div class="item" data-value="'+accounts[i]+'">'+accounts[i]+'</div>';
    }
    $("#accounts_menu").html(opts);
}

function connected(){
    if(web3.isConnected()){
        if(web3.eth.accounts.length){
            clearInterval(connected_interval);
            $("#messages").html("");
            populateAccounts(web3.eth.accounts);
            getContract(window.location.hash.substring(1));
        } else {
            message("Contas ETH não encontradas", "Crie uma conta ETH e de permissão ao Dapp", "negative")
        }
    } else {
        message("Incapaz de conectar", "Inicie o geth/mist para conectar com o Dapp", "negative")
    }
}

function getContract(address){
    var abiArray = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"participants","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"status","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"cashback","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"participants_length","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"withdraw","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"kill","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"description","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"amount_needed","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"min_participants","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"invitation_value","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"max_participants","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"done","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"join","outputs":[],"payable":true,"type":"function"},{"constant":false,"inputs":[],"name":"leave","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"cancel","outputs":[],"payable":false,"type":"function"},{"inputs":[{"name":"_name","type":"string"},{"name":"_description","type":"string"},{"name":"_amount_needed","type":"uint256"},{"name":"_max_participants","type":"uint256"},{"name":"_min_participants","type":"uint256"}],"payable":false,"type":"constructor"},{"payable":true,"type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"participant","type":"address"}],"name":"Join","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"participant","type":"address"}],"name":"Leave","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"participant","type":"address"}],"name":"Withdraw","type":"event"},{"anonymous":false,"inputs":[],"name":"Done","type":"event"},{"anonymous":false,"inputs":[],"name":"Cancel","type":"event"}];
    var MeetupContract = web3.eth.contract(abiArray);
    meetup = MeetupContract.at(address);
    updateMeetup();
}

function updateMeetup(){
    var bgMeetupAddress = GeoPattern.generate(meetup.address, {color: '#CCC6C6'}).toDataUrl();
    $("#meetupAvatar").css("background-image", bgMeetupAddress);
}

$(function() {

    if (typeof web3 !== 'undefined') {
        web3 = new Web3(web3.currentProvider);
    } else {
        web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }

    $('.ui.dropdown').dropdown();

    $('.message .close').on('click', function() {
        $(this).closest('.message').transition('fade');
    });

    connected_interval = setInterval("connected()", 5000);
    connected();
});
