from flask import Flask, Blueprint, render_template

frontpage_bp = Blueprint("frontpage", __name__, static_folder="static", template_folder="templates")

@frontpage_bp.route('/')
def frontpage():
    return "This is frontpage"