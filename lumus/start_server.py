import sys
import os
sys.path.append('/home/almirante_ming/projects/scheduler/lumus')

from app import create_app

def main():
    app = create_app()
    
    host = os.getenv("FLASK_HOST", "0.0.0.0")
    port = int(os.getenv("FLASK_PORT", 3001))
    debug = os.getenv("FLASK_DEBUG", "True").lower() == "true"
    
    print(f"🚀 Starting Lumus API server on http://{host}:{port}")
    print(f"🔧 Debug mode: {debug}")
    print(f"🔗 Available at: http://localhost:{port}")
    print(f"\n✅ API is ready for Umbra integration!")
    
    try:
        app.run(host=host, port=port, debug=debug)
    except KeyboardInterrupt:
        print(f"\n👋 Lumus API server stopped")

if __name__ == "__main__":
    main()
