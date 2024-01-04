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


const likeClass = (isLiked) => {
    let parts = location.href.split('&');
    let link;
    let class_id = parts[1];

    const setIconFill = (isFill, class_id) => {
        let fill = isFill ? '1' : '0';
        $('#star').css("font-variation-settings","'FILL' "+ fill + ",'wght' 400,'GRAD' -25,'opsz' 24");
        $('#class_like').attr("onclick","likeClass('" + class_id + "','" + fill + "')");
    };

    if (isLiked === '0') {
        link = '/likeClass/1';  //1 => add
        setIconFill(true, class_id);
    } else {
        link = '/likeClass/0';  //0 => delete
        setIconFill(false, class_id);
    };                  

    $.ajax({
        type: "POST",
        url: link,
        data: {'classID': class_id},
        success : function(result) {
            if (result === 'fail') {
                if (isLiked === '0') setIconFill(false, class_id);
                else setIconFill(true, class_id);
                showCancelModal("3개 까지만 가능합니다.");
            } else if (result != 'success') {
                if (isLiked === '0') setIconFill(false, class_id);
                else setIconFill(true, class_id);
                showCancelModal(result);
            }
        },
        error : function(request, status, error) {
            if (isLiked === '0') setIconFill(false, class_id);
            else setIconFill(true, class_id);
            showCancelModal('오류');
        }
    });
};


const isLiked = (x) => {
    if (x === '1') $('#star').css("font-variation-settings","'FILL' 1,'wght' 400,'GRAD' -25,'opsz' 24");
};


let pid;


const showPost = (link, post_id, post_uid, post_title, post_content, post_favorite, user_id) => {
    changeLink(post_id);
    $('#modal-title').text(post_title);
    $('#modal-favorite').text(post_favorite);
    $('#modal-content').html(post_content);
    $('#modal-user').text(post_uid);
    $('#post').css({visibility:'visible', opacity:'1'});
    $('#dimlayer_comment').css("visibility","visible");
    if ($(".btn"+post_id).attr("id") != 'like_btn') {
        $('.modal-like').attr({id:'unlike_btn', onclick:'m_unfavorite()'});
        $('.modal-icon').attr('id','unlike_icon');
    } else {
        $('.modal-like').attr({id:'like_btn',onclick:'m_favorite()'});
        $('.modal-icon').attr('id','like_icon');
    }
    $('.modal-num').text($('#like_num'+post_id).text());
    pid = post_id;
    
    let menuHtml;
    if (post_uid === user_id) {
        menuHtml = `
            <a class="vert-menu" onclick="showModal('edit', '${post_id}')">
                <span class="material-symbols-rounded">edit</span>
                <span>수정</span>
            </a>
            <a class="vert-menu" onclick="showModal('del', '${post_id}')">
                <span class="material-symbols-rounded">close</span>
                <span>삭제</span>
            </a>
        `
    } else {
        menuHtml = `
        <a class="vert-menu" onclick="declarePost('${post_id}', 0)">
            <span class="material-symbols-rounded">brightness_alert</span>
            <span>신고</span>
        </a>
        `
    }
    $('#post-modal_menu').html(menuHtml);                                   
    showComment(post_id);
};

const showComment = (post_id) => {
    $.ajax({
        type: "POST",
        url: '/getComment/'+post_id+'&0',
        success : function(result) {
            let uid = result[result.length - 1];
            let fragment = document.createDocumentFragment();

            if (result.length === 1) {
                let msg = uid ? '첫 댓글을 달아보세요.' : '로그인하여 첫 댓글을 달아보세요.';
                $('.post-modal_comment__view').html('<div class="view-loading">'+ msg +'</div>');
            } else {
                result.slice(0,-1).forEach(comment => {
                    let [id, cmt_class, replies, username, date, content] = comment;
                    let commentHtml = `
                        <div class="comment-card" id="comment-card">
                            <div class="comment-card_user" onclick="location.href='/user/${username}&1'">
                                <img class="profile-img --small" src="/static/image/default_profile.jpg">
                                <div class="comment-card_user_info">
                                    <p class="comment-card-p">${username}</p>
                                    <p class="comment-card-p --date">${date}</p>
                                </div>
                            </div>
                            <div class="comment-card_content">
                                <div class="comment-card_content_main" id="comment-content${id}">
                                    <p class="content-p" id="comment-p${id}" onclick="createReply(${id},'${username}')">${content}</p>
                                </div>
                                <div class="dropdown-click" id="show_vert${id}" onclick="showVert(${id})">
                                    <button class="small-icon"><span class="material-symbols-rounded vert">more_vert</span></button>
                                    <div class="dropdown__list --vert" id="vert_menu${id}">
                                        <div style="height:10px;"></div>
                                        <div class="dropdown__list_content --vert">
                    `;
                    
                    if (username === uid){
                        commentHtml += ` 
                            <div class="vert-menu" onclick="editComment(${id})">
                                <span class="material-symbols-rounded" style="font-size:20px;">edit</span>
                                <p style="margin:0 3px 0 0">수정하기</p>
                            </div>
                            <div class="vert-menu" onclick="deleteComment(${id}, false)">
                                <span class="material-symbols-rounded" style="font-size:20px;">close</span>
                                <p style="margin:0 3px 0 0">삭제하기</p>
                            </div>
                        `;
                    } else {
                        commentHtml += ` 
                            <div class="vert-menu" onclick="declarePost(${id},0)">
                                <span class="material-symbols-rounded" style="font-size:20px;">brightness_alert</span>
                                <p style="margin:0 3px 0 0">신고하기</p>
                            </div>
                        `;
                    }

                    commentHtml += '</div></div></div></div>';  //<div class="comment-card_content">

                    if (replies > 0) {
                        commentHtml += `<div id="reply-section${id}"></div>`;
                        commentHtml += `<button class="comment-more" onclick="showReply(${id},'')" id="reply-more${id}">―― 답글 ${replies}개 보기</button>`;
                    };
                    commentHtml += '</div>';
                    $(fragment).append(commentHtml);
                });
                $('.post-modal_comment__view').html(fragment);
            }
        },
        error : function(request, status, error) {
            showCancelModal('댓글오류');
        }
    });
}


