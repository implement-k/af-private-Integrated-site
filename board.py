from flask import Flask, render_template, url_for, request, session, redirect, jsonify
from dotenv import load_dotenv
import pymysql, uuid, re
import os 

app = Flask(__name__)
app.secret_key = uuid.uuid4().hex

load_dotenv()
U = os.environ.get('user')
P = os.environ.get('password')
H = os.environ.get('host')
D = os.environ.get('db')


def db(isOutput, sql):
    con = pymysql.connect(user=U,passwd=P,host=H,db=D,charset='utf8')
    cur = con.cursor()

    if isOutput:
        output = []
        for i in sql:
            cur.execute(i)
            output.append(cur.fetchall())
        con.close()
        return output
    
    for i in sql:
        cur.execute(i)
    con.commit()
    con.close()
        

@app.route('/login/',methods=['POST', 'GET'])
def login():
    if request.method == 'POST':
        con = pymysql.connect(user=U,passwd=P,host=H,db=D,charset='utf8')
        cur = con.cursor()
        user_id = request.form.get('id')
        user_pw = request.form.get('password')

        if len(user_id) == 0 or len(user_pw) == 0: return redirect('/login',isCorrect=0)
        
        cur.execute("SELECT u_id FROM user WHERE u_id = '{0}' AND u_pw = '{1}';".format(user_id, user_pw))
        isUser = len(cur.fetchall())

        if isUser > 0:
            session['id'] = user_id

            cur.execute("SELECT u_intro FROM user WHERE u_id = '{0}'".format(user_id))
            session['user_intro'] = cur.fetchall()[0][0]

            con.close()
            return redirect('/')
        else:
            con.close()
            return render_template('login.html',isCorrect=0)
    else:
        if "id" in session: return redirect('/')
        else: return render_template('login.html',isCorrect=1)


@app.route('/logout/')
def logout():
    if "id" in session:
        session.pop('id',None)
        session.pop('user_intro',None)
    return redirect('/')


@app.route('/signup/',methods=['POST', 'GET'])
def signup():
    if request.method == 'POST':
        try:
            user_id = request.form.get('id')
            user_pw = request.form.get('pw_dub')
            user_phoneNumber = request.form.get('num').replace("-", "")
            valid_id = '^[가-힣A-Za-z0-9._]{1,20}$'
            valid_pw = '^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,25}$'

            if not re.fullmatch(valid_id, user_id) or not re.fullmatch(valid_pw, user_pw): return '잘못된 접근'

            db(False, ["INSERT INTO user(u_id,u_pw,u_phoneNum) VALUES ('{0}','{1}','{2}');".format(user_id, user_pw, user_phoneNumber)])
            return render_template('signup_done.html')
        except: return 'error'
    else:
        if "id" in session: return redirect('/')
        else: return render_template('signup.html')


