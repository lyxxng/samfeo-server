from flask import Flask, request, jsonify
import json
import subprocess
import time

app = Flask(__name__)

@app.route('/api/submit', methods=['POST'])
def samfeo_submission():
    body = request.json

    structure = body.get("structure")
    temperature = body.get("temperature")
    queue = body.get("queue")
    step = body.get("step")
    obj = body.get("object")

    # Create list of arguments
    args = ["--online", "--t", temperature, "--k", queue, "--object", obj, "--step", step]

    # Run SAMFEO with timer
    start_time = time.time()

    result = subprocess.run(
        ["python3", "../SAMFEO/main.py"] + args,
        input=structure,
        text=True,
        capture_output=True)
    
    end_time = time.time()
    
    s = result.stdout
    e = result.stderr

    # If contents in stderr return code 400
    if e:
        return jsonify({
            "error": e
        }), 400

    # Locate the RNA sequence in stdout
    rna_len = len(structure)

    start_seq = s.find("RNA sequence") + 15
    end_seq = start_seq + rna_len + 1
    seq = s[start_seq:end_seq]

    # Get the json file name
    stdout_len = len(s)
    json_file = s[s.find("results_"):stdout_len - 1]

    # Save info from the json file
    with open(json_file) as f:
        data = json.load(f)

        mfe = len(data['mfe'])
        umfe = len(data['umfe'])

        ned_best = data['ned_best']
        ned_val = ned_best[0]
        ned_seq = ned_best[1]

        dist_best = data['dist_best']
        dist_val = dist_best[0]
        dist_seq = dist_best[1]
        
    total_time = end_time - start_time

    # Return all data and time elapsed
    return jsonify({
        "structure": structure,
        "rna": seq,
        "mfe": mfe,
        "umfe": umfe,
        "ned_val": ned_val,
        "ned_seq": ned_seq,
        "dist_val": dist_val,
        "dist_seq": dist_seq,
        "time": total_time
    })