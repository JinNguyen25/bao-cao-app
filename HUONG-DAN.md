# Hướng dẫn cài app "Báo cáo" (làm 1 lần, ~10 phút)

App là một web-app (PWA): đưa lên một địa chỉ https, mở bằng Chrome/Safari trên điện thoại rồi **"Thêm vào màn hình chính"** là có icon như app thật.

## Bước 1 – Đưa app lên mạng (miễn phí)
Cách dễ nhất: **Netlify Drop**
1. Vào https://app.netlify.com/drop (đăng ký bằng Google).
2. Kéo cả thư mục `bao-cao-app` này thả vào trang.
3. Netlify cho bạn một địa chỉ dạng `https://ten-gi-do.netlify.app` → **ghi lại** (dùng ở bước 2).

(Hoặc dùng GitHub Pages / Cloudflare Pages / Firebase Hosting – miễn là có https.)

## Bước 2 – Tạo Google Client ID (để app đọc được Drive)
1. Vào https://console.cloud.google.com → tạo **Project** mới (tên bất kỳ).
2. Menu **APIs & Services → Library** → tìm **Google Drive API** → **Enable**.
3. **APIs & Services → OAuth consent screen** (hoặc "Google Auth Platform"):
   - Loại: **External**, điền tên app + email của bạn.
   - Phần **Audience / Test users**: thêm **chính email Gmail của bạn**.
   - (Có thể để ở chế độ *Testing*, dùng cá nhân là đủ.)
4. **Credentials → Create credentials → OAuth client ID**:
   - Application type: **Web application**
   - **Authorized JavaScript origins**: dán địa chỉ ở bước 1 (vd `https://ten-gi-do.netlify.app`, không có dấu `/` ở cuối).
   - Create → copy **Client ID** (dạng `123-abc.apps.googleusercontent.com`).

## Bước 3 – Dùng trên điện thoại
1. Mở địa chỉ Netlify bằng Chrome (Android) / Safari (iPhone).
2. Dán **Client ID** → **Đăng nhập Google**.
   Nếu thấy cảnh báo *"Google hasn't verified this app"* → **Advanced / Nâng cao → Go to … (unsafe)** – bình thường vì app là của riêng bạn. App chỉ xin quyền **chỉ đọc** (`drive.readonly`).
3. **Chọn thư mục** chứa báo cáo trên Drive.
4. Cài lên màn hình chính: Chrome ⋮ → **Thêm vào màn hình chính / Cài đặt ứng dụng**; Safari → **Chia sẻ → Thêm vào MH chính**.

## Cách tổ chức thư mục để các mục rõ ràng
```
Báo cáo hằng ngày/          ← thư mục gốc bạn chọn
├── Doanh thu/              ← mỗi thư mục con = 1 "Mục"
│   ├── 2026-10-02.gdoc
│   └── 2026-10-01.gdoc
├── Marketing/
└── Kho vận/
```
- Thư mục lồng sâu hơn vẫn được gom vào mục cấp 1.
- File nằm ngay thư mục gốc sẽ vào mục **Chung**.
- Ngày báo cáo lấy từ **tên file** nếu có dạng `2026-10-02` hoặc `02-10-2026`, nếu không thì lấy ngày sửa file.
- Đọc được: Google Docs, Google Sheets (sheet đầu tiên), `.md`, `.txt`, `.html`, `.json`. PDF/Word hiện nút mở sang Drive.

## Tính năng
- **Mới nhất**: mọi báo cáo gộp theo ngày (Hôm nay / Hôm qua…), lọc theo mục, lọc chưa đọc.
- **Mục**: từng mục có số báo cáo + số chưa đọc.
- **Giao diện đọc kiểu app truyện**: 8 màu nền (Sáng, Giấy cũ, Xanh dịu, Xanh nhạt, Xám, Tối, Đen, **Tùy chỉnh** tự chọn màu nền/chữ), cỡ chữ, giãn dòng, lề, kiểu chữ, căn đều, giữ màn hình sáng.
- Nhớ vị trí đọc dở, thanh tiến độ, chạm giữa màn hình để ẩn/hiện thanh công cụ, nút báo cáo cũ hơn/mới hơn.
- Dấu chấm "chưa đọc", lưu (bookmark), tìm kiếm theo tên và nội dung.
- Tự tải sẵn N báo cáo mới nhất → **đọc offline** (mặc định 10).
- Đọc to bằng giọng tiếng Việt (nút loa).

## Lưu ý
- Token Google hết hạn sau ~1 giờ; app tự gia hạn ngầm, nếu không được sẽ hiện nút "Đăng nhập". Báo cáo đã tải sẵn vẫn đọc được offline.
- Cập nhật app: sửa file rồi thả lại thư mục lên Netlify; mở app 2 lần để nhận bản mới.
- Dữ liệu (đã đọc, đã lưu, cài đặt) lưu trên máy, không gửi đi đâu ngoài Google.

## Tự dịch báo cáo (Việt / Anh / Nhật)
Giao diện đổi ngôn ngữ ngay trong **Cài đặt → Ngôn ngữ**. Để báo cáo cũng tự dịch theo ngôn ngữ đang chọn, cần một script dịch miễn phí trên Google của bạn (làm 1 lần, ~3 phút):
1. Vào https://script.google.com → **Dự án mới**.
2. Xóa code mẫu, dán toàn bộ nội dung file `dich-apps-script.gs` → **Lưu**.
3. **Triển khai (Deploy) → Tùy chọn triển khai mới → loại Ứng dụng web**:
   - Thực thi dưới tư cách: **Tôi**
   - Người có quyền truy cập: **Bất kỳ ai**
   - Bấm Triển khai, cấp quyền khi Google hỏi (Nâng cao → tiếp tục).
4. Copy **URL ứng dụng web** (kết thúc bằng `/exec`) → dán vào **Cài đặt → Ngôn ngữ** của app → **Lưu** → **Thử dịch**.
- Báo cáo đã dịch được lưu trên máy để đọc lại/offline. Có nút ⽂ ở thanh dưới để chuyển qua lại bản gốc / bản dịch.
- Báo cáo đã đúng ngôn ngữ đang chọn thì không bị dịch lại.
- Hạn mức miễn phí của Google khoảng vài nghìn lượt dịch mỗi ngày, đủ dùng cá nhân.
