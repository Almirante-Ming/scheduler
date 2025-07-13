
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.exceptions import BadRequest, NotFound, Forbidden
from lumus.models.user import User, UserType
from lumus.config.database import db
from lumus.utils.auth import admin_required, require_permission


user_bp = Blueprint('user', __name__, url_prefix='/api/users')


@user_bp.route('', methods=['GET'])
@jwt_required()
@require_permission('read_user')
def get_users():
    """Get all users with pagination and filtering"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 10, type=int), 100)
        search = request.args.get('search', '')
        user_type = request.args.get('type', '')
        active_only = request.args.get('active', 'true').lower() == 'true'
        
        query = User.query
        
        if search:
            query = query.filter(
                (User.name.ilike(f'%{search}%')) |
                (User.email.ilike(f'%{search}%'))
            )
        
        if user_type:
            try:
                query = query.filter(User.type == UserType(user_type))
            except ValueError:
                return jsonify({
                    'error': f'Invalid user type: {user_type}'
                }), 400
        
        if active_only:
            query = query.filter(User.is_active == True)
        
        paginated = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        return jsonify({
            'users': [user.to_dict() for user in paginated.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': paginated.total,
                'pages': paginated.pages,
                'has_next': paginated.has_next,
                'has_prev': paginated.has_prev
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get users error: {str(e)}")
        return jsonify({
            'error': 'Internal server error'
        }), 500


@user_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
@require_permission('read_user')
def get_user(user_id):
    """Get specific user by ID"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({
                'error': 'User not found'
            }), 404
        
        return jsonify({
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get user error: {str(e)}")
        return jsonify({
            'error': 'Internal server error'
        }), 500


@user_bp.route('', methods=['POST'])
@jwt_required()
@require_permission('create_user')
def create_user():
    """Create new user"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'Request body is required'
            }), 400
        
        required_fields = ['name', 'email', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'error': f'{field} is required'
                }), 400
        
        if User.get_by_email(data['email']):
            return jsonify({
                'error': 'Email already exists'
            }), 400
        
        user_type = data.get('type', 'user')
        try:
            user_type = UserType(user_type)
        except ValueError:
            return jsonify({
                'error': f'Invalid user type: {user_type}'
            }), 400
        
        user = User(
            name=data['name'],
            email=data['email'],
            type=user_type,
            phone=data.get('phone'),
            bio=data.get('bio'),
            is_active=data.get('is_active', True)
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'message': 'User created successfully',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        current_app.logger.error(f"Create user error: {str(e)}")
        db.session.rollback()
        return jsonify({
            'error': 'Internal server error'
        }), 500
