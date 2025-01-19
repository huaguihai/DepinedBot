import randomUseragent from 'random-useragent';
import axios from 'axios';
import log from './logger.js';
import {
    newAgent
} from './helper.js'

// 生成随机User-Agent
const userAgent = randomUseragent.getRandom();
const headers = {
    "Accept": "application/json",
    "Accept-Language": "en-US,en;q=0.9",
    "User-Agent": userAgent,
}

// 用户注册函数
export const registerUser = async (email, password) => {
    const url = 'https://api.depined.org/api/user/register';

    try {
        const response = await axios.post(url, { email, password }, {
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            }
        });
        log.info('用户注册成功:', response.data.message);
        return response.data;
    } catch (error) {
        log.error('用户注册失败:', error.response ? error.response.data : error.message);
        return null;
    }
};

// 用户登录函数
export const loginUser = async (email, password) => {
    const url = 'https://api.depined.org/api/user/login';

    try {
        const response = await axios.post(url, { email, password }, {
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            }
        });
        log.info('用户登录成功:', response.data.message);
        return response.data;
    } catch (error) {
        log.error('用户登录失败:', error.response ? error.response.data : error.message);
        return null;
    }
};

// 创建用户资料函数
export const createUserProfile = async (token, payload) => {
    const url = 'https://api.depined.org/api/user/profile-creation';

    try {
        const response = await axios.post(url, payload, {
            headers: {
                ...headers,
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        log.info('用户资料创建成功:', response.data.message);
        return response.data;
    } catch (error) {
        log.error('创建用户资料失败:', error.response ? error.response.data : error.message);
        return null;
    }
};

// 确认用户推荐函数
export const confirmUserReff = async (token, referral_code) => {
    const url = 'https://api.depined.org/api/access-code/referal';

    try {
        const response = await axios.post(url, { referral_code }, {
            headers: {
                ...headers,
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        log.info('用户推荐确认成功:', response.data.message);
        return response.data;
    } catch (error) {
        log.error('确认用户推荐失败:', error.response ? error.response.data : error.message);
        return null;
    }
};

// 获取用户信息函数
export async function getUserInfo(token, proxy) {
    const agent = newAgent(proxy);
    try {
        const response = await axios.get('https://api.depined.org/api/user/details', {
            headers: {
                ...headers,
                'Authorization': 'Bearer ' + token
            },
            httpsAgent: agent,
            httpAgent: agent
        });

        return response.data;
    } catch (error) {
        log.error('获取用户信息失败:', error.message || error);
        return null;
    }
}
// 获取用户收益函数
export async function getEarnings(token, proxy) {
    const agent = newAgent(proxy);
    try {
        const response = await axios.get('https://api.depined.org/api/stats/epoch-earnings', {
            headers: {
                ...headers,
                'Authorization': 'Bearer ' + token
            },
            httpsAgent: agent,
            httpAgent: agent
        });

        return response.data;
    } catch (error) {
        log.error('Error fetching user info:', error.message || error);
        return null;
    }
}

// 获取用户推荐统计
export async function getUserRef(token, proxy) {
    const agent = newAgent(proxy);
    try {
        const response = await axios.get('https://api.depined.org/api/referrals/stats', {
            headers: {
                ...headers,
                'Authorization': 'Bearer ' + token
            },
            httpsAgent: agent,
            httpAgent: agent
        });

        return response.data;
    } catch (error) {
        log.error('Error fetching user info:', error.message || error);
        return null;
    }
}

// 领取积分
export async function claimPoints(token, proxy) {
    const agent = newAgent(proxy);
    try {
        const payload = {}
        const response = await axios.post('https://api.depined.org/api/referrals/claim_points', payload, {
            headers: {
                ...headers,
                'Authorization': 'Bearer ' + token
            },
            httpsAgent: agent,
            httpAgent: agent
        });

        return response.data;
    } catch (error) {
        log.error(`Error when claiming points: ${error.message}`);
        return null;
    }
}

// 连接小部件函数
export async function connect(token, proxy) {
    const agent = newAgent(proxy);
    try {
        const payload = { connected: true }
        const response = await axios.post('https://api.depined.org/api/user/widget-connect', payload, {
            headers: {
                ...headers,
                'Authorization': 'Bearer ' + token
            },
            httpsAgent: agent,
            httpAgent: agent
        });

        return response.data;
    } catch (error) {
        log.error(`Error when update connection: ${error.message}`);
        return null;
    }
}
