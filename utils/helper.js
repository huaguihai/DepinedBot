import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';
import fs from 'fs/promises';
import log from './logger.js';

// 延迟函数
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms * 1000));
}

// 保存数据到文件
export async function saveToFile(filename, data) {
    try {
        await fs.appendFile(filename, `${data}\n`, 'utf-8');
        log.info(`数据已保存到 ${filename}`);
    } catch (error) {
        log.error(`保存数据到 ${filename} 失败: ${error.message}`);
    }
}

// 读取文件
export async function readFile(pathFile) {
    try {
        const datas = await fs.readFile(pathFile, 'utf8');
        return datas.split('\n')
            .map(data => data.trim())
            .filter(data => data.length > 0);
    } catch (error) {
        log.error(`读取文件失败: ${error.message}`);
        return [];
    }
}

// 创建代理agent
export const newAgent = (proxy = null) => {
    if (proxy) {
        if (proxy.startsWith('http://')) {
            return new HttpsProxyAgent(proxy);
        } else if (proxy.startsWith('socks4://') || proxy.startsWith('socks5://')) {
            return new SocksProxyAgent(proxy);
        } else {
            log.warn(`不支持的代理类型: ${proxy}`);
            return null;
        }
    }
    return null;
};
