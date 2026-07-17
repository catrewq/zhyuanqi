// 解决鼠标光标放在点开图片查看里，点esc键没法退出图片查看
import { FileUnknownOutlined } from '@ant-design/icons';
import { message } from 'antd';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import ReactPlayer from 'react-player';
import axios from 'src/utils/axios';
import OssProxy from 'src/utils/OssProxyUtil';
import './styles.css';
import FixHeader from 'src/layouts/FixHeader';


const PhotoGallery = () => {
  const [imagesData, setImagesData] = useState([]);
  const [currentImage, setCurrentImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentCategory, setCurrentCategory] = useState(0);
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const lightboxRef = useRef(null);
  const lightboxImgRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const currentCategoryRef = useRef(0);

  // ... 其他函数保持不变 ...
  const convertAndLogUrls = async (groups) => {
    const updatedGroups = await Promise.all(
      groups.map(async (group) => {
        //const uriPromises = group.uris.map((uri) => OssProxy.getUrl(uri));
        const uriPromises = await OssProxy.getUrls(group.uris);
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

    // Check if id and type are present
    if (!id || !type) {
      message.error('没有有效参数');
      return;
    }

    console.log(window.location.search);
    console.log(urlParams);

    const newUrl = `/bill/inspection/print/pic/url?id=${id}&type=${type}`;
    console.log(newUrl);

    // Fetch data from the new URL
    const fetchData = async () => {
      const response = await axios(newUrl);
      if (response.data.success) {
        const groups = response.data.data.groups;
        if (groups && groups.length > 0) {
          const updatedGroups = await convertAndLogUrls(groups);
          setImagesData(updatedGroups);
        } else {
          message.error('没有可用的分组数据！');
          setImagesData([]);
        }
      } else {
        message.error('请求失败！');
        setImagesData([]);
      }
    };

    fetchData();
  }, []);
  // 边界检查逻辑
  const enforceBounds = () => {
    if (!lightboxRef.current || !lightboxImgRef.current) return;

    const viewRect = lightboxRef.current.getBoundingClientRect();
    const imgRect = lightboxImgRef.current.getBoundingClientRect();

    const scaledWidth = imgRect.width * transform.scale;
    const scaledHeight = imgRect.height * transform.scale;

    let newX = transform.x;
    let newY = transform.y;

    // 水平边界
    if (scaledWidth > viewRect.width) {
      const maxX = (scaledWidth - viewRect.width) / 2;
      newX = Math.max(-maxX, Math.min(newX, maxX));
    } else {
      newX = 0;
    }

    // 垂直边界
    if (scaledHeight > viewRect.height) {
      const maxY = (scaledHeight - viewRect.height) / 2;
      newY = Math.max(-maxY, Math.min(newY, maxY));
    } else {
      newY = 0;
    }

    setTransform(prev => ({ ...prev, x: newX, y: newY }));
  };

  // 滚轮事件处理
  const handleWheel = (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.2 : 0.8;
    zoomImage(factor, e.clientX, e.clientY);
  };

  // 缩放功能
  const zoomImage = (factor, clientX, clientY) => {
    const newScale = transform.scale * factor;
    if (newScale < 0.5 || newScale > 4) return;

    const viewRect = lightboxRef.current.getBoundingClientRect();
    const offsetX = clientX - viewRect.left - viewRect.width / 2;
    const offsetY = clientY - viewRect.top - viewRect.height / 2;

    const newX = offsetX * (1 - factor) + transform.x * factor;
    const newY = offsetY * (1 - factor) + transform.y * factor;

    setTransform({
      scale: newScale,
      x: newX,
      y: newY
    });
  };

  // 拖拽功能
  const startDragging = (e) => {
    if (transform.scale <= 1) return; // 新增条件

    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - transform.x,
      y: e.clientY - transform.y
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || transform.scale <= 1) return; // 新增条件

    const newX = e.clientX - dragStartPos.current.x;
    const newY = e.clientY - dragStartPos.current.y;

    setTransform(prev => ({
      ...prev,
      x: newX,
      y: newY
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    enforceBounds();
  };

  // 重置变换
  const resetTransform = () => {
    setTransform({ scale: 1, x: 0, y: 0 });
  };



  const closeLightbox = useCallback(() => {
    setCurrentImage(null);
    document.body.style.overflow = 'auto';
    resetTransform();
  }, []);

  const changeImage = useCallback(
    (direction) => {
      const category = imagesData[currentCategory];
      if (category && category.uris) {
        const newIndex = (currentIndex + direction + category.uris.length) % category.uris.length;
        setCurrentImage(category.uris[newIndex]);
        setCurrentIndex(newIndex);
        resetTransform();
      }
    },
    [currentCategory, currentIndex, imagesData]
  );

  useEffect(() => {
    enforceBounds();
  }, [transform.scale]);

  // useEffect(() => {
  //   const handleKeyDown = (e) => {
  //     if (currentImage) {
  //       switch (e.key) {
  //         case 'Escape':
  //           closeLightbox();
  //           break;
  //         case 'ArrowLeft':
  //           e.preventDefault();
  //           changeImage(-1);
  //           break;
  //         case 'ArrowRight':
  //           e.preventDefault();
  //           changeImage(1);
  //           break;
  //         default:
  //           break;
  //       }
  //     }
  //   };

  //   window.addEventListener('keydown', handleKeyDown);
  //   return () => window.removeEventListener('keydown', handleKeyDown);
  // }, [currentImage, closeLightbox, changeImage]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // 确保只在lightbox显示时处理事件
      if (!currentImage) return;
  
      // 调试输出
      console.log('Key pressed:', e.key);
      
      switch (e.key) {
        case 'Escape':
          console.log('Closing lightbox');
          closeLightbox();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          changeImage(-1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          changeImage(1);
          break;
      }
    };
  
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      console.log('Cleaning up event listener');
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentImage, closeLightbox, changeImage]); // 确保依赖项正确

  // const openLightbox = useCallback((src, categoryIndex, index) => {
  //   setCurrentImage(src);
  //   setCurrentIndex(index);
  //   setCurrentCategory(categoryIndex);
  //   document.body.style.overflow = 'hidden';
  //   resetTransform();
  // }, []);

  const openLightbox = useCallback((src, categoryIndex, index) => {
    setCurrentImage(src);
    setCurrentIndex(index);
    setCurrentCategory(categoryIndex);
    document.body.style.overflow = 'hidden';
    resetTransform();
  
    // 使用requestAnimationFrame确保DOM更新完成
    requestAnimationFrame(() => {
      if (lightboxRef.current) {
        console.log('Focusing lightbox');
        lightboxRef.current.focus();
        // 添加视觉反馈用于调试
        lightboxRef.current.style.outline = '2px solid red';
        setTimeout(() => {
          lightboxRef.current.style.outline = 'none';
        }, 500);
      }
    });
  }, []);

  useEffect(() => {
    currentCategoryRef.current = currentCategory;
  }, [currentCategory]);

  // ... 其他代码保持不变 ...
  const detectFileType = (url) => {
    // 1. 移除URL中的查询参数和哈希
    const cleanUrl = url.split(/[?#]/)[0];

    // 2. 解码URL编码字符（如%20等）
    const decodedUrl = decodeURIComponent(cleanUrl);

    // 3. 提取最后一个路径段作为文件名
    const filename = decodedUrl.split('/').pop() || '';

    // 4. 处理多扩展名情况（如.tar.gz）
    const extensions = filename.split('.');
    const mainExtension = extensions.length > 1
      ? extensions.pop().toLowerCase()
      : '';

    // 5. 类型匹配
    return {
      isAudio: ['m4a', 'mp3', 'wav', 'ogg', 'flac'].includes(mainExtension),
      isVideo: ['mp4', 'mov', 'webm', 'avi'].includes(mainExtension),
      isImage: ['jpg', 'jpeg', 'png', 'gif'].includes(mainExtension),
      extension: mainExtension
    };
  };
  // 组件中动态渲染逻辑
  const MediaRenderer = ({ url, groupName, index, categoryIndex }) => {
    const { isAudio, isVideo, isImage } = detectFileType(url);

    if (isAudio) {
      return (
        <div className="audio-container">
          <ReactPlayer
            url={url}
            controls
            width="100%"
            height="50px"
            config={{
              file: {
                attributes: {
                  // 处理跨域和自动播放策略
                  crossOrigin: 'anonymous',
                  playsInline: true
                }
              }
            }}
          />
          {/* <p>{groupName} - 音频{index + 1}</p> */}
        </div>
      );
    }

    if (isVideo) {
      return (
        <div className="video-container">
          <ReactPlayer
            url={url}
            controls
            width="100%"
            height="auto"
          />
          {/* <p>{groupName} - 视频{index + 1}</p> */}
        </div>
      );
    }

    if (isImage) {
      return (
        <>
          <img
            src={url}
            alt={`${groupName} - 照片 ${index + 1}`}
            onClick={() => openLightbox(url, categoryIndex, index)}
          />
          {/* <p>{groupName} - 照片{index + 1}</p> */}
        </>
      );
    }

    // 未知类型处理
    return (
      <div className="unknown-file">
        <FileUnknownOutlined type="file-unknown" />
        <p>不支持的文件格式</p>
      </div>
    );
  };

  // 在原有imagesStyle中使用
  const imagesStyle = (group, categoryIndex) => (
    <div className="products-container">
      {group.uris.map((uri, index) => (
        <div className="product" key={index}>
          <MediaRenderer
            url={uri}
            groupName={group.groupName}
            index={index}
            categoryIndex={categoryIndex}
          />
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div className="photo-gallery">
        {imagesData.map((group, index) => (
          <div className="category" key={index}>
            <h1>{group.groupName}</h1>
            {imagesStyle(group, index)}
          </div>
        ))}

        <div
          className="lightbox"
          ref={lightboxRef}
          tabIndex="-1"  // 新增此行
          style={{ display: currentImage ? 'flex' : 'none' }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
        >
          <span className="close" onClick={closeLightbox}>×</span>
          {/* <span
            className="prev"
            onClick={() => changeImage(-1)}
            style={{ display: imagesData[currentCategoryRef.current]?.uris.length > 1 ? 'block' : 'none' }}
          >
            ←
          </span> */}
          <span
            className="prev"
            onClick={() => changeImage(-1)}
            style={{ display: imagesData[currentCategory]?.uris?.length > 1 ? 'block' : 'none' }}
          >
            ←
          </span>
          <img
            ref={lightboxImgRef}
            className="lightbox-content"
            src={currentImage}
            alt="Lightbox"
            style={{
              transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
              cursor: transform.scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
            }}
            onMouseDown={startDragging}
            draggable="false"
          />
          {/* <span
            className="next"
            onClick={() => changeImage(1)}
            style={{ display: imagesData[currentCategoryRef.current]?.uris.length > 1 ? 'block' : 'none' }}
          >
            →
          </span> */}
          <span
            className="next"
            onClick={() => changeImage(1)}
            style={{ display: imagesData[currentCategory]?.uris?.length > 1 ? 'block' : 'none' }}
          >
            →
          </span>
          <span className="zoom-in" onClick={() => zoomImage(1.2, window.innerWidth / 2, window.innerHeight / 2)}>+</span>
          <span className="zoom-out" onClick={() => zoomImage(0.8, window.innerWidth / 2, window.innerHeight / 2)}>-</span>
        </div>
      </div>
    </>
  );
};

export default PhotoGallery;
