
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_cors import cross_origin
from werkzeug.exceptions import BadRequest, NotFound
from lumus.models.course import Course
from lumus.models.student import Student
from lumus.config.database import db
from lumus.utils.auth import require_permission


course_bp = Blueprint('course', __name__, url_prefix='/api/courses')


@course_bp.route('/public', methods=['GET'])
@cross_origin()
def get_courses_public():
    """Get all courses without authentication (for guest access)"""
    try:
        courses = Course.query.all()
        
        return jsonify({
            'courses': [course.to_dict() for course in courses],
            'total': len(courses)
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Internal server error'
        }), 500


@course_bp.route('', methods=['GET'])
def get_courses():
    """Get all courses with pagination and filtering"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 10, type=int), 100)
        search = request.args.get('search', '')
        period = request.args.get('period', '')
        
        query = Course.query
        
        if search:
            query = query.filter(
                (Course.name.ilike(f'%{search}%')) |
                (Course.nickname.ilike(f'%{search}%')) |
                (Course.course_code.ilike(f'%{search}%'))
            )
        
        if period:
            query = query.filter(Course.period == period)
        
        paginated = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        courses = [course.to_dict() for course in paginated.items]
        
        return jsonify({
            'courses': courses,
            'pagination': {
                'page': paginated.page,
                'pages': paginated.pages,
                'per_page': paginated.per_page,
                'total': paginated.total
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@course_bp.route('/<int:course_id>', methods=['GET'])
@jwt_required()
@require_permission('read_course')
def get_course(course_id):
    """Get a specific course"""
    try:
        course = Course.query.get_or_404(course_id)
        return jsonify(course.to_dict(include_students=True))
    except NotFound:
        return jsonify({'error': 'Course not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@course_bp.route('', methods=['POST'])
@jwt_required()
@require_permission('create_turma')
def create_course():
    """Create a new course"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        required_fields = ['name', 'nickname', 'course_code', 'period']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        existing_course = Course.query.filter_by(course_code=data['course_code']).first()
        if existing_course:
            return jsonify({'error': 'Course code already exists'}), 409
        
        course = Course(
            name=data['name'],
            nickname=data['nickname'],
            course_code=data['course_code'],
            period=data['period'],
            capacity=data.get('capacity', 30),
            description=data.get('description', '')
        )
        
        db.session.add(course)
        db.session.commit()
        
        return jsonify(course.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@course_bp.route('/<int:course_id>', methods=['PUT'])
@jwt_required()
@require_permission('update_course')
def update_course(course_id):
    """Update a course"""
    try:
        course = Course.query.get_or_404(course_id)
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        for field in ['name', 'nickname', 'course_code', 'period', 'capacity', 'description']:
            if field in data:
                setattr(course, field, data[field])
        
        db.session.commit()
        
        return jsonify(course.to_dict())
        
    except NotFound:
        return jsonify({'error': 'Course not found'}), 404
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@course_bp.route('/<int:course_id>', methods=['DELETE'])
@jwt_required()
@require_permission('delete_course')
def delete_course(course_id):
    """Delete a course"""
    try:
        course = Course.query.get_or_404(course_id)
        
        if course.students:
            return jsonify({'error': 'Cannot delete course with enrolled students'}), 409
        
        db.session.delete(course)
        db.session.commit()
        
        return jsonify({'message': 'Course deleted successfully'})
        
    except NotFound:
        return jsonify({'error': 'Course not found'}), 404
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@course_bp.route('/<int:course_id>/students', methods=['GET'])
@jwt_required()
@require_permission('read_student')
def get_course_students(course_id):
    """Get all students in a course"""
    try:
        course = Course.query.get_or_404(course_id)
        students = [student.to_dict() for student in course.students]
        
        return jsonify({
            'course': course.to_dict(),
            'students': students,
            'total_students': len(students)
        })
        
    except NotFound:
        return jsonify({'error': 'Course not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
