from flask import Flask, render_template, url_for, request, session, redirect
from connect_afpsDB import U,P,H,D
import pymysql, uuid, re

app = Flask(__name__)
app.secret_key = uuid.uuid4().hex


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

        if len(user_id) == 0 or len(user_pw) == 0: return redirect('/login')
        
        cur.execute("SELECT u_id FROM user WHERE u_id = '{0}' AND u_pw = '{1}';".format(user_id, user_pw))
        isUser = len(cur.fetchall())

        if isUser > 0:
            session['id'] = user_id

            cur.execute("SELECT u_clike1,u_clike2,u_clike3 FROM user WHERE u_id = '{0}'".format(user_id))
            classLike_list = cur.fetchall()[0]

            for i in range(3): session[str(i+1)] = classLike_list[i]

            con.close()
            return redirect('/')
        else:
            con.close()
            return render_template('login.html')
    else:
        if "id" in session: return redirect('/')
        else: return render_template('login.html')


@app.route('/logout/')
def logout():
    if "id" in session:
        session.pop('id',None)

        for i in range(3): session.pop(str(i+1), None)

    return redirect('/')


@app.route('/signup/',methods=['POST', 'GET'])
def signup():
    if request.method == 'POST':
        try:
            user_id = request.form.get('id')
            user_pw = request.form.get('pw_dub')
            user_phoneNumber = request.form.get('num').replace("-", "")
            valid_id = '^[A-Za-z0-9._]{1,20}$'
            valid_pw = '^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,25}$'

            if not re.fullmatch(valid_id, user_id) or not re.fullmatch(valid_pw, user_pw): return '잘못된 접근'

            db(False, ["INSERT INTO user(u_id,u_pw,u_phoneNum) VALUES ('{0}','{1}','{2}');".format(user_id, user_pw, user_phoneNumber)])
            return render_template('signup_done.html')
        except: return 'error'
    else:
        if "id" in session: return redirect('/')
        else: return render_template('signup.html')
        

@app.route('/board/<int:isShow>&<int:class_id>&<class_name>',methods=['POST', 'GET'])
def board(isShow, class_id, class_name):    #isShow 1: 글보기, isShow 0: 글작성
    user_id = session.get('id', None)
    class_info = [class_id, class_name]     #index 0: class id, index 1: class name

    if isShow == 1:
        isLiked = [0 for i in range(100)]

        if not user_id and class_id != 1: return redirect('/login')     #로그인 안하거나 익명도 글 작성이 가능한 게시판이 아니라면 로그인페이지로 리다이렉트

        post_list = db(True, ["SELECT * FROM posts WHERE p_classification = {0}".format(class_id)])[0]
        
        #TODO start 좋아요 눌렀는지 확인 => 
        isLike = 0
        for i in range(3):
            cid = session.get(str(i+1), None)
            if cid != 0 and cid != None: isLiked[cid-1] = 1

        if isLiked[class_id-1] == 1:
            isLike = 1
        #TODO end 좋아요 눌렀는지 확인 => 

        return render_template('board.html', post_list=post_list, uid=user_id, class_info=class_info, isLiked=isLike)
    elif isShow == 0:
        if not user_id and class_id != 1: return redirect('/login')
        else: return render_template('write.html', class_info = class_info)


@app.route('/',methods=['POST', 'GET'])
def home():
    if "id" in session:
        liked_class_list = []
                
        class_list = db(True, ["SELECT * FROM post_class"])[0]

        for i in range(3):
            class_id = session.get(str(i+1), None)
            for c in class_list:
                if class_id == c[0]:
                    liked_class_list.append([class_id, c[1]])
                    break
            
        return render_template('home.html', class_list=class_list, liked_class_list=liked_class_list)
    else:
        return redirect('/board/1&1&계룡대')


#TODO 좋아요 누르는 쿼리 다시 짜기
@app.route('/likeClass/<int:isAdd>',methods=['POST'])
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


@app.route('/isDub',methods=['POST'])
def dubCheck():
    try:
        name = request.form['name']
        value = request.form['value']
        return str(len(db(True, ["SELECT {0} FROM user WHERE {0}='{1}'".format(name, value)]))[0]) #중복이면 1, 중복 아니면 0
    except Exception as e:
        return "error"


app.run(debug=True)