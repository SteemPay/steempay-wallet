/*jslint browser: true*/
/*global SecureLS, $, toFixed, steem, balance, console, user, document, localStorage*/

//todo: clean up (this is a mess)
//todo: want to add dynamic balance as user types in amount
//encrypting localstorage
var ls = new SecureLS({
    encodingType: 'aes'
});
$(document).ready(function () {
    //transfer
    $("#transfer_send").click(function () {
        $("#transfer_error").hide();
        $("#main_status").text("sending...");
        //fade in loader screen
        $(".loader").fadeIn("fast");
        //get info from transfer form and local storage
        var to = $("#transfer_to").val().toLowerCase(),
            amount = toFixed($("#transfer_amount").val(), 3),
            memo = $("#transfer_memo").val(),
            wif = ls.get("key"),
            from = localStorage.getItem("user"),
            //api call to check if valid
            isValid = steem.utils.validateAccountName(to);
        //check if name is valid format, else show error
        if (isValid === null) {
            //hide error if showing
            $("#transfer_error").hide();
            //check if user exists, else show error
            steem.api.lookupAccountNames([to], function (err, result) {
                if (result[0] !== null) {
                    //check that balance is enough
                    if ((parseFloat(amount, 10) <= parseFloat(balance, 10)) && (parseFloat(amount, 10) >= 0.001)) {
                        //initiate transfer
                        steem.broadcast.transfer(wif, from, to, amount + " SBD", memo, function (err, result) {
                            console.log(err, result);
                            //clear form and go back to home
                            $("#transfer_to").val("");
                            $("#transfer_amount").val("");
                            $("#transfer_memo").val("");
                            //update balance (unnecessary call, need to just subtract amounts)
                            steem.api.getAccounts([user], function (err, response) {
                                console.log(response);
                                $("#balance").text("$" + toFixed(response[0].sbd_balance, 2));
                                //fade out loader and transition back home
                                $(".loader").fadeOut("slow");
                                //create new history item showing sent tx
                                createHistory("sent", response.ref_block_num, to, amount);
                                //transition back home
                                pageTransition(7);
                            });
                        });
                    } else {
                        //not enough balance or not sending the minimum amount
                        error("transfer_error", "insufficient funds or not sending minimum (.001)");
                    }
                } else {
                    //user does not exist
                    error("transfer_error", "user does not exist");
                }
            });
        } else {
            //name is invalid format
            error("transfer_error", isValid.toLowerCase());
        }
    });
});