// 第一版，token调用太多次
// import React, { useState, useEffect, useRef } from 'react';
// import file6 from 'src/assets/images/file6.png';
// import './styles.css';
// import axios from 'src/utils/axios';
// import OssProxy from 'src/utils/OssProxyUtil';

// const PhotoGallery = () => {
//   const [imagesData, setImagesData] = useState([]);
//   const [currentImage, setCurrentImage] = useState(null);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [currentScale, setCurrentScale] = useState(1);
//   const lightboxRef = useRef(null);
//   const currentCategoryRef = useRef(null);
//   const prevButtonRef = useRef(null);
//   const nextButtonRef = useRef(null);

//   // Function to get OSS URLs and log them
//   const convertAndLogUrls = async (groups) => {
//     const updatedGroups = await Promise.all(
//       groups.map(async (group) => {
//         const uris = await Promise.all(
//           group.uris.map(async (uri) => {
//             const url = await OssProxy.getUrl(uri);
//             return url;
//           })
//         );
//         return { groupName: group.groupName, uris };
//       })
//     );
//     return updatedGroups;
//   };

//   useEffect(() => {
//     // 从当前浏览器URL中获取参数
//     const urlParams = new URLSearchParams(window.location.search);
//     const id = urlParams.get('id') || 1;
//     const type = urlParams.get('type') || 'all';

//     // 构造新URL
//     const newUrl = `http://tooltest.zanhua.com.cn/test/fxiaoke/api/bill/inspection/print/pic/url?id=${id}&type=${type}`;
//     console.log(newUrl);

//     // 从新URL获取数据
//     const fetchData = async () => {
//       const response = await axios(newUrl);
//       if (response.data.success) {
//         const updatedGroups = await convertAndLogUrls(response.data.data.groups);
//         setImagesData(updatedGroups);
//       }
//     };

//     fetchData();
//   }, []);

//   const openLightbox = (src, categoryIndex, index) => {
//     setCurrentImage(src);
//     setCurrentIndex(index);
//     currentCategoryRef.current = categoryIndex;
//     const categoryImages = imagesData[categoryIndex].uris;
//     console.log(imagesData[categoryIndex].uris);
//     lightboxRef.current.style.display = 'flex';
//     document.body.classList.add('no-scroll');
//     if (categoryImages.length >= 2) {
//       prevButtonRef.current.style.display = 'block';
//       nextButtonRef.current.style.display = 'block';
//     } else {
//       prevButtonRef.current.style.display = 'none';
//       nextButtonRef.current.style.display = 'none';
//     }
//   };

//   const closeLightbox = () => {
//     setCurrentImage(null);
//     lightboxRef.current.style.display = 'none';
//     document.body.classList.remove('no-scroll');
//     resetZoom();
//   };

//   const changeImage = (direction) => {
//     const categoryImages = imagesData[currentCategoryRef.current].uris;
//     let newIndex = currentIndex + direction;
//     if (newIndex < 0) newIndex = 0;
//     if (newIndex >= categoryImages.length) newIndex = categoryImages.length - 1;
//     setCurrentImage(categoryImages[newIndex]);
//     setCurrentIndex(newIndex);
//     resetZoom();
//   };

//   const zoomImage = (factor) => {
//     setCurrentScale(currentScale * factor);
//   };

//   const resetZoom = () => {
//     setCurrentScale(1);
//   };

//   const imagesStyle = (group, categoryIndex) => (
//     <div className="products-container">
//       {group.uris.map((uri, index) => (
//         <div className="product" key={index}>
//           <img
//             src={uri}
//             alt={`Sample Image ${index + 1}`}
//             onClick={() => openLightbox(uri, categoryIndex, index)}
//           />
//           <p>{group.groupName} - 照片{index + 1}</p>
//         </div>
//       ))}
//     </div>
//   );

