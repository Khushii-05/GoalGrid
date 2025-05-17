# app/routes/main.py
from flask import Blueprint, render_template, request, redirect, url_for, jsonify
from flask_login import login_required, current_user
from app import db
from app.models.goal import Goal, Progress
from datetime import datetime
import calendar

bp = Blueprint('main', __name__)

@bp.route('/')
@login_required
def index():
    goals = Goal.query.filter_by(user_id=current_user.id, is_active=True).all()
    today = datetime.utcnow()
    month_calendar = calendar.monthcalendar(today.year, today.month)
    month_names = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]
    return render_template(
        'index.html',
        goals=goals,
        calendar=month_calendar,
        month=today.month,
        year=today.year,
        month_names=month_names,
        current_time=today
    )

@bp.route('/calendar')
@login_required
def get_calendar():
    month = request.args.get('month', type=int)
    year = request.args.get('year', type=int)
    today = datetime.today()
    month = month or today.month
    year = year or today.year
    month_calendar = calendar.monthcalendar(year, month)
    return jsonify({
        'calendar': month_calendar,
        'month': month,
        'year': year
    })

@bp.route('/goal', methods=['POST'])
@login_required
def add_goal():
    title = request.form.get('title')
    description = request.form.get('description', '')
    active_goals = Goal.query.filter_by(user_id=current_user.id, is_active=True).count()
    if active_goals >= 5:
        return jsonify({'error': 'Maximum 5 active goals allowed'}), 400
    new_goal = Goal(title=title, description=description, user_id=current_user.id)
    db.session.add(new_goal)
    db.session.commit()
    return redirect(url_for('main.index'))

@bp.route('/goal/<int:goal_id>', methods=['DELETE'])
@login_required
def delete_goal(goal_id):
    goal = Goal.query.filter_by(id=goal_id, user_id=current_user.id).first_or_404()
    goal.is_active = False
    db.session.commit()
    return jsonify({'success': True})

@bp.route('/progress', methods=['POST'])
@login_required
def update_progress():
    goal_id = request.form.get('goal_id', type=int)
    date_str = request.form.get('date')
    status = request.form.get('status')
    notes = request.form.get('notes', '')
    date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()

    progress = Progress.query.filter_by(goal_id=goal_id, user_id=current_user.id, date=date_obj).first()

    if progress:
        progress.status = status
        progress.notes = notes
    else:
        progress = Progress(
            goal_id=goal_id,
            user_id=current_user.id,
            date=date_obj,
            status=status,
            notes=notes
        )
        db.session.add(progress)

    db.session.commit()
    return jsonify({'success': True})

@bp.route('/progress/<int:goal_id>/<string:date>', methods=['GET'])
@login_required
def get_progress(goal_id, date):
    date_obj = datetime.strptime(date, '%Y-%m-%d').date()
    progress = Progress.query.filter_by(goal_id=goal_id, user_id=current_user.id, date=date_obj).first()

    if progress:
        return jsonify({
            'status': progress.status,
            'notes': progress.notes
        })
    else:
        return jsonify({
            'status': 'incomplete',
            'notes': ''
        })
