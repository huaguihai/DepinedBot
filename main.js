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
        log.info(`Starting Program for all accounts:`, tokens.length);

        const accountsProcessing = tokens.map(async (token, index) => {
            const proxy = proxies[index % proxies.length] || null;
            try {
                const userData = await utils.getUserInfo(token, proxy);

                if (userData?.data) {
                    const { email, verified, current_tier, points_balance } = userData.data
                    log.info(`Account ${index + 1} info:`, { email, verified, current_tier, points_balance });
                }

                await checkUserRewards(token, proxy, index);

                setInterval(async () => {
                    const connectRes = await utils.connect(token, proxy);
                    log.info(`Ping result for account ${index + 1}:`, connectRes || { message: 'unknown error' });

                    const result = await utils.getEarnings(token, proxy);
                    log.info(`Earnings result for account ${index + 1}:`, result?.data || { message: 'unknown error' });
                }, 1000 * 30); // Run every 30 seconds

                setInterval(async () => {
                    await checkUserRewards(token, proxy, index);
                }, 1000 * 60 * 60 * 24); // check every 24 hours

            } catch (error) {
                log.error(`Error processing account ${index}: ${error.message}`);
            }
        });

        const checkUserRewards = async (token, proxy, index) => {
            try {
                const response = await utils.getUserRef(token, proxy)
                const { total_unclaimed_points } = response?.data || 0;
                if (total_unclaimed_points > 0) {
                    log.info(`Account ${index + 1} has ${total_unclaimed_points} unclaimed points, trying to claim it...`);
                    const claimResponse = await utils.claimPoints(token, proxy);
                    if (claimResponse.code === 200) {
                        log.info(`Account ${index + 1} claimed successfully! ${total_unclaimed_points} points`);
                    }
                }
            } catch (error) {
                log.error(`Error checking user rewards: ${error.message}`);
            }
        }

        await Promise.all(accountsProcessing);
    } catch (error) {
        log.error(`Error in main loop: ${error.message}`);
    }
};


// 处理SIGINT信号（Ctrl+C）
process.on('SIGINT', () => {
    log.warn(`Process received SIGINT, cleaning up and exiting program...`);
    process.exit(0);
});

// 处理SIGTERM信号
process.on('SIGTERM', () => {
    log.warn(`Process received SIGTERM, cleaning up and exiting program...`);
    process.exit(0);
});


// 运行主函数
main();
