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

@app.route('/addLikeClass',methods=['POST'])
def likeClass():
    try:
        cid = request.form['classID']
        uid = session.get('id', None)
        cl = db(True, ["SELECT u_clike1,u_clike2,u_clike3 FROM user WHERE u_id = '{0}'".format(uid)])
        n = cl[0][0]
        checkClass = []
        cnt = 0
        for i in range(3):
            if n[i] == 0:
                db(False, ["UPDATE user SET u_clike{0} = {1} WHERE u_id = '{2}'".format(str(i+1), cid, uid)])
                return 's'
            else:
                cnt += 1
        if cnt == 3:
            return 'f'
    except:
        return redirect('/')
        
@app.route('/board/<int:page_id>')
def board(page_id):
    uid = session.get('id', None)
    if not uid and page_id != 1:
        return redirect('/login')
    sql = ["SELECT * FROM posts WHERE p_classification = {0}".format(page_id),"SELECT c_name FROM post_class WHERE c_id = {0}".format(page_id)]
    op = db(True, sql)
    posts = op[0]
    pn = op[1]
    return render_template('board.html', post_list = posts, uid = uid, post_name = pn[0][0], page_id = page_id)

@app.route('/write/board/<int:page_id>')
def write(page_id):
    return render_template('write.html', n = str(page_id))


@app.route('/',methods=['POST', 'GET'])
def home():
    uid = session.get('id', None)
    if uid:
        op = db(True, ["SELECT * FROM post_class","SELECT u_clike1,u_clike2,u_clike3 FROM user WHERE u_id = '{0}'".format(uid)])
        classList = op[0]
        n = op[1][0]
        classLikeList = []
        for i in range(3):
            if n[i] != 0:
                for ii in range(len(classList)):
                    if n[i] == classList[0]:
                        classLikeList.append([n[i], classList[2]])
                        break

        return render_template('home.html', postClass_list = classList , postClass_likeList=classLikeList)
    else:
        return redirect('/board/1')

app.run(debug=True)