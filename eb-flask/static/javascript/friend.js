const isFriend = (user_id) => {
    $.ajax({
        type: "POST",
        url: '/manageFriend/0&'+user_id,                 //mode 0:친구인지 확인
        success : function(result) {
            if (result === 'friend') {
                $('#friend_btn').css("background-color","rgb(202, 206, 214)").text('친구').attr("onclick","removeFriend('"+user_id+"')");
            } else if (result === 'request') {
                $('#friend_btn').css("background-color","rgb(235, 235, 235)").text('요청중..').attr("onclick","removeFriend('"+user_id+"')");
            } else if (result === 'success') {
                $('#friend_btn').css("background-color","rgb(235, 235, 235)").text('친구추가').attr("onclick","addFriend('"+user_id+"')");
            } else if (result === 'db_error') {
                $('#friend_btn').css("background-color","rgb(224, 173, 173)").text('다시시도').attr("disabled",true);
            } else if (result != 'success') {
                $('#friend_btn').css("background-color","rgb(224, 173, 173)").text('오류').attr("disabled",true);
            }
        },
        error : function(request, status, error) {alert('error');}
    });
    
}

const addFriend = (user_id) => {
    $.ajax({
        type: "POST",
        url: '/manageFriend/1&'+user_id,                 //mode 1:친구추가
        success : function(result) {
            if (result === 'success') {
                location.reload();
            } else if (result === 'db_error') {
                $('#friend_btn').css("background-color","rgb(224, 173, 173)").text('새로고침').attr("disabled",true);
            } else {
                $('#friend_btn').css("background-color","rgb(224, 173, 173)").text('오류').attr("disabled",true);
            }
        },
        error : function(request, status, error) {alert('error');}
    });
}

const removeFriend = (user_id) => {
    $.ajax({
        type: "POST",
        url: '/manageFriend/2&'+user_id,                 //mode 2:친구삭제
        success : function(result) {
            if (result === 'success') {
                location.reload();
            } else if (result === 'db_error') {
                $('#friend_btn').css("background-color","rgb(224, 173, 173)").text('새로고침').attr("disabled",true);
            } else {
                $('#friend_btn').css("background-color","rgb(224, 173, 173)").text('오류').attr("disabled",true);
            }
        },
        error : function(request, status, error) {alert('error');}
    });
}

let isSearch = false;

const showSearch = () => {
    $('#search-user-input').css('box-shadow','0 0 6px .1px rgb(175,175,175)');
    $('#dimlayer').css('visibility','visible');
    $('#user-search-btn').css('visibility','visible');
}

const closeSearch = () => {
    resetSearchResult();
    $('#search-user-input').css('box-shadow','none');
    $('#dimlayer').css('visibility','hidden');
    $('#user-search-btn').css('visibility','hidden');
    $('#search-user-input').hover(
        function(){
          // 마우스가 요소 위로 이동했을 때 실행할 내용
          $(this).css("box-shadow", "0 0 6px .1px rgb(175,175,175)");
        },
        function(){
          // 마우스가 요소에서 벗어났을 때 실행할 내용
          $(this).css("box-shadow", ""); // 기본 값으로 변경하거나 다른 값으로 설정할 수 있습니다.
        }
      );
};

const showSearchResult = () => {
    isSearch = true;
    let search = $('#search-user-input').val();
    let search_list = '<div class="search-bar_list">';

    if (search.length < 2) {
        search_list += `
                <div class="search-bar_friend_last">
                    <span>두 글자 이상으로 검색해주세요.</span>
                </div>
            </div>
            <button class="circle --friend --board" onclick="resetSearchResult()">
                <span class="material-symbols-rounded">close</span>
                <span class="circle-search">지우기</span>
            </button>
        `;
        $('.search-bar_section').html(search_list);
    } else {
        $.ajax({
            type: "POST",
            url: '/search/' + search,                 //mode 1:친구추가
            success : function(result) {
                let search_list = '<div class="search-bar_list">';
                $('.search-bar_section').empty();
                let last_text;
                
        
                if (result === 'invalid_id') {
                    last_text = '한글, 영어, 숫자, 허용된 특수기호(._)만 입력하세요.';
                } else if (result === 'short_text') {
                    last_text = '두 글자 이상으로 검색해주세요.';
                }else if (result.length == 0){
                    last_text = '검색 결과가 없습니다.';
                } else {
                    search_list += '<div class="search-bar_friend_section">';
                    result.forEach(user => {
                        search_list += `
                            <div class="search-bar_friend"  onclick="location.href = '/user/${user[0]}&1'">
                                <img class="profile-img --medium" src="/static/image/default_profile.jpg">
                                <span style="margin-left:10px;">${user[0]}</span>
                            </div>
                        `;
                    });
                    search_list += '</div>';
                    last_text = '사용자명으로 추가';
                }
                search_list += `
                        <div class="search-bar_friend_last">
                            <span>${last_text}</span>
                        </div>
                    </div>
                    <button class="circle --friend --board" onclick="resetSearchResult()">
                        <span class="material-symbols-rounded">close</span>
                        <span class="circle-search">지우기</span>
                    </button>
                `;
                $('.search-bar_section').html(search_list);
            },
            error : function(request, status, error) {alert('error')}
            });
    }
}

const changeValue = () => {
    if (isSearch) {
        isSearch = true;
        $('.search-bar_section').empty();
        let searchHtml = `
            <button class="circle --friend --board" onclick="showSearchResult()">
                <span class="material-symbols-rounded">search</span>
                <span class="circle-search">검색</span>
            </button>
        `;
        $('.search-bar_section').html(searchHtml);
    }
}

const resetSearchResult = () => {
    isSearch = false;
    $('#search-user-input').val('');
    $('.search-bar_section').empty();
    let searchHtml = `
        <button class="circle --friend --board" id="user-search-btn" onclick="showSearchResult()">
            <span class="material-symbols-rounded">search</span>
            <span class="circle-search">검색</span>
        </button>
    `;
    $('.search-bar_section').html(searchHtml);
}