var page = '';

const showModal = (link) => {
    page = link;
    $('#yn').css("visibility","visible");
    $('.dimlayer').css("visibility","visible");
    if (page === 'create') {$('.modal-p').text("글을 올리겠습니까?");}
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
    else if (page === 'create') {
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
            createLink = '/createPost/'+class_id;
            const specialChars = /['"\\%_]/g;
            const escapeChars = {"'": "\\'",'"': '\\"','\\': '\\\\','%': '\\%','_': '\\_'};
            
            title = title.replace(specialChars, match => escapeChars[match]);
            content = content.replace(specialChars, match => escapeChars[match]);
            
            try{
                $.ajax({
                    type: "POST", url: createLink,
                    data: {'title': title, 'content': content},
                    success : function() {location.href = '/board/1&'+class_id+'&'+class_name;},
                    error : function() {alert("error")}
                });
            } catch(e) {
                alert("error");
            }
        }
    } else {location.href = page;}
};

const createPost = () => {
    $('#yn').css("visibility","visible");
    $('.dimlayer').css("visibility","visible");
}