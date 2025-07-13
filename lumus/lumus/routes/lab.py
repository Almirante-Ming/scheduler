from flask import Blueprint, jsonify, request, make_response
from flask_cors import cross_origin
from flask_jwt_extended import jwt_required, get_jwt_identity
from lumus.models.base import db
from lumus.models.schedule import Schedule
from lumus.models.lab import Lab
from sqlalchemy import distinct

lab_bp = Blueprint('lab', __name__, url_prefix='/api/labs')

@lab_bp.route('/', methods=['GET', 'OPTIONS'])
@lab_bp.route('', methods=['GET', 'OPTIONS'])
@cross_origin()
def get_labs():
    """Get all available labs"""
    try:
        labs = Lab.get_active_labs()
        labs_with_stats = []
        
        for lab in labs:
            lab_data = lab.to_dict()
            lab_data['active_bookings'] = lab.get_active_bookings_count()
            lab_data['available'] = True  # Could be enhanced with real availability logic
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
            
        # Check if lab nickname already exists
        if Lab.get_by_nickname(data['nickname']):
            return jsonify({'error': 'Lab nickname already exists'}), 409
        
        # Create new lab
        new_lab = Lab()
        new_lab.nickname = data['nickname']  # type: ignore
        new_lab.name = data['name']  # type: ignore
        new_lab.capacity = int(data['capacity'])  # type: ignore
        new_lab.location = data.get('location', '')  # type: ignore
        new_lab.description = data.get('description', '')  # type: ignore
        new_lab.is_active = True  # type: ignore
        
        db.session.add(new_lab)
        db.session.commit()
        
        lab_data = new_lab.to_dict()
        lab_data['active_bookings'] = 0
        lab_data['available'] = True
        
        return jsonify(lab_data), 201
        
    except ValueError:
        return jsonify({'error': 'Invalid capacity value'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@lab_bp.route('/<nickname>', methods=['GET'])
@cross_origin()
def get_lab(nickname):
    """Get specific lab by nickname"""
    try:
        lab = Lab.get_by_nickname(nickname)
        if not lab:
            return jsonify({'error': 'Lab not found'}), 404
        
        lab_data = lab.to_dict()
        lab_data['active_bookings'] = lab.get_active_bookings_count()
        lab_data['available'] = True
        
        return jsonify(lab_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@lab_bp.route('/<nickname>/availability', methods=['GET'])
@cross_origin()
def get_lab_availability(nickname):
    """Get lab availability for a specific date range"""
    try:
        lab = Lab.get_by_nickname(nickname)
        if not lab:
            return jsonify({'error': 'Lab not found'}), 404
        
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        schedules = lab.get_availability_for_date_range(start_date, end_date)
        
        return jsonify({
            'lab': lab.to_dict(),
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
