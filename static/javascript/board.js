const addLikeClass = (class_id, isLiked) => {
    let r;
    let link;
    if (isLiked === '0') {link = '/likeClass/1'}    //1 => add
    else {link = '/likeClass/0'}                    //0 => delete

    $.ajax({
        type: "POST",
        url: link,
        async: false,
        data: {'classID': class_id},
        success : function(result) {r = result;},
        error : function(request, status, error) {r = error;}
    });
    
    if (r === 's') {
        if (isLiked === '0') {$('#star').css("font-variation-settings","'FILL' 1,'wght' 400,'GRAD' -25,'opsz' 24")}
        else {$('#star').css("font-variation-settings","'FILL' 0,'wght' 400,'GRAD' -25,'opsz' 24")}
    } else if (r === 'f') { $('#class_like').css({"width":"150px"}).val('3개 까지만 가능합니다.')}    //3개까지만 추가 가능 맨트
    else {alert(r)};      //오류
};

const isLiked = (x) => {
    if (x === '1') {$('#star').css("font-variation-settings","'FILL' 1,'wght' 400,'GRAD' -25,'opsz' 24")};
};

let pid;
let puid;
let ptitle;
let pcontent;
let pfavorite;

const showPost = (class_id, class_name, post_id, post_uid, post_title, post_content, post_favorite) => {
    history.pushState(null, null, '/board/1&'+class_id+'&'+class_name+'&'+post_id);
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
    // TODO icon fill 0 -> 1
    // 숫자 카운팅 +1 
    // 
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