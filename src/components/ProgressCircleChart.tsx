import './ProgressCircle.css';

interface ProgressCircleProps {
  percentage: number; // valor de 0 a 100
  size?: number;      // tamaño del círculo
  strokeWidth?: number; // grosor del donut
  color?: string;     // color principal del progreso
  backgroundColor?: string; // color de fondo
  showText?: boolean; // mostrar porcentaje en el centro
}

export function ProgressCircle({
  percentage,
  size = 200,
  strokeWidth = 20,
  color = "#3B82F6",
  backgroundColor = "#E5E7EB",
  showText = true,
}: ProgressCircleProps) {

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percentage / 100);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        {showText && (
          <text
            x="50%"
            y="50%"
            fill="var(--textCenter-ProgressChart)"
            fontSize={size * 0.2}
            fontWeight="800"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {`${percentage.toFixed(0)}%`}
          </text>
        )}
      </svg>
    </div>
  );
}