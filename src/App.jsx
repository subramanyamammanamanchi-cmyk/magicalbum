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
      
      {/* Background Floating Decorations */}
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
          <h2 style={{color: 'white', marginBottom: '15px'}}>Magical Album ✨</h2>
          <p style={{color: '#eee', fontSize: '12px'}}>Cast to TV & Lock Phone</p>
          
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

          {loading && <p style={{color: 'white', marginTop: '10px'}}>Processing HEIC images...</p>}

          {images.length > 0 && (
            <button onClick={() => { setShowAlbum(true); setIsPlaying(true); confetti(); }} style={styles.mainBtn}>
              Create Magic ✨
            </button>
          )}
        </motion.div>
      ) : (
        <div style={styles.viewer}>
          <div style={styles.topControls}>
            <button onClick={() => setShowAlbum(false)} style={styles.iconBtn}>⬅</button>
            
            {/* Google Cast Button */}
            <div style={styles.castWrapper}>
               <google-cast-launcher id="castbutton"></google-cast-launcher>
            </div>

            <button onClick={toggleFullScreen} style={styles.iconBtn}>⛶</button>
            <button onClick={() => setShowAlbum(false)} style={styles.iconBtn}>✕</button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ scale: 0.1, opacity: 0 }}
              animate={{ scale: [0.1, 1.2, 1], opacity: 1 }}
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
  container: { height: '100vh', width: '100vw', overflow: 'hidden', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'background 2s ease' },
  floatingText: { position: 'absolute', fontSize: '2rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none', zIndex: 1 },
  glassCard: { background: 'rgba(255, 255, 255, 0.2)', padding: '30px', borderRadius: '20px', backdropFilter: 'blur(10px)', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', width: '80%', maxWidth: '400px', zIndex: 10 },
  textInput: { width: '100%', padding: '12px', borderRadius: '10px', border: 'none', marginBottom: '10px', outline: 'none', fontSize: '16px' },
  uploadBtn: { background: '#63cdda', padding: '10px 20px', borderRadius: '30px', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
  mainBtn: { marginTop: '20px', width: '100%', background: '#f8a5c2', color: 'white', border: 'none', padding: '15px', borderRadius: '30px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' },
  viewer: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  topControls: { position: 'absolute', top: '20px', width: '90%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 20 },
  iconBtn: { background: 'rgba(255,255,255,0.3)', border: 'none', color: 'white', padding: '10px', borderRadius: '50%', cursor: 'pointer', fontSize: '20px' },
  castWrapper: { background: 'white', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  imageFrame: { width: '85vw', height: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 5 },
  imgResponsive: { maxWidth: '100%', maxHeight: '100%', borderRadius: '15px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', border: '5px solid white' },
  bottomBar: { position: 'absolute', bottom: '30px', zIndex: 20 },
  playCircle: { width: '60px', height: '60px', borderRadius: '50%', background: 'white', border: 'none', fontSize: '24px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }
};

export default App;
