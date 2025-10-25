import React from "react"; 
import { useNavigate } from "react-router-dom"; 

const COLORS = { 
  navy: "#0B2A5A", 
  navy2: "#102F6A", 
  white: "#FFFFFF", 
  coral: "#FF6B6B", 
  blue: "#11A7FF", 
}; 

function BrokenHeart({ size = 140 }: { size?: number }) { 
  // cœur bleu cassé (plein) 
  return ( 
    <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden="true"> 
      <path 
        d="M100 170c-28-28-80-49-80-95C20 50 36 34 56 34c14 0 27 7 34 18l-13 22 23 21-9 35 26-29-15-20 12-22c6-11 19-18 33-18 20 0 36 16 36 41 0 46-52 67-80 95z" 
        fill={COLORS.blue} 
      /> 
    </svg> 
  ); 
} 

export default function MatchEnded({ onOk }: { onOk?: () => void }) { 
  const navigate = useNavigate(); 

  const handleOk = () => { 
    if (onOk) onOk(); 
    else navigate("/discover", { replace: true }); 
  }; 

  return ( 
    <div style={styles.screen}> 
      <div style={styles.center}> 
        <BrokenHeart /> 
        <h1 style={styles.title}>Match terminé</h1> 
      </div> 

      <button style={styles.cta} onClick={handleOk}> 
        OK 
      </button> 

      <div style={styles.homeIndicator} /> 
    </div> 
  ); 
} 

const styles: Record<string, React.CSSProperties> = { 
  screen: { 
    minHeight: "100vh", 
    background: `linear-gradient(160deg, ${COLORS.navy}, ${COLORS.navy2})`, 
    color: COLORS.white, 
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif", 
    display: "grid", 
    gridTemplateRows: "1fr auto auto", 
    padding: "24px 18px", 
  }, 
  center: { 
    display: "grid", 
    placeItems: "center", 
    gap: 18, 
  }, 
  title: { 
    margin: 0, 
    fontSize: 40, 
    fontWeight: 800, 
    textAlign: "center" as const, 
  }, 
  cta: { 
    justifySelf: "center", 
    width: "min(640px, 92vw)", 
    border: "none", 
    background: COLORS.coral, 
    color: COLORS.white, 
    borderRadius: 40, 
    padding: "18px 22px", 
    fontSize: 22, 
    fontWeight: 800, 
    cursor: "pointer", 
    boxShadow: "0 16px 32px rgba(255,107,107,0.35)", 
  }, 
  homeIndicator: { 
    height: 6, 
    width: 140, 
    borderRadius: 999, 
    background: "rgba(255,255,255,0.55)", 
    justifySelf: "center", 
    marginTop: 12, 
  }, 
}; 