Tiêu đề: Yêu cầu tạo Phím tắt iOS (Apple Shortcut) - "Snap Video"
Mô tả tổng quan:
Mình cần tạo một Phím tắt iOS để tải video/phương tiện từ các nền tảng mạng xã hội. Phím tắt này không tự bóc tách dữ liệu mà hoạt động như một "cầu nối": Nhận URL từ người dùng, mã hóa, gửi lên một API server (api.phimtat.vn) để lấy link tải trực tiếp (JSON), sau đó hiển thị menu cho người dùng chọn độ phân giải và tiến hành tải về máy.
Luồng logic chi tiết (Step-by-Step):
1. Đầu vào (Input):
Dấu đầu dòng Phím tắt cần xuất hiện trong Bảng chia sẻ (Share Sheet), chấp nhận URL từ các ứng dụng khác.
Dấu đầu dòng Nếu không chạy từ Share Sheet, nó sẽ tự động lấy văn bản/URL từ Khay nhớ tạm (Clipboard).
2. Tiền xử lý & Cấu hình:
Dấu đầu dòng Tạo một Từ điển (Dictionary) chứa các cài đặt mặc định: show_menu = ĐÚNG, ask_format = ĐÚNG.
Dấu đầu dòng Mã hóa Base64: Mã hóa cái URL vừa nhận được ở bước 1.
Dấu đầu dòng Xử lý qua JavaScript nhúng: Sử dụng hành động "Văn bản" hoặc "URL" với định dạng data:text/html,<script>.... Trong script này, thực hiện giải mã (decode) Base64, lấy thông tin ngôn ngữ máy (navigator.language), và đóng gói các chuỗi query cần thiết. Trích xuất nội dung của URL này thành biến main_json.
3. Gọi API Server:
Dấu đầu dòng Phím tắt cần gọi đến URL (GET): [https://api.phimtat.vn/json/snapvideo.json](https://api.phimtat.vn/json/snapvideo.json)
Dấu đầu dòng Tham số bắt buộc (Query Parameters):
Dấu đầu dòng api-key: Cần nhập chính xác chuỗi JILx9BLUzuCnwpXaSAYgF9X10hlW3rNN (Trích xuất từ ảnh gốc).
Dấu đầu dòng lang: Biến ngôn ngữ.
Dấu đầu dòng ask_format, show_menu, skip_update: Lấy từ từ điển cấu hình ban đầu.
Dấu đầu dòng b64 (hoặc url64): Chính là URL đầu vào đã được mã hóa base64.
4. Xử lý phản hồi (JSON Parsing) & Menu chọn:
Dấu đầu dòng API sẽ trả về một cấu trúc JSON. Hãy dùng hành động Lấy Từ điển từ Đầu vào.
Dấu đầu dòng Trích xuất ra 2 danh sách (List): Biến labels (chứa tên hiển thị, ví dụ: "1080p", "720p") và biến medias (chứa URL tải thực tế tương ứng).
Dấu đầu dòng Dùng lệnh Chọn từ danh sách (Choose from List) biến labels để người dùng chọn chất lượng.
Dấu đầu dòng Dùng Chỉ mục (Index) của mục vừa chọn trong labels để lấy ra URL tương ứng ở cùng vị trí trong danh sách medias. Đặt URL này thành biến url_fetch.
5. Tải xuống (Download) & Xử lý ngoại lệ:
Dấu đầu dòng Sử dụng lệnh Lấy nội dung của URL (Get Contents of URL) đối với biến url_fetch để tải file về.
Dấu đầu dòng Lưu ý luồng phụ: Tác giả có dùng các lệnh "Lặp lại", "Thay thế văn bản" để kiểm tra xem url_fetch có chứa các cờ như {{open-url}} hay không. Nếu có, tức là máy chủ yêu cầu mở bằng trình duyệt thay vì tải trực tiếp -> Mở link và kết thúc phím tắt.
6. Đổi tên và Lưu trữ (Save logic):
Dấu đầu dòng Tạo một Số ngẫu nhiên (Random Number) từ 1 đến 9999999.
Dấu đầu dòng Đổi tên file tải về (fetch_result) theo định dạng: snapvideo--[Tiêu đề video]-[Số ngẫu nhiên].[Đuôi file mở rộng].
Dấu đầu dòng Tạo rẽ nhánh Nếu (If) dựa trên loại file:
Dấu đầu dòng Nếu là tệp tin thông thường (ví dụ JSON, Document): Dùng lệnh Lưu tệp (Save File) vào thư mục "Trên iPhone". Gán vào biến m_file.
Dấu đầu dòng Nếu là file phương tiện (Ảnh/Video): Dùng lệnh Lưu vào Album ảnh (Save to Photo Album) ("Gần đây"). Gán vào biến m_album.
7. Menu kết thúc (Post-Action):
Dấu đầu dòng Tạo một danh sách menu gom các biến m_file, m_album và chữ close.
Dấu đầu dòng Hỏi người dùng muốn làm gì tiếp theo (Hiển thị lệnh Chọn từ...).
Dấu đầu dòng Nếu người dùng chọn mục có chứa ảnh/video (m_album), chạy hành động Mở ứng dụng Ảnh (Open Photos) để họ xem kết quả.
Ghi chú cho người làm: Bạn có thể tham khảo 14 ảnh chụp màn hình đính kèm để xem cách tác giả gốc đặt tên biến (selected_item, url_red, label_now...) và cách họ nối các khối logic (đặc biệt là khối data:text/html). Yếu tố tiên quyết để phím tắt này chạy là API Key của phimtat.vn vẫn còn hoạt động.
