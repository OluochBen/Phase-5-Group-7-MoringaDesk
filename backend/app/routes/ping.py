from flask import jsonify

@app.route('/api/ping', methods=['GET'])
def ping():
    return jsonify({
        'message': 'pong', 
        'status': 'success',
        'timestamp': datetime.utcnow().isoformat()
    })