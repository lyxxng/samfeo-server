from flask import Flask, request, jsonify, send_from_directory, abort
from flask_cors import CORS
import json
import os
from pathlib import Path
import random
import re
import subprocess
import sys
import threading
import time
import uuid

app = Flask(__name__)
CORS(app)

# /app/api
PARENT = Path(__file__).parent
sys.path.insert(0, str(PARENT))

from linear_plot import get_linear_plot
from process_log import process_output

# /app/api/../../tmp/[results/logs] (production)
RESULTS_DIR = (PARENT / ".." / ".." / "tmp" / "results")
LOGS_DIR = (PARENT / ".." / ".." / "tmp" / "logs")

# For local development uncomment:
# RESULTS_DIR = (PARENT / "tmp" / "results")
# LOGS_DIR = (PARENT / "tmp" / "logs")

# /app/api/../programs/
SAMFEO_PATH = (PARENT / ".." / "programs" / "SAMFEO").resolve()
FD_PATH = (PARENT / ".." / "programs" / "FastDesign").resolve()

R_CLEAN_FREQUENCY = 3600  # Every hour for results
L_CLEAN_FREQUENCY = 7200  # Every 2 hours for logs

# Remove old files
def cleanup():
    while True:
        curr_time = time.time()

        # Check every file in the results directory
        for f in os.listdir(RESULTS_DIR):
            path = os.path.join(str(RESULTS_DIR), f)
            try:
                if os.path.isfile(path):
                    elapsed = curr_time - os.path.getmtime(path)
                    if elapsed > R_CLEAN_FREQUENCY:
                        os.remove(path)
                        print("Removed results file " + path)
            # Already removed by another worker
            except (FileNotFoundError, PermissionError):
                pass

        # Check every file in the logs directory
        for f in os.listdir(LOGS_DIR):
            path = os.path.join(str(LOGS_DIR), f)
            try:
                if os.path.isfile(path):
                    elapsed = curr_time - os.path.getmtime(path)
                    if elapsed > L_CLEAN_FREQUENCY:
                        os.remove(path)
                        print("Removed log/status file " + path)
            # Already removed by another worker
            except (FileNotFoundError, PermissionError):
                pass

        # Check every 5 minutes            
        time.sleep(300)


with app.app_context():
    # Create temp directories if they don't already exist
    os.makedirs(RESULTS_DIR, exist_ok=True)
    os.makedirs(LOGS_DIR, exist_ok=True)

    # Start the cleanup thread
    thread = threading.Thread(target=cleanup, daemon=True)
    thread.start()
    print("Cleanup thread started")


