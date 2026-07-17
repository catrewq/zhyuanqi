import axios from "./axios";

const getOssToken = async () => {
  const { data } = await axios({
    method: "post",
    // url: "/system/wechatController/getOssToken",
    url: "/download/info/oss/token",
  });
  if (data.success) {
    return data.data;
  }
};

export default getOssToken;
