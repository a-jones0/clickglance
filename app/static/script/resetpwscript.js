    /* ------------------------------- RESET PASSWORD FORM FUNCTIONALITY ------------------------------- */

    // Add functionality to the "Reset password" button on the "reset password" form
    document.getElementById("reset-pw-btn").onclick = function(){
        let new_password = document.getElementById("resetpw-input").value.trim(); // strip leading and trailing whitespace
        let confirm_password = document.getElementById("confirmpw-input").value.trim();

        if (new_password != confirm_password) {
            document.getElementById("resetpw-error-message").style.display = "block";
        }
        else {
            document.getElementById("resetpw-input").value = new_password;
            document.getElementById("confirmpw-input").value = confirm_password;
            document.getElementById("reset-pw-form").submit();
        }
    };
    