const showCancelModal = (text) => {
    $('.modal-p').text(text);
    $('#cancel').css("visibility","visible");
    $('#dimlayer').css("visibility","visible"); 
}

const closeCancelModal = () => {
    $('#cancel').css("visibility","hidden");
    $('#dimlayer').css("visibility","hidden");
}

const editUserInfo = () => {
    let user_id = $('.user-name').text();
    let user_intro = $('.user-intro').text();
    let editHtml = `
        <span class="user-name">${user_id}</span>
        <input class="user-intro user-info-edit" id="user-intro-edit" placeholder="${user_intro}">
    `;
    $('.user-card_info_text').html(editHtml);
    // $('.user-name').val(user_id);
    $('.user-intro').val(user_intro);
    $('#user-edit-btn').attr("onclick","doneEditUserInfo('"+user_id+"','"+user_intro+"')");
    $('#user-edit-icon').text('done');
    $('#user-edit-text').text('완료');
}

const doneEditUserInfo = (user_id, user_intro) => {
    // let id = $('#user-name-edit').val();
    let intro = $('#user-intro-edit').val();
    // let avail_id = true;
    let avail_intro = true;
    
    // if (id !== user_id) {
    //     if (id.length === 0) {
    //         showCancelModal("아이디를 입력해주세요.");
    //         avail_id = false;
    //     } else if (!(/^[0-9a-zA-Z가-힣._]*$/g.test(id))) {
    //         showCancelModal("아이디: 한글, 영어, 숫자, 허용된 특수기호(._)만 입력하세요.");
    //         avail_id = false;
    //     } else if (id.length > 20) {
    //         showCancelModal("아이디: 20자 이내로 입력해주세요.");
    //         avail_id = false;
    //     } else {
    //         $.ajax({
    //             type: "POST",
    //             url: '/updateUser',
    //             data: {
    //                 'user_info':id,
    //                 'user_id':user_id,
    //                 'user_type':'u_id'
    //             },
    //             success : function(result) {
    //                 if (result === "dup_id") { //아이디 중복일 경우
    //                     showCancelModal("중복되는 아이디입니다.");
    //                     avail_id = false;
    //                 } else if (result === "invaild_id") {
    //                     showCancelModal("무효한 아이디");
    //                     avail_id = false;
    //                 }else if (result === 'db_error'){
    //                     showCancelModal("아이디: DB오류");
    //                     avail_id = false;
    //                 }
    //                 if (avail_id && avail_intro) {
    //                     let editHtml = `
    //                         <span class="user-name">${id}</span>
    //                         <span class="user-intro">${intro}</span>
    //                     `;
    //                     $('.user-card_info_text').html(editHtml);
    //                     $('#user-edit-btn').attr('onclick','editUserInfo()');
    //                     $('#user-edit-icon').text('edit');
    //                     $('#user-edit-text').text('수정');
    //                 }
    //             },
    //             error : function(request, status, error) {
    //                 showCancelModal("아이디: 오류");
    //                 avail_id = false;
    //             }
    //         });
    //     }
    // }
    if (intro !== user_intro) {
        if (intro.length > 30) {
            showCancelModal("자기소개: 30자 이내로 입력해주세요.");
            avail_intro = false;
        }
        const specialChars = /['"\\%_]/g;
        const escapeChars = {"'": "\\'",'"': '\\"','\\': '\\\\','%': '\\%','_': '\\_'};
        intro = intro.replace(specialChars, match => escapeChars[match]);
        $.ajax({
            type: "POST",
            url: '/updateUser',
            data: {
                'user_info':intro,
                'user_id':user_id,
                'user_type':'u_intro'
            },
            success : function(result) {
                if (result === "invaild_intro") {
                    showCancelModal("무효한 자기소개");
                    avail_intro = false;
                }else if (result === 'db_error'){
                    showCancelModal("자기소개: DB오류");
                    avail_intro = false;
                }
            },
            error : function(request, status, error) {
                showCancelModal("자기소개: 오류");
                avail_intro = false;
            }
        });
    }
    if (avail_intro) {
        let editHtml = `
            <span class="user-name">${user_id}</span>
            <span class="user-intro">${intro}</span>
        `;
        $('.user-card_info_text').html(editHtml);
        $('#user-edit-btn').attr('onclick','editUserInfo()');
        $('#user-edit-icon').text('edit');
        $('#user-edit-text').text('수정');
    }
}