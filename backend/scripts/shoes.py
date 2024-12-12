import os, json, random
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
django.setup()
from django.core.files import File
from ecommerce import settings
from inventory.models.agency import Agency
from inventory.models.product import Shoes
from image.models import Image
from inventory.models.product import ProductItem
from inventory.models.product import ProductImage


path = 'import/images'
json_path = 'import/data.json'

agencies = []

description = """👟👞👠🥿👡 Giày dép phong cách và đa dạng 👡🥿👠👞👟
Nam nữ unisex, mỗi đôi đều mang một câu chuyện riêng! 🌟
Chất liệu và form unisex, phù hợp cho cả nam và nữ. 💫
▪️Size: Freesize, phù hợp với dưới 65kg
▪️Màu sắc: Đa dạng, từ trắng đến đen, tạo sự lựa chọn cho bạn. 🌈

CAM KẾT:

Sản phẩm 100% giống mô tả, đảm bảo sự hài lòng của khách hàng. ✅
Chất liệu vải đảm bảo chất lượng, đem lại sự thoải mái cho đôi chân của bạn. 💯
Kiểm tra và đóng gói cẩn thận trước khi giao hàng, đảm bảo sản phẩm không bị hỏng hoặc bẩn khi nhận hàng. 📦
Sẵn sàng giao hàng ngay khi nhận được đơn, tiết kiệm thời gian cho bạn. ⏰
Hoàn tiền nếu không hài lòng với sản phẩm, sự tin tưởng của khách hàng là ưu tiên hàng đầu. 💰
Giao hàng toàn quốc, thanh toán khi nhận hàng, đem lại sự thuận tiện cho mọi người. 🚚💨
HỖ TRỢ ĐỔI TRẢ THEO CHÍNH SÁCH CỦA CỬA HÀNG
Màu sắc thực tế có thể chênh lệch nhẹ do điều kiện ánh sáng, nhưng chất lượng sản phẩm vẫn được đảm bảo. 🌟
Cần tư vấn thêm? Đừng ngần ngại, liên hệ ngay với chúng tôi! Chúng tôi luôn sẵn lòng hỗ trợ bạn. 📲✨
"""

for agency in os.listdir(path):
    agencies.append(Agency(name=agency))
    
Agency.objects.bulk_create(agencies)


with open(json_path, 'r', encoding='utf-8') as file:
    data = json.load(file)


def clean(price):
    price = price.replace(',', '')
    return int(price)

sizes = ['36', '37', '38', '39', '40', '41', '42', '43', '44']

products = []    
products_images = []
for item in data:
    agency = Agency.objects.get(name=item['brand'])
    product = Shoes(
        name = item['name'],
        price = clean(item['price_sale']),
        old_price = clean(item['price_original']),
        cost = int(int(clean(item['price_sale'])) * 0.8),
        description = description,
        agency = agency,
        view = random.randint(100, 10000),
        category = random.choice(Shoes.SHOES_CATEGORY_CHOICE)[1],
    )
    product.save()
    
    product_items = []
    for size in sizes:
        product_item = ProductItem(
            product = product, 
            size = size,
            total = random.randint(100, 10000),
            buyed_total = random.randint(100, 10000),
            cancelled_total = random.randint(100, 1000),
            returned_total = random.randint(100, 1000),
            revenue_total = random.randint(1000000, 100000000),
            profit_total = random.randint(100000, 10000000),
        )
        product_items.append(product_item)
    
    ProductItem.objects.bulk_create(product_items)    
    
    product.update_total()
    product.save()
    
    products_images = []
    image_folder = f"{path}/{agency.name}/{item['image']}"
    len_min = min(os.listdir(image_folder), key=len)
    
    for image_item in os.listdir(image_folder):
        
        file_path = os.path.join(image_folder, image_item)
        primary = True if image_item == len_min else False
        
        with open(file_path, 'rb') as file:
            django_file = File(file)
            image = Image(image=django_file)
            image.save()
            products_images.append(ProductImage(
                product = product,
                image = image,
                primary = primary
            ))
            
    ProductImage.objects.bulk_create(products_images)
    # break

    