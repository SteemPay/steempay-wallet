/*jslint browser: true*/
/*global SecureLS, $, toFixed, steem, balance, console, user, document, localStorage*/

//todo: clean up (this is a mess)
//todo: want to add dynamic balance as user types in amount
//encrypting localstorage
var ls = new SecureLS({
    encodingType: 'aes'
});
$(document).ready(function () {
    //page transition (at the risk of repeating, oops)
    function pageTransition(distance) {
        $("#send_button").animate({
            right: distance + "vw"
        });
        $("#back").fadeToggle("fast");
        $("#transfer_page").slideToggle("slow");
        $("#history_page").fadeToggle("slow");
        $("#send_button").toggle();
    }
    //transfer
    $("#transfer_send").click(function () {
        $("#login_error").hide();
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
                    if ((parseInt(amount, 10) <= parseInt(balance, 10)) && (parseInt(amount, 10) >= 0.001)) {
                        //initiate transfer
                        steem.broadcast.transfer(wif, from, to, amount + " SBD", memo, function (err, result) {
                            console.log(err, result);
                            //clear form and go back to home
                            $("#transfer_to").val("");
                            $("#transfer_amount").val("");
                            $("#transfer_memo").val("");
                            //update balance (unnecessary call, need to just subtract amounts)
                            steem.api.getAccounts([user], function (err, response) {
                                $("#balance").text("$" + toFixed(response[0].sdb_balance, 2));
                                //fade out loader and transition back home
                                $(".loader").fadeOut("slow");
                                pageTransition(7);
                            });
                        });
                    } else {
                        //not enough balance or not sending the minimum amount
                        $("#transfer_error").text(" - insufficient funds or not sending minimum (.001)");
                        $("#transfer_error").show();
                        $(".loader").fadeOut("slow");
                    }
                } else {
                    //user does not exist
                    $("#transfer_error").text(" - user does not exist");
                    $("#transfer_error").show();
                    $(".loader").fadeOut("slow");
                }
            });
        } else {
            //name is invalid format
            $("#transfer_error").text(" - " + isValid.toLowerCase());
            $("#transfer_error").show();
            $(".loader").fadeOut("slow");
        }
    });
});