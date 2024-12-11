import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

# Danh sách các URL cần lấy link
urls = ["https://zunezx.com/san-pham.html", "https://zunezx.com/san-pham.html?page=2"]
product_urls = []

# Tạo thư mục 'zune' nếu chưa tồn tại
os.makedirs("zune", exist_ok=True)

# Duyệt qua từng URL để lấy link sản phẩm
for url in urls:
    response = requests.get(url)

    # Kiểm tra mã trạng thái HTTP để chắc chắn rằng yêu cầu thành công
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, "html.parser")

        # Tìm tất cả các thẻ <a> có chứa <img> với class 'img-responsive main-img main'
        products = soup.find_all("a", href=True, title=True)

        # Lọc ra những sản phẩm có <img> có class đúng như yêu cầu
        for product in products:
            img_tag = product.find("img", class_="img-responsive main-img main")
            if img_tag:
                link = product["href"]
                title = product["title"]
                product_urls.append((link, title))
    else:
        print(f"Yêu cầu không thành công, mã trạng thái: {response.status_code}")

# Cào ảnh từ các link sản phẩm chi tiết
for link, title in product_urls:
    # Tạo thư mục cho mỗi sản phẩm
    product_folder = os.path.join("zune", title.replace(" ", "_"))
    os.makedirs(product_folder, exist_ok=True)

    # Gửi yêu cầu GET đến trang chi tiết sản phẩm
    product_url = urljoin(urls[0], link)  # Xây dựng URL đầy đủ nếu link không đầy đủ
    response = requests.get(product_url)

    if response.status_code == 200:
        soup = BeautifulSoup(response.text, "html.parser")

        # Tìm tất cả các thẻ <img> trong div với class 'slick-slide'
        img_tags = soup.find_all("img", class_="img-responsive")

        total = 0

        # Duyệt qua tất cả các ảnh
        for i, img_tag in enumerate(img_tags):
            img_url = img_tag["src"]
            if "upload/image" not in img_url or total == 4:
                continue
            total += 1
            img_url = urljoin(product_url, img_url)  # Đảm bảo URL ảnh là đầy đủ
            img_name = os.path.basename(img_url)  # Lấy tên ảnh từ URL
            if img_name == "Shape-1-b9f.png":
                continue

            # Tải ảnh và lưu vào thư mục tương ứng
            img_path = os.path.join(product_folder, img_name)
            try:
                img_response = requests.get(img_url, stream=True)
                if img_response.status_code == 200:
                    with open(img_path, "wb") as f:
                        for chunk in img_response.iter_content(chunk_size=8192):
                            f.write(chunk)
                    print(f"Đã tải ảnh: {img_name} vào thư mục {product_folder}")
                else:
                    print(f"Lỗi tải ảnh: {img_url}")
            except Exception as e:
                print(f"Đã có lỗi khi tải ảnh {img_url}: {e}")
    else:
        print(
            f"Yêu cầu không thành công khi cào trang sản phẩm {product_url}, mã trạng thái: {response.status_code}"
        )
