const likeClass = (class_id, isLiked) => {
    let result;
    let link;
    if (isLiked === '0') {
        link = '/likeClass/1';  //1 => add
        $('#star').css("font-variation-settings","'FILL' 1,'wght' 400,'GRAD' -25,'opsz' 24");
        $('#class_like').attr("onclick","likeClass('"+class_id+"','1')");
    } else {
        link = '/likeClass/0';  //0 => delete
        $('#star').css("font-variation-settings","'FILL' 0,'wght' 400,'GRAD' -25,'opsz' 24");
        $('#class_like').attr("onclick","likeClass('"+class_id+"','0')");
    };                  

    $.ajax({
        type: "POST",
        url: link,
        data: {'classID': class_id},
        success : function(result) {
            if (result === 'fail') {
                if (isLiked === '0') {
                    $('#star').css("font-variation-settings","'FILL' 0,'wght' 400,'GRAD' -25,'opsz' 24");
                    $('#class_like').attr("onclick","likeClass('"+class_id+"','0')");
                } else {
                    $('#star').css("font-variation-settings","'FILL' 1,'wght' 400,'GRAD' -25,'opsz' 24");
                    $('#class_like').attr("onclick","likeClass('"+class_id+"','1')");
                };
                $('.modal-p').text('3개 까지만 가능합니다.');   //3개까지만 추가 가능 맨트
                $('#cancel').css("visibility","visible");
                $('.dimlayer').css("visibility","visible"); 
            } else if (result != 'success') {
                if (isLiked === '0') {
                    $('#star').css("font-variation-settings","'FILL' 0,'wght' 400,'GRAD' -25,'opsz' 24");
                    $('#class_like').attr("onclick","likeClass('"+class_id+"','0')");
                } else {
                    $('#star').css("font-variation-settings","'FILL' 1,'wght' 400,'GRAD' -25,'opsz' 24");
                    $('#class_like').attr("onclick","likeClass('"+class_id+"','1')");
                };
                $('.modal-p').text(result);
                $('#cancel').css("visibility","visible");
                $('.dimlayer').css("visibility","visible"); 
            }; 
        },
        error : function(request, status, error) {
            if (isLiked === '0') {
                $('#star').css("font-variation-settings","'FILL' 0,'wght' 400,'GRAD' -25,'opsz' 24");
                $('#class_like').attr("onclick","likeClass('"+class_id+"','0')");
            } else {
                $('#star').css("font-variation-settings","'FILL' 1,'wght' 400,'GRAD' -25,'opsz' 24");
                $('#class_like').attr("onclick","likeClass('"+class_id+"','1')");
            };
            $('.modal-p').text('오류');
            $('#cancel').css("visibility","visible");
            $('.dimlayer').css("visibility","visible"); 
        }
    });
    
    
};


const isLiked = (x) => {if (x === '1') {$('#star').css("font-variation-settings","'FILL' 1,'wght' 400,'GRAD' -25,'opsz' 24")};};


let pid;
let puid;
let ptitle;
let pcontent;
let pfavorite;


const showPost = (link, post_id, post_uid, post_title, post_content, post_favorite) => {
    history.pushState(null, null, link);
    $('#modal-title').text(post_title);
    $('#modal-favorite').text(post_favorite);
    $('#modal-content').text(post_content);
    $('#modal-user').text(post_uid);
    $('#post').css("visibility","visible");
    $('#post').css("opacity","1");
    $('#dimlayer_comment').css("visibility","visible");
    pid = post_id
};


const isPost = (post_id, post_uid, post_title, post_content, post_favorite) => {
    pid = post_id
    puid = post_uid;
    ptitle = post_title;
    pcontent = post_content;
    pfavorite = post_favorite;
};


const preshowPost = () => {
    $('#modal-title').text(ptitle);
    $('#modal-favorite').text(pfavorite);
    $('#modal-content').text(pcontent);
    $('#modal-user').text(puid);
    $('#post').css("visibility","visible");
    $('#post').css("opacity","1");
    $('#dimlayer_comment').css("visibility","visible");
}


const closePost = (class_id, class_name) => {
    history.pushState(null, null, '/board/1&'+class_id+'&'+class_name+'&0');
    $('#post').css("visibility","hidden");
    $('#post').css("opacity","0");
    $('#dimlayer_comment').css("visibility","hidden");
};


