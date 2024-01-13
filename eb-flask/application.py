from flask import Flask


# EB looks for an 'application' callable by default.
application = Flask(__name__)

@application.route('/',methods=['POST', 'GET'])
def login():
    if request.method == 'POST':
        con = pymysql.connect(user=U,passwd=P,host=H,db=D,charset='utf8')
        cur = con.cursor()
        user_id = request.form.get('id')
        user_pw = request.form.get('password')

        if len(user_id) == 0 or len(user_pw) == 0: return redirect('/login',isCorrect=0)
        
        # cur.execute("SELECT u_id FROM user WHERE u_id = '{0}' AND u_pw = '{1}';".format(user_id, user_pw))
        isUser = len(cur.fetchall())

        if isUser > 0:
            session['id'] = user_id

            # cur.execute("SELECT u_intro FROM user WHERE u_id = '{0}'".format(user_id))
            session['user_intro'] = cur.fetchall()[0][0]

            con.close()
            return redirect('/')
        else:
            con.close()
            return render_template('login.html',isCorrect=0)
    else:
        if "id" in session: return redirect('/')
        else: return render_template('login.html',isCorrect=1)

# run the app.
if __name__ == "__main__":
    # Setting debug to True enables debug output. This line should be
    # removed before deploying a production app.
    application.debug = True
    application.run()