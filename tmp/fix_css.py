file_path = r'c:\Users\sagar\memento\frontend\app\landing.css'
try:
    # Use errors='ignore' to handle any weird encoding issues in the corrupted part
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()

    # Truncate at line 1630 (index 1629)
    # Line 1629 ends with '}' and a newline.
    # Line 1630 is the start of corruption.
    fixed_lines = lines[:1630]
    
    new_css = """
/* ─── DEMO MODAL ─── */
.demo-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 9000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.demo-modal-container {
  width: 100%;
  max-width: 1200px;
  height: 90vh;
  max-height: 800px;
  background: var(--surface);
  backdrop-filter: blur(32px);
  -webkit-backdrop-filter: blur(32px);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: 0 24px 64px rgba(30, 41, 59, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modalSlideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.demo-modal-container.fullscreen {
  max-width: none;
  height: 100vh;
  max-height: none;
  border-radius: 0;
  border: none;
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.demo-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.3);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.demo-status-badges {
  display: flex;
  gap: 0.5rem;
}

.modal-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0.4rem 0.8rem;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 4px 12px rgba(30, 41, 59, 0.05);
}

.live-badge {
  color: #10b981;
}

.time-badge {
  color: var(--amber);
}

.pulse-dot.active {
  background: #10b981;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5);
  animation: pulse-green 2s ease-in-out infinite;
}

@keyframes pulse-green {
  0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
  50% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
}

.modal-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid transparent;
  color: var(--text2);
  transition: all 0.2s;
  cursor: pointer;
}

.modal-icon-btn:hover {
  background: rgba(255, 255, 255, 0.8);
  color: var(--text1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(30, 41, 59, 0.08);
}

.modal-icon-btn.active {
  background: var(--amber);
  color: white;
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.3);
}

.modal-icon-btn.close-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.modal-icon-btn.close-btn:hover {
  background: #ef4444;
  color: white;
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
}

.demo-modal-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
}

.demo-modal-sidebar {
  width: 260px;
  background: rgba(255, 255, 255, 0.15);
  border-right: 1px solid var(--border);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.qr-container-glass {
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  padding: 1.5rem 1rem;
  text-align: center;
  box-shadow: 0 8px 32px rgba(30, 41, 59, 0.05);
}

.qr-box {
  background: white;
  padding: 0.5rem;
  border-radius: 12px;
  display: inline-block;
  box-shadow: 0 4px 20px rgba(245, 158, 11, 0.15);
}

.demo-modal-main {
  flex: 1;
  overflow-y: auto;
  position: relative;
  background: rgba(250, 249, 253, 0.3);
}

.demo-empty-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

/* Modal Grid View */
.demo-grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
}

.demo-grid-item {
  aspect-ratio: 1;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid var(--border);
  box-shadow: 0 8px 24px rgba(30, 41, 59, 0.05);
  animation: photoEnter 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
  transition: transform 0.3s, box-shadow 0.3s;
}

.demo-grid-item:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 32px rgba(30, 41, 59, 0.1);
  z-index: 10;
}

@keyframes photoEnter {
  0% { opacity: 0; transform: scale(0.9) translateY(20px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

.demo-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: filter 0.3s;
}

.demo-item-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: linear-gradient(to top, rgba(15, 23, 42, 0.8), transparent);
  color: white;
  transform: translateY(10px);
  opacity: 0;
  transition: all 0.3s;
}

.demo-grid-item:hover .demo-item-overlay {
  transform: translateY(0);
  opacity: 1;
}

.demo-item-overlay .caption {
  font-size: 0.9rem;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.demo-item-overlay .uploader {
  font-size: 0.75rem;
  color: var(--amber);
}

/* Modal Polaroid View */
.demo-polaroid-view {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.polaroid-float-demo {
  width: 200px;
  padding: 0.75rem 0.75rem 2rem 0.75rem;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 16px 40px rgba(30, 41, 59, 0.1);
  animation: floatDemo 6s ease-in-out infinite alternate;
  transform: rotate(var(--rot, 0deg));
}

@keyframes floatDemo {
  0% { transform: translateY(0) rotate(var(--rot, 0deg)); }
  100% { transform: translateY(-15px) rotate(calc(var(--rot, 0deg) + 3deg)); }
}

.polaroid-img-wrapper {
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 0.75rem;
  background: rgba(0,0,0,0.05);
}

.polaroid-caption {
  text-align: center;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text1);
}

/* Modal Slideshow View */
.demo-slideshow-view {
  width: 100%;
  height: 100%;
  position: relative;
  background: rgba(10, 15, 30, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
}

.demo-media-slide {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  animation: slideFade 1s ease-in-out;
}

@keyframes slideFade {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}

.slide-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  color: white;
}

.slide-caption {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.slide-uploader {
  font-size: 1rem;
  color: var(--amber);
}

@media (max-width: 768px) {
  .demo-modal-body {
    flex-direction: column;
  }
  .demo-modal-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--border);
    padding: 1rem;
  }
  .qr-container-glass {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem;
    text-align: left;
  }
  .qr-container-glass h3, .qr-container-glass p {
    margin-bottom: 0;
  }
  .qr-box {
    transform: scale(0.6);
    transform-origin: right center;
    margin: -1rem;
  }
  .demo-modal-container {
    height: 100vh;
    height: 100dvh;
    max-height: none;
    border-radius: 0;
  }
}
"""
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(fixed_lines)
        f.write(new_css)
    print("File fixed and CSS appended successfully.")
except Exception as e:
    print(f"Error: {e}")
