const paint_login_button = () => {
    $("#id, #password").on("propertychange change keyup paste input", function(){
        let id = $("#id").val();
        let pw = $("#password").val();
        if (id.length > 1 && pw.length > 1) {
            $("#signin").css({"background-color":"rgb(240, 160, 5)","cursor":"pointer"}).attr("disabled", false);
        } else {
            $("#signin").css({"background-color":"rgb(235, 235, 235)","cursor":"auto"}).attr("disabled", true);
        };
    });
};

const prevent_signin_enter = () => {
    window.addEventListener('keydown', function (e) {
        if (e.code === "Enter") {
            if (id.length <= 1 || pw.length <= 1) {e.preventDefault();};
        };
    });
};