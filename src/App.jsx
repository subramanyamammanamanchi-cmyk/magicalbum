import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import heic2any from "heic2any";
import confetti from 'canvas-confetti';

function App() {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [albumTitle, setAlbumTitle] = useState("");
  const [musicSrc, setMusicSrc] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAlbum, setShowAlbum] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  const backgrounds = ['#f8a5c2', '#778beb', '#63cdda', '#786fa6', '#cf6a87', '#f19066'];
  const decorations = ['🌸', '🎈', '🎆', '✨', '🦋', '🍭', '💖', '🌈'];
  
  const exitPoints = [
    { x: -1200, y: -1200, rotate: -90 }, { x: 1200, y: -1200, rotate: 90 },
    { x: -1200, y: 1200, rotate: -45 }, { x: 1200, y: 1200, rotate: 45 },
    { x: 0, y: -1500, rotate: 0 }, { x: 0, y: 1500, rotate: 180 }
  ];

  const getRandomExit = () => exitPoints[Math.floor(Math.random() * exitPoints.length)];

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => alert(err.message));
    } else {
      document.exitFullscreen();
    }
  };

  const handleImages = async (e) => {
    setLoading(true);
    const files = Array.from(e.target.files);
    const photoUrls = [];
    for (let file of files) {
      if (file.name.toLowerCase().endsWith(".heic")) {
        try {
          const blob = await heic2any({ blob: file, toType: "image/jpeg" });
          photoUrls.push(URL.createObjectURL(blob));
        } catch (err) { console.error(err); }
      } else {
        photoUrls.push(URL.createObjectURL(file));
      }
    }
    setImages(photoUrls);
    setLoading(false);
  };

  useEffect(() => {
    let interval;
    if (showAlbum && images.length > 0 && isPlaying) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 7000);
    }
    return () => clearInterval(interval);
  }, [showAlbum, images, isPlaying]);

  return (
    <div ref={containerRef} style={{ ...styles.container, background: backgrounds[currentIndex % backgrounds.length] }}>
      
      {/* Background Titles */}
      {showAlbum && [...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: "110vh", x: `${(i * 15) + 5}vw`, opacity: 0 }}
          animate={{ y: "-30vh", opacity: [0, 0.6, 0] }}
          transition={{ duration: 12 + i * 2, repeat: Infinity, ease: "linear" }}
          style={styles.floatingText}
        >
          {albumTitle || "Memories"} {decorations[i % decorations.length]}
        </motion.div>
      ))}

      {!showAlbum ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.glassCard}>
          <h2 style={{color: 'white', marginBottom: '15px'}}>Magic Studio ✨</h2>
          <input 
            type="text" 
            placeholder="Album Title..." 
            style={styles.textInput}
            value={albumTitle}
            onChange={(e) => setAlbumTitle(e.target.value)}
          />
          <div style={{display: 'flex', gap: '10px', marginTop: '15px', justifyContent: 'center'}}>
            <label style={styles.uploadBtn}>📸 Photos <input type="file" multiple onChange={handleImages} hidden /></label>
            <label style={styles.uploadBtn}>🎵 Music <input type="file" accept="audio/*" onChange={(e) => setMusicSrc(URL.createObjectURL(e.target.files[0]))} hidden /></label>
          </div>
          {images.length > 0 && <button onClick={() => { setShowAlbum(true); setIsPlaying(true); confetti(); }} style={styles.mainBtn}>Start Show</button>}
        </motion.div>
      ) : (
        <div style={styles.viewer}>
          <div style={styles.topControls}>
            <button onClick={() => setShowAlbum(false)} style={styles.iconBtn}>⬅</button>
            <button onClick={toggleFullScreen} style={styles.iconBtn}>⛶ Full</button>
            <button onClick={() => setShowAlbum(false)} style={styles.iconBtn}>✕</button>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ scale: 0.1, opacity: 0 }}
              animate={{ scale: [0.1, 1.5, 1], opacity: 1 }}
              exit={{ scale: 0.1, opacity: 0, x: getRandomExit().x, y: getRandomExit().y }}
              transition={{ duration: 4, times: [0, 0.7, 1], ease: "easeInOut" }}
              style={styles.imageFrame}
            >
              <img src={images[currentIndex]} style={styles.imgResponsive} alt="memory" />
            </motion.div>
          </AnimatePresence>

          <div style={styles.bottomBar}>
            <button onClick={() => setIsPlaying(!isPlaying)} style={styles.playCircle}>
              {isPlaying ? '⏸' : '▶'}
            </button>
          </div>
        </div>
      )}
      {musicSrc && <audio src={musicSrc} autoPlay loop />}
    </div>
  );
}

const styles = {
  container: { width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', position: 'relative' },
  floatingText: { position: 'absolute', zIndex: 1, color: 'rgba(255, 255, 255, 0.8)', fontWeight: '1000', fontSize: '5vw', pointerEvents: 'none', fontFamily: '"Comic Sans MS", cursive', textShadow: '2px 2px 10px rgba(0,0,0,0.2)', whiteSpace: 'nowrap' },
  glassCard: { padding: '30px', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', borderRadius: '20px', textAlign: 'center', width: '85%', maxWidth: '450px' },
  textInput: { width: '100%', padding: '10px', borderRadius: '10px', border: 'none', outline: 'none' },
  uploadBtn: { padding: '8px 15px', background: 'white', borderRadius: '20px', color: '#ff6bad', fontWeight: 'bold', fontSize: '12px' },
  mainBtn: { marginTop: '20px', padding: '12px 35px', background: '#ff6bad', color: 'white', border: 'none', borderRadius: '50px', fontWeight: 'bold' },
  viewer: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  topControls: { position: 'absolute', top: '20px', width: '90%', display: 'flex', justifyContent: 'space-between', zIndex: 110 },
  iconBtn: { background: 'rgba(255,255,255,0.3)', border: 'none', padding: '8px 12px', borderRadius: '15px', color: 'white', fontWeight: 'bold' },
  
  // 📱💻 Responsive Image Frame
  imageFrame: { 
    width: '90%', 
    height: 'auto', 
    aspectRatio: '16 / 9', // టీవీ కోసం 16:9
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 10 
  },
  imgResponsive: { 
    maxWidth: '100%', 
    maxHeight: '90vh', // మొబైల్ లో ఫోటో కట్ అవ్వకుండా 
    objectFit: 'contain', 
    borderRadius: '15px', 
    border: '5px solid white', 
    boxShadow: '0 20px 50px rgba(0,0,0,0.3)' 
  },
  
  bottomBar: { position: 'absolute', bottom: '40px', zIndex: 110 },
  playCircle: { width: '60px', height: '60px', background: 'white', border: 'none', borderRadius: '50%', fontSize: '24px', color: '#ff6bad' }
};

export default App;
