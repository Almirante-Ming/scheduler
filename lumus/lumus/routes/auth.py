from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.exceptions import BadRequest, Unauthorized
from lumus.models.user import User, UserType
from lumus.config.database import db
from datetime import timedelta


auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'lumus-api'}), 200


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login endpoint"""
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({
                'error': 'Email and password are required'
            }), 400
        
        email = data['email']
        password = data['password']
        
        user = User.get_by_email(email)
        if not user or not user.check_password(password):
            return jsonify({
                'error': 'Invalid credentials'
            }), 401
        
        if not user.is_active:
            return jsonify({
                'error': 'Account is deactivated'
            }), 401
        
        user.update_last_login()
        
        access_token = create_access_token(
            identity=str(user.id),
            expires_delta=timedelta(hours=24)
        )
        
        return jsonify({
            'access_token': access_token,
            'user': user.to_dict(),
            'permissions': user.get_permissions()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Login error: {str(e)}")
        return jsonify({
            'error': 'Internal server error'
        }), 500


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register endpoint"""
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
        if isinstance(user_type, str):
            try:
                user_type = UserType(user_type.lower())
            except ValueError:
                return jsonify({
                    'error': f'Invalid user type: {user_type}. Valid types: {[t.value for t in UserType]}'
                }), 400
        
        user = User(
            name=data['name'],
            email=data['email'],
            type=user_type,
            phone=data.get('phone'),
            bio=data.get('bio')
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'message': 'User registered successfully',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        current_app.logger.error(f"Registration error: {str(e)}")
        db.session.rollback()
        return jsonify({
            'error': 'Internal server error'
        }), 500


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout endpoint"""
    try:
        return jsonify({
            'message': 'Logged out successfully'
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Logout error: {str(e)}")
        return jsonify({
            'error': 'Internal server error'
        }), 500


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user information"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'error': 'User not found'
            }), 404
        
        return jsonify({
            'user': user.to_dict(),
            'permissions': user.get_permissions()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get current user error: {str(e)}")
        return jsonify({
            'error': 'Internal server error'
        }), 500


@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change password endpoint"""
    try:
        data = request.get_json()
        
        if not data or not data.get('current_password') or not data.get('new_password'):
            return jsonify({
                'error': 'Current password and new password are required'
            }), 400
        
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'error': 'User not found'
            }), 404
        
        if not user.check_password(data['current_password']):
            return jsonify({
                'error': 'Current password is incorrect'
            }), 400
        
        user.change_password(data['new_password'])
        
        return jsonify({
            'message': 'Password changed successfully'
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Change password error: {str(e)}")
        return jsonify({
            'error': 'Internal server error'
        }), 500


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required()
def refresh_token():
    """Refresh access token"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user or not user.is_active:
            return jsonify({
                'error': 'User not found or inactive'
            }), 404
        
        access_token = create_access_token(
            identity=str(user.id),
            expires_delta=timedelta(hours=24)
        )
        
        return jsonify({
            'access_token': access_token
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Refresh token error: {str(e)}")
        return jsonify({
            'error': 'Internal server error'
        }), 500


@auth_bp.errorhandler(BadRequest)
def handle_bad_request(error):
    """Handle bad request errors"""
    return jsonify({
        'error': 'Bad request'
    }), 400


@auth_bp.errorhandler(Unauthorized)
def handle_unauthorized(error):
    """Handle unauthorized errors"""
    return jsonify({
        'error': 'Unauthorized'
    }), 401
