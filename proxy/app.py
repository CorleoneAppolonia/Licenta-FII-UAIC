import os
from datetime import datetime
from typing import Any, Dict, Optional

import requests
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
app.url_map.strict_slashes = False

BACKEND_URL = os.environ.get('BACKEND_URL', 'http://localhost:8000')
TRAFFIC_LOG: list[Dict[str, Any]] = []


def iso_timestamp() -> str:
    return datetime.utcnow().isoformat() + 'Z'


def filtered_headers(source_headers) -> Dict[str, str]:
    allowed = {'authorization', 'content-type'}
    return {
        key: value
        for key, value in source_headers.items()
        if key.lower() in allowed
    }


def record(entry: Dict[str, Any]) -> None:
    TRAFFIC_LOG.append(entry)
    if len(TRAFFIC_LOG) > 1000:
        TRAFFIC_LOG.pop(0)


def forward_request(
    method: str,
    frontend_path: str,
    backend_path: str,
    payload: Optional[Dict[str, Any]],
):
    url = f"{BACKEND_URL}{backend_path}"
    headers = filtered_headers(request.headers)

    record(
        {
            'direction': 'client_to_server',
            'timestamp': iso_timestamp(),
            'path': frontend_path,
            'method': method,
            'payload': payload,
            'headers': headers,
            'query': request.args.to_dict(flat=False),
        }
    )

    response = requests.request(
        method,
        url,
        headers=headers,
        json=payload,
        params=request.args,
        timeout=10,
    )

    has_json = False
    response_data: Optional[Any]
    if response.status_code == 204 or not response.content:
        response_data = None
    else:
        try:
            response_data = response.json()
            has_json = True
        except ValueError:
            response_data = response.text

    record(
        {
            'direction': 'server_to_client',
            'timestamp': iso_timestamp(),
            'path': frontend_path,
            'method': method,
            'payload': response_data,
            'status_code': response.status_code,
            'headers': dict(response.headers),
        }
    )

    return response.status_code, response_data, has_json


def extract_payload() -> Optional[Dict[str, Any]]:
    if request.method in {'GET', 'HEAD'}:
        return None
    return request.get_json(silent=True)


def relay(prefix: str, subpath: str = ''):
    normalized = subpath.strip('/')
    backend_path = f"/api/{prefix}/{normalized}/" if normalized else f"/api/{prefix}/"
    frontend_path = f"/{prefix}/{normalized}/" if normalized else f"/{prefix}/"
    if request.method == 'OPTIONS':
        return '', 204
    payload = extract_payload()
    status_code, response_data, has_json = forward_request(
        request.method,
        frontend_path,
        backend_path,
        payload,
    )
    if status_code == 204 or response_data is None:
        return '', status_code
    if has_json:
        return jsonify(response_data), status_code
    return response_data, status_code, {'Content-Type': 'text/plain; charset=utf-8'}


@app.route('/auth/', defaults={'subpath': ''}, methods=['GET', 'POST'])
@app.route('/auth/<path:subpath>', methods=['GET', 'POST', 'PATCH', 'PUT', 'DELETE'])
def proxy_auth(subpath: str):
    return relay('auth', subpath)


@app.route('/friends/', defaults={'subpath': ''}, methods=['GET', 'POST'])
@app.route('/friends/<path:subpath>', methods=['GET', 'POST', 'PATCH', 'PUT', 'DELETE'])
def proxy_friends(subpath: str):
    return relay('friends', subpath)


@app.route('/messages/', defaults={'subpath': ''}, methods=['GET', 'POST'])
@app.route('/messages/<path:subpath>', methods=['GET', 'POST', 'PATCH', 'PUT', 'DELETE'])
def proxy_messages(subpath: str):
    return relay('messages', subpath)


@app.route('/encryption/', defaults={'subpath': ''}, methods=['GET'])
@app.route('/encryption/<path:subpath>', methods=['GET'])
def proxy_encryption(subpath: str):
    return relay('encryption', subpath)


@app.route('/admin/', defaults={'subpath': ''}, methods=['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'])
@app.route('/admin/<path:subpath>', methods=['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'])
def proxy_admin(subpath: str):
    return relay('admin', subpath)


@app.route('/logs/', methods=['GET', 'DELETE'])
def message_logs():
    if request.method == 'DELETE':
        TRAFFIC_LOG.clear()
        return jsonify({'detail': 'Log cleared.'})
    return jsonify(TRAFFIC_LOG)


@app.route('/health/', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'backend_url': BACKEND_URL})


if __name__ == '__main__':
    port = int(os.environ.get('PORT', os.environ.get('PROXY_PORT', '5000')))
    app.run(host='0.0.0.0', port=port)
