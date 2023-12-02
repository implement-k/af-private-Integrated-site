var page = '';

const showModal = (link) => {
    page = link;
    $('.modal').css("visibility","visible");
    $('.dimlayer').css("visibility","visible");
    if (page === 'create') {$('.modal-p').text("글을 올리겠습니까?");}
};

const closeModal = () => {
    page = '';
    $('.modal').css("visibility","hidden");
    $('.dimlayer').css("visibility","hidden");
};

const go = (class_id, class_name) => {
    alert(class_id)
    alert(class_name)
}

const goPage = (class_id, class_name) => {
    if (page === 'back') {history.back();}
    else if (page === 'create') {
        var title = $('#title').val();
        var content = $('#content').val();
        createLink = '/createPost/'+class_id;
        if (title.length === 0) {
            $('#title').attr("placeholder","제목을 입력하세요.");
            $('.modal').css("visibility","hidden");
            $('.dimlayer').css("visibility","hidden");  
        } else if (content.length === 0) {
            $('#content').attr("placeholder","내용을 입력하세요.");
            $('.modal').css("visibility","hidden");
            $('.dimlayer').css("visibility","hidden");
        } else {
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
    $('.modal').css("visibility","visible");
    $('.dimlayer').css("visibility","visible");
}