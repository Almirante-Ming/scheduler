
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_cors import cross_origin
from werkzeug.exceptions import BadRequest, NotFound
from lumus.models.schedule import Schedule
from lumus.models.course import Course
from lumus.config.database import db
from lumus.utils.auth import require_permission
from datetime import datetime, date


schedule_bp = Blueprint('schedule', __name__, url_prefix='/api/schedules')


@schedule_bp.route('/public', methods=['GET'])
@cross_origin()
def get_schedules_public():
    """Get all schedules without authentication (for guest access)"""
    try:
        schedules = Schedule.query.all()
        
        return jsonify({
            'schedules': [schedule.to_dict() for schedule in schedules],
            'total': len(schedules)
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Internal server error'
        }), 500


@schedule_bp.route('/public', methods=['POST'])
@cross_origin()
def create_schedule_public():
    """Create a schedule without authentication (for guest access) - DEPRECATED: Use main endpoint"""
    return jsonify({
        'error': 'This endpoint is deprecated. Use POST /api/schedules instead.'
    }), 410  # Gone


@schedule_bp.route('', methods=['GET'])
@cross_origin()
def get_schedules():
    """Get all schedules with pagination and filtering"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 10, type=int), 100)
        
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        lab_nickname = request.args.get('lab_nickname')
        course_code = request.args.get('course_code')
        user_id = request.args.get('user_id')
        status = request.args.get('status')
        
        query = Schedule.query
        
        if start_date:
            try:
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
                query = query.filter(Schedule.date >= start_date)
            except ValueError:
                return jsonify({'error': 'Invalid start_date format. Use YYYY-MM-DD'}), 400
        
        if end_date:
            try:
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
                query = query.filter(Schedule.date <= end_date)
            except ValueError:
                return jsonify({'error': 'Invalid end_date format. Use YYYY-MM-DD'}), 400
        
        if lab_nickname:
            query = query.filter(Schedule.lab_nickname == lab_nickname)
        
        if course_code:
            query = query.filter(Schedule.course_code == course_code)
        
        if user_id:
            query = query.filter(Schedule.user_id == user_id)
        
        if status:
            query = query.filter(Schedule.status == status)
        
        query = query.order_by(Schedule.date.desc(), Schedule.created_at.desc())
        
        paginated = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        schedules = [schedule.to_dict() for schedule in paginated.items]
        
        return jsonify({
            'schedules': schedules,
            'pagination': {
                'page': paginated.page,
                'pages': paginated.pages,
                'per_page': paginated.per_page,
                'total': paginated.total
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@schedule_bp.route('/<int:schedule_id>', methods=['GET'])
@jwt_required()
@require_permission('read_schedule')
def get_schedule(schedule_id):
    """Get a specific schedule"""
    try:
        schedule = Schedule.query.get_or_404(schedule_id)
        return jsonify(schedule.to_dict())
    except NotFound:
        return jsonify({'error': 'Schedule not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@schedule_bp.route('', methods=['POST'])
@cross_origin()
def create_schedule():
    """Create a new schedule"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        required_fields = ['date', 'times', 'user_name', 'course_code']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        try:
            schedule_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        
        if not isinstance(data['times'], list):
            return jsonify({'error': 'Times must be a list'}), 400
        
        course_exists = True
        try:
            course = Course.query.filter_by(course_code=data['course_code']).first()
            if not course:
                course_exists = False
                print(f"Warning: Course {data['course_code']} not found, but allowing booking")
        except Exception as e:
            print(f"Warning: Could not check course existence: {e}")
            course_exists = False
        
        from lumus.models.schedule import RepeatType, BookingStatus
        
        repeat_type_str = data.get('repeat_type', 'NONE').upper()
        try:
            repeat_type = RepeatType(repeat_type_str.lower())
        except ValueError:
            repeat_type = RepeatType.NONE
        
        status_str = data.get('status', 'PENDING').upper()
        try:
            status = BookingStatus(status_str.lower())
        except ValueError:
            status = BookingStatus.PENDING
        
        schedule_data = {
            'date': schedule_date,
            'times': data['times'],
            'user_name': data['user_name'],
            'course_code': data['course_code'],
            'annotation': data.get('annotation', ''),
            'repeat_type': repeat_type,
            'lab_nickname': data.get('lab_nickname', 'LAB01'),
            'status': status,
            'user_id': data.get('user_id', 'guest')
        }
        
        from sqlalchemy import text
        
        sql = text("""
            INSERT INTO schedules (date, times, user_name, course_code, annotation, repeat_type, lab_nickname, status, user_id, created_at, updated_at)
            VALUES (:date, :times, :user_name, :course_code, :annotation, :repeat_type, :lab_nickname, :status, :user_id, datetime('now'), datetime('now'))
        """)
        
        import json
        times_json = json.dumps(data['times'])
        
        result = db.session.execute(sql, {
            'date': schedule_date.isoformat(),
            'times': times_json,
            'user_name': data['user_name'],
            'course_code': data['course_code'],
            'annotation': data.get('annotation', ''),
            'repeat_type': repeat_type.value.upper(),  # Use uppercase
            'lab_nickname': data.get('lab_nickname', 'LAB01'),
            'status': status.value.upper(),  # Use uppercase
            'user_id': data.get('user_id', 'guest')
        })
        
        db.session.commit()
        
        latest_schedule = db.session.execute(text("""
            SELECT id, date, times, user_name, course_code, annotation, repeat_type, lab_nickname, status, user_id
            FROM schedules 
            WHERE user_name = :user_name AND course_code = :course_code AND date = :date
            ORDER BY id DESC LIMIT 1
        """), {
            'user_name': data['user_name'],
            'course_code': data['course_code'],
            'date': schedule_date.isoformat()
        }).fetchone()
        
        if latest_schedule:
            created_schedule = {
                'id': latest_schedule[0],
                'date': latest_schedule[1],
                'times': json.loads(latest_schedule[2]) if isinstance(latest_schedule[2], str) else latest_schedule[2],
                'user_name': latest_schedule[3],
                'course_code': latest_schedule[4],
                'annotation': latest_schedule[5] or '',
                'repeat_type': latest_schedule[6].upper() if latest_schedule[6] else 'NONE',
                'lab_nickname': latest_schedule[7],
                'status': latest_schedule[8].upper() if latest_schedule[8] else 'PENDING',
                'user_id': latest_schedule[9]
            }
        else:
            created_schedule = {
                'id': 'unknown',
                'date': schedule_date.isoformat(),
                'times': data['times'],
                'user_name': data['user_name'],
                'course_code': data['course_code'],
                'annotation': data.get('annotation', ''),
                'repeat_type': repeat_type.value.upper(),
                'lab_nickname': data.get('lab_nickname', 'LAB01'),
                'status': status.value.upper(),
                'user_id': data.get('user_id', 'guest')
            }
        
        return jsonify(created_schedule), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error creating schedule: {str(e)}")
        print(f"Request data: {data}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500


@schedule_bp.route('/<int:schedule_id>', methods=['PUT'])
@jwt_required()
@require_permission('update_schedule')
def update_schedule(schedule_id):
    """Update a schedule"""
    try:
        schedule = Schedule.query.get_or_404(schedule_id)
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        if 'date' in data:
            try:
                schedule_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
                schedule.date = schedule_date
            except ValueError:
                return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        
        if 'times' in data:
            if not isinstance(data['times'], list):
                return jsonify({'error': 'Times must be a list'}), 400
            schedule.times = data['times']
        
        if 'course_code' in data:
            course = Course.query.filter_by(course_code=data['course_code']).first()
            if not course:
                return jsonify({'error': 'Course not found'}), 404
            schedule.course_code = data['course_code']
        
        for field in ['lab_nickname', 'user_id', 'user_name', 'annotation', 'repeat_type', 'status']:
            if field in data:
                setattr(schedule, field, data[field])
        
        db.session.commit()
        
        return jsonify(schedule.to_dict())
        
    except NotFound:
        return jsonify({'error': 'Schedule not found'}), 404
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@schedule_bp.route('/<int:schedule_id>', methods=['DELETE'])
@jwt_required()
@require_permission('delete_schedule')
def delete_schedule(schedule_id):
    """Delete a schedule"""
    try:
        schedule = Schedule.query.get_or_404(schedule_id)
        
        db.session.delete(schedule)
        db.session.commit()
        
        return jsonify({'message': 'Schedule deleted successfully'})
        
    except NotFound:
        return jsonify({'error': 'Schedule not found'}), 404
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@schedule_bp.route('/by-date/<date_str>', methods=['GET'])
@cross_origin()
def get_schedules_by_date(date_str):
    """Get schedules for a specific date (public access)"""
    try:
        try:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        
        schedules = Schedule.query.filter_by(date=target_date).all()
        
        return jsonify([schedule.to_dict() for schedule in schedules])
        
    except Exception as e:
        import traceback
        print(f"Error in get_schedules_by_date: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500


@schedule_bp.route('/by-date-auth/<date_str>', methods=['GET'])
@jwt_required()
@require_permission('read_schedule')
def get_schedules_by_date_auth(date_str):
    """Get schedules for a specific date (authenticated access)"""
    try:
        try:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        
        schedules = Schedule.query.filter_by(date=target_date).all()
        
        return jsonify({
            'date': date_str,
            'schedules': [schedule.to_dict() for schedule in schedules],
            'total': len(schedules)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@schedule_bp.route('/by-lab/<lab_nickname>', methods=['GET'])
@jwt_required()
@require_permission('read_schedule')
def get_schedules_by_lab(lab_nickname):
    """Get schedules for a specific lab"""
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        query = Schedule.query.filter_by(lab_nickname=lab_nickname)
        
        if start_date:
            try:
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
                query = query.filter(Schedule.date >= start_date)
            except ValueError:
                return jsonify({'error': 'Invalid start_date format. Use YYYY-MM-DD'}), 400
        
        if end_date:
            try:
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
                query = query.filter(Schedule.date <= end_date)
            except ValueError:
                return jsonify({'error': 'Invalid end_date format. Use YYYY-MM-DD'}), 400
        
        schedules = query.order_by(Schedule.date.asc()).all()
        
        return jsonify({
            'lab_nickname': lab_nickname,
            'schedules': [schedule.to_dict() for schedule in schedules],
            'total': len(schedules)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
