from flask import Blueprint, render_template, redirect, url_for, request, flash, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_user, login_required, logout_user
from flask_limiter.util import get_remote_address
from flask_limiter import Limiter

from db import db
from models import User

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')
limiter = Limiter(get_remote_address, app=None, default_limits=["5 per minute"])

@auth_bp.route('/login', methods=['GET', 'POST'])
@limiter.limit("5 per minute")
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter_by(username=username).first()

        if user and check_password_hash(user.password, password):
            login_user(user)
            flash('Logged in successfully!', 'success')
            return redirect(url_for('dashboard.dashboard'))
        else:
            flash('Invalid credentials, try again.', 'danger')
    # return render_template('login.html')
    return jsonify({"message": "You will login here", "status": "in progress"})

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password1 = request.form['password1']
        password2 = request.form['password2']

        if password1 != password2:
            flash('Passwords should be the same.', 'danger')
            return redirect(url_for('auth.register'))

        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            flash('Username is already taken. Please choose another one.', 'danger')
            return redirect(url_for('auth.register'))
        
        hashed_password = generate_password_hash(password1, method='scrypt')
        new_user = User(username=username, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()

        flash('Account created successfully!', 'success')
        return redirect(url_for('auth.login'))
    return jsonify({"message": "You will register here", "status": "in progress"})
    #return render_template('register.html')

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('auth.login'))
