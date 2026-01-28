const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./model/category');
const Product = require('./model/product');
const User = require('./model/user');

dotenv.config();

// Hàm kết nối DB trực tiếp (không phụ thuộc file config bên ngoài)
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/rice");
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

const seedData = async () => {
    await connectDB();

    try {
        // Clear existing data
        await Category.deleteMany({});
        await Product.deleteMany({});
        console.log('Data cleared...');

        // Tìm một user để làm người bán (Seller)
        let seller = await User.findOne({ role: 'admin' });
        if (!seller) seller = await User.findOne({});
        
        // Nếu chưa có user nào, tạo một user mặc định để tránh lỗi validation sản phẩm
        if (!seller) {
            console.log('No user found. Creating default admin user...');
            const defaultUser = new User({
                name: 'Admin Seeder',
                email: 'admin@example.com',
                password: 'password123', // Lưu ý: Model User nên có hook pre-save để hash password này
                role: 'admin',
                is_approved: true
            });
            seller = await defaultUser.save();
        }

        const sellerId = seller._id;
        console.log('Using seller:', seller.fullName || seller.email);

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
                images: ['/images/products/gaolutdodienbien.jpg'],
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
                images: ['/images/products/nepcaihoavang.jpg'],
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
                images: ['/images/products/gaotamthom.jpg'],
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
                images: ['/images/products/gaoluttimthan.png'],
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
                images: ['/images/products/nepnuongtaybac.jpg'],
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
                images: ['/images/products/gaonanghuong.jpg'],
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
                images: ['/images/products/gaonhatjaponica.jpg'],
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
                images: ['/images/products/gaohuyetrong.jpeg'],
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
                images: ['/images/products/gaothomlaimien.jpg'],
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
                images: ['/images/products/gaonepsap.jpg'],
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
                images: ['/images/products/gaotainguyen.jpg'],
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
                images: ['/images/products/gaohamchau.jpg'],
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
                images: ['/images/products/gaosamo.jpg'],
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
                images: ['/images/products/gaolutden.jpg'],
                is_approved: true,
            },
        ];

        // Create products with auto-generated productId
        for (const productData of products) {
            const productId = 'PRD' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 100);
            
            const productPayload = {
                ...productData,
                productId: productId,
                remainingQuantity: productData.initialQuantity,
                seller: sellerId, // Luôn gán seller để tránh lỗi validation
            };

            const product = new Product(productPayload);
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
