//global balance variable
var balance;
//encrypting localstorage
var ls = new SecureLS({encodingType: 'aes'});

$(document).ready(function () {
    //function for single-page transition
    function pageTransition(distance) {
        $("#send_button").animate({
            right: distance + "vw"
        });
        $("#back").fadeToggle("fast");
        $("#transfer_page").slideToggle("slow");
        $("#history_page").fadeToggle("slow");
        $("#send_button").toggle();
    }
    //navigation
    $("#send_button").click(function () {
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
//disable back button when logged in to wallet - don't want to go back to login page
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    document.addEventListener("backbutton", function (e) {
        e.preventDefault();
    }, false);
}
//function to drop last decimal of SBD balance without rounding
function toFixed(variable, d) {
    var v = parseFloat(variable);
    return (Math.floor(v * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d);
}
//get user name from local storage
var user = localStorage.getItem("user");
//get account object
steem.api.getAccounts([user], function (err, response) {
    //parse metadata and fill in profile details
    var metadata = jQuery.parseJSON(response[0].json_metadata),
        pic = metadata.profile.profile_image,
        location = metadata.profile.location;
    balance = response[0].sbd_balance;
    $("#user").text(user);
    $("#location").text(location);
    $("#balance").text("$" + toFixed(balance, 2));
    $("#profile").attr("src", pic);
    //fade out loading page after all is loaded
    $(".loader").fadeOut("slow");
});