var meetup;
var web3;
var connected_interval;

function message(title, msg, type){
    $("#messages").html('<div class="ui '+type+' big message"><i class="close icon"></i><div class="header">'+title+'</div><p>'+msg+'</p></div>');
}

function populateAccounts(accounts){
    var opts = "";
    for(var i in accounts){
        opts += '<div class="item" data-value="'+accounts[i]+'">'+accounts[i]+'</div>';
    }
    $("#accounts_menu").html(opts);
    $("#accounts").on("change", function(){
        updateMeetup();
    });
}

function connected(){
    if(web3.isConnected()){
        if(web3.eth.accounts.length){
            clearInterval(connected_interval);
            $("#messages").html("");
            populateAccounts(web3.eth.accounts);
            getContract(window.location.hash.substring(1));
        } else {
            message("Contas ETH não encontradas", "Crie uma conta ETH e de permissão ao Dapp", "negative");
        }
    } else {
        message("Incapaz de conectar", "Inicie o geth/mist para conectar com o Dapp", "negative");
    }
}

function getContract(address){
    var abiArray = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"participants","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"status","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"cashback","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"participants_length","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"withdraw","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"kill","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"description","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"amount_needed","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"min_participants","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"invitation_value","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"max_participants","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"done","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"join","outputs":[],"payable":true,"type":"function"},{"constant":false,"inputs":[],"name":"leave","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"cancel","outputs":[],"payable":false,"type":"function"},{"inputs":[{"name":"_name","type":"string"},{"name":"_description","type":"string"},{"name":"_amount_needed","type":"uint256"},{"name":"_max_participants","type":"uint256"},{"name":"_min_participants","type":"uint256"}],"payable":false,"type":"constructor"},{"payable":true,"type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"participant","type":"address"}],"name":"Join","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"participant","type":"address"}],"name":"Leave","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"participant","type":"address"}],"name":"Withdraw","type":"event"},{"anonymous":false,"inputs":[],"name":"Done","type":"event"},{"anonymous":false,"inputs":[],"name":"Cancel","type":"event"}];
    var MeetupContract = web3.eth.contract(abiArray);
    meetup = MeetupContract.at(address);
    meetup.allEvents(function(){
        console.log("All events", arguments);
        updateMeetup();
    });
    updateMeetup();
}

function updateMeetup(){
    var currentAccount = $("#accounts").val();

    $("#owner").html("Admin: "+meetup.owner());

    if(currentAccount == meetup.owner())
        $("#admin").removeClass("hidde");
    else
        $("#admin").addClass("hidde");

    $("#name_amount_need").html(meetup.name()+" "+ web3.fromWei(meetup.amount_needed(), "ether").toString()+" ETH");

    $("#description").html(meetup.description());

    $("#cashback").html(web3.fromWei(meetup.cashback(), "ether").toString()+" ETH");
    $("#withdraw_value").html(web3.fromWei(meetup.cashback(), "ether").toString()+" ETH");

    $("#balance").html(
        web3.fromWei(web3.eth.getBalance(meetup.address), "ether").toString()+"/"+
        web3.fromWei(meetup.amount_needed(), "ether").toString()+" ETH"
    );

    $("#invitation_value").html(web3.fromWei(meetup.invitation_value(), "ether").toString()+" ETH");

    $("#leave_value").html(web3.fromWei(meetup.balanceOf(currentAccount), "ether").toString()+" ETH");

    if(meetup.status().toNumber() == 0 && !meetup.participants(currentAccount))
        $("#join").removeClass("hidde");
    else
        $("#join").addClass("hidde");

    console.log(meetup.status().toNumber() == 0 && meetup.participants(currentAccount));
    if(meetup.status().toNumber() == 0 && meetup.participants(currentAccount))
        $("#leave").removeClass("hidde");
    else
        $("#leave").addClass("hidde");

    if(meetup.balanceOf(currentAccount).toNumber() > 0 && (meetup.status().toNumber() == 2 || !meetup.participants(currentAccount)))
        $("#withdraw").removeClass("hidde");
    else
        $("#withdraw").addClass("hidde");
}

function callMeetup(action, value, args, callback) {
    var currentAccount = $("#accounts").val();
    var method = meetup[action];
    var data = method.getData.apply(method, args);
    var gas = web3.eth.estimateGas({
        from:currentAccount, to: meetup.address,
        value: value, data: data});
    args.push({from: currentAccount, gas: gas, gasPrice: web3.eth.gasPrice, value: value});
    args.push(callback);
    method.apply(meetup, args);
}

function join(){
    $("#join").addClass("hidde");
    callMeetup("join", meetup.invitation_value(), [], function(error, success){
        if(error)
            message("Erro", "Não foi possivel entrar no evento", "warning");
        else
            message("Sucesso", "Foi possivel cadastrar-se no evento", "positive");

    });
}

function leave(){
    $("#leave").addClass("hidde");
    callMeetup("leave", 0, [], function(error, success){
        if(error)
            message("Erro", "Não foi possivel cancelar sua particação", "warning");
        else
            message("Sucesso", "Seu cancelamento foi efetuado com sucesso", "positive");
    });

}

function withdraw(){
    $("#withdraw").addClass("hidde");
    callMeetup("withdraw", 0, [], function(error, success){
        if(error)
            message("Erro", "Não foi possivel sacar seu reembolso", "warning");
        else
            message("Sucesso", "O reembolso foi sacado com sucesso", "positive");
    });
}

function done(){
    callMeetup("done", 0, [], function(error, success){
        if(error)
            message("Erro", "Não foi possivel aprovar o evento", "warning");
        else
            message("Sucesso", "O evento foi aprovado", "positive");
    });
}

function cancel(){
    callMeetup("cancel", 0, [], function(error, success){
        if(error)
            message("Erro", "Não foi possivel cancelar o evento", "warning");
        else
            message("Sucesso", "O evento foi cancelado", "positive");
    });
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

    $("#join").on("click", join);
    $("#leave").on("click", leave);
    $("#withdraw").on("click", withdraw);

    $("#done").on("click", done);
    $("#cancel").on("click", cancel);

    connected_interval = setInterval("connected()", 5000);
    connected();
});
