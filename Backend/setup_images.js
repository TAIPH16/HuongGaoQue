const fs = require('fs');
const path = require('path');
const https = require('https');

const imagesToDownload = [
    { filename: 'gaost25.jpg', text: 'Gao ST25 Soc Trang', color: 'E6E6FA' },
    { filename: 'gaolutdodienbien.jpg', text: 'Gao Lut Do Dien Bien', color: 'A52A2A' },
    { filename: 'nepcaihoavang.jpg', text: 'Nep Cai Hoa Vang', color: 'FFFACD' },
    { filename: 'gaotamthom.jpg', text: 'Gao Tam Thom Hai Hau', color: 'F0F8FF' },
    { filename: 'gaoluttimthan.png', text: 'Gao Lut Tim Than', color: '4B0082' },
    { filename: 'nepnuongtaybac.jpg', text: 'Nep Nuong Tay Bac', color: 'F5F5DC' },
    { filename: 'gaonanghuong.jpg', text: 'Gao Nang Huong Cho Dao', color: 'FAF0E6' },
    { filename: 'gaonhatjaponica.jpg', text: 'Gao Nhat Japonica', color: 'FFFFFF' },
    { filename: 'gaohuyetrong.jpeg', text: 'Gao Huyet Rong', color: '8B0000' },
    { filename: 'gaothomlaimien.jpg', text: 'Gao Thom Lai Mien', color: 'F0FFF0' },
    { filename: 'gaonepsap.jpg', text: 'Gao Nep Sap', color: 'FFFAF0' },
    { filename: 'gaotainguyen.jpg', text: 'Gao Tai Nguyen Cho Dao', color: 'F8F8FF' },
    { filename: 'gaohamchau.jpg', text: 'Gao Ham Chau', color: 'FFFFF0' },
    { filename: 'gaosamo.jpg', text: 'Gao Sa Mo', color: 'F5FFFA' },
    { filename: 'gaolutden.jpg', text: 'Gao Lut Den', color: '2F4F4F' },
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