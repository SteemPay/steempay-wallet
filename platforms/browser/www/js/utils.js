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
//convert current vw to px
function vw(value) {
    var w = window,
      d = document,
      e = d.documentElement,
      g = d.getElementsByTagName('body')[0],
      x = w.innerWidth || e.clientWidth || g.clientWidth,
      y = w.innerHeight|| e.clientHeight|| g.clientHeight;

    var result = (x*value)/100;
    return result;
}
//change header on scroll to show balance
$(window).scroll(function() {
    if ($(this).scrollTop() > vw(21)){
        $("#header-title").hide();
        $("#header_balance").text("$" + toFixed(parseFloat(balance), 2));
        $("#sign_out").fadeOut(500);
        $("#header_balance").fadeIn("slow");
    } else {
        $("#header_balance").hide();
        $("#header-title").fadeIn("slow");
        //$("#header-title").html("steempay");
        $("#sign_out").fadeIn("slow");
    }
});