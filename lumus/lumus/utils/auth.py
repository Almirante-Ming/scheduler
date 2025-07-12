
from functools import wraps
from flask import jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from lumus.models.user import User, UserType


def admin_required(f):
    """Decorator to require admin privileges"""
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        try:
            user_id = int(get_jwt_identity())
            user = User.query.get(user_id)
            
            if not user or not user.is_admin():
                return jsonify({
                    'error': 'Admin privileges required'
                }), 403
            
            return f(*args, **kwargs)
        except Exception as e:
            current_app.logger.error(f"Admin required error: {str(e)}")
            return jsonify({
                'error': 'Internal server error'
            }), 500
    
    return decorated_function


def require_permission(permission):
    """Decorator to require specific permission"""
    def decorator(f):
        @wraps(f)
        @jwt_required()
        def decorated_function(*args, **kwargs):
            try:
                user_id = int(get_jwt_identity())
                user = User.query.get(user_id)
                
                if not user:
                    return jsonify({
                        'error': 'User not found'
                    }), 404
                
                if not user.is_active:
                    return jsonify({
                        'error': 'Account is deactivated'
                    }), 401
                
                user_permissions = user.get_permissions()
                if permission not in user_permissions:
                    return jsonify({
                        'error': f'Permission required: {permission}'
                    }), 403
                
                return f(*args, **kwargs)
            except Exception as e:
                current_app.logger.error(f"Permission required error: {str(e)}")
                return jsonify({
                    'error': 'Internal server error'
                }), 500
        
        return decorated_function
    return decorator


def get_current_user():
    """Get current authenticated user"""
    try:
        user_id_str = get_jwt_identity()
        if not user_id_str:
            return None
        
        user_id = int(user_id_str)
        user = User.query.get(user_id)
        return user
    except Exception as e:
        current_app.logger.error(f"Get current user error: {str(e)}")
        return None


def is_owner_or_admin(resource_owner_id):
    """Check if current user is owner of resource or admin"""
    try:
        current_user = get_current_user()
        if not current_user:
            return False
        
        return current_user.is_admin() or current_user.id == resource_owner_id
    except Exception as e:
        current_app.logger.error(f"Owner or admin check error: {str(e)}")
        return False


def require_owner_or_admin(get_resource_owner_id):
    """Decorator to require resource ownership or admin privileges"""
    def decorator(f):
        @wraps(f)
        @jwt_required()
        def decorated_function(*args, **kwargs):
            try:
                current_user = get_current_user()
                if not current_user:
                    return jsonify({
                        'error': 'Authentication required'
                    }), 401
                
                resource_owner_id = get_resource_owner_id(*args, **kwargs)
                
                if not is_owner_or_admin(resource_owner_id):
                    return jsonify({
                        'error': 'Resource access denied'
                    }), 403
                
                return f(*args, **kwargs)
            except Exception as e:
                current_app.logger.error(f"Owner or admin required error: {str(e)}")
                return jsonify({
                    'error': 'Internal server error'
                }), 500
        
        return decorated_function
    return decorator


def check_permission(user, permission):
    """Check if user has specific permission"""
    if not user or not user.is_active:
        return False
    
    permissions = user.get_permissions()
    return permission in permissions


def get_user_permissions(user_id):
    """Get permissions for a specific user"""
    try:
        user = User.query.get(user_id)
        if not user:
            return []
        
        return user.get_permissions()
    except Exception as e:
        current_app.logger.error(f"Get user permissions error: {str(e)}")
        return []


def validate_user_type(user_type_str):
    """Validate and convert user type string to UserType enum"""
    try:
        return UserType(user_type_str)
    except ValueError:
        return None


def can_modify_user(current_user, target_user):
    """Check if current user can modify target user"""
    if not current_user or not target_user:
        return False
    
    if current_user.is_admin():
        return True
    
    return current_user.id == target_user.id


def require_self_or_admin(f):
    """Decorator to require self or admin access"""
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        try:
            current_user = get_current_user()
            if not current_user:
                return jsonify({
                    'error': 'Authentication required'
                }), 401
            
            target_user_id = kwargs.get('usuario_id') or kwargs.get('user_id')
            if not target_user_id:
                target_user_id = args[0] if args else None
            
            if not target_user_id:
                return jsonify({
                    'error': 'User ID required'
                }), 400
            
            target_user = User.query.get(target_user_id)
            if not target_user:
                return jsonify({
                    'error': 'Target user not found'
                }), 404
            
            if not can_modify_user(current_user, target_user):
                return jsonify({
                    'error': 'Access denied'
                }), 403
            
            return f(*args, **kwargs)
        except Exception as e:
            current_app.logger.error(f"Self or admin required error: {str(e)}")
            return jsonify({
                'error': 'Internal server error'
            }), 500
    
    return decorated_function


def log_user_activity(user_id, activity, details=None):
    """Log user activity for audit purposes"""
    try:
        current_app.logger.info(f"User {user_id} activity: {activity} - {details}")
    except Exception as e:
        current_app.logger.error(f"Log user activity error: {str(e)}")


def create_response(data=None, message=None, error=None, status=200):
    """Create standardized API response"""
    response = {}
    
    if data is not None:
        response['data'] = data
    
    if message:
        response['message'] = message
    
    if error:
        response['error'] = error
    
    return jsonify(response), status
