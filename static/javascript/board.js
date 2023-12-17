const showCancelModal = (text) => {
    $('.modal-p').text(text);
    $('#cancel').css("visibility","visible");
    $('#dimlayer').css("visibility","visible"); 
}


const closeCancelModal = () => {
    $('#cancel').css("visibility","hidden");
    $('#dimlayer').css("visibility","hidden");
}


const closeModal = () => {
    $('#yn').css("visibility","hidden");
    $('#dimlayer').css("visibility","hidden");
};


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
                showCancelModal("3개 까지만 가능합니다.")
            } else if (result != 'success') {
                if (isLiked === '0') {
                    $('#star').css("font-variation-settings","'FILL' 0,'wght' 400,'GRAD' -25,'opsz' 24");
                    $('#class_like').attr("onclick","likeClass('"+class_id+"','0')");
                } else {
                    $('#star').css("font-variation-settings","'FILL' 1,'wght' 400,'GRAD' -25,'opsz' 24");
                    $('#class_like').attr("onclick","likeClass('"+class_id+"','1')");
                };
                showCancelModal(result);
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
            showCancelModal('오류');
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
    if (link!='') {history.pushState(null, null, link);};
    $('#modal-title').text(post_title);
    $('#modal-favorite').text(post_favorite);
    $('#modal-content').html(post_content);
    $('#modal-user').text(post_uid);
    $('#post').css("visibility","visible");
    $('#post').css("opacity","1");
    $('#dimlayer_comment').css("visibility","visible");
    if ($(".btn"+post_id).attr("id") != 'like_btn') {
        $('.modal-like').attr({id:'unlike_btn',onclick:'m_unfavorite()'});
        $('.modal-icon').attr('id','unlike_icon');
    } else {
        $('.modal-like').attr({id:'like_btn',onclick:'m_favorite()'});
        $('.modal-icon').attr('id','like_icon');
    }
    $('.modal-num').text($('#like_num'+post_id).text());
    pid = post_id;

    showComment(post_id)
};

const showComment = (post_id) => {
    var commentHtml = '';
    var comment_card1 = '<div class="comment-card" id="comment-card"><div class="comment-card_user">';
    comment_card1 += '<img class="profile-img --small" src="/static/image/default_profile.jpg">';
    comment_card1 += '<div class="comment-card_user_info"><p class="comment-card-p">';
    var comment_card2 = '</p><p class="comment-card-p --date">';
    var comment_card3 = '</p></div></div><div class="comment-card_content"><p class="content-p">';
    var vert1 = '<div class="dropdown-click" id="show_vert'
    var vert2 = '" onclick="showVert('
    var vert3 = ')"><button class="small-icon"><span class="material-symbols-rounded vert">more_vert</span></button>'
    vert3 += '<div class="dropdown__list --vert" id="vert_menu'
    var vert4 = '"><div style="height:10px;"></div><div class="dropdown__list_content --vert">'
    var vert5 = '<div class="vert-menu" onclick="editComment('
    var vert6 = ')"><span class="material-symbols-rounded" style="font-size:20px;">edit</span><p style="margin:0 3px 0 0">수정하기</p></div><div class="vert-menu" onclick="deleteComment(';
    var vert7 = ')"><span class="material-symbols-rounded" style="font-size:20px;">'
    vert7 += 'close</span><p style="margin:0 3px 0 0">삭제하기</p></div></div></div></div>'
    var vert8 = '<div class="vert-menu" onclick="declarePost('
    var vert9 = ',0)"><span class="material-symbols-rounded" style="font-size:20px;">brightness_alert</span><p style="margin:0 3px 0 0">'
    vert9 += '신고하기</p></div></div></div></div>'

    $.ajax({
        type: "POST",
        url: '/getComment/'+post_id+'&0',
        success : function(result) {
            uid = result[result.length-1];
            if (result.length === 1) {
                if (uid) {$('.post-modal_comment__view').html('<div class="view-loading">첫 댓글을 달아보세요.</div>');}
                else {$('.post-modal_comment__view').html('<div class="view-loading">로그인하여 첫 댓글을 달아보세요.</div>');}
            } else {
                for (i = 0;i < result.length-1;i++){
                    let id = result[i][0];
                    commentHtml += comment_card1 + result[i][2] + comment_card2 + result[i][3] + comment_card3 + result[i][4] + '</p>';
                    commentHtml += vert1 + id + vert2 + id + vert3 + id + vert4;
                    if (result[i][2] === uid){
                        commentHtml += vert5 + id + vert6 + id + vert7;
                    } else {
                        commentHtml += vert8 + id + vert9;
                    }
                    commentHtml += '</div>';           
                    if (result[i][1] > 0) {
                        commentHtml += '<div class="reply"></div>';
                        commentHtml += '<button class="comment-more" onclick="showReply('+id+')">―― 답글 '+result[i][1]+'개 보기</button>';
                    };
                    commentHtml += '</div>';
                };
                $('.post-modal_comment__view').html(commentHtml);
            }
        },
        error : function(request, status, error) {
            showCancelModal('댓글오류');
        }
    });
}


