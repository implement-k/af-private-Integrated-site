const addLikeClass = (pId, isLiked) => {
    if (isLiked === 0) {
        r = ''
        $.ajax({
            type: "POST",
            url: '/likeClass/1', //1 => add
            async: false,
            data: {
                'classID': pId
            },
            success : function(result) {
                r = result;
                alert('a')
            },
            error : function(request, status, error) {
                r = error;
                alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
            }
        });
        if (r === 's') {
            $('.star').css("font-variation-settings","'FILL' 1,'wght' 400,'GRAD' -25,'opsz' 24")
        } else if (r === 'f') {
            $('#class_like').css({"width":"150px"}).val('3개 까지만 가능합니다.')
            //3개까지만 추가 가능 맨트
        } else {
            $('#asdf').val(r)
            //오류
        }
    } else {
        r = ''
        $.ajax({
            type: "POST",
            url: '/LikeClass/0', //0 => delete
            async: false,
            data: {
                'classID': pId
            },
            success : function(result) {
                r = result;
                alert('bn')
            },
            error : function(request, status, error) {
                alert("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
            }
        });
        if (r === 's') {
            $('.star').css("font-variation-settings","'FILL' 0,'wght' 400,'GRAD' -25,'opsz' 24")
        } else {
            $('#asdf').val(r)
            //오류
        }
    };
}

const isLiked = (x) => {
    if (x === 1) {
        $('.star').css("font-variation-settings","'FILL' 1,'wght' 400,'GRAD' -25,'opsz' 24")
    };
}
