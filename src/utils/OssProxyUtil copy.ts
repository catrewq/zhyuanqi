import OSS from "ali-oss";
import getOssToken from "./getOssToken";

const autoRefreshMillSeconds = 4 * 60 * 60 * 1000;

class OssProxy {

    getUrl(uri: string): Promise<string> {
        return getUrl(uri);
    }

    tryGetUrl(uri: string): Promise<string> {
        return tryGetUrl(uri);
    }

    upload(path: string, file: File): Promise<string> {
        return upload(path, file);
    }

}



async function getOssClient() {
    const info: string | null = sessionStorage.getItem("__sys_oss_client_info");

    let ossClient;
    let checkComplete = false;

    if (info) {
        const createDate = sessionStorage.getItem("__sys_oss_client_info_timeout");
        if (createDate === null) {
            checkComplete = false;
        }
        else {
            const createTimestamp: number = Number(createDate);
            const date = new Date().getTime();

            if (createTimestamp + autoRefreshMillSeconds > date) {
                checkComplete = false;
            }
            else {
                ossClient = JSON.parse(info);
                checkComplete = true;
            }
        }
    }

    if (!checkComplete) {
        const res = await getOssToken();
        ossClient = new OSS(res);

        const date = new Date().getTime();
        sessionStorage.setItem("__sys_oss_client_info_timeout", date.toString());
        sessionStorage.setItem("__sys_oss_client_info", JSON.stringify(ossClient));
    }
    return ossClient;
}

/**
 * 获取完整url
 * @param uri 部分路径
 * @returns 
 */
function getUrl(uri: string): Promise<string> {

    return new Promise(async function (resolve, reject) {

        const ossClient = await getOssClient();

        if (ossClient === null) {
            reject("oss client error");
        }

        const url = await ossClient.signatureUrl(uri, {
            "content-disposition": `attachment; filename=${encodeURIComponent(
                uri
            )}`,
        });

        // 获取url
        if (url) {
            resolve(url);
        } else {
            reject("url get failed");
        }
    }) as Promise<string>;

}

/**
 * 获取完整url
 * @param uri 部分路径
 * @returns 
 */
function tryGetUrl(uri: string): Promise<string> {

    return new Promise(async function (resolve, reject) {

        // 失败则自动清空缓存再尝试一次
        getUrl(uri).then((url) => {
            // 获取url
            if (url) {
                resolve(url);
            } else {
                clearCache();
                return getUrl(uri).then((url) => {
                    resolve(url);
                }).catch((e) => {
                    reject(e);
                });
            }
        }).catch((e) => {
            clearCache();
            return getUrl(uri).then((url) => {
                resolve(url);
            }).catch((e) => {
                reject(e);
            });
        })

    });

}

function upload(path: string, file: File): Promise<string> {

    return new Promise(async function (resolve, reject) {

        const ossClient = await getOssClient();

        if (ossClient === null) {
            reject("oss client error");
        }

        const res = await ossClient.put(path, file, {
            headers: {
                'Content-Disposition': 'attachment',
            },
        });

        if (res === null || res === undefined) {
            reject("upload failed");
        }

        if (res.res.status === 200 && res.url) {
            resolve(res.url)
        }
        else {
            reject("upload failed");
        }

    });

}

function clearCache() {
    sessionStorage.removeItem("__sys_oss_client_info_timeout");
    sessionStorage.removeItem("__sys_oss_client_info");
}

const proxy = new OssProxy();

export default proxy;