const isPost = (post_id, post_uid, post_title, post_content, post_favorite) => {
    pid = post_id
    puid = post_uid;
    ptitle = post_title;
    pcontent = post_content;
    pfavorite = post_favorite;
};


const preshowPost = () => {
    showPost('',pid,puid,ptitle,pcontent,pfavorite)
}


const closePost = (class_id, class_name) => {
    history.pushState(null, null, '/board/1&'+class_id+'&'+class_name+'&0');
    $('#post').css("visibility","hidden");
    $('#post').css("opacity","0");
    $('#dimlayer_comment').css("visibility","hidden");
    $('.post-modal_comment__view').html('<div class="view-loading">로딩중</div>');
};


const favorite = (post_id) => {
    $('.btn'+post_id).attr({onclick:'unfavorite('+post_id+')',id:'unlike_btn'});
    $('.icon'+post_id).attr('id','unlike_icon');
    $('#like_num'+post_id).text(parseInt($('#like_num'+post_id).text()) + 1);

    const undoFav = () => {
        $('#like_num'+post_id).text(parseInt($('#like_num'+post_id).text()) - 1);
        $('.btn'+post_id).attr({onclick:'favorite('+post_id+')',id:'like_btn'});
        $('.icon'+post_id).attr('id','like_icon');
    }

    $.ajax({
        type: "POST",
        url: '/likePost/'+post_id+'&0',
        success : function(result) {
            if (result != 'success') {  // result === 'fail','error','db_error'
                undoFav();
                showCancelModal(result);
            };
        },
        error : function(request, status, error) {
            undoFav();
            showCancelModal('오류');
        }
    });
};


const unfavorite = (post_id) => {
    $('.btn'+post_id).attr({onclick:'favorite('+post_id+')',id:'like_btn'});
    $('.icon'+post_id).attr('id','like_icon');
    $('#like_num'+post_id).text(parseInt($('#like_num'+post_id).text()) - 1);

    const undoFav = () => {
        $('#like_num'+post_id).text(parseInt($('#like_num'+post_id).text()) + 1);
        $('.btn'+post_id).attr({onclick:'unfavorite('+post_id+')',id:'unlike_btn'});
        $('.icon'+post_id).attr('id','unlike_icon');
    }

    $.ajax({
        type: "POST",
        url: '/likePost/'+post_id+'&1',
        success : function(result) {
            if (result != 'success') {  // result === 'fail','error','db_error'
                undoFav();
                showCancelModal(result);
            };
        },
        error : function(request, status, error) {
            undoFav();
            showCancelModal('오류');
        }
    });
};


const m_favorite = () => {
    let post_id = pid;
    $('.btn'+post_id).attr({onclick:'unfavorite('+post_id+')',id:'unlike_btn'});
    $('.icon'+post_id).attr('id','unlike_icon');
    $('#like_num'+post_id).text(parseInt($('#like_num'+post_id).text()) + 1);
    $('.modal-num').text(parseInt($('.modal-num').text()) + 1);
    $('.modal-like').attr({id:'unlike_btn',onclick:'m_unfavorite()'});
    $('.modal-icon').attr('id','unlike_icon');

    const undoFav = () => {
        $('.btn'+post_id).attr({onclick:'favorite('+post_id+')',id:'like_btn'});
        $('.icon'+post_id).attr('id','like_icon');
        $('#like_num'+post_id).text(parseInt($('#like_num'+post_id).text()) - 1);
        $('.modal-num').text(parseInt($('.modal-num').text()) - 1);
        $('.modal-like').attr({id:'like_btn',onclick:'m_favorite()'});
        $('.modal-icon').attr('id','like_icon');
    }

    $.ajax({
        type: "POST",
        url: '/likePost/'+post_id+'&0',
        success : function(result) {
            if (result != 'success') { // result === 'fail','error','db_error'
                undoFav();
                showCancelModal(result);
            };
        },
        error : function(request, status, error) {
            undoFav();
            showCancelModal('오류');
        }
    });
}

