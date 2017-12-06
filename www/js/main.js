/*jslint browser: true*/
/*global SecureLS, $, console, steem, jQuery, document, localStorage, window*/
//global balance variable
var balance;
//encrypting localstorage
var ls = new SecureLS({
    encodingType: 'aes'
});

$(document).ready(function () {
    //navigation
    $("#send_button").click(function () {
        $('html,body').animate({ scrollTop: 0 }, 'slow');
        pageTransition(-20);
    });
    $("#header_send").click(function () {
        $('html,body').animate({ scrollTop: 0 }, 'slow');
        pageTransition(-20);
    });
    $("#back").click(function () {
        pageTransition(7);
    });
    $("#transfer_send").click(function () {
        console.log("sending..");
    });
    $("#sign_out").click(function () {
        localStorage.clear();
        ls.clear();
        window.location.href = "login.html";
    });
});
$(".loader").fadeIn("fast");
//check if user is logged in
if (localStorage.getItem('logged_in') !== "1") {
    window.location.href = "login.html";
}
//get user name from local storage
var user = localStorage.getItem("user");
//get account object
steem.api.getAccounts([user], function (err, response) {
    //parse metadata and fill in profile details
    try {
        var metadata = jQuery.parseJSON(response[0].json_metadata),
            pic = metadata.profile.profile_image,
            location = metadata.profile.location;

        $("#location").text(location);
        $("#profile").attr("src", pic);
    } catch (e) {
        console.log("Failed to get metadata");
    }

    balance = response[0].sbd_balance;
    $("#user").text(user);
    $("#balance").text("$" + toFixed(balance, 2));
    //fade out loading page after all is loaded
    $(".loader").fadeOut("slow");
});