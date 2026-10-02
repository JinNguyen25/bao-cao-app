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

## Tra từ điển & học từ vựng (tiếng Anh / tiếng Nhật)
- Khi đang đọc bản tiếng Anh hoặc Nhật, bấm nút **sách có dấu tra** ở thanh dưới để bật **chế độ tra từ**, rồi **chạm vào từ bất kỳ**: hiện nghĩa tiếng Việt, cách đọc (hiragana với tiếng Nhật, phiên âm với tiếng Anh), loại từ, nghĩa tiếng Anh, và đọc to từ đó. Không cần chuyển sang tiếng Việt nên không mất chỗ đang đọc.
- Bấm **★ Lưu từ** để lưu kèm câu ví dụ và link quay lại đúng báo cáo. Tab **Từ vựng** liệt kê từ đã lưu, có nút **Ôn tập** (thẻ ghi nhớ lặp lại ngắt quãng: 1, 3, 7, 14, 30 ngày) và **Xuất CSV** để nhập vào Anki.
- Cần **cập nhật lại script**: vào script.google.com mở dự án cũ, dán lại toàn bộ nội dung `dich-apps-script.gs` mới → **Triển khai → Quản lý bản triển khai → ✎ → Phiên bản: Phiên bản mới → Triển khai** (URL giữ nguyên).

## Đồng bộ giữa điện thoại và iPad
Cần script Apps Script bản mới nhất (có `sync_get`/`sync_set`, xem `dich-apps-script.gs`) và đã kết nối địa chỉ dịch.
1. Trên thiết bị thứ nhất: **Cài đặt → Đồng bộ thiết bị** → nhập một mã dài khó đoán (hoặc bấm **Tạo mã ngẫu nhiên**) → **Bật đồng bộ**.
2. Bấm **Sao chép link cài thiết bị khác**, gửi link sang thiết bị thứ hai (Messenger, Ghi chú…) và mở. Link tự lưu địa chỉ dịch và mã đồng bộ; không cần gõ lại.
3. Đồng bộ: từ vựng (kèm ôn tập), dấu trang, trạng thái đã đọc, vị trí đọc dở, thư mục nguồn, ngôn ngữ/màu/kiểu chữ. Cỡ chữ, giãn dòng, lề giữ riêng từng máy.
4. App tự đồng bộ khi mở, khi quay lại app, và vài giây sau mỗi thay đổi. Nút **Đồng bộ ngay** để ép đồng bộ.
- Mỗi thiết bị vẫn phải tự đăng nhập Google để đọc Drive.
- Dữ liệu đồng bộ nằm trong Script Properties của script (giới hạn ~500 KB, đủ cho hàng nghìn từ vựng).
- Hạn chế: "Đánh dấu chưa đọc" có thể bị máy kia ghi đè lại thành đã đọc.
