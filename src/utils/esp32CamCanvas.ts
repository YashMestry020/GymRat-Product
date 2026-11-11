// Generates realistic optical camera frame capture data URLs for the virtual local storage gallery

export interface CapturedFrame {
  id: string;
  filename: string;
  repNumber: number;
  timestamp: string;
  repIntervalSec: number | null;
  phase: 'PEAK_CHIN_OVER_BAR' | 'FULL_EXTENSION_VERIFIED';
  dataUrl: string;
}

export function generateEsp32CamSnapshot(
  repNumber: number,
  intervalSec: number | null
): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Dark sensor frame background
  ctx.fillStyle = '#111317';
  ctx.fillRect(0, 0, 320, 200);

  // Subtle calibration grid
  ctx.strokeStyle = 'rgba(245, 184, 0, 0.14)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= 320; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 200);
    ctx.stroke();
  }
  for (let y = 0; y <= 200; y += 25) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(320, y);
    ctx.stroke();
  }

  // Pull-up bar horizontal line
  ctx.strokeStyle = '#9CA3AF';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(30, 48);
  ctx.lineTo(290, 48);
  ctx.stroke();

  // IR optical threshold dashed line
  ctx.save();
  ctx.setLineDash([5, 4]);
  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(20, 62);
  ctx.lineTo(300, 62);
  ctx.stroke();
  ctx.restore();

  // Stylized athlete silhouette at chin-over-bar peak
  ctx.strokeStyle = '#F5B800';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Head above bar
  ctx.beginPath();
  ctx.arc(160, 42, 13, 0, Math.PI * 2);
  ctx.fillStyle = '#1E2024';
  ctx.fill();
  ctx.stroke();

  // Shoulders & Torso
  ctx.beginPath();
  ctx.moveTo(132, 72);
  ctx.lineTo(188, 72);
  ctx.moveTo(160, 56);
  ctx.lineTo(160, 128);
  ctx.stroke();

  // Flexed arms gripping bar
  ctx.beginPath();
  ctx.moveTo(132, 72);
  ctx.lineTo(116, 86);
  ctx.lineTo(124, 48);
  ctx.moveTo(188, 72);
  ctx.lineTo(204, 86);
  ctx.lineTo(196, 48);
  ctx.stroke();

  // Legs
  ctx.beginPath();
  ctx.moveTo(160, 128);
  ctx.lineTo(148, 178);
  ctx.moveTo(160, 128);
  ctx.lineTo(172, 178);
  ctx.stroke();

  // Top & Bottom OSD telemetry bar (like on-device camera JPEG overlay)
  ctx.fillStyle = 'rgba(17, 19, 23, 0.85)';
  ctx.fillRect(0, 0, 320, 22);
  ctx.fillRect(0, 178, 320, 22);

  ctx.fillStyle = '#F5B800';
  ctx.font = 'bold 11px monospace';
  ctx.fillText(`CAM-OPT · REP #${repNumber}`, 10, 15);

  ctx.fillStyle = '#10B981';
  ctx.fillText('IR PEAK LOCKED', 212, 15);

  ctx.fillStyle = '#D1D5DB';
  ctx.font = '10px monospace';
  const paceTxt = intervalSec === null ? 'STARTING REP' : `DELTA: ${intervalSec.toFixed(1)}s`;
  ctx.fillText(`/sdcard/GYMRAT_${String(repNumber).padStart(3, '0')}.JPG`, 10, 192);
  ctx.fillText(paceTxt, 218, 192);

  return canvas.toDataURL('image/png');
}