const favorite = (post_id) => {
    $('.btn'+post_id).attr({onclick:'unfavorite('+post_id+')',id:'unlike_btn'});
    $('.icon'+post_id).attr('id','unlike_icon');
    $('#like_num'+post_id).text(parseInt($('#like_num'+post_id).text()) + 1);

    $.ajax({
        type: "POST",
        url: '/likePost/'+post_id+'&0',
        success : function(result) {
            if (result != 'success') {  // result === 'fail','error','db_error'
                $('#like_num'+post_id).text(parseInt($('#like_num'+post_id).text()) - 1);
                $('.btn'+post_id).attr({onclick:'favorite('+post_id+')',id:'like_btn'});
                $('.icon'+post_id).attr('id','like_icon');
                $('.modal-p').text(result);
                $('#cancel').css("visibility","visible");
                $('.dimlayer').css("visibility","visible"); 
            };
        },
        error : function(request, status, error) {
            $('#like_num'+post_id).text(parseInt($('#like_num'+post_id).text()) - 1);
            $('.btn'+post_id).attr({onclick:'favorite('+post_id+')',id:'like_btn'});
            $('.icon'+post_id).attr('id','like_icon');
            $('.modal-p').text('오류');
            $('#cancel').css("visibility","visible");
            $('.dimlayer').css("visibility","visible"); 
        }
    });
};


const unfavorite = (post_id) => {
    $('.btn'+post_id).attr({onclick:'favorite('+post_id+')',id:'like_btn'});
    $('.icon'+post_id).attr('id','like_icon');
    $('#like_num'+post_id).text(parseInt($('#like_num'+post_id).text()) - 1);

    $.ajax({
        type: "POST",
        url: '/likePost/'+post_id+'&1',
        success : function(result) {
            if (result != 'success') {  // result === 'fail','error','db_error'
                $('#like_num'+post_id).text(parseInt($('#like_num'+post_id).text()) + 1);
                $('.btn'+post_id).attr({onclick:'unfavorite('+post_id+')',id:'unlike_btn'});
                $('.icon'+post_id).attr('id','unlike_icon');
                $('.modal-p').text(result);
                $('#cancel').css("visibility","visible");
                $('.dimlayer').css("visibility","visible"); 
            };
        },
        error : function(request, status, error) {
            $('#like_num'+post_id).text(parseInt($('#like_num'+post_id).text()) + 1);
            $('.btn'+post_id).attr({onclick:'unfavorite('+post_id+')',id:'unlike_btn'});
            $('.icon'+post_id).attr('id','unlike_icon');
            $('.modal-p').text('오류');
            $('#cancel').css("visibility","visible");
            $('.dimlayer').css("visibility","visible"); 
        }
    });
};


let c = '';
let cid;
let cname;

const showModal = (cmd, post_id, class_id, class_name) => {
    c = cmd;
    $('#yn').css("visibility","visible");
    $('#dimlayer').css("visibility","visible");
    let s = " 하시겠습니까?";
    if (cmd == 'edit') {s = "수정" + s}
    else {s = "삭제" + s};
    $('.modal-p').text(s);
    pid = post_id;
    cid = class_id;
    cname = class_name;
};

const closeModal = () => {
    $('#yn').css("visibility","hidden");
    $('#dimlayer').css("visibility","hidden");
};

const execute = () => {
    if (c === 'edit') {
        $('#yn').css("visibility","hidden");
        $('#dimlayer').css("visibility","hidden");
        const title = $('#title'+pid).text();
        const content = $('#content'+pid).text();
        localStorage.setItem("title", title);
        localStorage.setItem("content", content);
        localStorage.setItem("post_id", pid);
        location.href = '/board/2&'+cid+'&'+cname+'&0';
    } else {
        $('#yn').css("visibility","hidden");
        $('#dimlayer').css("visibility","hidden");
        let r = '';
        $.ajax({
            type: "POST",
            url: '/deletePost/'+pid,    //0 => delete
            async: false,
            success : function(result) {r = result;},
            error : function(request, status, error) {r = error;}
        });
        if (r === 'f') {alert('error')}
        else{location.reload();};
    };
}

const bookmark = (post_id) => {
    let r;
    $.ajax({
        type: "POST", url: '/bookmarkPost/'+post_id, async: false,
        success : function(result) {r = result;},
        error : function(request, status, error) {r = error;}
    });
    alert(r)
    if (r === 'f') {alert('error')}
    else {
        $('.modal-p').text("저장했습니다.");
        $('#cancel').css("visibility","visible");
        $('.dimlayer').css("visibility","visible"); 
    };
};

const closeCancelModal = () => {
    $('#cancel').css("visibility","hidden");
    $('.dimlayer').css("visibility","hidden");
}