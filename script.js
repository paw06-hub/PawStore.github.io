module.exports = {
    // ═══ TOKEN ═══
    TOKEN: process.env.DISCORD_TOKEN || process.env.TOKEN || 'THAY_TOKEN_VAO_DAY',
    
    // ═══ ADMIN BOT — THAY ID CỦA BẠN VÀO ĐÂY ═══
    ADMIN_IDS: [
        '1298727049451540541',
        '1498554147304247296'
    ],
    
    // ═══ FILE DATA ═══
    DATA_FILE: './school_data.json',
    
    // ═══ SERVER ═══
    SERVER_NAME: '🏫 Swan School',
    INVITE_LINK: 'https://discord.gg/SmaysUxgGk',
    
    // ═══ MÀU EMBED ═══
    COLORS: {
        PRIMARY: '#3498DB',
        SUCCESS: '#2ECC71',
        WARNING: '#F39C12',
        DANGER: '#E74C3C',
        INFO: '#9B59B6',
        GOLD: '#FFD700'
    },
    
    // ═══ KINH TẾ ═══
    CURRENCY: {
        NAME: 'Xu',
        ICON: '🪙'
    },
    
    // ═══ MÔN HỌC ═══
    MON_HOC: {
        toan: '📐 Toán',
        van: '📖 Văn',
        anh: '🌏 Anh',
        ly: '🔬 Lý',
        hoa: '🧪 Hóa',
        sinh: '🧬 Sinh'
    },
    
    // ═══ COOLDOWN (ms) ═══
    COOLDOWN: {
        DIEMDANH: 24 * 60 * 60 * 1000,
        HOC: 30 * 60 * 1000,
        BTVN: 60 * 60 * 1000,
        THI: 2 * 60 * 60 * 1000,
        THUVIEN: 45 * 60 * 1000,
        DAYHOC: 5 * 60 * 1000
    },
    
    // ═══ ĐIỂM THƯỞNG ═══
    POINTS: {
        DIEMDANH: 10,
        HOC: 15,
        BTVN: 20,
        THI: 50,
        THUVIEN: 25,
        DAYHOC: 30,
        CHAMBai: 10
    },
    
    // ═══ TIỀN THƯỞNG ═══
    MONEY: {
        DIEMDANH: 100,
        HOC: 150,
        BTVN: 200,
        THI: 500,
        THUVIEN: 250,
        DAYHOC: 200
    }
};