//   return (
//     <div className="photo-gallery">
//       {imagesData.map((group, index) => (
//         <div className="category" key={index}>
//           <h1>{group.groupName}</h1>
//           {imagesStyle(group, index)}
//         </div>
//       ))}

//       <div className="lightbox" ref={lightboxRef} id="lightbox">
//         <span className="close" onClick={closeLightbox}>×</span>
//         <span className="prev" ref={prevButtonRef} onClick={() => changeImage(-1)}>←</span>
//         <img
//           id="lightbox-img"
//           src={currentImage}
//           alt="Lightbox"
//           style={{ transform: `scale(${currentScale})` }}
//         />
//         <span className="next" ref={nextButtonRef} onClick={() => changeImage(1)}>→</span>
//         <span className="zoom-in" onClick={() => zoomImage(1.2)}>+</span>
//         <span className="zoom-out" onClick={() => zoomImage(0.8)}>-</span>
//       </div>
//     </div>
//   );
// };

// export default PhotoGallery;

// 第二版  少量token ,好像没怎么减少

// import React, { useState, useEffect, useRef } from 'react';
// import file6 from 'src/assets/images/file6.png';
// import './styles.css';
// import axios from 'src/utils/axios';
// import OssProxy from 'src/utils/OssProxyUtil';

// const PhotoGallery = () => {
//   const [imagesData, setImagesData] = useState([]);
//   const [currentImage, setCurrentImage] = useState(null);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [currentScale, setCurrentScale] = useState(1);
//   const lightboxRef = useRef(null);
//   const currentCategoryRef = useRef(null);
//   const prevButtonRef = useRef(null);
//   const nextButtonRef = useRef(null);

//   const convertAndLogUrls = async (groups) => {
//     const updatedGroups = await Promise.all(
//       groups.map(async (group) => {
//         const uriPromises = group.uris.map((uri) => OssProxy.getUrl(uri));
//         const uris = await Promise.all(uriPromises);
//         return { groupName: group.groupName, uris };
//       })
//     );
//     return updatedGroups;
//   };

//   useEffect(() => {
//     // 从当前浏览器URL中获取参数
//     const urlParams = new URLSearchParams(window.location.search);
//     // const id = urlParams.get('id');
//     // const type = urlParams.get('type');

//     const id = urlParams.get('id') || 1;
//     const type = urlParams.get('type') || 'all';

//     // 构造新URL
//     const newUrl = `http://tooltest.zanhua.com.cn/test/fxiaoke/api/bill/inspection/print/pic/url?id=${id}&type=${type}`;
//     console.log(newUrl);

//     // 从新URL获取数据
//     const fetchData = async () => {
//       const response = await axios(newUrl);
//       if (response.data.success) {
//         const updatedGroups = await convertAndLogUrls(response.data.data.groups);
//         setImagesData(updatedGroups);
//       }
//     };

//     fetchData();
//   }, []);

//   const openLightbox = (src, categoryIndex, index) => {
//     setCurrentImage(src);
//     setCurrentIndex(index);
//     currentCategoryRef.current = categoryIndex;
//     const categoryImages = imagesData[categoryIndex].uris;
//     console.log(imagesData[categoryIndex].uris);
//     lightboxRef.current.style.display = 'flex';
//     document.body.classList.add('no-scroll');
//     if (categoryImages.length >= 2) {
//       prevButtonRef.current.style.display = 'block';
//       nextButtonRef.current.style.display = 'block';
//     } else {
//       prevButtonRef.current.style.display = 'none';
//       nextButtonRef.current.style.display = 'none';
//     }
//   };

//   const closeLightbox = () => {
//     setCurrentImage(null);
//     lightboxRef.current.style.display = 'none';
//     document.body.classList.remove('no-scroll');
//     resetZoom();
//   };

//   const changeImage = (direction) => {
//     const categoryImages = imagesData[currentCategoryRef.current].uris;
//     let newIndex = currentIndex + direction;
//     if (newIndex < 0) newIndex = 0;
//     if (newIndex >= categoryImages.length) newIndex = categoryImages.length - 1;
//     setCurrentImage(categoryImages[newIndex]);
//     setCurrentIndex(newIndex);
//     resetZoom();
//   };

