from flask import Flask, request, jsonify
import json
import subprocess
import os

app = Flask(__name__)

# SAMFEO API call
@app.route('/api/samfeo_submit', methods=['POST'])
def samfeo_submission():
    body = request.json

    structure = body.get("structure")
    temperature = body.get("temperature")
    queue = body.get("queue")
    step = body.get("step")
    obj = body.get("object")

    # Create list of arguments
    args = ["--online", "--t", temperature, "--k", queue, "--object", obj, "--step", step]

    # Run SAMFEO
    result = subprocess.run(
        ["python3", "../SAMFEO/main.py"] + args,
        input=structure,
        text=True,
        capture_output=True)
        
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

        total_time = data['time']
    
    # Remove the results file
    os.remove(json_file)
        
    # Return all data and time elapsed for SAMFEO
    return jsonify({
        "structure": structure,
        "rna": seq,
        "mfe": mfe,
        "umfe": umfe,
        "ned_val": ned_val,
        "ned_seq": ned_seq,
        "dist_val": dist_val,
        "dist_seq": dist_seq,
        "time": str(round(total_time, 3)) + "s"
    })

# SAMFEO++ / FastDesign API call
@app.route('/api/fastdesign_submit', methods=['POST'])
def fastdesign_submission():
    body = request.json

    structure = body.get("structure")
    step = body.get("step")
    poststep = body.get("poststep")
    k_prune = body.get("k_prune")
    motif_path = body.get("motif_path")

    # Create list of arguments
    args = ["--online", "--step", step, "--poststep", poststep, "--k_prune", k_prune, "--motif_path"]

    # Append correct path to motifs
    if motif_path == "easy":
        args.append("../FastDesign/data/easy_motifs.txt")
    elif motif_path == "helix":
        args.append("../FastDesign/data/helix_motifs.txt")
    
    result = subprocess.run(
        ["python3", "../FastDesign/main.py"] + args,
        input=structure,
        text=True,
        capture_output=True)
    
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

    # Save info from the json file
    with open(json_file) as f:
        data = json.load(f)

        mfe = len(data['mfe_list'])
        umfe = len(data['umfe_list'])

        ned_best = data['ned_best']
        ned_val = ned_best[0]
        ned_seq = ned_best[1]

        prob_best = data['prob_best']
        prob_val = prob_best[0]
        prob_seq = prob_best[1]

        dist_best = data['dist_best']
        dist_val = dist_best[0]
        dist_seq = dist_best[1]

        total_time = data['time']
    
    # Remove the results file
    os.remove(json_file)
        
    # Return all data and time elapsed for SAMFEO++
    return jsonify({
        "structure": structure,
        "mfe": mfe,
        "umfe": umfe,
        "ned_val": ned_val,
        "ned_seq": ned_seq,
        "prob_val": prob_val,
        "prob_seq": prob_seq,
        "dist_val": dist_val,
        "dist_seq": dist_seq,
        "time": str(round(total_time, 3)) + "s"
    })