const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const Category = require('./model/category');
const Product = require('./model/product');
const User = require('./model/user');

dotenv.config();

const seedData = async () => {
    await connectDB();

    try {
        // Clear existing data
        await Category.deleteMany({});
        await Product.deleteMany({});
        console.log('Data cleared...');

        // Tìm một user để làm người bán (Seller)
        const seller = await User.findOne({});
        const sellerId = seller ? seller._id : null;
        if (sellerId) console.log('Found seller user:', seller.fullName || seller.email);

        // Create categories (Danh mục gạo)
        const categories = await Category.insertMany([
            { name: 'Gạo Tẻ', description: 'Các loại gạo tẻ thơm ngon cho bữa cơm hàng ngày.' },
            { name: 'Gạo Lứt', description: 'Gạo lứt giàu dinh dưỡng, hỗ trợ giảm cân và sức khỏe.' },
            { name: 'Gạo Nếp', description: 'Gạo nếp dẻo thơm, chuyên dùng để nấu xôi, làm bánh.' },
            { name: 'Gạo Đặc Sản', description: 'Các loại gạo đặc sản nổi tiếng các vùng miền.' },
        ]);
        console.log('Categories created...');

        const products = [
            {
                name: 'Gạo ST25 Sóc Trăng',
                category: categories[3]._id, // Đặc sản
                listedPrice: 35000,
                discountPercent: 0,
                description: 'Gạo ST25 chính hãng chú Cua, hạt dài, trắng trong, cơm dẻo, thơm mùi lá dứa tự nhiên.',
                initialQuantity: 1000,
                unit: 'kg',
                images: ['/images/products/gaost25.jpg'],
                is_approved: true,
            },
            {
                name: 'Gạo Lứt Đỏ Điện Biên',
                category: categories[1]._id, // Lứt
                listedPrice: 28000,
                discountPercent: 10,
                description: 'Gạo lứt đỏ Điện Biên dẻo, mềm, dễ ăn, tốt cho người ăn kiêng và tiểu đường.',
                initialQuantity: 500,
                unit: 'kg',
                images: ['/images/products/gao-lut-do.jpg'],
                is_approved: true,
            },
            {
                name: 'Nếp Cái Hoa Vàng',
                category: categories[2]._id, // Nếp
                listedPrice: 32000,
                discountPercent: 0,
                description: 'Nếp cái hoa vàng hạt tròn, dẻo thơm đặc trưng, là lựa chọn số một cho các món xôi.',
                initialQuantity: 800,
                unit: 'kg',
                images: ['/images/products/nep-cai-hoa-vang.jpg'],
                is_approved: true,
            },
            {
                name: 'Gạo Tám Thơm Hải Hậu',
                category: categories[0]._id, // Tẻ
                listedPrice: 25000,
                discountPercent: 5,
                description: 'Gạo Tám thơm Hải Hậu hạt nhỏ, cơm thơm, ngọt đậm đà vị truyền thống.',
                initialQuantity: 1200,
                unit: 'kg',
                images: ['/images/products/gao-tam-thom.jpg'],
                is_approved: true,
            },
            {
                name: 'Gạo Lứt Tím Than',
                category: categories[1]._id, // Lứt
                listedPrice: 30000,
                discountPercent: 0,
                description: 'Gạo lứt tím than chứa nhiều anthocyanin chống oxy hóa, tốt cho sức khỏe.',
                initialQuantity: 400,
                unit: 'kg',
                images: ['/images/products/gao-lut-tim.jpg'],
                is_approved: true,
            },
             {
                name: 'Nếp Nương Tây Bắc',
                category: categories[2]._id, // Nếp
                listedPrice: 38000,
                discountPercent: 0,
                description: 'Nếp nương hạt to, dài, đồ lên dẻo và rất thơm, đặc sản vùng cao.',
                initialQuantity: 600,
                unit: 'kg',
                images: ['/images/products/nep-nuong.jpg'],
                is_approved: true,
            },
            {
                name: 'Gạo Nàng Hương Chợ Đào',
                category: categories[3]._id, // Đặc sản
                listedPrice: 29000,
                discountPercent: 0,
                description: 'Gạo Nàng Hương Chợ Đào nổi tiếng Long An, hương thơm lài đặc trưng.',
                initialQuantity: 700,
                unit: 'kg',
                images: ['/images/products/gao-nang-huong.jpg'],
                is_approved: true,
            },
            {
                name: 'Gạo Nhật Japonica',
                category: categories[0]._id, // Tẻ
                listedPrice: 32000,
                discountPercent: 15,
                description: 'Gạo Nhật hạt tròn, dẻo nhiều, thích hợp làm sushi, cơm nắm cho bé.',
                initialQuantity: 500,
                unit: 'kg',
                images: ['/images/products/gao-nhat.jpg'],
                is_approved: true,
            },
            {
                name: 'Gạo Huyết Rồng',
                category: categories[1]._id, // Lứt
                listedPrice: 42000,
                discountPercent: 5,
                description: 'Gạo huyết rồng màu đỏ nâu, giàu sắt và vitamin B1, rất tốt cho sức khỏe.',
                initialQuantity: 300,
                unit: 'kg',
                images: ['/images/products/gao-huyet-rong.jpg'],
                is_approved: true,
            },
            {
                name: 'Gạo Thơm Lài Miên',
                category: categories[0]._id, // Tẻ
                listedPrice: 26000,
                discountPercent: 0,
                description: 'Gạo Thơm Lài hạt thon dài, cơm dẻo vừa, thơm nhẹ, để nguội vẫn mềm.',
                initialQuantity: 1500,
                unit: 'kg',
                images: ['/images/products/gao-thom-lai.jpg'],
                is_approved: true,
            },
            {
                name: 'Gạo Nếp Sáp',
                category: categories[2]._id, // Nếp
                listedPrice: 24000,
                discountPercent: 0,
                description: 'Nếp sáp hạt trắng đục, độ dẻo và kết dính cao, thích hợp nấu xôi, chè.',
                initialQuantity: 600,
                unit: 'kg',
                images: ['/images/products/nep-sap.jpg'],
                is_approved: true,
            },
            {
                name: 'Gạo Tài Nguyên Chợ Đào',
                category: categories[3]._id, // Đặc sản
                listedPrice: 27000,
                discountPercent: 0,
                description: 'Gạo Tài Nguyên hạt đục, cơm xốp, mềm, ngọt, thích hợp làm cơm chiên.',
                initialQuantity: 800,
                unit: 'kg',
                images: ['/images/products/gao-tai-nguyen.jpg'],
                is_approved: true,
            },
            {
                name: 'Gạo Hàm Châu',
                category: categories[0]._id, // Tẻ
                listedPrice: 18000,
                discountPercent: 0,
                description: 'Gạo Hàm Châu nở xốp, khô, chuyên dùng làm bún, bánh xèo, cơm chiên.',
                initialQuantity: 2000,
                unit: 'kg',
                images: ['/images/products/gao-ham-chau.jpg'],
                is_approved: true,
            },
            {
                name: 'Gạo Sa Mơ',
                category: categories[0]._id, // Tẻ
                listedPrice: 19000,
                discountPercent: 0,
                description: 'Gạo Sa Mơ hạt nhỏ, cơm khô xốp, nở nhiều, thích hợp cho bếp ăn công nghiệp.',
                initialQuantity: 1500,
                unit: 'kg',
                images: ['/images/products/gao-sa-mo.jpg'],
                is_approved: true,
            },
            {
                name: 'Gạo Lứt Đen',
                category: categories[1]._id, // Lứt
                listedPrice: 35000,
                discountPercent: 10,
                description: 'Gạo lứt đen (huyền mễ) giàu chất chống oxy hóa, hỗ trợ tim mạch.',
                initialQuantity: 400,
                unit: 'kg',
                images: ['/images/products/gao-lut-den.jpg'],
                is_approved: true,
            },
        ];

        // Create products with auto-generated productId
        for (const productData of products) {
            const productId = 'PRD' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 100);
            const product = new Product({
                ...productData,
                productId: productId,
                remainingQuantity: productData.initialQuantity,
                seller: sellerId, // Gán người bán
            });
            await product.save();
        }
        
        console.log('Products created...');
        console.log('Data seeding complete!');
        process.exit();
    } catch (error) {
        console.error(`Error seeding data: ${error}`);
        process.exit(1);
    }
};

seedData();
