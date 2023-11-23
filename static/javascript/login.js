var is_id_done = false;
var is_password_done = false;
var is_phone_done = false;
var is_num_dub = false;

function paint_login_button(){
    $("#id, #password").on("propertychange change keyup paste input", function(){
        let id = $("#id").val();
        let pw = $("#password").val();
        if (id.length > 1 && pw.length > 1) {
            $("#signin").css({"background-color":"rgb(240, 160, 5)","cursor":"pointer"});
        } else {
            $("#signin").css({"background-color":"rgb(235, 235, 235)","cursor":"auto"});
        };
    });
};

function is_id_dub(){
    let id = $('#id').val();
    if (id.length === 0) {
        $('#id').attr("placeholder","아이디를 입력해주세요.").css("background-color","rgb(224, 173, 173)");
    } else if (!(/[\._0-9a-zA-Z가-힣]/g.test(id))) {
        $('#id').val('').attr("placeholder","한글, 영어, 숫자, 허용된 특수기호(._)만 입력하세요.").css("background-color","rgb(224, 173, 173)");
    } else if (id.length > 20) {
        $('#id').val('').attr("placeholder","20자 이내로 입력해주세요.").css("background-color","rgb(224, 173, 173)");
    } else {
        var dub = 'e';
        $.ajax({
            type: "POST",
            url: '/isDub',
            async: false,
            data: {
                'name':'u_id',
                'value':id
            },
            success : function(result) {
                dub = result;
            },
            error : function(request, status, error) {
                dub = "e";
            }
        });
        if (dub === "1") { //아이디 중복일 경우
            $('#id').val('').attr("placeholder","중복되는 아이디입니다.").css("background-color","rgb(224, 173, 173)")
        } else if (dub === "e") {
            $('#id').val('').attr("placeholder","DB오류").css("background-color","rgb(224, 173, 173)")
        }else { // 정상적인 아이디
            $('#id_dub').attr("disabled",true)
            is_id_done = true;
        };
    }
};

const is_password_able = (target) => {
    let pw = target.value;
    if (!(/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{8,25}$/.test(pw))) {
        $('#signup_pw_info').css("background-color","rgb(224, 173, 173)");
        $('#pw_dub').attr("disabled",true).attr("readonly",false).val('');
    } else {
        $('#signup_pw_info').css("background-color","rgb(180, 225, 170)")
        .text("숫자와 알파벳을 포함하여 8자리 이상으로 설정해주세요.");
        $('#pw_dub').attr("disabled",false).attr("readonly",false).val('');
    };
};

const is_password_same = (target) => {
    let pwd = target.value;
    let pw = $('#password').val();
    if (pwd.length === 0){
        $('#signup_pw_info').text("숫자와 알파벳을 포함하여 8자리 이상으로 설정해주세요.");
        is_password_done = false;
    } else if (pw === pwd) {
        $('#signup_pw_info').css("background-color","rgb(180, 225, 170)").text("비밀번호 동일");
        is_password_done = true;
    } else {
        $('#signup_pw_info').css("background-color","rgb(224, 173, 173)").text("비밀번호가 같지 않습니다.");
        is_password_done = false;
    };
};

const autoHyphen = (target) => {
    target.value = target.value.replace(/[^0-9]/g, '')
    .replace(/^(\d{0,3})(\d{0,4})(\d{0,4})$/g, "$1-$2-$3").replace(/(\-{1,2})$/g, "");
    if (target.value.length === 13 && target.value.indexOf('-') != -1) {
        is_phone_done = true;
    } else {is_phone_done = false;};
};


function paint_id_original(){
    $("#id").on("propertychange change keyup paste input", function(){
        $("#id").css("background-color","rgb(235, 235, 235)").attr("placeholder","");
        $('.response_button.signup_id').attr("disabled",false);
    });
};

function paint_signup_button() {
    $("#id, #password, #pw_dub, #num").on("propertychange change keyup paste input", function(){
        if (is_id_done && is_password_done && is_phone_done) {
            $("#signin").css({"background-color":"rgb(202, 206, 214)","cursor":"pointer"}).attr("disabled", false);
        } else {
            $("#signin").css({"background-color":"rgb(235, 235, 235)","cursor":"auto"});
        };
    });
};

function prevent_signup_enter() {
    window.addEventListener('keydown', function (e) {
        if (e.code === "Enter") {
            if (!(is_id_done && is_password_done && is_phone_done)) {e.preventDefault();};
        };
    });
};

function prevent_signin_enter() {
    window.addEventListener('keydown', function (e) {
        if (e.code === "Enter") {
            if (id.length <= 1 || pw.length <= 1) {e.preventDefault();};
        };
    });
};