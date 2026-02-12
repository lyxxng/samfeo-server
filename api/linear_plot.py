# Reference: https://github.com/weiyutang1010/SamplingDesign/blob/main/figures/bpp_plot/plot.py
# View the draw_rna_linear function

import plotly.graph_objects as go
import numpy as np
import ViennaRNA
import math

def extract_pairs(structure):
    pairs = list(range(len(structure)))
    stack = []

    for i, c in enumerate(structure):
        if c ==  '.':
            pass
        elif  c == '(':
            stack.append(i)
        elif c == ')':
            j = stack.pop()
            pairs[j] = i
            pairs[i] = j
        else:
            raise ValueError(f"Wrong structure at position {i}: {c}")
    
    return pairs

def base_pair_probs(seq, sym=False, scale=True):
    fc = ViennaRNA.fold_compound(seq)

    if scale:
        _, mfe = fc.mfe()
        fc.exp_params_rescale(mfe)
    
    fc.pf()
    bpp = np.array(fc.bpp())[1:, 1:]

    if sym:
        bpp += bpp.T
        unpair = 1 - np.sum(bpp, axis=1)
        bpp[range(len(bpp)), range(len(bpp))] = unpair

    return bpp

def format_bpp(bpp):
    bpp_arr = []

    for i, row_i in enumerate(bpp):
        for j, pair_prob in enumerate(row_i):
            if i < j and pair_prob >= 0.01:
                bpp_arr.append((i, j, pair_prob))
    
    return bpp_arr

def get_pairs(structure):
    pairs = []
    stack = []

    for j, c in enumerate(structure):
        if c == "(":
            stack.append(j)
        elif c == ")":
            i = stack.pop()
            pairs.append((i, j))
    
    return sorted(pairs)

def draw_rna_linear(bpp, seq, seq_len, pairs):
    fig = go.Figure()

    bpp_pairs = []

    for pair in bpp:
        start_index, end_index, pair_prob = pair[0], pair[1], pair[2]
        pair_matched = (start_index, end_index) in pairs
        bpp_pairs.append((start_index, end_index))

        round_prob = math.ceil(pair_prob * 10) / 10

        color = 'blue' if pair_matched else 'red'

        center = ((start_index + end_index) / 2, 0)
        width = (end_index - start_index) / 2
        height = (width + 3) * 0.55

        x = np.linspace(start_index, end_index, max(400, seq_len * 4))
        y = np.sqrt((1. - ((x - center[0]) ** 2 / (width * width))) * (height * height)) + center[1]

        if not pair_matched:
            y *= -1

        alpha = round_prob
        if pair_matched and pair_prob < 0.1:
            alpha = 0.1
            color = "#FFAA00"
        
        start_nt = seq[start_index] if start_index < len(seq) else 'N'
        end_nt = seq[end_index] if end_index < len(seq) else 'N'
        hover_text = (
            f"<b>Nucleotides:</b> [{start_index + 1}, {end_index + 1}]<br>"
            f"<b>Bases:</b> {start_nt} - {end_nt}<br>"
            f"<b>Probability:</b> {pair_prob:.3f}<br>"
        )

        fig.add_trace(go.Scatter(
            x=x,
            y=y,
            mode='lines', 
            line=dict(color=color, width=2),
            opacity=alpha,
            hovertemplate='%{text}<extra></extra>',
            text=[hover_text] * len(x),
            showlegend=False,
            hoverlabel=dict(
                bgcolor="white",
                font_size=13,
                font_family="Arial",
            )
        ))
    
    for pair in pairs:
        if pair not in bpp_pairs:
            start_index, end_index = pair

            center = ((start_index + end_index) / 2, 0)
            width = (end_index - start_index) / 2
            height = (width + 3) * 0.55

            x = np.linspace(start_index, end_index, max(400, seq_len * 4))
            y = np.sqrt((1. - ((x - center[0]) ** 2 / (width * width))) * (height * height)) + center[1]

            start_nt = seq[start_index] if start_index < len(seq) else 'N'
            end_nt = seq[end_index] if end_index < len(seq) else 'N'
            hover_text = (
                f"<b>Nucleotides:</b> [{start_index + 1}, {end_index + 1}]<br>"
                f"<b>Bases:</b> {start_nt} - {end_nt}<br>"
                f"<b>Probability:</b> Low<br>"
            )

            fig.add_trace(go.Scatter(
                x=x,
                y=y,
                mode='lines',
                line=dict(color="#FFA000", width=2),
                hovertemplate='%{text}<extra></extra>',
                text=[hover_text] * len(x),
                showlegend=False,
                hoverlabel=dict(
                    bgcolor="white",
                    font_size=13,
                    font_family="Arial",
                )
            ))

    x = np.linspace(0, seq_len - 1, seq_len)
    y = np.zeros(seq_len)
    fig.add_trace(go.Scatter(
        x=x,
        y=y,
        mode='lines',
        line=dict(color='black', width=2),
        hoverinfo='skip',
        showlegend=False
    ))

    label_dist_x = seq_len * 0.025
    fig.add_annotation(x=0 - label_dist_x, y=0, text="5'", showarrow=False, font=dict(size=13))
    fig.add_annotation(x=seq_len - 1 + label_dist_x, y=0, text="3'", showarrow=False, font=dict(size=13))

    indices_height = seq_len * (-0.015)
    for index in np.linspace(0, seq_len - 1, 10).round().astype(int):
        fig.add_annotation(x=index, y=indices_height, text=str(index + 1), showarrow=False, font=dict(size=13))

    figwidth = max(12, seq_len // 15) * 100
    figheight = 6 * 100

    fig.update_layout(
        width=figwidth,
        height=figheight,
        xaxis=dict(showgrid=False, showticklabels=False, zeroline=False),
        yaxis=dict(showgrid=False, showticklabels=False, zeroline=False, scaleanchor="x", scaleratio=1),
        plot_bgcolor='white',
        hovermode='closest',
        margin=dict(l=50, r=50, t=50, b=50)
    )

    return fig

def get_linear_plot(struct, seq):
    bpp = base_pair_probs(seq, sym=True, scale=True)
    bpp = format_bpp(bpp)

    pairs = get_pairs(struct)

    fig = draw_rna_linear(bpp, seq, len(seq), pairs)

    return fig.to_json()