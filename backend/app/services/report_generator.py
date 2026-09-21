import os
import json
import base64
from pathlib import Path
from typing import Dict, Any
from app.core.config import REPORTS_DIR

import time

class ReportGenerator:
    @staticmethod
    def generate_html_report(analysis_result: Dict[str, Any]) -> str:

        query = analysis_result.get("query", "Remote Sensing Query")
        task_type = analysis_result.get("task_type", "SINGLE_VQA")
        answer = analysis_result.get("answer", "")
        confidence = int(analysis_result.get("confidence", 0.9) * 100)
        tool_name = analysis_result.get("selected_tool", {}).get("name", "RS Tool")
        trace_log = analysis_result.get("trace_log", [])
        image_metadata = analysis_result.get("image_metadata", [])
        previews = analysis_result.get("image_previews", [])
        boxes = analysis_result.get("grounding_boxes", [])

        # Build metadata rows
        meta_rows = ""
        for idx, meta in enumerate(image_metadata):
            meta_rows += f"""
            <tr>
                <td><strong>Image {idx+1} ({meta.get('filename')})</strong></td>
                <td>{meta.get('modality')}</td>
                <td>{meta.get('dimensions')}</td>
                <td>{meta.get('crs')}</td>
                <td>{meta.get('resolution')}</td>
                <td>{', '.join(meta.get('sar_polarization', [])) or 'RGB/Multispectral'}</td>
            </tr>
            """

        # Build trace log rows
        trace_rows = ""
        for step in trace_log:
            trace_rows += f"""
            <tr>
                <td>Step {step.get('step')}</td>
                <td><strong>{step.get('action')}</strong></td>
                <td>{step.get('status', 'OK')}</td>
                <td>{step.get('latency_ms', 0)} ms</td>
                <td>{step.get('details', step.get('tool_name', step.get('task_type', 'Completed')))}</td>
            </tr>
            """

        # Build images HTML
        images_html = ""
        for idx, prev in enumerate(previews):
            images_html += f"""
            <div style="flex: 1; min-width: 300px; text-align: center; margin: 10px;">
                <h4>Image {idx+1}: {image_metadata[idx].get('filename') if idx < len(image_metadata) else ''}</h4>
                <img src="{prev}" style="max-width: 100%; height: auto; border-radius: 8px; border: 1px solid #cbd5e1; shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
            </div>
            """

        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>SatQuery AI - Execution Audit Report</title>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 30px; }}
        .card {{ background: #ffffff; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }}
        h1 {{ color: #1e3a8a; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; margin-top: 0; }}
        h2 {{ color: #1e293b; margin-top: 0; font-size: 1.25rem; }}
        .badge {{ display: inline-block; padding: 4px 12px; border-radius: 9999px; background: #dbeafe; color: #1e40af; font-weight: 600; font-size: 0.875rem; }}
        .confidence {{ background: #dcfce7; color: #166534; }}
        table {{ width: 100%; border-collapse: collapse; margin-top: 12px; }}
        th, td {{ border: 1px solid #e2e8f0; padding: 10px 14px; text-align: left; font-size: 0.9rem; }}
        th {{ background: #f1f5f9; color: #334155; font-weight: 600; }}
        .answer-box {{ background: #eff6ff; border-left: 4px solid #2563eb; padding: 16px; border-radius: 4px; font-size: 1.05rem; line-height: 1.6; white-space: pre-line; }}
        .footer {{ text-align: center; color: #64748b; font-size: 0.8rem; margin-top: 40px; }}
    </style>
</head>
<body>
    <div class="card">
        <h1>SatQuery AI - Multimodal RS Analysis Audit Report</h1>
        <p><strong>Indian Space Research Organisation (ISRO) - SIH 2026 PS 26167</strong></p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0;" />
        <p><strong>Query:</strong> <em>"{query}"</em></p>
        <p>
            <span class="badge">Task: {task_type}</span>
            <span class="badge">Tool: {tool_name}</span>
            <span class="badge confidence">Confidence: {confidence}%</span>
        </p>
    </div>

    <div class="card">
        <h2>Visual Evidence & Imagery</h2>
        <div style="display: flex; flex-wrap: wrap;">
            {images_html}
        </div>
    </div>

    <div class="card">
        <h2>Evidence-Grounded Answer</h2>
        <div class="answer-box">
            {answer}
        </div>
    </div>

    <div class="card">
        <h2>Geospatial Input Compatibility & Metadata</h2>
        <table>
            <thead>
                <tr>
                    <th>Input File</th>
                    <th>Modality</th>
                    <th>Dimensions</th>
                    <th>CRS</th>
                    <th>Resolution</th>
                    <th>Bands / Polarizations</th>
                </tr>
            </thead>
            <tbody>
                {meta_rows}
            </tbody>
        </table>
    </div>

    <div class="card">
        <h2>Auditable Agentic Execution Trace</h2>
        <table>
            <thead>
                <tr>
                    <th>Step</th>
                    <th>Action</th>
                    <th>Status</th>
                    <th>Latency</th>
                    <th>Details / Output</th>
                </tr>
            </thead>
            <tbody>
                {trace_rows}
            </tbody>
        </table>
    </div>

    <div class="footer">
        Generated automatically by SatQuery AI Agentic Controller | ISRO SIH 2026
    </div>
</body>
</html>
        """
        filename = f"satquery_report_{int(time.time() * 1000)}.html"
        report_path = REPORTS_DIR / filename

        with open(report_path, "w", encoding="utf-8") as f:
            f.write(html_content)

        return str(report_path)
