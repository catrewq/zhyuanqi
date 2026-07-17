// 此为插件版本
// 3月20日，使用react-photo-view替代原有方案
import { FileUnknownOutlined } from '@ant-design/icons';
import { message } from 'antd';
import React, { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import axios from 'src/utils/axios';
import OssProxy from 'src/utils/OssProxyUtil';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import './styles.css';

const PhotoGallery = () => {
  const [imagesData, setImagesData] = useState([]);

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

    // 使用相对路径，通过 proxy 转发到后端
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

  // 文件类型判断逻辑保持不变
  const detectFileType = (url) => {
    // 1. 移除URL中的查询参数和哈希
    const cleanUrl = url.split(/[?#]/)[0];
    let hostname = '';
    try {
      hostname = new URL(url).hostname;
    } catch (e) {
      hostname = '';
    }

    if (hostname.includes('picsum.photos')) {
      return {
        isAudio: false,
        isVideo: false,
        isImage: true,
        extension: 'jpg'
      };
    }

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

  // 媒体渲染组件改造
  const MediaRenderer = ({ url, groupName, index }) => {
    const { isAudio, isVideo, isImage } = detectFileType(url);

    if (isAudio) {
      return (
        <div className="audio-container">
          <ReactPlayer
            url={url}
            controls
            width="100%"
            height="50px"
            config={{ file: { attributes: { crossOrigin: 'anonymous' } } }}
          />
          <p>{groupName} - 音频{index + 1}</p>
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
          <p>{groupName} - 视频{index + 1}</p>
        </div>
      );
    }

    if (isImage) {
      return (
        <PhotoView
          key={index}
          src={url}
          overlay={
            <div className="image-caption">
              {groupName} - 照片 {index + 1}
            </div>
          }
          // 长图优化
          longElement={<div className="long-image-hint">滚动查看完整内容 ↓</div>}
        >
          <img
            src={url}
            alt={`${groupName} - 照片 ${index + 1}`}
            style={{ cursor: 'zoom-in' }}
          />
        </PhotoView>
      );
    }

    return (
      <div className="unknown-file">
        <FileUnknownOutlined />
        <p>不支持的文件格式</p>
      </div>
    );
  };

  return (
    <div className="photo-gallery">
      {imagesData.map((group, groupIndex) => (
        <div className="category" key={groupIndex}>
          <h1>{group.groupName}</h1>
          <PhotoProvider
            toolbarRender={({ rotate, onRotate, scale, onScale }) => (
              <>
                <button onClick={() => onScale(scale * 1.2)}>+</button>
                <button onClick={() => onScale(scale * 0.8)}>-</button>
                <button onClick={() => onRotate(rotate + 90)}>↻</button>
                <button onClick={() => onRotate(rotate - 90)}>↺</button>
              </>
            )}
          >
            <div className="products-container">
              {group.uris.map((uri, index) => (
                <div className="product" key={index}>
                  <MediaRenderer
                    url={uri}
                    groupName={group.groupName}
                    index={index}
                  />
                </div>
              ))}
            </div>
          </PhotoProvider>
        </div>
      ))}
    </div>
  );
};

export default PhotoGallery;