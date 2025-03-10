import React, { useState, useRef } from 'react';
import file6 from "src/assets/images/file6.png";
import './styles.css';

const PhotoGallery = () => {
  const imagesDatas = {
    images: [
      { src: file6, alt: "Sample Image 1", caption: "照片1" },
      { src: file6, alt: "Sample Image 2", caption: "照片2" },
      { src: file6, alt: "Sample Image 3", caption: "照片3" },
      { src: file6, alt: "Sample Image 4", caption: "照片4" },
      { src: file6, alt: "Sample Image 5", caption: "照片5" },
      { src: file6, alt: "Sample Image 6", caption: "照片6" },
      { src: file6, alt: "Sample Image 7", caption: "照片7" },
      { src: file6, alt: "Sample Image 8", caption: "照片8" }
    ],
    images_online: [
      { src: file6, alt: "Sample Image 1", caption: "照片1" },
      { src: file6, alt: "Sample Image 2", caption: "照片2" },
      { src: file6, alt: "Sample Image 3", caption: "照片3" },
    ],
    images_outline: [
      { src: file6, alt: "Sample Image 1", caption: "照片1" },
      { src: file6, alt: "Sample Image 2", caption: "照片2" },
    ],
    images_coldData: [
      { src: file6, alt: "Sample Image 1", caption: "照片1" },
    ],
  };

  const [currentImage, setCurrentImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentScale, setCurrentScale] = useState(1);
  const lightboxRef = useRef(null);
  const currentCategoryRef = useRef(null);
  const prevButtonRef = useRef(null);
  const nextButtonRef = useRef(null);

  const openLightbox = (src, categoryIndex, index) => {
    setCurrentImage(src);
    setCurrentIndex(index);
    currentCategoryRef.current = categoryIndex;
    const categoryImages = imagesDatas[categoryIndex];
    console.log(categoryImages);
    lightboxRef.current.style.display = 'flex';
    document.body.classList.add('no-scroll');
    if (categoryImages.length >= 2) {
      prevButtonRef.current.style.display = 'block';
      nextButtonRef.current.style.display = 'block';
    } else {
      prevButtonRef.current.style.display = 'none';
      nextButtonRef.current.style.display = 'none';
    }
  };

  const closeLightbox = () => {
    setCurrentImage(null);
    lightboxRef.current.style.display = 'none';
    document.body.classList.remove('no-scroll');
    resetZoom();
  };

  const changeImage = (direction) => {
    const categoryImages = imagesDatas[currentCategoryRef.current];
    let newIndex = currentIndex + direction;
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= categoryImages.length) newIndex = categoryImages.length - 1;
    setCurrentImage(categoryImages[newIndex].src);
    setCurrentIndex(newIndex);
    resetZoom();
  };

  const zoomImage = (factor) => {
    setCurrentScale(currentScale * factor);
  };

  const resetZoom = () => {
    setCurrentScale(1);
  };

  const imagesStyle = (images, categoryIndex) => (
    <div className="products-container">
      {images?.map((image, index) => (
        <div className="product" key={index}>
          <img
            src={image.src}
            alt={image.alt}
            onClick={() => openLightbox(image.src, categoryIndex, index)}
          />
          <p>{image.caption}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="photo-gallery">
      <div className="category">
        <h1>四列布局照片示例</h1>
        {imagesStyle(imagesDatas.images, 'images')}
      </div>
      <div className="category">
        <h1>四列布局照片示例</h1>
        {imagesStyle(imagesDatas.images_online, 'images_online')}
      </div>
      <div className="category">
        <h1>四列布局照片示例</h1>
        {imagesStyle(imagesDatas.images_outline, 'images_outline')}
      </div>
      <div className="category">
        <h1>四列布局照片示例</h1>
        {imagesStyle(imagesDatas.images_coldData, 'images_coldData')}
      </div>

      <div className="lightbox" ref={lightboxRef} id="lightbox">
        <span className="close" onClick={closeLightbox}>×</span>
        <span className="prev" ref={prevButtonRef} onClick={() => changeImage(-1)}>←</span>
        <img
          id="lightbox-img"
          src={currentImage}
          alt="Lightbox"
          style={{ transform: `scale(${currentScale})` }}
        />
        <span className="next" ref={nextButtonRef} onClick={() => changeImage(1)}>→</span>
        <span className="zoom-in" onClick={() => zoomImage(1.2)}>+</span>
        <span className="zoom-out" onClick={() => zoomImage(0.8)}>-</span>
      </div>
    </div>
  );
};

export default PhotoGallery;
