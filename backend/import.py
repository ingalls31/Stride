import os
import json
import random
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ecommerce.settings")
django.setup()

from django.core.files import File
from ecommerce import settings
from product.models import Agency, Product, ProductImage, ProductItem
from image.models import Image

# Cấu hình Django

# Đường dẫn thư mục chứa sản phẩm và các ảnh
path = "zune"
agencies = ["LuxeFit", "VeraMode", "NoirWear"]

description = """👗👚👕🧥👖 Quần áo phong cách và đa dạng 👖🧥👕👚👗
Dành cho cả nam và nữ, mỗi bộ trang phục đều mang đến sự tự tin và phong cách riêng! 🌟
Chất liệu và thiết kế unisex, phù hợp với mọi đối tượng. 💫
▪️Size: Freesize, phù hợp với nhiều vóc dáng khác nhau
▪️Màu sắc: Đa dạng, từ basic đến nổi bật, giúp bạn dễ dàng lựa chọn. 🌈

CAM KẾT:

Sản phẩm 100% giống mô tả, đảm bảo sự hài lòng của khách hàng. ✅
Chất liệu vải mềm mại, thoải mái, giúp bạn tự do di chuyển cả ngày dài. 💯
Kiểm tra và đóng gói cẩn thận trước khi giao hàng, đảm bảo sản phẩm không bị hỏng hoặc bẩn khi nhận hàng. 📦
Sẵn sàng giao hàng ngay khi nhận được đơn, tiết kiệm thời gian cho bạn. ⏰
Hoàn tiền nếu không hài lòng với sản phẩm, sự tin tưởng của khách hàng là ưu tiên hàng đầu. 💰
Giao hàng toàn quốc, thanh toán khi nhận hàng, đem lại sự thuận tiện cho mọi người. 🚚💨
HỖ TRỢ ĐỔI TRẢ THEO CHÍNH SÁCH CỦA CỬA HÀNG
Màu sắc thực tế có thể chênh lệch nhẹ do điều kiện ánh sáng, nhưng chất lượng sản phẩm vẫn được đảm bảo. 🌟
Cần tư vấn thêm? Đừng ngần ngại, liên hệ ngay với chúng tôi! Chúng tôi luôn sẵn lòng hỗ trợ bạn. 📲✨
"""

# Mảng các kích thước
sizes = ["S", "M", "L", "XL", "2XL", "3XL"]

# Tạo danh sách Agency (chọn ngẫu nhiên từ danh sách agencies)
agency_objects = [Agency(name=agency) for agency in agencies]
Agency.objects.bulk_create(agency_objects)

# Duyệt qua các thư mục con trong thư mục zune
for subdir in os.listdir(path):
    subdir_path = os.path.join(path, subdir)
    product_images = []
    image_folder = subdir_path  # Thư mục chứa ảnh sản phẩm
    image_files = [
        f for f in os.listdir(image_folder) if f.endswith((".jpg", ".jpeg", ".png"))
    ]

    if len(image_files) == 0:
        continue

    # Kiểm tra xem đây có phải là thư mục
    if os.path.isdir(subdir_path):
        print(subdir)
        # Chọn ngẫu nhiên một agency
        agency = random.choice(agency_objects)

        # Tạo thông tin sản phẩm
        price = random.randint(100000, 200000)
        old_price = random.randint(price, 200000)
        cost = random.randint(100000, price)
        product = Product(
            name=subdir.replace("_", " "),  # Tên sản phẩm là tên thư mục con
            price=price,
            old_price=old_price,
            cost=cost,
            description=description,
            agency=agency,
            view=random.randint(100, 10000),
        )
        product.save()

        # Tạo các ProductItem cho các kích thước
        product_items = []
        for size in sizes:
            product_item = ProductItem(
                product=product,
                size=size,
                total=random.randint(100, 10000),
                buyed_total=random.randint(100, 10000),
                cancelled_total=random.randint(100, 1000),
                returned_total=random.randint(100, 1000),
                revenue_total=random.randint(1000000, 100000000),
                profit_total=random.randint(100000, 10000000),
            )
            product_items.append(product_item)

        ProductItem.objects.bulk_create(product_items)

        # Cập nhật lại tổng sản phẩm
        product.update_total()
        product.save()

        print(product)

        # Tạo các ProductImage từ ảnh trong thư mục sản phẩm
        product_images = []
        image_folder = subdir_path  # Thư mục chứa ảnh sản phẩm
        image_files = [
            f for f in os.listdir(image_folder) if f.endswith((".jpg", ".jpeg", ".png"))
        ]

        print(image_files)

        if image_files:
            # Chọn ảnh đầu tiên làm ảnh chính
            primary_image_file = image_files[0]

            for image_item in image_files:
                file_path = os.path.join(image_folder, image_item)
                print(file_path)
                primary = image_item == primary_image_file

                # Đọc và lưu ảnh vào cơ sở dữ liệu
                with open(file_path, "rb") as file:
                    django_file = File(file)
                    image = Image(image=django_file)
                    image.save()
                    product_images.append(
                        ProductImage(product=product, image=image, primary=primary)
                    )

            results = ProductImage.objects.bulk_create(product_images)
            print("results", results)

        # Nếu cần, có thể thêm một dòng "break" để dừng sau một số lần lặp
        # break

    # break
