from flask import Flask, render_template, url_for, request, session, redirect
from connect_afpsDB import U,P,H,D
import pymysql
import uuid
import re

app = Flask(__name__)
app.secret_key = uuid.uuid4().hex

post_list = [
    {'id':'1', 'favorite':0, 'user':'권구현', 'title':'제목제목asdfasdfasdf', 'content':'ㅁㄴㅇㄻㄴㅇㄻㄴㅇㄻㄴㅇㄻㄴㅇㄻㄹㄴㅇ', 'created':'11'},
    {'id':'2', 'favorite':100, 'user':'일구현', 'title':'제목제asdfasdf목', 'content':'ㅁㄴㅇㄻㄴㅇㄻㄴㅇㄻㄴㅇㄻㄴㅇㄻㄹㄴㅇㅁㄴㅇㄹㅁㄴㅇㄹ','created':'11'},
    {'id':'3', 'favorite':200, 'user':'이구현', 'title':'제목', 'content':'ㅁㄴㅇㄻㄴㅇㄻㄴㅇㄻㄴㅇㄻㄴㅇㄻㄹㄴㅇㄴㅇㄻㄴㅇㄻㄴㅇㄻㄴㅇㄻㄴㅇㄻㄹㄴㅇㄴㅇㄻㄴㅇㄻㄴㅇㄻㄴㅇㄻㄴㅇㄻㄹㄴㅇㄴㅇㄻㄴㅇㄻㄴㅇㄻㄴㅇㄻㄴㅇㄻㄹㄴㅇ','created':'11'},
    {'id':'4', 'favorite':39, 'user':'삼구현', 'title':'목', 'content':'ㅁㄴㅇㄻㄴㅇㄻㄴㅇㄻ','created':'11'},
    {'id':'5', 'favorite':2, 'user':'사구현', 'title':'제목제목', 'content':'ㅁㄴㅇㄻㄴㅇㄻㄴㅇㄻㄴㅇㄻㄴㅇㄻㄹㄴㅇ','created':'11'}
]

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
        uid = request.form.get('id')
        upw = request.form.get('password')
        if len(uid) == 0 or len(upw) == 0:
            return redirect('/login')
        t = len(db(True, ["SELECT u_id FROM user WHERE u_id = '{0}' AND u_pw = '{1}';".format(uid, upw)])[0])
        if t > 0:
            session['id'] = uid
            cl = db(True, ["SELECT u_clike1,u_clike2,u_clike3 FROM user WHERE u_id = '{0}'".format(uid)])
            n = cl[0][0]
            for i in range(3):
                session[str(i+1)] = n[i]
                    
            return redirect('/')
        else:
            return render_template('login.html')
    else:
        if "id" in session:
            return redirect('/')
        else:
            return render_template('login.html')

@app.route('/logout/')
def logout():
    if session.get('id', None):
        session.pop('id',None)
        for i in range(3):
            s = 'c_like' + str(i+1)
            session.pop(s, None)
    return redirect('/')

@app.route('/signup/',methods=['POST', 'GET'])
def signup():
    if request.method == 'POST':
        try:
            uid = request.form.get('id')
            upw = request.form.get('pw_dub')
            upn = request.form.get('num').replace("-", "")
            vid = '^[A-Za-z0-9._]{1,20}$'
            vpw = '^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,25}$'
            if not re.fullmatch(vid, uid) or not re.fullmatch(vpw, upw):
                return '잘못된 접근'
            db(False, ["INSERT INTO user(u_id,u_pw,u_phoneNum) VALUES ('{0}','{1}','{2}');".format(uid,upw,upn)])
            return render_template('signup_done.html')
        except: return 'error'
    else:
        if "id" in session:
            return redirect('/')
        else:
            return render_template('signup.html')

@app.route('/isDub',methods=['POST'])
def dubCheck():
    try:
        name = request.form['name']
        value = request.form['value']
        return str(len(db(True, ["SELECT {0} FROM user WHERE {0}='{1}'".format(name, value)]))[0]) #중복이면 1, 중복 아니면 0
    except Exception as e:
        return "error"

@app.route('/LikeClass/<int:isAdd>',methods=['POST'])
def likeClass(isAdd):
    if isAdd == 1:
        cid = request.form['classID']
        try:
            uid = session.get('id', None)
            x = -1
            for i in range(3):
                if session.get(str(i+1), None) == 0:
                    x = i
                    break
            
            db(False, ["UPDATE user SET u_clike{0} = {1} WHERE u_id = '{2}'".format(str(x+1), cid, uid)])
            session[str(x+1)] = cid #세션 다시 불러오기
            if x == -1: return 'f'
            else: return 's'
        except:
            return redirect('/board/'+str(cid))
    else:
        cid = request.form['classID']
        try:
            uid = session.get('id', None)
            x = -1
            for i in range(3):
                if session.get(str(i+1), None) == cid:
                    x = i+1
                    break
            
            db(False, ["UPDATE user SET u_clike{0} = {1} WHERE u_id = '{2}'".format(str(x), 0, uid)])
            session.pop(str(x),None)#세션 다시 불러오기
            return 's'
        except:
            return redirect('/board/'+str(cid))
        

@app.route('/board/<int:isShow>&<int:class_id>&<class_name>',methods=['POST', 'GET'])
def board(isShow, class_id, class_name):        #isShow 1: 글보기, isShow 0: 글작성
    user_id = session.get('id', None)
    class_info = [class_id, class_name]     #index 0: class id, index 1: class name
    if isShow == 1:
        isLiked = [0 for i in range(100)]

        if not user_id and class_id != 1: return redirect('/login')     #로그인 안하거나 익명도 글 작성이 가능한 게시판이 아니라면 로그인페이지로 리다이렉트

        post_list = db(True, ["SELECT * FROM posts WHERE p_classification = {0}".format(class_id)])[0]
        
        #좋아요 눌렀는지 확인 => 캐시로 해도 될 것 같음
        isLike = 0
        for i in range(3):
            cid = session.get(str(i+1), None)
            if cid != 0 and cid != None: isLiked[cid-1] = 1

        if isLiked[class_id-1] == 1:
            isLike = 1

        return render_template('board.html', post_list=post_list, uid=user_id, class_info=class_info, isLiked=isLike)
    elif isShow == 0:
        if not user_id and class_id != 1: return redirect('/login')
        else: return render_template('write.html', class_info = class_info)



@app.route('/',methods=['POST', 'GET'])
def home():
    uid = session.get('id', None)
    cnt = 0
    if uid:
        sql = ["SELECT * FROM post_class"]
        classLikeList = []

        for i in range(3):
            cid = session.get(str(i+1), None)
            if cid != 0:
                sql.append("SELECT c_name FROM post_class WHERE c_id = {0}".format(cid))
                classLikeList.append([cid])
                
                cnt += 1
                
        result = db(True, sql)
        classList = result[0]

        for i in range(cnt):
            classLikeList[i].append(result[i+1][0][0])
            
        return render_template('home.html', postClass_list = classList , postClass_likeList=classLikeList)
    else:
        return redirect('/board/1')

app.run(debug=True)