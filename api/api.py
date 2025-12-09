from flask import Flask, request, jsonify
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
    init = body.get("init")
    nosm = body.get("nosm")
    nomfe = body.get("nomfe")

    # Create list of arguments
    args = ["--online", "--t", temperature, "--k", queue, "--object", obj, "--init", init, "--step", step]

    if nosm:
        args.append("--nosm")
    if nomfe:
        args.append("--nomfe")

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

    # Located the RNA sequence in stdout
    start_s = s.find("RNA sequence")
    end_s = s.find("ensemble objective:  ")
    seq = s[start_s + 15:end_s - 1]

    total_time = end_time - start_time

    # Return structure input, sequence, and time elapsed
    return jsonify({
        "structure": structure,
        "rna": seq,
        "time": total_time
    })