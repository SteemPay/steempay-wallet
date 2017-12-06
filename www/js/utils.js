/*jslint browser: true*/
/*global $*/

//error handling function
function error(id, text) {
    $("#" + id).text(" - " + text);
    $("#" + id).show();
    $(".loader").fadeOut("slow");
}
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
//function to drop last decimal of SBD balance without rounding
function toFixed(variable, d) {
    "use strict";
    var v = parseFloat(variable);
    return (Math.floor(v * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d);
}