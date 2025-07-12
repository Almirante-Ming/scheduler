#!/usr/bin/env python3
"""
Lumus Flask Application Startup Script
"""

import os
import sys
from app import create_app

def main():
    """Main entry point for the application"""
    app = create_app()
    
    # Get configuration from environment
    host = os.getenv('FLASK_HOST', '127.0.0.1')
    port = int(os.getenv('FLASK_PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    print(f"""
    🚀 Starting Lumus Laboratory Scheduler API
    
    📡 Server: http://{host}:{port}
    🔧 Debug mode: {debug}
    📁 Database: {app.config['SQLALCHEMY_DATABASE_URI']}
    
    📋 Available API endpoints:
    • POST /api/auth/login - User login
    • POST /api/auth/register - User registration
    • GET /api/auth/me - Get current user
    • GET /api/usuarios - List users
    • POST /api/usuarios - Create user
    
    💡 Check README.md for complete documentation
    """)
    
    try:
        app.run(host=host, port=port, debug=debug)
    except KeyboardInterrupt:
        print("\n👋 Shutting down gracefully...")
        sys.exit(0)

if __name__ == '__main__':
    main()
