from app import create_app, db, socketio
from flask_migrate import Migrate

app = create_app()
migrate = Migrate(app, db)

if __name__ == "__main__":
    # Run with SocketIO support
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
