import React, { useState, useEffect, useRef } from 'react'
import file6 from "src/assets/images/file6.png";
import './styles.css';
import axios from 'src/utils/axios';
import OssProxy from 'src/utils/OssProxyUtil';

const PhotoGallery = () => {
  // const imagesDatas = {
  //   images: [
  //     { src: file6, alt: "Sample Image 1", caption: "照片1" },
  //     { src: file6, alt: "Sample Image 2", caption: "照片2" },
  //     { src: file6, alt: "Sample Image 3", caption: "照片3" },
  //     { src: file6, alt: "Sample Image 4", caption: "照片4" },
  //     { src: file6, alt: "Sample Image 5", caption: "照片5" },
  //     { src: file6, alt: "Sample Image 6", caption: "照片6" },
  //     { src: file6, alt: "Sample Image 7", caption: "照片7" },
  //     { src: file6, alt: "Sample Image 8", caption: "照片8" }
  //   ],
  //   images_online: [
  //     { src: file6, alt: "Sample Image 1", caption: "照片1" },
  //     { src: file6, alt: "Sample Image 2", caption: "照片2" },
  //     { src: file6, alt: "Sample Image 3", caption: "照片3" },
  //   ],
  //   images_outline: [
  //     { src: file6, alt: "Sample Image 1", caption: "照片1" },
  //     { src: file6, alt: "Sample Image 2", caption: "照片2" },
  //   ],
  //   images_coldData: [
  //     { src: file6, alt: "Sample Image 1", caption: "照片1" },
  //   ],
  // };
  const [imagesData, setImagesData] = useState([]);
  const [currentImage, setCurrentImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentScale, setCurrentScale] = useState(1);
  const lightboxRef = useRef(null);
  const currentCategoryRef = useRef(null);
  const prevButtonRef = useRef(null);
  const nextButtonRef = useRef(null);

  function convertAndLogUrls(groups) {
    groups.forEach((group) => {
      const { uris } = group;
      uris.forEach((uri) => {
        OssProxy.getUrl(uri).then((url) => {
          console.log(url);
          // Optionally open the URL in a new window
          // window.open(url);
        });
      });
    });
  }

  useEffect(() => {
    // 从当前浏览器URL中获取参数
    const urlParams = new URLSearchParams(window.location.search);
    // const id = urlParams.get('id');
    // const type = urlParams.get('type');
    const id = 1;
    const type = 'all';

    // 构造新URL
    const newUrl = `https://tool.zanhua.com.cn/api/fxiaoke/bill/inspection/print/pic/url?id=${id}&type=${type}`;
    console.log(newUrl);

    // 从新URL获取数据
    const fetchData = async () => {
      const response = await axios(newUrl);
      if (response.data.success) {
        // setImagesData(response.data.data.groups);
        convertAndLogUrls(response.data.data.groups);
      }
    };

    fetchData();
  }, []);



  const openLightbox = (src, categoryIndex, index) => {
    setCurrentImage(src);
    setCurrentIndex(index);
    currentCategoryRef.current = categoryIndex;
    const categoryImages = imagesData[categoryIndex].uris;
    console.log(imagesData[categoryIndex].uris);
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
    const categoryImages = imagesData[currentCategoryRef.current].uris;
    let newIndex = currentIndex + direction;
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= categoryImages.length) newIndex = categoryImages.length - 1;
    setCurrentImage(categoryImages[newIndex]);
    setCurrentIndex(newIndex);
    resetZoom();
  };

  const zoomImage = (factor) => {
    setCurrentScale(currentScale * factor);
  };

  const resetZoom = () => {
    setCurrentScale(1);
  };

  const imagesStyle = (group, categoryIndex) => (
    <div className="products-container">
      {group.uris.map((uri, index) => (
        <div className="product" key={index}>
          <img
            src={`https://tool.zanhua.com.cn${uri}`}
            alt={`Sample Image ${index + 1}`}
            // onClick={() => openLightbox(`http://tooltest.zanhua.com.cn${uri}`, categoryIndex, index)}
            onClick={() => {
              console.log(`https://tool.zanhua.com.cn${uri}`);
            }}
          />
          <p>{group.groupName} - 照片{index + 1}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="photo-gallery">
      {imagesData.map((group, index) => (
        <div className="category" key={index}>
          <h1>{group.groupName}</h1>
          {imagesStyle(group, index)}
        </div>
      ))}

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
