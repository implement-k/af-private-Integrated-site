const isFriend = (user_id) => {
    $.ajax({
        type: "POST",
        url: '/manageFriend/0&'+user_id,                 //mode 0:친구인지 확인
        success : function(result) {
            if (result === 'friend') {
                $('#friend_btn').css("background-color","rgb(202, 206, 214)").text('친구').attr("onclick","removeFriend('"+user_id+"')")
            } else if (result === 'request') {
                $('#friend_btn').css("background-color","rgb(235, 235, 235)").text('요청중..').attr("onclick","removeFriend('"+user_id+"')")
            } else if (result === 's') {
                $('#friend_btn').css("background-color","rgb(235, 235, 235)").text('친구추가').attr("onclick","addFriend('"+user_id+"')")
            } else if (result === 'f') {
                $('#friend_btn').css("background-color","rgb(224, 173, 173)").text('다시시도').attr("disabled",true)
            } else if (result != 's') {
                $('#friend_btn').css("background-color","rgb(224, 173, 173)").text('오류').attr("disabled",true)
            };
        },
        error : function(request, status, error) {alert('error')}
    });
    
}

const addFriend = (user_id) => {
    $.ajax({
        type: "POST",
        url: '/manageFriend/1&'+user_id,                 //mode 1:친구추가
        success : function(result) {
            if (result === 's') {
                location.reload();
            } else if (result === 'f') {
                $('#friend_btn').css("background-color","rgb(224, 173, 173)").text('새로고침').attr("disabled",true)
            } else {
                $('#friend_btn').css("background-color","rgb(224, 173, 173)").text('오류').attr("disabled",true)
            }
        },
        error : function(request, status, error) {alert('error')}
    });
}

const removeFriend = (user_id) => {
    $.ajax({
        type: "POST",
        url: '/manageFriend/2&'+user_id,                 //mode 2:친구삭제
        success : function(result) {
            if (result === 's') {
                location.reload();
            } else if (result === 'f') {
                $('#friend_btn').css("background-color","rgb(224, 173, 173)").text('새로고침').attr("disabled",true)
            } else {
                $('#friend_btn').css("background-color","rgb(224, 173, 173)").text('오류').attr("disabled",true)
            }
        },
        error : function(request, status, error) {alert('error')}
    });
    
}