from flask import Blueprint, render_template, jsonify

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def home():
    #return render_template('index.html')
    return jsonify({"message": "You will see home site here", "status": "in progress"})