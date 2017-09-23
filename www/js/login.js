$(document).ready(function () {
    $(".loader").fadeOut("fast");
    $("#login_button").on("click", function () {
        $(".loader").fadeIn("fast");
        //hide error if it is showing
        $("#login_error").hide();
        //get username and password from login form
        var account = $("#login_username").val().toLowerCase();
        var password = $("#login_password").val();
        //get account user object
        steem.api.getAccounts([account], function (err, response) {
            try {
                //get active pubkey to check against key that is generated below
                var activePubVerify = response[0].active.key_auths[0][0];
                //generate active keys from account username/password
                var keys = steem.auth.getPrivateKeys(account, password, ["active", "memo"]);
                var activePub = keys.activePubkey;
                var activePriv = keys.active;
                var memo = keys.memo;
                console.log(memo);
                //check if generated key is the same as known key for account
                if (activePub == activePubVerify) {
                    //keys match - correct username/password combo
                    console.log("correct username/password");
                    //save active priv key and username into local storage
                    localStorage.setItem("key", activePriv);
                    localStorage.setItem("memo", memo);
                    localStorage.setItem("user", account);
                    localStorage.setItem("logged_in", "1");
                    //send user to wallet
                    window.location.href = "index.html";
                }
                else {
                    //keys do not match - incorrect username/password combo
                    console.log("password does not match account");
                    $("#login_error").text(" - password does not match this user");
                    $("#login_error").show();
                }
            }
            catch (err) {
                //user does not exist
                $("#login_error").text(" - this username does not exist");
                $("#login_error").show();
            }
            $(".loader").fadeOut("slow");
        });
    });
});