//   const zoomImage = (factor) => {
//     setCurrentScale(currentScale * factor);
//   };

//   const resetZoom = () => {
//     setCurrentScale(1);
//   };

//   const imagesStyle = (group, categoryIndex) => (
//     <div className="products-container">
//       {group.uris.map((uri, index) => (
//         <div className="product" key={index}>
//           <img
//             src={uri}
//             alt={`Sample Image ${index + 1}`}
//             onClick={() => openLightbox(uri, categoryIndex, index)}
//           />
//           <p>{group.groupName} - 照片{index + 1}</p>
//         </div>
//       ))}
//     </div>
//   );

//   return (
//     <div className="photo-gallery">
//       {imagesData.map((group, index) => (
//         <div className="category" key={index}>
//           <h1>{group.groupName}</h1>
//           {imagesStyle(group, index)}
//         </div>
//       ))}

//       <div className="lightbox" ref={lightboxRef} id="lightbox">
//         <span className="close" onClick={closeLightbox}>×</span>
//         <span className="prev" ref={prevButtonRef} onClick={() => changeImage(-1)}>←</span>
//         <img
//           id="lightbox-img"
//           src={currentImage}
//           alt="Lightbox"
//           style={{ transform: `scale(${currentScale})` }}
//         />
//         <span className="next" ref={nextButtonRef} onClick={() => changeImage(1)}>→</span>
//         <span className="zoom-in" onClick={() => zoomImage(1.2)}>+</span>
//         <span className="zoom-out" onClick={() => zoomImage(0.8)}>-</span>
//       </div>
//     </div>
//   );
// };

// export default PhotoGallery;

// 第三版  限制type 和  id ,如果没有此参数，跳到navigate


import React, { useState, useEffect, useRef } from 'react';
import file6 from 'src/assets/images/file6.png';
import './styles.css';
import axios from 'src/utils/axios';
import OssProxy from 'src/utils/OssProxyUtil';

const PhotoGallery = () => {
  const [imagesData, setImagesData] = useState([]);
  const [currentImage, setCurrentImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentScale, setCurrentScale] = useState(1);
  const lightboxRef = useRef(null);
  const currentCategoryRef = useRef(null);
  const prevButtonRef = useRef(null);
  const nextButtonRef = useRef(null);

  const convertAndLogUrls = async (groups) => {
    const updatedGroups = await Promise.all(
      groups.map(async (group) => {
        const uriPromises = group.uris.map((uri) => OssProxy.getUrl(uri));
        const uris = await Promise.all(uriPromises);
        return { groupName: group.groupName, uris };
      })
    );
    return updatedGroups;
  };

  useEffect(() => {
    // Capture query parameters from the current browser URL
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const type = urlParams.get('type');
    console.log(window.location.search);
    console.log(urlParams);

    // Construct a new URL using the captured parameters
    const newUrl = `/bill/inspection/print/pic/url?id=${id}&type=${type}`;

    console.log(newUrl);

    // Fetch data from the new URL
    const fetchData = async () => {
      const response = await axios(newUrl);
      if (response.data.success) {
        const updatedGroups = await convertAndLogUrls(response.data.data.groups);
        setImagesData(updatedGroups);
      }
    };

    fetchData();
  }, []);


  // useEffect(() => {
  //   const queryParams = new URLSearchParams(location.search);
  //   const id = queryParams.get('id');
  //   const type = queryParams.get('type');
  //   console.log("ID:", id);
  //   console.log("Type:", type);
  //   // 你可以在此处使用 id 和 type 进行你的逻辑处理
  // }, [location]);

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
            src={uri}
            alt={`Sample Image ${index + 1}`}
            onClick={() => openLightbox(uri, categoryIndex, index)}
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
