//todo: clean up (this is a mess)
//todo: want to add dynamic balance as user types in amount
//encrypting localstorage
var ls = new SecureLS({encodingType: 'aes'});
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
        var to = $("#transfer_to").val().toLowerCase();
        var amount = toFixed($("#transfer_amount").val(), 3);
        var memo = $("#transfer_memo").val();
        var wif = ls.get("key");
        var from = localStorage.getItem("user");
        //api call to check if valid
        var isValid = steem.utils.validateAccountName(to);
        
        //check if name is valid format, else show error
        if (isValid == null) {
            //hide error if showing
            $("#transfer_error").hide();

            //check if user exists, else show error
            steem.api.lookupAccountNames([to], function (err, result) {
                if (result[0] != null) {
                    //check that balance is enough
                    if ((amount <= balance) && (amount >= .001)) {
                        //initiate transfer
                        console.log(amount + " SBD");
                        steem.broadcast.transfer(wif, from, to, amount + " SBD", memo, function(err, result) {
                            console.log(err, result);
                            //clear form and go back to home
                            $("#transfer_to").val("");
                            $("#transfer_amount").val("");
                            $("#transfer_memo").val("");
                            //update balance and todo: tx history
                            steem.api.getAccounts([user], function (err, response) {
                                balance = response[0].sbd_balance;
                                $("#balance").text("$" + toFixed(balance, 2));
                                //fade out loader and transition back home
                                $(".loader").fadeOut("slow");
                                pageTransition(7);
                            });
                        });
                    }
                    //not enough balance or not sending the minimum amount
                    else {
                        $("#transfer_error").text(" - insufficient funds or not sending minimum (.001)");
                        $("#transfer_error").show();
                        $(".loader").fadeOut("slow");
                    }
                }
                //user does not exist
                else {
                    $("#transfer_error").text(" - user does not exist");
                    $("#transfer_error").show();
                    $(".loader").fadeOut("slow");
                }
            });
        }
        //name is invalid format
        else {
            $("#transfer_error").text(" - " + isValid.toLowerCase());
            $("#transfer_error").show();
            $(".loader").fadeOut("slow");
        }
    });
});