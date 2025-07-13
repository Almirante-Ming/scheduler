
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.exceptions import BadRequest, NotFound
from lumus.models.student import Student
from lumus.models.course import Course
from lumus.config.database import db
from lumus.utils.auth import require_permission


student_bp = Blueprint('student', __name__, url_prefix='/api/students')


@student_bp.route('', methods=['GET'])
@jwt_required()
@require_permission('read_student')
def get_students():
    """Get all students with pagination and filtering"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 10, type=int), 100)
        search = request.args.get('search', '')
        course_id = request.args.get('course_id', type=int)
        
        query = Student.query
        
        if search:
            query = query.filter(
                (Student.name.ilike(f'%{search}%')) |
                (Student.email.ilike(f'%{search}%')) |
                (Student.registration_number.ilike(f'%{search}%'))
            )
        
        if course_id:
            query = query.filter(Student.course_id == course_id)
        
        paginated = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        students = [student.to_dict(include_course=True) for student in paginated.items]
        
        return jsonify({
            'students': students,
            'pagination': {
                'page': paginated.page,
                'pages': paginated.pages,
                'per_page': paginated.per_page,
                'total': paginated.total
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@student_bp.route('/<int:student_id>', methods=['GET'])
@jwt_required()
@require_permission('read_student')
def get_student(student_id):
    """Get a specific student"""
    try:
        student = Student.query.get_or_404(student_id)
        return jsonify(student.to_dict(include_course=True))
    except NotFound:
        return jsonify({'error': 'Student not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@student_bp.route('', methods=['POST'])
@jwt_required()
@require_permission('create_student')
def create_student():
    """Create a new student"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        required_fields = ['name', 'email', 'course_id']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        existing_student = Student.query.filter_by(email=data['email']).first()
        if existing_student:
            return jsonify({'error': 'Email already exists'}), 409
        
        course = Course.query.get(data['course_id'])
        if not course:
            return jsonify({'error': 'Course not found'}), 404
        
        if data.get('registration_number'):
            existing_reg = Student.query.filter_by(registration_number=data['registration_number']).first()
            if existing_reg:
                return jsonify({'error': 'Registration number already exists'}), 409
        
        student = Student(
            name=data['name'],
            email=data['email'],
            course_id=data['course_id'],
            phone=data.get('phone', ''),
            registration_number=data.get('registration_number', '')
        )
        
        db.session.add(student)
        db.session.commit()
        
        return jsonify(student.to_dict(include_course=True)), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@student_bp.route('/<int:student_id>', methods=['PUT'])
@jwt_required()
@require_permission('update_student')
def update_student(student_id):
    """Update a student"""
    try:
        student = Student.query.get_or_404(student_id)
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        if 'email' in data and data['email'] != student.email:
            existing_student = Student.query.filter_by(email=data['email']).first()
            if existing_student:
                return jsonify({'error': 'Email already exists'}), 409
        
        if 'registration_number' in data and data['registration_number'] != student.registration_number:
            existing_reg = Student.query.filter_by(registration_number=data['registration_number']).first()
            if existing_reg:
                return jsonify({'error': 'Registration number already exists'}), 409
        
        if 'course_id' in data:
            course = Course.query.get(data['course_id'])
            if not course:
                return jsonify({'error': 'Course not found'}), 404
        
        for field in ['name', 'email', 'course_id', 'phone', 'registration_number']:
            if field in data:
                setattr(student, field, data[field])
        
        db.session.commit()
        
        return jsonify(student.to_dict(include_course=True))
        
    except NotFound:
        return jsonify({'error': 'Student not found'}), 404
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@student_bp.route('/<int:student_id>', methods=['DELETE'])
@jwt_required()
@require_permission('delete_student')
def delete_student(student_id):
    """Delete a student"""
    try:
        student = Student.query.get_or_404(student_id)
        
        db.session.delete(student)
        db.session.commit()
        
        return jsonify({'message': 'Student deleted successfully'})
        
    except NotFound:
        return jsonify({'error': 'Student not found'}), 404
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@student_bp.route('/by-email/<email>', methods=['GET'])
@jwt_required()
@require_permission('read_student')
def get_student_by_email(email):
    """Get student by email"""
    try:
        student = Student.get_by_email(email)
        if not student:
            return jsonify({'error': 'Student not found'}), 404
        
        return jsonify(student.to_dict(include_course=True))
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@student_bp.route('/by-registration/<registration_number>', methods=['GET'])
@jwt_required()
@require_permission('read_student')
def get_student_by_registration(registration_number):
    """Get student by registration number"""
    try:
        student = Student.query.filter_by(registration_number=registration_number).first()
        if not student:
            return jsonify({'error': 'Student not found'}), 404
        
        return jsonify(student.to_dict(include_course=True))
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
