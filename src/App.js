import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import heic2any from "heic2any";
import confetti from 'canvas-confetti';

function App() {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [musicSrc, setMusicSrc] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAlbum, setShowAlbum] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [direction, setDirection] = useState(0);

  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const backgrounds = ['#FFB6C1', '#ADD8E6', '#90EE90', '#FFE4B5'];
  const decorations = ['🌸', '🎈', '🎆', '✨'];

  // 🎭 Swipe & Magic Effects
  const variants = {
    enter: (direction) => ({ x: direction > 0 ? 1000 : -1000, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction < 0 ? 1000 : -1000, opacity: 0 })
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

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setCurrentIndex((prev) => (prev + newDirection + images.length) % images.length);
  };

  const saveVideo = async () => {
    setIsSaving(true);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });
      chunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Memories.webm`;
        a.click();
        setIsSaving(false);
      };
      mediaRecorderRef.current.start();
      setTimeout(() => {
        if(mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.stop();
          stream.getTracks().forEach(track => track.stop());
        }
      }, images.length * 4000);
    } catch (err) { setIsSaving(false); }
  };

  useEffect(() => {
    let interval;
    if (showAlbum && images.length > 0 && isPlaying) {
      interval = setInterval(() => paginate(1), 4000);
    }
    return () => clearInterval(interval);
  }, [showAlbum, images, isPlaying]);

  return (
    <div style={{ ...styles.container, background: backgrounds[currentIndex % backgrounds.length] }}>
      {showAlbum && decorations.map((icon, i) => (
        <motion.div key={i} animate={{ y: [0, -200, 0], opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 6 + i, repeat: Infinity }} style={{ ...styles.floatingIcon, left: `${20 * (i + 1)}%` }}>{icon}</motion.div>
      ))}

      {!showAlbum ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.glassCard}>
          <h2 style={{ color: '#ff69b4' }}>Magic Studio ✨</h2>
          <div style={{ display: 'flex', gap: '10px', margin: '20px 0' }}>
            <label style={styles.uploadBtn}>📸 Photos <input type="file" multiple onChange={handleImages} hidden /></label>
            <label style={styles.uploadBtn}>🎵 Music <input type="file" accept="audio/*" onChange={(e) => setMusicSrc(URL.createObjectURL(e.target.files[0]))} hidden /></label>
          </div>
          {images.length > 0 && <button onClick={() => { setShowAlbum(true); setIsPlaying(true); confetti(); }} style={styles.mainBtn}>Start Magic</button>}
          {loading && <p>Processing... ⏳</p>}
        </motion.div>
      ) : (
        <div style={styles.viewer}>
          {/* ⬅️ Top Left Back Arrow */}
          <button onClick={() => setShowAlbum(false)} style={styles.iconBtnLeft}>⬅</button>
          {/* ✕ Top Right Close */}
          <button onClick={() => setShowAlbum(false)} style={styles.iconBtnRight}>✕ Close</button>
          
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(e, { offset, velocity }) => {
                if (offset.x > 100) paginate(-1);
                else if (offset.x < -100) paginate(1);
              }}
              style={styles.imageFrame}
            >
              <img src={images[currentIndex]} style={styles.img} alt="memory" />
            </motion.div>
          </AnimatePresence>

          {/* 🔘 Minimal Bottom Controls */}
          <div style={styles.bottomNav}>
            <button onClick={() => setIsPlaying(!isPlaying)} style={styles.playBtnCircle}>
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button onClick={saveVideo} style={styles.modernSaveBtn}>
              {isSaving ? '⏳' : '📥 Save'}
            </button>
          </div>
        </div>
      )}
      {musicSrc && <audio ref={audioRef} src={musicSrc} autoPlay loop />}
    </div>
  );
}

const styles = {
  container: { width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', position: 'relative' },
  floatingIcon: { position: 'absolute', fontSize: '30px', zIndex: 1, pointerEvents: 'none' },
  glassCard: { padding: '40px', background: 'rgba(255,255,255,0.9)', borderRadius: '30px', textAlign: 'center', zIndex: 10, width: '80%' },
  uploadBtn: { padding: '10px 15px', background: '#fff', border: '1px solid #ff69b4', borderRadius: '50px', color: '#ff69b4', fontWeight: 'bold' },
  mainBtn: { padding: '12px 40px', background: '#ff69b4', color: 'white', border: 'none', borderRadius: '50px', fontWeight: 'bold' },
  viewer: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  iconBtnLeft: { position: 'absolute', top: '30px', left: '25px', zIndex: 100, background: 'white', border: 'none', padding: '10px 15px', borderRadius: '50%', fontWeight: 'bold' },
  iconBtnRight: { position: 'absolute', top: '30px', right: '25px', zIndex: 100, background: 'white', border: 'none', padding: '10px 20px', borderRadius: '50px', fontWeight: 'bold' },
  // ✨ Transparent Border (No more white gaps)
  imageFrame: { width: '90%', height: '70%', background: 'transparent', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  img: { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', borderRadius: '15px' },
  // 🔘 Modern Buttons
  bottomNav: { position: 'absolute', bottom: '50px', display: 'flex', gap: '30px', zIndex: 100 },
  playBtnCircle: { width: '60px', height: '60px', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', fontSize: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' },
  modernSaveBtn: { padding: '12px 35px', background: '#ff69b4', color: 'white', border: 'none', borderRadius: '50px', fontWeight: 'bold', fontSize: '15px', boxShadow: '0 10px 20px rgba(255,105,180,0.3)' }
};

export default App;
