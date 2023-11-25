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
# TODO db

@app.route('/login/',methods=['POST', 'GET'])
def login():
    if request.method == 'POST':
        uid = request.form.get('id')
        upw = request.form.get('password')
        if len(uid) == 0 or len(upw) == 0:
            return '잘못된 접근'
        con = pymysql.connect(user=U,passwd=P,host=H,db=D,charset='utf8')
        cur = con.cursor()
        cur.execute("SELECT * FROM user WHERE u_id = '{0}' AND u_pw = '{1}';".format(uid, upw))
        t = cur.fetchone()
        con.close()
        if t:
            session["id"] = uid
            return redirect('/')
        else:
            return render_template('login.html')
    else:
        if "id" in session:
            return redirect('/')
        else:
            return render_template('login.html')

@app.route('/logout/',methods=['POST'])
def logout():
    session.pop('id', None)
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
            con = pymysql.connect(user=U,passwd=P,host=H,db=D,charset='utf8')
            cur = con.cursor()
            cur.execute("INSERT INTO user(u_id,u_pw,u_phoneNum) VALUES ('{0}','{1}','{2}');".format(uid,upw,upn))
            con.commit()
            con.close()
            return render_template('signup_done.html')
        except:
            return 'error'
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
        con = pymysql.connect(user=U,passwd=P,host=H,db=D,charset='utf8')
        cur = con.cursor()
        cur.execute("SELECT {0} FROM user WHERE {0}='{1}'".format(name, value))
        t = cur.fetchall()
        con.close()
        return str(len(t)) #중복이면 1, 중복 아니면 0
    except Exception as e:
        return "error"
        


@app.route('/board/')
def board():
    return render_template('board.html', post_list = post_list)

@app.route('/',methods=['POST', 'GET'])
def home():
    if "id" in session: 
        return render_template('home.html', isLogin = True)
    else:
        return render_template('home.html', isLogin = False)

app.run(debug=True)