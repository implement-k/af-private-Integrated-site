var page = '';

const showModal = (link) => {
    page = link;
    $('#yn').css("visibility","visible");
    $('.dimlayer').css("visibility","visible");
    $('.modal-p').text("글 작성을 중지하시겠습니까?")
    if (page === 'create') {$('.modal-p').text("글을 올리겠습니까?");}
    else if (page === 'edit'){$('.modal-p').text("글을 수정하시겠습니까?");}
};

const closeModal = () => {
    page = '';
    $('#yn').css("visibility","hidden");
    $('.dimlayer').css("visibility","hidden");
};

const closeCancelModal = () => {
    $('#cancel').css("visibility","hidden");
    $('.dimlayer').css("visibility","hidden");
}

const goPage = (class_id, class_name) => {
    var title = $('#title').val();
    var content = $('#content').val();
    if (page === 'back') {history.back();}
    else if (page === 'create' || page === 'edit') {
        $('#yn').css("visibility","hidden");
        $('.dimlayer').css("visibility","hidden");
        if (title.length === 0) {
            $('.modal-p').text("제목을 입력해주세요.");
            $('#cancel').css("visibility","visible");
            $('.dimlayer').css("visibility","visible"); 
        } else if (content.length === 0) {
            $('.modal-p').text("내용을 입력해주세요.");
            $('#cancel').css("visibility","visible");
            $('.dimlayer').css("visibility","visible");
        } else if (title.length > 45) {
            $('.modal-p').text("제목은 45자 이내로 작성해 주세요");
            $('#cancel').css("visibility","visible");
            $('.dimlayer').css("visibility","visible");
        } else if (content.length > 400) {
            $('.modal-p').text("내용은 400자 이내로 작성해 주세요");
            $('#cancel').css("visibility","visible");
            $('.dimlayer').css("visibility","visible");
        } else {
            const createLink = '/createPost/'+class_id+'&'+page;
            let pid = localStorage.getItem("post_id");
            const specialChars = /['"\\%_]/g;
            const escapeChars = {"'": "\\'",'"': '\\"','\\': '\\\\','%': '\\%','_': '\\_'};
            
            title = title.replace(specialChars, match => escapeChars[match]);
            content = content.replace(specialChars, match => escapeChars[match]);
            try{
                $.ajax({
                    type: "POST", url: createLink,
                    data: {'title': title, 'content': content, 'pid':pid},
                    success : function() {
                        localStorage.removeItem("post_id")
                        location.href = '/board/1&'+class_id+'&'+class_name+'&0';},
                    error : function() {alert("error")}
                });
            } catch(e) {alert("error");}
        }
    } else {location.href = page;}
};

const createPost = () => {
    $('#yn').css("visibility","visible");
    $('.dimlayer').css("visibility","visible");
}

const isEdit = () => {
    let title = localStorage.getItem("title");
    let content = localStorage.getItem("content");
    $('#title').val(title)
    $('#content').text(content)
}