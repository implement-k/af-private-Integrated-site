from flask import Flask, render_template,url_for,request

app = Flask(__name__)

post_list = [
    {'id':'1', 'favorite':0, 'user':'권구현', 'title':'제목제목asdfasdfasdf', 'content':'ㅁㄴㅇㄻㄴㅇㄻㄴㅇㄻㄴㅇㄻㄴㅇㄻㄹㄴㅇ', 'created':'11'},
    {'id':'2', 'favorite':100, 'user':'일구현', 'title':'제목제asdfasdf목', 'content':'ㅁㄴㅇㄻㄴㅇㄻㄴㅇㄻㄴㅇㄻㄴㅇㄻㄹㄴㅇㅁㄴㅇㄹㅁㄴㅇㄹ','created':'11'},
    {'id':'3', 'favorite':200, 'user':'이구현', 'title':'제목', 'content':'ㅁㄴㅇㄻㄴㅇㄻㄴㅇㄻㄴㅇㄻㄴㅇㄻㄹㄴㅇㄴㅇㄻㄴㅇㄻㄴㅇㄻㄴㅇㄻㄴㅇㄻㄹㄴㅇㄴㅇㄻㄴㅇㄻㄴㅇㄻㄴㅇㄻㄴㅇㄻㄹㄴㅇㄴㅇㄻㄴㅇㄻㄴㅇㄻㄴㅇㄻㄴㅇㄻㄹㄴㅇ','created':'11'},
    {'id':'4', 'favorite':39, 'user':'삼구현', 'title':'목', 'content':'ㅁㄴㅇㄻㄴㅇㄻㄴㅇㄻ','created':'11'},
    {'id':'5', 'favorite':2, 'user':'사구현', 'title':'제목제목', 'content':'ㅁㄴㅇㄻㄴㅇㄻㄴㅇㄻㄴㅇㄻㄴㅇㄻㄹㄴㅇ','created':'11'}
]
# TODO db

@app.route('/login/')
def login():
    return render_template('login.html')

@app.route('/signup/',methods=['POST', 'GET'])
def signup():
    if request.method == 'POST':
        return render_template('signup_done.html')
    else:
        return render_template('signup.html')

@app.route('/board/')
def board():
    return render_template('board.html', post_list = post_list)

@app.route('/')
def home():
    return render_template('home.html')

app.run(debug=True)