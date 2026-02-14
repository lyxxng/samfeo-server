# Helper functions for filtering the log file

import re

# Filter SAMFEO stdout line
def filter_samfeo_log_line(line):
    # Always show these lines
    if any(keyword in line for keyword in [
        'seed_np:',
        'steps:',
        'name_pair:',
        'pair_pool:',
        'best:',
        'ned_best:',
        'prob_best:',
        'dist_best:',
        'full results are saved in'
    ]):
        return True
    
    # Show iters less than 100 then in intervals of 100
    if line.strip().startswith('iter:'):
        match = re.search(r'iter:\s+(\d+)', line)
        if match:
            iter_num = int(match.group(1))
            if iter_num <= 100 or iter_num % 100 == 0:
                return True
    
    # Remove everything else
    return False

# Filter SAMFEO++ stdout line
def filter_fd_log_line(line):
    # Skip most of the verbose output
    skip_patterns = [
        'y_sub:',
        'pair_boundary:',
        'Bad design found:',
        'Found match for motif:',
        'Motif to split:',
        'boundary stacks:',
        'internal stacks:',
        'Skipping split',
        'Split motif at stack:'
    ]

    if any(pattern in line for pattern in skip_patterns):
        return False
    
    # Always show these lines
    if any(keyword in line for keyword in [
        'num_repeat:',
        'target structure:',
        'constraint:',
        'samfeo seed:',
        'steps:',
        'name_pair:',
        'pair_pool:',
        'ned_best:',
        'prob_best:',
        'dist_best:',
        'Results saved to'
    ]):
        return True
    
    # Show iters in intervals of 200
    if line.strip().startswith('iter:'):
        match = re.search(r'iter:\s+(\d+)', line)
        if match:
            iter_num = int(match.group(1))
            if iter_num % 200 == 0:
                return True
    
    # Remove everything else
    return False

# Process the subprocess output for the log file
def process_output(process, log_file, program_type):
    y_sub_message_shown = False # y_sub messages in SAMFEO++
    completed_job = False
    
    # Process stdout line by line until end
    for line in iter(process.stdout.readline, ''):
        if not line:
            break
        
        # For FastDesign, show a message when verbose y_sub section starts
        if program_type == 'fd' and not y_sub_message_shown and 'y_sub:' in line:
            log_file.write('\nEvaluating combined sequence designs (this may take a moment)...\n\n')
            log_file.flush()

            y_sub_message_shown = True
        
        # Job complete message
        if not completed_job and 'results_' in line:
            log_file.write('\nJob completed.\n\n')
            log_file.flush()

            completed_job = True
        
        # Filter based on program type
        if program_type == 'samfeo':
            if filter_samfeo_log_line(line):
                log_file.write(line)
                log_file.flush()
        elif program_type == 'fd':
            if filter_fd_log_line(line):
                log_file.write(line)
                log_file.flush()