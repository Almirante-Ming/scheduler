#!/usr/bin/env python3

import os
from flask import Flask, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from dotenv import load_dotenv

from lumus.config.database import db
from lumus.config.config import Config
from lumus.routes import register_blueprints
from lumus.models.base import BaseModel
from lumus.models.schedule import Schedule
from lumus.models.course import Course
from lumus.models.student import Student
from lumus.models.user import User
from lumus.models.lab import Lab

load_dotenv()


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    app.url_map.strict_slashes = False

    db.init_app(app)
    migrate = Migrate(app, db)
    jwt = JWTManager(app)
    
    # CORS configuration for development
    CORS(app, 
         origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:5174", 
                  "http://127.0.0.1:3000", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],
         allow_headers=["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
         supports_credentials=True
    )
    
    # Backup CORS handler in case Flask-CORS doesn't work
    @app.after_request
    def after_request(response):
        origin = request.headers.get('Origin')
        if origin in ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174", 
                      "http://127.0.0.1:3000", "http://127.0.0.1:5173", "http://127.0.0.1:5174"]:
            # Only add headers if they're not already present
            if 'Access-Control-Allow-Origin' not in response.headers:
                response.headers['Access-Control-Allow-Origin'] = origin
            if 'Access-Control-Allow-Headers' not in response.headers:
                response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization,X-Requested-With,Accept,Origin'
            if 'Access-Control-Allow-Methods' not in response.headers:
                response.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS,PATCH'
            if 'Access-Control-Allow-Credentials' not in response.headers:
                response.headers['Access-Control-Allow-Credentials'] = 'true'
        return response

    register_blueprints(app)

    return app


def main():
    app = create_app()
    
    host = os.getenv("FLASK_HOST", "0.0.0.0")
    port = int(os.getenv("FLASK_PORT", 3001))
    debug = os.getenv("FLASK_DEBUG", "False").lower() == "true"
    
    print(f"🚀 Starting Lumus API server on http://{host}:{port}")
    print(f"📊 Database: {app.config['SQLALCHEMY_DATABASE_URI']}")
    print(f"🔧 Debug mode: {debug}")
    
    app.run(host=host, port=port, debug=debug)


if __name__ == "__main__":
    main()
