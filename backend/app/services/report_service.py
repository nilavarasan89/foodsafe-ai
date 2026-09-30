import os
import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from sqlalchemy.orm import Session
from app.models.domain import Batch, Inspection, Report

class ReportService:
    @staticmethod
    def generate_batch_pdf(db: Session, batch_id: str, generated_by: str = "admin@foodsafe.ai") -> bytes:
        batch = db.query(Batch).filter(Batch.id == batch_id).first()
        if not batch:
            batch = db.query(Batch).first()

        inspections = db.query(Inspection).filter(Inspection.batch_id == batch.id).order_by(Inspection.timestamp.desc()).limit(20).all()

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=22,
            textColor=colors.HexColor('#0F172A'),
            spaceAfter=4
        )
        
        subtitle_style = ParagraphStyle(
            'ReportSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=11,
            textColor=colors.HexColor('#2563EB'),
            spaceAfter=15
        )

        section_heading = ParagraphStyle(
            'SectionHeading',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=14,
            textColor=colors.HexColor('#1E293B'),
            spaceBefore=12,
            spaceAfter=6
        )

        body_style = ParagraphStyle(
            'ReportBody',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            textColor=colors.HexColor('#334155'),
            spaceAfter=6
        )

        disclaimer_style = ParagraphStyle(
            'ReportDisclaimer',
            parent=styles['Italic'],
            fontName='Helvetica-Oblique',
            fontSize=8,
            textColor=colors.HexColor('#64748B'),
            spaceBefore=10,
            spaceAfter=10
        )

        story = []

        # Header Title
        story.append(Paragraph("FOODSAFE AI", title_style))
        story.append(Paragraph("AI-Powered Inline Food Inspection & Intelligent Traceability Report", subtitle_style))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#CBD5E1'), spaceAfter=15))

        # Batch Summary Metadata Table
        batch_code = batch.batch_code if batch else "N/A"
        food_type = batch.food_type if batch else "N/A"
        supplier = batch.supplier if batch else "N/A"
        date_str = batch.production_date.strftime("%Y-%m-%d %H:%M") if batch else datetime.utcnow().strftime("%Y-%m-%d")

        meta_data = [
            [Paragraph("<b>Batch Code:</b>", body_style), Paragraph(batch_code, body_style), Paragraph("<b>Production Date:</b>", body_style), Paragraph(date_str, body_style)],
            [Paragraph("<b>Food Type:</b>", body_style), Paragraph(food_type, body_style), Paragraph("<b>Supplier:</b>", body_style), Paragraph(supplier, body_style)],
            [Paragraph("<b>Total Inspected:</b>", body_style), Paragraph(str(batch.inspected_count if batch else 0), body_style), Paragraph("<b>Reject Rate:</b>", body_style), Paragraph(f"{batch.reject_rate if batch else 0.0}%", body_style)]
        ]

        t_meta = Table(meta_data, colWidths=[110, 150, 110, 150])
        t_meta.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
            ('PADDING', (0,0), (-1,-1), 6),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#E2E8F0')),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ]))
        story.append(t_meta)
        story.append(Spacer(1, 15))

        # KPI Breakdown Table
        story.append(Paragraph("Three-Way Decision Metrics", section_heading))
        kpi_data = [
            ["Metric", "Count", "Percentage", "System Action"],
            ["ACCEPTED (Green)", str(batch.accepted_count if batch else 0), f"{((batch.accepted_count/batch.inspected_count)*100 if batch and batch.inspected_count>0 else 0):.1f}%", "Passed on Main Conveyor"],
            ["VERIFY (Yellow)", str(batch.verify_count if batch else 0), f"{((batch.verify_count/batch.inspected_count)*100 if batch and batch.inspected_count>0 else 0):.1f}%", "Diverted to Verification Bin"],
            ["REJECTED (Red)", str(batch.rejected_count if batch else 0), f"{((batch.rejected_count/batch.inspected_count)*100 if batch and batch.inspected_count>0 else 0):.1f}%", "Rejected via Servo Valve"]
        ]

        t_kpi = Table(kpi_data, colWidths=[140, 90, 90, 200])
        t_kpi.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0F172A')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 9),
            ('BOTTOMPADDING', (0,0), (-1,0), 6),
            ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#F0FDF4')),
            ('BACKGROUND', (0,2), (-1,2), colors.HexColor('#FEFCE8')),
            ('BACKGROUND', (0,3), (-1,3), colors.HexColor('#FEF2F2')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ]))
        story.append(t_kpi)
        story.append(Spacer(1, 15))

        # Sample Inspection Records Table
        story.append(Paragraph("Recent Inspection Log Snippet", section_heading))
        ins_table_data = [["Inspection ID", "Timestamp", "Prediction", "Confidence", "Decision", "Status"]]
        
        for ins in inspections:
            time_str = ins.timestamp.strftime("%H:%M:%S")
            conf_str = f"{ins.confidence*100:.1f}%"
            ins_table_data.append([
                ins.inspection_code,
                time_str,
                ins.prediction_raw,
                conf_str,
                ins.decision,
                ins.verification_status
            ])

        t_ins = Table(ins_table_data, colWidths=[100, 80, 100, 80, 80, 80])
        t_ins.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E293B')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 8.5),
            ('PADDING', (0,0), (-1,-1), 4),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ]))
        story.append(t_ins)
        story.append(Spacer(1, 15))

        # Scientific Disclaimer
        story.append(Paragraph("<b>Scientific & Regulatory Disclaimer:</b> This report represents inline NIR spectral classification and confidence screening results generated by FOODSAFE AI edge nodes. Thresholds are application configuration parameters. Flagged anomalies indicate potential contamination risk requiring human operator verification or official laboratory diagnostic validation.", disclaimer_style))
        story.append(Spacer(1, 10))

        # Signature Line
        sig_data = [
            [Paragraph("Report Generated By: " + generated_by, body_style), Paragraph("Quality Assurance Approval: __________________", body_style)]
        ]
        t_sig = Table(sig_data, colWidths=[260, 260])
        story.append(t_sig)

        doc.build(story)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes

report_service = ReportService()