const preshowPost = (post_id, post_uid, post_title, post_content, post_favorite, user_id) => {
    if (post_id != 'None') {
        showPost('', post_id, post_uid, post_title, post_content.replace(/&lt;br&gt;/g,'<br>'), post_favorite, user_id);
    } else {
        showCancelModal('삭제된 게시물입니다.');
        changeLink(0);
    }
}


const editComment = (cmt_id) => {
    let comment_content = $('#comment-p'+cmt_id).text()
    editCommentHtml = `
        <div style="display:flex;margin-top:5px;width:100%">
            <input class="edit-comment-input" type="text" id="edit-comment-input${cmt_id}">
            <button class="small-icon-circle" onclick="executeEditComment('${cmt_id}')">수정</button>
        </div>
    `
    $('#comment-content'+cmt_id).html(editCommentHtml);
    $('#edit-comment-input'+cmt_id).val(comment_content);
}


const executeEditComment = (cmt_id) => {
    content = $('#edit-comment-input'+cmt_id).val()
    $.ajax({
        type: "POST",
        url: '/getComment/'+cmt_id+'&2',
        data: {'content': content},
        success : function(result) {
            let editCommentHtml = `
                <p class="content-p" id="comment-p${cmt_id}" onclick="createReply(${cmt_id},'${result}')">${content}</p>
            `
            $('#comment-content'+cmt_id).html(editCommentHtml);
        },
        error : function(request, status, error) {
            showCancelModal('댓글오류');
        }
    });
}


const isPost = (post_id) => {pid = post_id};


const closePost = () => {
    changeLink(0);
    $('#post').css("visibility","hidden");
    $('#post').css("opacity","0");
    $('#dimlayer_comment').css("visibility","hidden");
    closeReply()
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

const showModal = (cmd, post_id) => {
    c = cmd;
    $('#yn').css("visibility","visible");
    $('#dimlayer').css("visibility","visible");
    let s = " 하시겠습니까?";
    if (cmd == 'edit') {s = "수정" + s}
    else {s = "삭제" + s};
    $('.modal-p').text(s);
    pid = post_id;
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
        let parts = location.href.split('&');
        location.href = '/board/2&' + parts[1] + '&' + parts[2] + '&0';
    } else {
        $('#yn').css("visibility","hidden");
        $('#dimlayer').css("visibility","hidden");
        $.ajax({
            type: "POST",
            url: '/deletePost/'+pid,    //0 => delete
            success : function(result) {
                if (result === 'success') {
                    let parts = location.href.split('?');
                    let url = parts[0];
                    let arg = parts[1] ? '?' + parts[1] : '';
                    parts = url.split('&');
                    parts[3] = 0;
                    url = parts.join('&');
                    location.href = url + arg;
                } else {
                    showCancelModal(result);
                }
                
            },
            error : function(request, status, error) {
                showCancelModal('오류');
            }
        });
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
        data: {'id':0, 'comment':comment},
        success : function(result) {
            $('#comment-input').val('');
            showComment(pid);
        },
        error : function(request, status, error) {showCancelModal("오류");}
    });
}


const deleteComment = (comment_id, isReply) => {
    let link;

    if (isReply) link = '/getComment/'+comment_id+'&5'
    else link = '/getComment/'+comment_id+'&3'

    $.ajax({
        type: "POST",
        url: link,
        success : function(result) {
            if (result === 'success') {
                showCancelModal("삭제했습니다.");
                showComment(pid)
                if (isReply) showReply(comment_id, '―― 답글 더 보기');
            } else {
                showCancelModal('오류');
            }
        },
        error : function(request, status, error) {showCancelModal("오류");}
    });
}