@app.route('/board/<int:mode>&<int:class_id>&<class_name>&<int:post_id>',methods=['POST', 'GET'])
def board(mode, class_id, class_name, post_id):    #mode 0: 글작성, mode 1: 글보기, mode 2: 글 수정, mode 2,3 저장한 게시물, 내가쓴글
    user_id = session.get('id', None)              #로그인 안하거나 익명도 글 작성이 가능한 게시판이 아니라면 로그인페이지로 리다이렉트
    if not user_id and class_id != 1:
        return redirect('/login')

    user_intro = session.get('user_intro', None)
    if not user_intro: user_intro="자기소개가 없습니다."

    if mode == 1:
        per_page = 10

        con = pymysql.connect(user=U,passwd=P,host=H,db=D,charset='utf8')
        cur = con.cursor()

        cur.execute("SELECT COUNT(*) FROM posts WHERE p_classification = %s", (class_id)) 
        total_post = cur.fetchone()[0]
        end_page = total_post // per_page + 1
        cur_page = min(int(request.args.get('page', 1)), end_page)
        post_info = {'id':None, 'user_id':None, 'title':None, 'content':None, 'created':None, 'like':None}

        if post_id != 0:
            cur.execute("SELECT COUNT(*) FROM posts WHERE p_classification = %s AND p_id <= %s", (class_id, post_id))
            post_index = cur.fetchone()[0] - 1
            cur_page = (total_post - post_index) // per_page + 1
            cur.execute("SELECT p_id, p_uid, p_title, p_content, p_created, p_like FROM posts WHERE p_id=%s", (post_id))
            result = cur.fetchone()
            if result:
                post_info = {
                    'id':result[0],
                    'user_id':result[1],
                    'title':result[2],
                    'content':result[3],
                    'created':result[4],
                    'like':result[5]
                }
        
        offset = (cur_page - 1) * per_page

        cur.execute("""
            SELECT p_id, p_uid, p_title, p_content, p_created, p_like, lp_uid 
            FROM posts 
            LEFT JOIN liked_post 
            ON posts.p_id = liked_post.lp_id AND liked_post.lp_uid = %s 
            WHERE p_classification = %s 
            ORDER BY p_created DESC 
            LIMIT %s OFFSET %s
        """, (user_id, class_id, per_page, offset))
        post_list = cur.fetchall()

        cur.execute("SELECT c_intro FROM post_class WHERE c_id=%s", (class_id))
        class_intro = cur.fetchall()[0][0]

        cur.execute("SELECT l_id FROM liked_class WHERE l_uid=%s and l_cid=%s", (user_id, class_id))
        liked_class = cur.fetchall()
        con.close()

        start_page = ((cur_page-1) // 10) * 10 + 1
        mid_page = end_page if end_page < start_page + 10 else start_page + 9

        return render_template(
            'board.html',
            post_list = post_list,
            user_info = {'id':user_id, 'intro':user_intro},
            class_info = {'id':class_id, 'name':class_name, 'intro':class_intro},
            isLiked = 0 if len(liked_class) == 0 else 1,
            post_id = post_id,
            post_info = post_info,
            pagination=[cur_page, start_page, mid_page, end_page, per_page, total_post]
        )
    elif mode == 0 or mode == 2:
        if not user_id:
            return redirect('/login')
        else:
            return render_template(
                'write.html',
                class_id = class_id,
                class_name = class_name,
                user_info = {'id':user_id, 'intro':user_intro},
                isEdit = False if mode == 0 else True
            )


@app.route('/',methods=['POST', 'GET'])
def home():
    user_id = session.get('id', None)
    if user_id:
        user_intro = session.get('user_intro', None)
        if not user_intro: user_intro="자기소개가 없습니다."
        user_info = [user_id, user_intro]
                
        result = db(True, ["SELECT * FROM post_class","SELECT l_cid, c_name FROM liked_class, post_class WHERE liked_class.l_cid = post_class.c_id and l_uid='{0}'".format(user_id)])
        class_list = result[0]
        liked_class_list = result[1]
            
        return render_template('home.html', class_list=class_list, liked_class_list=liked_class_list, user_info=user_info)
    else:
        return redirect('/board/1&1&공군&0')


@app.route('/calender')
def calender():
    user_id = session.get('id', None)       #로그인 안하거나 익명도 글 작성이 가능한 게시판이 아니라면 로그인페이지로 리다이렉트
    if not user_id: return redirect('/login')
    user_intro = session.get('user_intro', None)
    if not user_intro: user_intro="자기소개가 없습니다."
    user_info = [user_id, user_intro]
    return render_template('calender.html', user_info=user_info)


@app.route('/friend/management')
def manageFriend():
    user_id = session.get('id', None)
    
    if user_id:
        friends = []            #친구
        friend_reception = []   #친구신청 받은 것
        friend_request = []     #친구신청 보낸 것

        try:
            con = pymysql.connect(user=U,passwd=P,host=H,db=D,charset='utf8')
            cur = con.cursor()
            cur.execute("SELECT f_toid,f_friend FROM friend WHERE f_fromid='{0}'".format(user_id))
            result = cur.fetchall()
            con.close()
        except: return "db_error"

        for i in result:
            if i[1] == 0:
                friend_reception.append(i[0])
            elif i[1] == 1:
                friends.append(i[0])
            else:
                friend_request.append(i[0])

        return render_template(
            'friend_management.html',
            friend_list = friends,
            reception_list = friend_reception,
            send_list = friend_request,
            user_id = user_id
        )
    else:
        return redirect('/login')


@app.route('/user/<name>&<int:mode>')
def privateUser(name, mode):                  #mode 0: 개인, mode 1 남
    user_id = session.get('id', None)

    if user_id:
        if user_id == name and (mode == 0 or mode == 1):
            
            user_intro = session.get('user_intro', None)
            if not user_intro: user_intro="자기소개가 없습니다."

            user_info = [user_id, user_intro]
            # 미리 보기 5개까지만
            friend_list=['asd','dfff','df']
            # friend_list=[]
            friend_request_list=['fff','12user','fkuser']
            # friend_request_list=[]
            return render_template('user.html', user_info=user_info, friend_list=friend_list, friend_request_list=friend_request_list)
        else:
            result = db(True, ["SELECT u_intro FROM user WHERE u_id = '{0}'".format(name)])[0]
            user_intro = 'null'
            if len(result) == 0:
                return '해당 유저가 없습니다.'
            else: 
                user_intro = result[0][0]
                if not user_intro: user_intro="자기소개가 없습니다."
                return render_template('friend.html',user_id=name, user_intro=user_intro)
    else:
        return redirect('/login')


# @app.route('/userPost/<int:isSaved>',methods=['POST'])  #isSaved 1: 저장한 글, isSaved 0:내가쓴글
# def declare(isSaved):
#     user_id = session.get('id',None)
#     if isSaved == 1:
#         db(False, ["INSERT INTO declare_user(d_isPost,d_cardID,d_uid) VALUES({0},{1},'{2}')".format(isPost,id,user_id)])
#         return render_template('saved_post.html',user_id=name, user_intro=user_intro)
#     return 'success'


@app.route('/createPost/<int:class_id>&<mode>', methods=['POST']) 
def createPost(class_id,mode):
    user_id = session.get('id', None)
    title = request.form.get('title')
    content = request.form.get('content')
    pid = request.form.get('pid')
    if mode == 'create':
        db(False, ["INSERT INTO posts(p_uid,p_title,p_content,p_created,p_classification) VALUES('{0}','{1}','{2}',Now(),{3})".format(user_id, title, content, class_id)])
    else:
        db(False, ["UPDATE posts SET p_title='{0}', p_content='{1}' WHERE p_id='{2}'".format(title, content, pid)])
    return '1'


@app.route('/deletePost/<int:post_id>', methods=['POST']) 
def deletePost(post_id):
    db(False, ["DELETE FROM posts WHERE p_id={0}".format(post_id)])
    return 'success'


@app.route('/likePost/<int:post_id>&<int:mode>', methods=['POST'])  #mode 0:좋아요 추가, mode 1:좋아요 취소
def likePost(post_id,mode):
    user_id = session.get('id', None)
    con = pymysql.connect(user=U,passwd=P,host=H,db=D,charset='utf8')
    cur = con.cursor()

    try:
        cur.execute("SELECT COUNT(*) FROM liked_post WHERE lp_id={0} AND lp_uid='{1}'".format(post_id, user_id))
        result = cur.fetchone()[0]
    except:
        con.close()
        return 'db_error'

    if mode == 0:
        if result != 0:
            con.close()
            return 'error'
        else:
            try: 
                cur.execute("INSERT INTO liked_post(lp_id,lp_uid) VALUES({0},'{1}')".format(post_id, user_id))
                cur.execute("UPDATE posts SET p_like=p_like+1 WHERE p_id={0}".format(post_id))
                con.commit()
                con.close()
            except: return 'db_error'
            return 'success'
    elif mode == 1:
        if result == 0:
            con.close()
            return 'error'
        else:
            try: 
                cur.execute("DELETE FROM liked_post WHERE lp_id={0} AND lp_uid='{1}'".format(post_id, user_id))
                cur.execute("UPDATE posts SET p_like=p_like-1 WHERE p_id={0}".format(post_id))
                con.commit()
                con.close()
            except: return 'db_error'
            return 'success'
    else: return 'fail'


@app.route('/likeClass/<int:isAdd>',methods=['POST'])   #isAdd 1: 좋아요 추가, isAdd 0: 좋아요 삭제
def likeClass(isAdd):
    user_id = session.get('id', None)
    class_id = request.form['classID']
    con = pymysql.connect(user=U,passwd=P,host=H,db=D,charset='utf8')
    cur = con.cursor()

    if isAdd == 1:      
        try: cur.execute("SELECT l_id FROM liked_class WHERE l_uid='{0}'".format(user_id))
        except: return 'db_error'

        if len(cur.fetchall()) == 3: 
            con.close()
            return 'fail'

        try: 
            cur.execute("INSERT INTO liked_class(l_cid,l_uid) VALUES({0},'{1}')".format(class_id, user_id))
            con.commit()
            con.close()
        except: return 'db_error'
        return 'success'
    else:
        try:
            cur.execute("DELETE FROM liked_class WHERE l_cid={0} AND l_uid='{1}'".format(class_id, user_id))
            con.commit()
            con.close()
        except: return 'db_error'
        return 'success'


@app.route('/bookmarkPost/<int:post_id>',methods=['POST'])
def bookmarkPost(post_id):
    user_id = session.get('id', None)

    try:
        con = pymysql.connect(user=U,passwd=P,host=H,db=D,charset='utf8')
        cur = con.cursor()
        cur.execute("SELECT s_id FROM saved_post WHERE s_id={0} AND s_uid='{1}'".format(post_id, user_id))
        if len(cur.fetchall()) > 0: 
            con.close()
            return 'fail'
        
        cur.execute("INSERT INTO saved_post(s_id,s_uid) VALUES({0},'{1}')".format(post_id, user_id))
        con.commit()
        con.close()
        return 'success'
    except: return 'db_error'


@app.route('/isDub',methods=['POST'])
def dubCheck():
    try:
        name = request.form['name']
        value = request.form['value']
        return str(len(db(True, ["SELECT {0} FROM user WHERE {0}='{1}'".format(name, value)])[0])) #중복이면 1, 중복 아니면 0
    except Exception as e:
        return 'error'


@app.route('/manageFriend/<int:mode>&<friend_id>',methods=['POST'])
def editFriend(mode,friend_id):
    user_id = session.get('id', None)
    con = pymysql.connect(user=U,passwd=P,host=H,db=D,charset='utf8')
    cur = con.cursor()
    try:
        if mode == 0:
            cur.execute("SELECT f_fromid,f_friend FROM friend WHERE f_fromid='{0}' AND f_toid='{1}'".format(user_id, friend_id))
            result = cur.fetchall()
            con.close()

            if len(result) != 0 and result[0][1] == 1: return 'friend'
            elif len(result) == 0 or result[0][1] == 0: return 's'
            elif result[0][1] == 2: return 'request'
        elif mode == 1:
            cur.execute("SELECT f_friend FROM friend WHERE f_fromid='{0}' AND f_toid='{1}'".format(user_id, friend_id))
            result = cur.fetchall()

            if len(result) == 0:
                cur.execute("INSERT INTO friend(f_fromid, f_toid, f_friend) VALUES('{0}','{1}',2),('{1}','{0}',0)".format(user_id, friend_id))
            elif result[0][0] == 0:
                cur.execute("UPDATE friend SET f_friend=1 WHERE (f_fromid='{0}' AND f_toid='{1}') OR (f_fromid='{1}' AND f_toid='{0}')".format(user_id, friend_id))

            con.commit()
            con.close()
            return 's'
        else: 
            cur.execute("DELETE FROM friend WHERE (f_fromid='{0}' AND f_toid='{1}') OR (f_fromid='{1}' AND f_toid='{0}')".format(user_id, friend_id))
            con.commit()
            con.close()
            return 's'
    except:return 'f'


@app.route('/getComment/<int:post_id>&<int:mode>',methods=['POST'])
def getComment(post_id,mode): #mode 0 조회, mode 1 추가, mode 2 수정, mode 3 삭제, mode 4 대댓글 불러오기
    if mode == 0:
        user_id = session.get('id',None)
        #0 cm_id, 1 cm_class, 2 cm_group, 3 cm_uid, 4 cm_created, 5 cm_content
        result = db(True, ["SELECT cm_id,cm_class,cm_group,cm_uid,DATE_FORMAT(cm_created, '%Y-%m-%d %H:%i'),cm_content FROM comment WHERE cm_postID={0} AND cm_group=0".format(post_id)])[0]
        result = list(result)
        result.append(user_id)
        return jsonify(result)
    elif mode == 1:
        cm_class = 0
        gruop = 0
        user_id = session.get('id',None)
        comment = request.form['comment']
        db(False, ["INSERT INTO comment(cm_postID,cm_class,cm_group,cm_uid,cm_created,cm_content) VALUES({0},{1},{2},'{3}',NOW(),'{4}')".format(post_id,cm_class, gruop, user_id, comment)])
        return 'success'
    # elif mode == 2:
    #     cm_id = 댓글 id 
    #     content = 댓글 내용
    #     db(False, ["UPDATE comment SET cm_content = '{0}' WHERE cm_id={1}".format(content, cm_id)])
    #     return 'success'
    elif mode == 3:
        db(False, ["DELETE FROM comment WHERE cm_id={0}".format(post_id)])
        return 'success'
    # else:
    #     #0 cm_id, 1 cm_uid, 2 cm_created, 3 cm_content
    #     comment_id = 댓글 id
    #     result = db(True, ["SELECT cm_id,cm_uid,DATE_FORMAT(cm_created, '%Y-%m-%d %H:%i'),cm_content FROM comment WHERE cm_gruop={1}".format(comment_id)])[0]
    #     return jsonify(result)

@app.route('/declare/<int:id>&<int:isPost>',methods=['POST'])
def declare(id,isPost):
    user_id = session.get('id',None)
    db(False, ["INSERT INTO declare_user(d_isPost,d_cardID,d_uid) VALUES({0},{1},'{2}')".format(isPost,id,user_id)])
    return 'success'



app.run(debug=True)