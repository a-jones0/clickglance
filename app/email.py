from threading import Thread
from flask import render_template
from flask_mail import Message
from app import cg_app, mail, db

def send_async_email(cg_app, msg):
    with cg_app.app_context():
        mail.send(msg)

def send_email(subject, sender, recipients, text_body, html_body):
    msg = Message(subject, sender=sender, recipients=recipients)
    msg.body = text_body
    msg.html = html_body
    #mail.send(msg)
    Thread(target=send_async_email, args=(cg_app, msg)).start()

def send_password_reset_email(user):
    token = user.get_token()
    send_email('Reset Your Password',
               sender=cg_app.config['MAIL_USERNAME'], 
               recipients=[user.email],
               text_body=render_template('email/reset_password_email.txt', user=user, token=token),
               html_body=render_template('email/reset_password_email.html', user=user, token=token))
    
def send_activate_account_email(user):
    token = user.get_token(token_type="activate_account", expires_in=3600)
    user.activate_token = token
    db.session.commit()
    send_email('Verify your Email Address',
               sender=cg_app.config['MAIL_USERNAME'], 
               recipients=[user.email],
               text_body=render_template('email/activate_account_email.txt', user=user, token=token),
               html_body=render_template('email/activate_account_email.html', user=user, token=token))

def send_delete_account_email(user_email, username):
    send_email('[ClickGlance] Your account has been deleted',
               sender=cg_app.config['MAIL_USERNAME'], 
               recipients=[user_email],
               text_body=render_template('email/delete_account_email.txt', username=username),
               html_body=render_template('email/delete_account_email.html', username=username))