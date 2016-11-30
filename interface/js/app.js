function message(title, msg, type){
    $("#messages").html('<div class="ui '+type+' big message"><i class="close icon"></i><div class="header">'+title+'</div><p>'+msg+'</p></div>')
}

function populate_accounts(accounts){
    var opts = "";
    for(var i in accounts){
        opts += '<div class="item" data-value="'+accounts[i]+'">'+accounts[i]+'</div>';
    }
    $("#accounts_menu").html(opts);
}

$(function() {

    if (typeof web3 !== 'undefined') {
        web3 = new Web3(web3.currentProvider);
    } else {
        web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }

    if(web3.isConnected()){
        if(web3.eth.accounts.length){
            populate_accounts(web3.eth.accounts);
        } else {
            message("Contas ETH não encontradas", "Crie uma conta ETH e de permissão ao Dapp", "negative")
        }
    } else {
        message("Incapaz de conectar", "Inicie o geth/mist para conectar com o Dapp", "negative")
    }


    $('.ui.dropdown').dropdown();

    $('.message .close').on('click', function() {
        $(this).closest('.message').transition('fade');
    });

});
