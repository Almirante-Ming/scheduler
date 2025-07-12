from flask import Blueprint, jsonify, request, make_response
from flask_cors import cross_origin
from flask_jwt_extended import jwt_required, get_jwt_identity
from lumus.models.base import db
from lumus.models.schedule import Schedule
from sqlalchemy import distinct

lab_bp = Blueprint('lab', __name__, url_prefix='/api/labs')

@lab_bp.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response

LABS = [
    {'nickname': 'LAB01', 'name': 'Computer Lab 1', 'capacity': 30, 'location': 'Building A - Floor 1'},
    {'nickname': 'LAB02', 'name': 'Computer Lab 2', 'capacity': 25, 'location': 'Building A - Floor 1'},
    {'nickname': 'LAB03', 'name': 'Computer Lab 3', 'capacity': 35, 'location': 'Building A - Floor 2'},
    {'nickname': 'LAB04', 'name': 'Networking Lab', 'capacity': 20, 'location': 'Building B - Floor 1'},
    {'nickname': 'LAB05', 'name': 'Hardware Lab', 'capacity': 15, 'location': 'Building B - Floor 2'}
]

@lab_bp.route('/', methods=['GET', 'OPTIONS'])
@lab_bp.route('', methods=['GET', 'OPTIONS'])
@cross_origin()
def get_labs():
    """Get all available labs"""
    try:
        labs_with_stats = []
        for lab in LABS:
            active_schedules = Schedule.query.filter_by(
                lab_nickname=lab['nickname'],
                status='CONFIRMED'
            ).count()
            
            lab_data = {
                **lab,
                'active_bookings': active_schedules,
                'available': True  # Could be enhanced with real availability logic
            }
            labs_with_stats.append(lab_data)
        
        return jsonify({
            'labs': labs_with_stats,
            'total': len(labs_with_stats)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@lab_bp.route('/', methods=['POST', 'OPTIONS'])
@lab_bp.route('', methods=['POST', 'OPTIONS'])
@cross_origin()
def create_lab():
    """Create a new lab (only for authenticated users)"""
    try:
        data = request.get_json()
        
        if not data or not all(field in data for field in ['name', 'nickname', 'capacity']):
            return jsonify({'error': 'Missing required fields: name, nickname, capacity'}), 400
            
        if any(lab['nickname'] == data['nickname'] for lab in LABS):
            return jsonify({'error': 'Lab nickname already exists'}), 409
        
        new_lab = {
            'nickname': data['nickname'],
            'name': data['name'],
            'capacity': int(data['capacity']),
            'location': data.get('location', ''),
            'active_bookings': 0,
            'available': True
        }
        
        LABS.append(new_lab)
        
        return jsonify(new_lab), 201
        
    except ValueError:
        return jsonify({'error': 'Invalid capacity value'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@lab_bp.route('/<nickname>', methods=['GET'])
@cross_origin()
def get_lab(nickname):
    """Get specific lab by nickname"""
    try:
        lab = next((lab for lab in LABS if lab['nickname'] == nickname), None)
        if not lab:
            return jsonify({'error': 'Lab not found'}), 404
        
        active_schedules = Schedule.query.filter_by(
            lab_nickname=nickname,
            status='CONFIRMED'
        ).count()
        
        lab_data = {
            **lab,
            'active_bookings': active_schedules,
            'available': True
        }
        
        return jsonify(lab_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@lab_bp.route('/<nickname>/availability', methods=['GET'])
@cross_origin()
def get_lab_availability(nickname):
    """Get lab availability for a specific date range"""
    try:
        lab = next((lab for lab in LABS if lab['nickname'] == nickname), None)
        if not lab:
            return jsonify({'error': 'Lab not found'}), 404
        
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        query = Schedule.query.filter_by(
            lab_nickname=nickname,
            status='CONFIRMED'
        )
        
        if start_date:
            query = query.filter(Schedule.date >= start_date)
        if end_date:
            query = query.filter(Schedule.date <= end_date)
        
        schedules = query.all()
        
        return jsonify({
            'lab': lab,
            'schedules': [{
                'id': s.id,
                'date': s.date.isoformat(),
                'times': s.times,
                'user_name': s.user_name,
                'course_code': s.course_code,
                'annotation': s.annotation
            } for s in schedules],
            'total_bookings': len(schedules)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