const showReply = (comment_id, reply_more_html) => {
    if (reply_more_html !== '―― 답글 더 보기') reply_more_html = $('#reply-more'+comment_id).html();
    $('#reply-more'+comment_id).html('―― 로딩중');
    $.ajax({
        type: "POST",
        url: '/getComment/'+comment_id+'&4',
        success : function(result) {
            let uid = result[result.length - 1];
            let fragment = document.createDocumentFragment();

            result.slice(0,-1).forEach(reply => {
                replyHtml = `
                    <div class="comment-card --reply">
                        <div class="comment-card_user">
                            <img class="profile-img --small" src="/static/image/default_profile.jpg">
                            <div class="comment-card_user_info">
                                <p class="comment-card-p">${reply[1]}</p>
                                <p class="comment-card-p --date">${reply[2]}</p>
                            </div>
                        </div>
                        <div class="comment-card_content">
                                <div class="comment-card_content_main" id="comment-content${reply[0]}">
                                    <p class="content-p")" id="comment-p${reply[0]}">${reply[3]}</p>
                                </div>
                                <div class="dropdown-click" id="show_vert${reply[0]}" onclick="showVert(${reply[0]})">
                                    <button class="small-icon"><span class="material-symbols-rounded vert">more_vert</span></button>
                                    <div class="dropdown__list --vert" id="vert_menu${reply[0]}">
                                        <div style="height:10px;"></div>
                                        <div class="dropdown__list_content --vert">
                `;

                if (reply[1] === uid){
                    replyHtml += ` 
                        <div class="vert-menu" onclick="editComment(${reply[0]})">
                            <span class="material-symbols-rounded" style="font-size:20px;">edit</span>
                            <p style="margin:0 3px 0 0">수정하기</p>
                        </div>
                        <div class="vert-menu" onclick="deleteComment(${reply[0]},true)">
                            <span class="material-symbols-rounded" style="font-size:20px;">close</span>
                            <p style="margin:0 3px 0 0">삭제하기</p>
                        </div>
                    `;
                } else {
                    replyHtml += ` 
                        <div class="vert-menu" onclick="declarePost(${reply[0]},0)">
                            <span class="material-symbols-rounded" style="font-size:20px;">brightness_alert</span>
                            <p style="margin:0 3px 0 0">신고하기</p>
                        </div>
                    `;
                }

                replyHtml += '</div></div></div></div></div>';
                $(fragment).append(replyHtml);
            });
            $('#reply-section'+comment_id).html(fragment);
            $('#reply-more'+comment_id).attr('onclick','hideReply("'+comment_id+'","'+reply_more_html+'")').html('―― 숨기기');
        },
        error : function(request, status, error) {
            showCancelModal("오류");
            $('#reply-more'+comment_id).html(reply_more_html);
        }
    });
}


const hideReply = (comment_id, original_text) => {
    $('#reply-section'+comment_id).empty()
    $('#reply-more'+comment_id).attr('onclick','showReply("'+comment_id+'")').html(original_text);
}


const showVert = (cmt_id) => {
    $('#vert_menu'+cmt_id).css({opacity:1, visibility:'visible'});
    const clickHandler = (event) => {
        if($(event.target).closest('#show_vert'+cmt_id).length === 0) {
            $('#vert_menu'+cmt_id).css({opacity: 0, visibility: 'hidden'});
            document.removeEventListener('click', clickHandler);
        }
    };
    document.addEventListener('click', clickHandler);
};

const replaceEnter = (post_id,content) => {
    ct = content.replace(/&lt;br&gt;/g,'<br>')
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


const goPage = (page) => {
    let urlObj = new URL(location.href);
    urlObj.searchParams.set('page', page); 
    window.location.href = urlObj.toString();
}

const createReply = (cmt_id, user_id) => {
    $('#reply-card').css({visibility:'visible', height:'auto', padding:'10px'});
    $('#reply-head').text(user_id + '님 답글 달기')
    $('#comment-input-btn').attr('onclick','addReply("'+cmt_id+'")')
}

const closeReply = () => {
    $('#reply-card').css({visibility:'hidden', height:0,padding:0});
}


const changeLink = (post_id) => {
    let parts = location.href.split('?');
    let url = parts[0];
    let arg = parts[1] ? '?' + parts[1] : '';
    parts = url.split('&');
    parts[3] = post_id;
    url = parts.join('&');
    history.pushState(null, null, url + arg);
}


const addReply = (comment_id) => {
    let comment = $('#comment-input').val();
    $('#comment-input').val('로딩중');

    $.ajax({
        type: "POST",
        url: '/getComment/'+pid+'&1',
        data: {'id':comment_id, 'comment':comment},
        success : function(result) {
            $('#comment-input').val('');
            showComment(pid);
            showReply(comment_id, '―― 답글 더 보기');
        },
        error : function(request, status, error) {showCancelModal("오류");}
    });
    closeReply();
}