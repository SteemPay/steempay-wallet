/*jslint browser: true*/
/*global $, steem, console, localStorage, location, document*/

//get user
var user = localStorage.getItem("user");
//function to create history items from template 
function createHistory(status, id, user, amount) {
    //clone history item from index.html
    var newTX = $("#tx_template").clone();
    //decide if history item is sent or received
    if (status === "received") {
        newTX.attr("id", id).prependTo("#list").find(".tx_users").html("received from @" + user);
        newTX.find(".tx_amount").html("+ $" + amount);
    } else {
        newTX.attr("id", id).prependTo("#list").find(".tx_users").html("sent to @" + user);
        newTX.find(".tx_amount").addClass("sent").html("- $" + amount);
        newTX.find(".tx_icon").addClass("sent").removeClass("received");
        newTX.find(".fa").addClass("fa-minus-circle").removeClass("fa-plus-cirlce");
    }
    //fade in ite after it's created
    newTX.fadeIn("slow");
}

$(document).ready(function () {
    //get account history
    $("#main_status").text("getting history...");
    $.ajax({
        url: "https://api.steemjs.com/get_account_history?account=" + user + "&from=-1&limit=10000",
        success: function (result) {
            // var sliced = result.slice(0, 26);
            //create history from each transfer element in result
            $("#main_status").text("creating history...");
            result.forEach(function (element) {
                if (element[1].op[0] === "transfer") {
                    if (element[1].op[1].to === user) {
                        createHistory("received", element[0], element[1].op[1].from, element[1].op[1].amount.split(" ")[0]);
                    } else {
                        createHistory("sent", element[0], element[1].op[1].to, element[1].op[1].amount.split(" ")[0]);
                    }
                }
            });
            //hide 'no history' notification
            $("#none").hide();
        },
        type: 'GET'
    });
});