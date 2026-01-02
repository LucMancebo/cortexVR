
import os
import sys
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import requests

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
VIDEOS_DIR = os.path.normpath(os.path.join(BASE_DIR, "..", "frontend", "public", "videos"))
os.makedirs(VIDEOS_DIR, exist_ok=True)

MAX_UPLOAD_BYTES = int(os.environ.get("MAX_UPLOAD_BYTES", 500 * 1024 * 1024))
NODE_NOTIFY_URL = os.environ.get("NODE_NOTIFY_URL")  # optional

ALLOWED_EXT = {"mp4", "webm", "ogg", "mov", "mkv"}

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = MAX_UPLOAD_BYTES

def allowed_filename(filename: str) -> bool:
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return ext in ALLOWED_EXT

@app.route("/", methods=["GET"])
def index():
    return jsonify({"ok": True, "videos_dir": VIDEOS_DIR})

@app.route("/upload", methods=["POST"])
def upload():
    if "video" not in request.files:
        return jsonify({"error": "campo 'video' não encontrado"}), 400

    f = request.files["video"]
    if f.filename == "":
        return jsonify({"error": "arquivo sem nome"}), 400

    if not allowed_filename(f.filename):
        return jsonify({"error": "extensão não permitida"}), 400

    filename = secure_filename(f.filename)
    timestamped = f"{int(__import__('time').time() * 1000)}-{filename}"
    dest_path = os.path.join(VIDEOS_DIR, timestamped)

    try:
        f.save(dest_path)
    except Exception as e:
        return jsonify({"error": "falha ao salvar arquivo", "detail": str(e)}), 500

    result = {
        "filename": timestamped,
        "path": f"/videos/{timestamped}",
        "url": f"/videos/{timestamped}",
    }

    # opcional: notificar backend Node para indexação / broadcast
    if NODE_NOTIFY_URL:
        try:
            requests.post(NODE_NOTIFY_URL, json={"file": result}, timeout=5)
        except Exception:
            # não falha a resposta principal se a notificação falhar
            pass

    return jsonify(result)

if __name__ == "__main__":
    host = os.environ.get("UPLOAD_HOST", "127.0.0.1")
    port = int(os.environ.get("UPLOAD_PORT", 7000))
    print(f"Upload service listening on http://{host}:{port}, saving to {VIDEOS_DIR}")
    app.run(host=host, port=port)
