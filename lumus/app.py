#!/usr/bin/env python3

import os
from flask import Flask
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

load_dotenv()


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    app.url_map.strict_slashes = False

    db.init_app(app)
    migrate = Migrate(app, db)
    jwt = JWTManager(app)
    
    # CORS configuration for Docker and development
    allowed_origins = [
        "http://localhost:3000", 
        "http://localhost:5173", 
        "http://localhost:5174",
        "http://localhost:7070",
        "http://127.0.0.1:7070",
        "http://umbra-frontend:7070",
        "http://172.19.0.3:7070"
    ]
    
    # Allow all origins from Docker network in development
    if os.getenv("FLASK_ENV") == "development" or os.getenv("DOCKER_ENV") == "true":
        allowed_origins = ["*"]  # Allow all origins in Docker development mode
    
    CORS(app, 
         origins=allowed_origins,
         allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
         supports_credentials=True
    )

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
