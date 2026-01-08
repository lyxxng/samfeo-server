from flask import Flask, request, jsonify, send_from_directory, abort
import json
import subprocess
import os
import time
import threading
from pathlib import Path

app = Flask(__name__)

# /app/api
PARENT = Path(__file__).parent

# /app/api/../../tmp/samfeo_tmp
TEMP_DIR = (PARENT / ".." / ".." / "tmp" / "samfeo_tmp")

# /app/api/../programs/
SAMFEO_PATH = (PARENT / ".." / "programs" / "SAMFEO").resolve()
FD_PATH = (PARENT / ".." / "programs" / "FastDesign").resolve()

CLEAN_FREQUENCY = 3600  # Every hour

@app.route("/health")
def health():
    return "ok"

def cleanup():
    while True:
        curr_time = time.time()

        # Check every file in the temp directory
        for f in os.listdir(TEMP_DIR):
            path = os.path.join(str(TEMP_DIR), f)
            if os.path.isfile(path):
                elapsed = curr_time - os.path.getmtime(path)
                if elapsed > CLEAN_FREQUENCY:
                    os.remove(path)
                    print("Removed file " + path)

        # Check every 5 minutes            
        time.sleep(300)


with app.app_context():
    # Create temp directory if it doesn't already exist
    os.makedirs(TEMP_DIR, exist_ok=True)

    # Start the cleanup thread
    thread = threading.Thread(target=cleanup, daemon=True)
    thread.start()
    print("Cleanup thread started")


# SAMFEO API call
@app.route('/api/samfeo_submit', methods=['POST'])
def samfeo_submission():
    body = request.get_json(silent=True)

    if not body:
        return {"error": "Invalid JSON"}, 400

    structure = body["structure"]
    temperature = body["temperature"]
    queue = body["queue"]
    step = body["step"]
    obj = body["object"]

    if None in [structure, temperature, queue, step, obj]:
        return {"error": "Missing required fields"}, 400

    # Create list of arguments
    args = ["--online", "--t", temperature, "--k", queue, "--object", obj, "--step", step]

    # Run SAMFEO
    result = subprocess.run(
        ["python3", str(SAMFEO_PATH / "main.py")] + args,
        input=structure,
        text=True,
        capture_output=True,
        cwd=TEMP_DIR)
        
    s = result.stdout
    e = result.stderr

    # If contents in stderr return code 400
    if e:
        return jsonify({
            "error": e
        }), 400

    # Get the json file name
    stdout_len = len(s)
    json_file = s[s.find("results_"):stdout_len - 1]

    temp_path = os.path.join(str(TEMP_DIR), json_file)

    # Save info from the json file
    with open(temp_path) as f:
        data = json.load(f)

        prob_best = data['prob_best']
        prob_val = prob_best[0]
        prob_seq = prob_best[1]

        ned_best = data['ned_best']
        ned_val = ned_best[0]
        ned_seq = ned_best[1]

        dist_best = data['dist_best']
        dist_val = dist_best[0]
        dist_seq = dist_best[1]

        mfe = len(data['mfe'])
        umfe = len(data['umfe'])

        if mfe > 0:
            mfe_sample = data['mfe'][0]
        else:
            mfe_sample = "—"
        
        if umfe > 0:
            umfe_sample = data['umfe'][0]
        else:
            umfe_sample = "—"

        total_time = data['time']
            
    # Return all data and time elapsed for SAMFEO
    return jsonify({
        "structure": structure,
        "prob_val": str(round(prob_val, 4)),
        "prob_seq": prob_seq,
        "ned_val": str(round(ned_val, 3)),
        "ned_seq": ned_seq,
        "dist_val": dist_val,
        "dist_seq": dist_seq,
        "mfe": mfe,
        "umfe": umfe,
        "mfe_sample": mfe_sample,
        "umfe_sample": umfe_sample,
        "time": str(round(total_time, 3)),
        "results": json_file
    })

# SAMFEO++ / FastDesign API call
@app.route('/api/fastdesign_submit', methods=['POST'])
def fastdesign_submission():
    body = request.get_json()

    structure = body["structure"]
    step = body["step"]
    poststep = body["poststep"]
    k_prune = body["k_prune"]
    motif_path = body["motif_path"]

    # Create list of arguments
    args = ["--online", "--step", step, "--poststep", poststep, "--k_prune", k_prune, "--motif_path"]

    # Append correct path to motifs
    if motif_path == "easy":
        args.append(str(FD_PATH / "data/easy_motifs.txt"))
    elif motif_path == "helix":
        args.append(str(FD_PATH / "data/helix_motifs.txt"))
    
    result = subprocess.run(
        ["python3", str(FD_PATH / "main.py")] + args,
        input=structure,
        text=True,
        capture_output=True,
        cwd=TEMP_DIR)
    
    s = result.stdout
    e = result.stderr

    # If contents in stderr return code 400
    if e:
        return jsonify({
            "error": e
        }), 400
    
    # Get the json file name
    stdout_len = len(s)
    json_file = s[s.find("results_"):stdout_len - 1]

    temp_path = os.path.join(str(TEMP_DIR), json_file)

    # Save info from the json file
    with open(temp_path) as f:
        data = json.load(f)

        prob_best = data['prob_best']
        prob_val = prob_best[0]
        prob_seq = prob_best[1]

        ned_best = data['ned_best']
        ned_val = ned_best[0]
        ned_seq = ned_best[1]

        dist_best = data['dist_best']
        dist_val = dist_best[0]
        dist_seq = dist_best[1]

        mfe = len(data['mfe_list'])
        umfe = len(data['umfe_list'])

        if mfe > 0:
            mfe_sample = data['mfe_list'][0]
        else:
            mfe_sample = "—"
        
        if umfe > 0:
            umfe_sample = data['umfe_list'][0]
        else:
            umfe_sample = "—"

        total_time = data['time']
        
    # Return all data and time elapsed for SAMFEO++
    return jsonify({
        "structure": structure,
        "prob_val": str(round(prob_val, 4)),
        "prob_seq": prob_seq,
        "ned_val": str(round(ned_val, 3)),
        "ned_seq": ned_seq,
        "dist_val": dist_val,
        "dist_seq": dist_seq,
        "mfe": mfe,
        "umfe": umfe,
        "mfe_sample": mfe_sample,
        "umfe_sample": umfe_sample,
        "time": str(round(total_time, 3)),
        "results": json_file
    })

# Download files
@app.route('/api/download/<filename>')
def download_file(filename):
    file_path = os.path.join(str(TEMP_DIR), filename)

    if not os.path.exists(file_path):
        abort(404)

    return send_from_directory(
        TEMP_DIR,
        filename,
        as_attachment=True,
        mimetype="application/json"
    )