import './App.css'
import { useEffect } from 'react'

function App() {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = '/animateImages.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return (
    <div className="page">
      <div className="animation">
        <img
          src="http://www.g2conline.org/3dbrain/images/cshl_dnalc_logo_white.png"
          alt="DNA Learning Center"
          style={{ marginBottom: '15px' }}
        />
      </div>

      <h1 className="pageHeader">3D Brain</h1>

      <div className="selectDropdown">
        <select className="choices" id="choices" defaultValue="" />
      </div>

      <div className="animation">
        <div className="imagesDiv">
          <img
            className="relativeImage"
            src="http://www.g2conline.org/3dbrain/images/loading.jpg"
            alt=""
          />
          <div className="imageHolder" id="imageHolder" />
        </div>
        <div>
          <div>
            <input
              alt="Up"
              id="up"
              type="image"
              src="http://www.g2conline.org/3dbrain/images/up.png"
            />
          </div>
          <div>
            <input
              alt="Left"
              id="left"
              type="image"
              src="http://www.g2conline.org/3dbrain/images/left.png"
            />
            <input
              alt="Center"
              id="center"
              type="image"
              src="http://www.g2conline.org/3dbrain/images/center.png"
            />
            <input
              alt="Right"
              id="right"
              type="image"
              src="http://www.g2conline.org/3dbrain/images/right.png"
            />
          </div>
          <div>
            <input
              alt="Down"
              id="down"
              type="image"
              src="http://www.g2conline.org/3dbrain/images/down.png"
            />
          </div>
          <div className="labelDiv">
            <input
              alt="Labels"
              id="labels"
              type="image"
              src="http://www.g2conline.org/3dbrain/images/labels.png"
            />
          </div>
        </div>
      </div>

      <div className="textSource" id="textSource" />
      <canvas className="hidden" id="canvas" />
    </div>
  )
}

export default App
