"""
ND-CORE Flask 백엔드 서버
- /search   : 파일 이름 검색
- /open_explorer : 파일 탐색기에서 경로 열기
"""

import os
import subprocess
import math
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # 모든 origin 허용 (로컬 HTML 파일에서의 fetch 허용)

# ─────────────────────────────────────────
#  검색할 루트 경로 설정 (필요 시 변경)
# ─────────────────────────────────────────
SEARCH_ROOT = "C:\\"   # 전체 C 드라이브 검색. 특정 폴더로 좁히려면 변경하세요.
MAX_RESULTS = 200       # 최대 반환 개수


def format_size(size_bytes: int) -> str:
    """파일 크기를 읽기 쉬운 단위로 변환"""
    if size_bytes == 0:
        return "0 B"
    units = ["B", "KB", "MB", "GB", "TB"]
    i = int(math.floor(math.log(size_bytes, 1024)))
    p = math.pow(1024, i)
    s = round(size_bytes / p, 2)
    return f"{s} {units[i]}"


def format_modified(timestamp: float) -> str:
    """타임스탬프를 날짜 문자열로 변환"""
    try:
        dt = datetime.fromtimestamp(timestamp)
        return dt.strftime("%Y-%m-%d %H:%M")
    except Exception:
        return "-"


def search_files(query: str, search_root: str, max_results: int):
    """
    지정된 루트 경로에서 query를 포함하는 파일을 재귀적으로 탐색합니다.
    """
    results = []
    query_lower = query.lower()

    # 접근 불가 폴더 스킵 목록
    SKIP_DIRS = {
        "$recycle.bin", "system volume information", "windows",
        "windowsapps", "program files (x86)", "appdata",
        "$windows.~bt", "$windows.~ws",
    }

    for dirpath, dirnames, filenames in os.walk(search_root, topdown=True, onerror=lambda e: None):
        # 스킵할 폴더 제거
        dirnames[:] = [
            d for d in dirnames
            if d.lower() not in SKIP_DIRS and not d.startswith('.')
        ]

        for filename in filenames:
            if query_lower in filename.lower():
                full_path = os.path.join(dirpath, filename)
                try:
                    stat = os.stat(full_path)
                    results.append({
                        "name": filename,
                        "path": full_path,
                        "size": format_size(stat.st_size),
                        "modified": format_modified(stat.st_mtime),
                    })
                except (PermissionError, FileNotFoundError):
                    pass

                if len(results) >= max_results:
                    return results

    return results


@app.route("/search", methods=["POST"])
def search():
    """
    파일 검색 API
    Request body: { "query": "검색어", "searchType": "name" }
    Response: { "slots": [{ "file_info": { name, path, size, modified } }] }
    """
    data = request.get_json(force=True)
    query = (data.get("query") or "").strip()

    if not query:
        return jsonify({"error": "검색어를 입력하세요.", "slots": []}), 400

    files = search_files(query, SEARCH_ROOT, MAX_RESULTS)

    slots = [{"file_info": f} for f in files]
    return jsonify({
        "query": query,
        "total": len(slots),
        "slots": slots
    })


@app.route("/open_explorer", methods=["POST"])
def open_explorer():
    """
    파일 탐색기에서 파일 경로를 열기
    Request body: { "path": "C:\\..." }
    """
    data = request.get_json(force=True)
    path = (data.get("path") or "").strip()

    if not path or not os.path.exists(path):
        return jsonify({"error": "유효하지 않은 경로입니다."}), 400

    try:
        # 파일이면 해당 폴더를 열면서 파일 선택
        if os.path.isfile(path):
            subprocess.Popen(f'explorer /select,"{path}"')
        else:
            subprocess.Popen(f'explorer "{path}"')
        return jsonify({"status": "ok"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "running", "search_root": SEARCH_ROOT})


if __name__ == "__main__":
    print("=" * 50)
    print("  ND-CORE Flask 서버 시작")
    print(f"  검색 루트: {SEARCH_ROOT}")
    print(f"  주소: http://127.0.0.1:5000")
    print("=" * 50)
    app.run(host="127.0.0.1", port=5000, debug=False)
