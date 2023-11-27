const addLikeClass = (pId) => {
    r = ''
    $.ajax({
        type: "POST",
        url: '/addLikeClass',
        async: false,
        data: {
            'classID': pId
        },
        success : function(result) {
            r = result;
        },
        error : function(request, status, error) {
            r = 'e'
        }
    });
    if (r === 't') {
        $('#like').css("background-color","rgb(255,255,255)")
    } else if (r === 'f') {
        //3개까지만 추가 가능 맨트
    } else {
        //오류
    }
}