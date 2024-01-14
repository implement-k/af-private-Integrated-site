from flask import Flask


# EB looks for an 'application' callable by default.
application = Flask(__name__)

@application.route('/')
def login():
    return render_template('login.html',isCorrect=1)

# run the app.
if __name__ == "__main__":
    application.run()