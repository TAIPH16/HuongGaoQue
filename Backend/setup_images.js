const fs = require('fs');
const path = require('path');
const https = require('https');

const imagesToDownload = [
    { filename: 'gao-st25.jpg', text: 'Gao ST25 Soc Trang', color: 'E6E6FA' },
    { filename: 'gao-lut-do.jpg', text: 'Gao Lut Do', color: 'A52A2A' },
    { filename: 'nep-cai-hoa-vang.jpg', text: 'Nep Cai Hoa Vang', color: 'FFFACD' },
    { filename: 'gao-tam-thom.jpg', text: 'Gao Tam Thom', color: 'F0F8FF' },
    { filename: 'gao-lut-tim.jpg', text: 'Gao Lut Tim Than', color: '4B0082' },
    { filename: 'nep-nuong.jpg', text: 'Nep Nuong Tay Bac', color: 'F5F5DC' },
    { filename: 'gao-nang-huong.jpg', text: 'Gao Nang Huong', color: 'FAF0E6' },
    { filename: 'gao-nhat.jpg', text: 'Gao Nhat Japonica', color: 'FFFFFF' },
    { filename: 'gao-huyet-rong.jpg', text: 'Gao Huyet Rong', color: '8B0000' },
    { filename: 'gao-thom-lai.jpg', text: 'Gao Thom Lai Mien', color: 'F0FFF0' },
    { filename: 'nep-sap.jpg', text: 'Gao Nep Sap', color: 'FFFAF0' },
    { filename: 'gao-tai-nguyen.jpg', text: 'Gao Tai Nguyen', color: 'F8F8FF' },
    { filename: 'gao-ham-chau.jpg', text: 'Gao Ham Chau', color: 'FFFFF0' },
    { filename: 'gao-sa-mo.jpg', text: 'Gao Sa Mo', color: 'F5FFFA' },
    { filename: 'gao-lut-den.jpg', text: 'Gao Lut Den', color: '2F4F4F' },
];

const saveDir = path.join(__dirname, 'public', 'images', 'products');

if (!fs.existsSync(saveDir)) {
    fs.mkdirSync(saveDir, { recursive: true });
    console.log(`Đã tạo thư mục: ${saveDir}`);
}

const downloadImage = (filename, text, color) => {
    const url = `https://placehold.co/600x600/${color}/333333.jpg?text=${encodeURIComponent(text)}`;
    const filePath = path.join(saveDir, filename);

    const file = fs.createWriteStream(filePath);

    https.get(url, (response) => {
        if (response.statusCode !== 200) {
            console.error(`❌ Lỗi tải ${filename}: Status Code ${response.statusCode}`);
            return;
        }

        response.pipe(file);

        file.on('finish', () => {
            file.close();
            console.log(`✅ Đã tải xong: ${filename}`);
        });
    }).on('error', (err) => {
        fs.unlink(filePath, () => {}); 
        console.error(`❌ Lỗi tải ${filename}: ${err.message}`);
    });
};

console.log('🚀 Bắt đầu tải ảnh mẫu...');
imagesToDownload.forEach(img => {
    downloadImage(img.filename, img.text, img.color);
});