// 导入所需模块
import * as utils from './utils/api.js';
import banner from './utils/banner.js';
import log from './utils/logger.js';
import { readFile, delay } from './utils/helper.js'

// 主函数
const main = async () => {
    log.info(banner);
    await delay(3) // 延迟3秒
    
    // 读取tokens文件
    const tokens = await readFile("tokens.txt");
    if (tokens.length === 0) {
        log.error('未找到tokens，请检查tokens.txt文件');
        return;
    }
    
    // 读取代理文件
    const proxies = await readFile("proxy.txt");
    if (proxies.length === 0) {
        log.warn('未使用代理运行...');
    }

    try {
        log.info(`开始处理所有账户:`, tokens.length);

        // 处理每个账户
        const accountsProcessing = tokens.map(async (token, index) => {
            const proxy = proxies[index % proxies.length] || null;
            try {
                // 获取用户信息
                const userData = await utils.getUserInfo(token, proxy);

                if (userData?.data) {
                    const { email, verified, current_tier, points_balance } = userData.data
                    log.info(`账户 ${index + 1} 信息:`, { email, verified, current_tier, points_balance });
                }

                // 每30秒执行一次连接和收益检查
                setInterval(async () => {
                    const connectRes = await utils.connect(token, proxy);
                    log.info(`账户 ${index + 1} 连接结果:`, connectRes || { message: '未知错误' });

                    const result = await utils.getEarnings(token, proxy);
                    log.info(`账户 ${index + 1} 收益结果:`, result?.data || { message: '未知错误' });
                }, 1000 * 30); // 每30秒运行一次

            } catch (error) {
                log.error(`处理账户 ${index} 时出错: ${error.message}`);
            }
        });

        await Promise.all(accountsProcessing);
    } catch (error) {
        log.error(`主循环出错: ${error.message}`);
    }
};


// 处理SIGINT信号（Ctrl+C）
process.on('SIGINT', () => {
    log.warn(`收到SIGINT信号，正在清理并退出程序...`);
    process.exit(0);
});

// 处理SIGTERM信号
process.on('SIGTERM', () => {
    log.warn(`收到SIGTERM信号，正在清理并退出程序...`);
    process.exit(0);
});


// 运行主函数
main();
