from flask import Flask, render_template, Blueprint


auth_bp = Blueprint("auth", __name__, template_folder="templates", static_folder="static")

@auth_bp.route('/login')
def login():
    return "Login Page"

@auth_bp.route('/signup')
def signUp():
    return "Sign Up Page"