const m_unfavorite = () => {
    let post_id = pid;
    $('.btn'+post_id).attr({onclick:'favorite('+post_id+')',id:'like_btn'});
    $('.icon'+post_id).attr('id','like_icon');
    $('#like_num'+post_id).text(parseInt($('#like_num'+post_id).text()) - 1);
    $('.modal-num').text(parseInt($('.modal-num').text()) - 1);
    $('.modal-like').attr({id:'like_btn',onclick:'m_favorite()'});
    $('.modal-icon').attr('id','like_icon');

    const undoFav = () => {
        $('.btn'+post_id).attr({onclick:'unfavorite('+post_id+')',id:'unlike_btn'});
        $('.icon'+post_id).attr('id','unlike_icon');
        $('#like_num'+post_id).text(parseInt($('#like_num'+post_id).text()) + 1);
        $('.modal-num').text(parseInt($('.modal-num').text()) + 1);
        $('.modal-like').attr({id:'unlike_btn',onclick:'m_unfavorite()'});
        $('.modal-icon').attr('id','unlike_icon');
    }

    $.ajax({
        type: "POST",
        url: '/likePost/'+post_id+'&1',
        success : function(result) {
            if (result != 'success') { // result === 'fail','error','db_error'
                undoFav();
                showCancelModal(result);
            };
        },
        error : function(request, status, error) {
            undoFav();
            showCancelModal('오류');
        }
    });
    
}

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
    if (post_id === 'none') {post_id = pid};

    $.ajax({
        type: "POST",
        url: '/bookmarkPost/'+post_id,
        success : function(result) {
            if (result === 'success'){showCancelModal("저장했습니다.");}
            else if (result === 'fail') {showCancelModal("이미 저장한 글입니다.");}
            else {showCancelModal(result);};
        },
        error : function(request, status, error) {showCancelModal("오류");}
    });
};

const addComment = () => {
    let comment = $('#comment-input').val();
    $('#comment-input').val('로딩중');

    $.ajax({
        type: "POST",
        url: '/getComment/'+pid+'&1',
        data: {'comment':comment},
        success : function(result) {
            showComment(pid);
            $('#comment-input').val('');
        },
        error : function(request, status, error) {showCancelModal("오류");}
    });
}

const deleteComment = (cmt_id) => {
    $.ajax({
        type: "POST",
        url: '/getComment/'+cmt_id+'&3',
        success : function(result) {
            showCancelModal("삭제했습니다.");
            showComment(pid)
        },
        error : function(request, status, error) {showCancelModal("오류");}
    });
}

const showReply = (comment_id) => {
    
}

const showVert = (cmt_id) => {
    $('#vert_menu'+cmt_id).css({opacity:1,visibility:'visible'})
    $('#show_vert'+cmt_id).attr("onclick","hideVert('"+cmt_id+"')")
}

const hideVert = (cmt_id) => {
    $('#vert_menu'+cmt_id).css({opacity:0,visibility:'hidden'})
    $('#show_vert'+cmt_id).attr("onclick","showVert('"+cmt_id+"')")
}

const replaceEnter = (post_id,content) => {
    // ct = content
    ct = content.replace(/&lt;br&gt;/g,'<br>')
    // ct = content.split('&lt;br&gt;').join("\r\n");
    $('#content'+post_id).html(ct)
}

const declarePost = (cmt_id, isPost) => {
    $.ajax({
        type: "POST",
        url: '/declare/'+cmt_id+'&'+isPost,
        success : function(result) {showCancelModal("신고가 완료되었습니다.");},
        error : function(request, status, error) {showCancelModal("오류");}
    });
}

const editComment = (cmt_id) => {
    
}