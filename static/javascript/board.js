const addLikeClass = (class_id, isLiked) => {
    if (isLiked === '0') {
        r = ''
        $.ajax({
            type: "POST",
            url: '/likeClass/1',    //1 => add
            async: false,
            data: {'classID': class_id},
            success : function(result) {r = result;},
            error : function(request, status, error) {r = error;}
        });
        if (r === 's') {$('#star').css("font-variation-settings","'FILL' 1,'wght' 400,'GRAD' -25,'opsz' 24")} 
        else if (r === 'f') { $('#class_like').css({"width":"150px"}).val('3개 까지만 가능합니다.')}    //3개까지만 추가 가능 맨트
        else {alert(r)}      //오류
    } else {
        r = ''
        $.ajax({
            type: "POST",
            url: '/likeClass/0',    //0 => delete
            async: false,
            data: {'classID': class_id},
            success : function(result) {r = result;},
            error : function(request, status, error) {r = error;}
        });
        if (r === 's') {$('#star').css("font-variation-settings","'FILL' 0,'wght' 400,'GRAD' -25,'opsz' 24")} 
        else {alert(r)}    //오류
    };
};

const isLiked = (x) => {
    if (x === '1') {$('#star').css("font-variation-settings","'FILL' 1,'wght' 400,'GRAD' -25,'opsz' 24")};
};
