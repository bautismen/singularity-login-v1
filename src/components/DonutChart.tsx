import { useEffect, useRef } from 'react';

interface DonutChartProps {
  data: Array<{
    statusId: number;
    statusName: string;
    percentage: number;
  }>;
  total: number;
}

const STATUS_COLORS: Record<number, string> = {
  1: '#14B8A6', // Nueva - Teal
  2: '#3B82F6', // Enviada - Blue
  3: '#8B5CF6', // Asignada - Purple
  4: '#F59E0B', // Parcialmente Cotizada - Amber
  5: '#10B981', // Completamente Cotizada - Green
  6: '#EF4444', // Declinada - Red
  7: '#6B7280', // Cancelada - Gray
  8: '#06B6D4', // Aceptada - Cyan
};

export function DonutChart({ data, total }: DonutChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 80;
    const innerRadius = 55;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let currentAngle = -Math.PI / 2;

    const totalValue = data.reduce((sum, item) => sum + item.percentage, 0);

    data.forEach((item) => {
      const sliceAngle = (item.percentage / totalValue) * 2 * Math.PI;
      const color = STATUS_COLORS[item.statusId] || '#94A3B8';

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      currentAngle += sliceAngle;
    });

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = '#111827';
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total.toString(), centerX, centerY - 5);

    ctx.fillStyle = '#6B7280';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('TOTALES', centerX, centerY + 15);
  }, [data, total]);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        <canvas ref={canvasRef} width={200} height={200} />
      </div>
      <div className="flex flex-col gap-1">
        {data.map((item) => (
          <div key={item.statusId} className="flex items-center gap-4">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: STATUS_COLORS[item.statusId] || '#94A3B8' }}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {item.statusName}
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white ml-auto">
              {item.percentage.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