# SAMFEO API call
@app.route('/api/samfeo_submit', methods=['POST'])
def samfeo_submission():
    body = request.get_json(silent=True)

    if not body:
        return jsonify({
            "error": "Invalid JSON"
        }), 400

    structure = body["structure"]
    temperature = body["temperature"]
    queue = body["queue"]
    step = body["step"]
    obj = body["object"]

    # Create list of arguments
    args = ["--online", "--t", temperature, "--k", queue, "--object", obj, "--step", step]

    # Generate unique ID for log & status files
    log_id = str(uuid.uuid4())
    log_path = os.path.join(str(LOGS_DIR), f"log_{log_id}.txt")
    status_path = os.path.join(str(LOGS_DIR), f"status_{log_id}.json")

    def run_samfeo_background():
        try:
            # Run SAMFEO
            with open(log_path, 'w') as log_file:
                process = subprocess.Popen(
                    ["python3", "-u", str(SAMFEO_PATH / "main.py")] + args,
                    stdin=subprocess.PIPE,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                    cwd=RESULTS_DIR,
                    bufsize=1
                )

                # Write input and close stdin
                process.stdin.write(structure)
                process.stdin.close()

                # Process with filtering
                process_output(process, log_file, 'samfeo')

                # Wait for process to complete
                process.wait()
                result_stderr = process.stderr.read()

            # Check for error
            if result_stderr:
                with open(status_path, 'w') as f:
                    json.dump({
                        "status": "error",
                        "error": result_stderr
                    }, f)
                return

            # Read from log file to extract JSON file name
            with open(log_path, 'r') as log_file:
                stdout = log_file.read()

            # Extract JSON filename using regex
            json_match = re.search(r'(results_[^\s]+\.json)', stdout)
            if not json_match:
                with open(status_path, 'w') as f:
                    json.dump({
                        "status": "error",
                        "error": "Could not find results file in output"
                    }, f)
                return
            
            json_file = json_match.group(1)
            json_path = os.path.join(str(RESULTS_DIR), json_file)

            # Save info from the json file
            with open(json_path) as f:
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
                    mfe_index = random.randrange(mfe)
                    mfe_sample = data['mfe'][mfe_index]
                else:
                    mfe_sample = "—"
                
                if umfe > 0:
                    umfe_index = random.randrange(umfe)
                    umfe_sample = data['umfe'][umfe_index]
                else:
                    umfe_sample = "—"

                total_time = data['time']
                    
            # Return all data and time elapsed for SAMFEO
            with open(status_path, 'w') as f:
                json.dump({
                    "status": "complete",
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
                }, f)

        except Exception as e:
            print(f"SAMFEO background error: {e}")
            with open(status_path, 'w') as f:
                json.dump({
                    "status": "error",
                    "error": str(e)
                }, f)
    
    # Start background thread running SAMFEO
    thread = threading.Thread(target=run_samfeo_background, daemon=True)
    thread.start()

    # Return immediately with log ID
    return jsonify({
        "log_id": log_id,
        "status": "processing"
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
    
    # Generate unique ID
    log_id = str(uuid.uuid4())
    log_path = os.path.join(str(LOGS_DIR), f"log_{log_id}.txt")
    status_path = os.path.join(str(LOGS_DIR), f"status_{log_id}.json")

    def run_fastdesign_background():
        try:
            # Run FastDesign
            with open(log_path, 'w') as log_file:
                process = subprocess.Popen(
                    ["python3", "-u", str(FD_PATH / "main.py")] + args,
                    stdin=subprocess.PIPE,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                    cwd=RESULTS_DIR,
                    bufsize=1
                )

                # Write input and close stdin
                process.stdin.write(structure)
                process.stdin.close()

                # Process with filtering
                process_output(process, log_file, 'fd')

                # Wait for process to complete
                process.wait()
                result_stderr = process.stderr.read()

            # Check for error
            if result_stderr:
                with open(status_path, 'w') as f:
                    json.dump({
                        "status": "error",
                        "error": result_stderr
                    }, f)
                return

            # Read from log file to extract JSON file name
            with open(log_path, 'r') as log_file:
                stdout = log_file.read()

            # Extract JSON filename using regex
            json_match = re.search(r'(results_[^\s]+\.json)', stdout)
            if not json_match:
                with open(status_path, 'w') as f:
                    json.dump({
                        "status": "error",
                        "error": "Could not find results file in output"
                    }, f)
                return
            
            json_file = json_match.group(1)
            json_path = os.path.join(str(RESULTS_DIR), json_file)

            # Save info from the json file
            with open(json_path) as f:
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
                    mfe_index = random.randrange(mfe)
                    mfe_sample = data['mfe_list'][mfe_index]
                else:
                    mfe_sample = "—"
                
                if umfe > 0:
                    umfe_index = random.randrange(umfe)
                    umfe_sample = data['umfe_list'][umfe_index]
                else:
                    umfe_sample = "—"

                total_time = data['time']
                
            # Return all data and time elapsed for SAMFEO++
            with open(status_path, 'w') as f:
                json.dump({
                    "status": "complete",
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
                }, f)

        except Exception as e:
            print(f"FastDesign background error: {e}")
            with open(status_path, 'w') as f:
                json.dump({
                    "status": "error",
                    "error": str(e)
                }, f)
    
    # Start background thread running FastDesign
    thread = threading.Thread(target=run_fastdesign_background, daemon=True)
    thread.start()

    # Return immediately with log ID
    return jsonify({
        "log_id": log_id,
        "status": "processing"
    })

# Get filtered log starting from query param
@app.route('/api/logs/<log_id>', methods=['GET'])
def get_log(log_id):
    if not re.match(r'^[a-f0-9\-]+$', log_id):
        return jsonify({
            "error": "Invalid log ID"
        }), 400
    
    log_path = os.path.join(str(LOGS_DIR), f"log_{log_id}.txt")

    if not os.path.exists(log_path):
        return jsonify({"lines": [], "next": 0})
    
    # Get starting line from query param
    from_line = request.args.get('from', default=0, type=int)
    
    with open(log_path, 'r') as f:
        all_lines = f.readlines()
    
    # Grab new lines, do not send json file line
    new_lines = all_lines[from_line:]
    new_lines = [line.rstrip('\n') for line in new_lines if not ('results_' in line)]

    return jsonify({
        "lines": new_lines,
        "next": len(all_lines)
    })

# Get status of background process
@app.route('/api/status/<log_id>', methods=['GET'])
def get_status(log_id):
    if not re.match(r'^[a-f0-9\-]+$', log_id):
        return jsonify({
            "error": "Invalid log ID"
        }), 400
    
    status_path = os.path.join(str(LOGS_DIR), f"status_{log_id}.json")

    if not os.path.exists(status_path):
        return jsonify({"status": "processing"})
    
    with open(status_path, 'r') as f:
        return jsonify(json.load(f))

# Download files
@app.route('/api/download/<filename>', methods=['GET'])
def download_file(filename):
    file_path = os.path.join(str(RESULTS_DIR), filename)

    if not os.path.exists(file_path):
        abort(404)

    return send_from_directory(
        RESULTS_DIR,
        filename,
        as_attachment=True,
        mimetype="application/json"
    )

# Get the base pairing probability plot
@app.route('/api/rna_plot', methods=['POST'])
def generate_rna_plot():
    body = request.get_json(silent=True)

    if not body:
        return jsonify({
            "error": "Invalid JSON"
        }), 400

    # Extract dot-bracket structure and nucleotide sequence
    structure = body["structure"]
    sequence = body["sequence"]

    if None in [structure, sequence]:
        return jsonify({
            "error": "Missing required fields"
        }), 400
    
    # Get the plotly data
    plotly_json = get_linear_plot(structure, sequence)

    return jsonify({
        'plotly_data': plotly_json
    })