// Aceita propriedades para animar tamanho e estados do Porco
interface PiggyBankAvatarProps {
  progress: number;
  theme?: string;
}

export default function PiggyBankAvatar({ progress, theme = "standard" }: PiggyBankAvatarProps) {
  // SVG Customizado Simples para atuar como o Porquinho Variável
  // O tamanho da barriga do porquinho enche com o `progress` de 0 a 100
  
  // Cores Baseadas no Tema
  const colors = {
    standard: { fill: "#fbcfe8", stroke: "#db2777" },
    gold: { fill: "#fef08a", stroke: "#ca8a04" },
    sad: { fill: "#e2e8f0", stroke: "#64748b" }
  };
  
  const currentColors = colors[theme as keyof typeof colors] || colors.standard;
  
  // Progress determines the Y offset of the "fullness" layer (0 = fully scaled, 100 = full)
  const fullnessScale = 0.5 + Math.min(progress / 100, 1) * 0.5;

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md transition-all duration-700" style={{ transform: `scale(${fullnessScale})`}}>
        {/* Corpo */}
        <ellipse cx="50" cy="55" rx="35" ry="30" fill={currentColors.fill} stroke={currentColors.stroke} strokeWidth="2.5" />
        
        {/* Focinho */}
        <ellipse cx="25" cy="55" rx="8" ry="12" fill={currentColors.fill} stroke={currentColors.stroke} strokeWidth="2" />
        <circle cx="23" cy="52" r="1.5" fill={currentColors.stroke} />
        <circle cx="23" cy="58" r="1.5" fill={currentColors.stroke} />
        
        {/* Orelhas */}
        <polygon points="35,28 42,15 48,25" fill={currentColors.fill} stroke={currentColors.stroke} strokeWidth="2" />
        <polygon points="65,28 72,15 78,25" fill={currentColors.fill} stroke={currentColors.stroke} strokeWidth="2" />
        
        {/* Pés */}
        <rect x="35" y="80" width="8" height="12" rx="4" fill={currentColors.fill} stroke={currentColors.stroke} strokeWidth="2" />
        <rect x="65" y="80" width="8" height="12" rx="4" fill={currentColors.fill} stroke={currentColors.stroke} strokeWidth="2" />
        
        {/* Olho - Variavel de acordo com tema */}
        {theme === "sad" ? (
           <path d="M 40 45 L 45 42 M 45 42 L 50 45" stroke={currentColors.stroke} strokeWidth="2" fill="none" />
        ) : (
           <circle cx="45" cy="45" r="3" fill={currentColors.stroke} />
        )}
        
        {/* Rabo */}
        <path d="M 85 55 Q 92 50 95 60 Q 90 65 92 70" fill="none" stroke={currentColors.stroke} strokeWidth="2" strokeLinecap="round" />
        
        {/* Slot de Moeda */}
        <path d="M 45 28 L 65 28" stroke="#000" strokeWidth="2" opacity="0.3" strokeLinecap="round" />
      </svg>
      
      {/* Moeda Animada Dropando caso progress seja maior que zero */}
      {progress > 0 && theme !== "sad" && (
        <div className="absolute -top-6 animate-bounce">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="#fbbf24" stroke="#d97706" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <text x="12" y="16" fontSize="10" textAnchor="middle" fill="#d97706" fontWeight="bold">$</text>
           </svg>
        </div>
      )}
    </div>
  );
}
