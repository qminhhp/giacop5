export interface WorkActivity {
  code: string;
  name: string;
  description: string;
}

export const WORK_ACTIVITIES: WorkActivity[] = [
  { code: '101', name: 'Truyền đạo gõ cửa', description: 'Hoạt động truyền đạo thăm viếng từng nhà' },
  { code: '102', name: 'Truyền đạo đường phố', description: 'Hoạt động truyền đạo ngoài trời (đường phố, công viên, ga tàu, trung tâm mua sắm v.v...)' },
  { code: '103', name: 'Truyền đạo trại', description: 'Hoạt động truyền đạo hoạt dụng trại dành cho truyền đạo' },
  { code: '104', name: 'Truyền đạo sự kiện', description: 'Hoạt động truyền đạo bằng cách mời mọi người đến các sự kiện của Hội Thánh và rao truyền (Hội thảo Kinh Thánh, Hội thảo chữa lành, Triển lãm v.v...)' },
  { code: '105', name: 'Truyền đạo liên kết', description: 'Hoạt động truyền đạo cho người quen lâu năm (bạn bè, tiền bối & hậu bối v.v...), hoặc các hoạt động truyền đạo được tiến hành bằng cách liên kết bởi đề nghị của người khác (bao gồm truyền đạo trực tuyến cho người quen).' },
  { code: '110', name: 'Truyền đạo gia đình', description: 'Hoạt động truyền đạo rao truyền cho đối tượng là gia đình và họ hàng' },
  { code: '111', name: 'Truyền đạo người đi làm', description: 'Hoạt động truyền đạo rao truyền cho đối tượng chủ yếu là nhân viên công sở' },
  { code: '112', name: 'Truyền đạo bộ đội', description: 'Hoạt động truyền đạo rao truyền cho đối tượng chủ yếu là quân nhân' },
  { code: '113', name: 'Truyền đạo sinh viên', description: 'Hoạt động truyền đạo rao truyền cho đối tượng chủ yếu là sinh viên' },
  { code: '114', name: 'Truyền đạo học sinh', description: 'Hoạt động truyền đạo rao truyền cho đối tượng chủ yếu là học sinh trung học cơ sở và trung học phổ thông' },
  { code: '115', name: 'Truyền đạo thương gia', description: 'Hoạt động truyền đạo rao truyền cho đối tượng chủ yếu là thương nhân' },
  { code: '116', name: 'Truyền đạo cơ quan', description: 'Hoạt động truyền đạo rao truyền cho đối tượng chủ yếu là người làm việc cơ quan bằng cách thăm viếng các cơ quan ban ngành (cơ quan công quyền, đồn cảnh sát, bệnh viện - trung tâm y tế v.v...)' },
  { code: '117', name: 'Truyền đạo hàng xóm', description: 'Hoạt động truyền đạo rao truyền cho đối tượng chủ yếu là hàng xóm sống gần nhà' },
  { code: '118', name: 'Truyền đạo loại hình khác', description: 'Hoạt động truyền đạo cho số đông không xác định, không thuộc nhóm từ "110 -117"' },
  { code: '120', name: 'Hoạt động phụng sự', description: 'Hoạt động phụng sự bên ngoài do Hội Thánh chủ quản (làm sạch môi trường, hiến máu, chung tay giúp đỡ, phục hồi thiệt hại, giúp đỡ nạn nhân, cứu trợ tai nạn v.v...)' },
  { code: '121', name: 'Hoạt động quảng bá', description: 'Hoạt động quảng bá Hội Thánh (thăm viếng cơ quan, thăm viếng nhân vật có thế lực, phát sóng tài liệu quảng bá v.v...)' },
  { code: '122', name: 'Truyền đạo đối ứng', description: 'Mọi hoạt động nhằm đối ứng kẻ hủy báng' },
  { code: '123', name: 'Hỗ trợ truyền đạo', description: 'Mọi hoạt động để hỗ trợ truyền đạo (phụng sự xe cộ, phụng sự ấu nhi, phụng sự nhà bếp, chấp lễ Báptêm v.v...)' },
  { code: '124', name: 'Hành chính truyền đạo', description: 'Mọi công việc hành chính nhằm hỗ trợ hoạt động truyền đạo' },
  { code: '125', name: 'Tài liệu truyền đạo', description: 'Mọi hoạt động liên quan đến việc chế tác tài liệu truyền đạo (Ảnh, video, âm thanh, xuất bản, điện toán, phiên dịch, chỉnh sửa v.v...)' },
  { code: '126', name: 'Hỗ trợ truyền đạo loại hình khác', description: 'Mọi hoạt động liên quan đến truyền đạo không thuộc nhóm "120 - 126" (nhóm họp tổng kết, nhóm liên hiệp, dã ngoại, nhóm họp địa - khu vực trưởng, nhóm họp thể thao v.v...)' },
  { code: '127', name: 'Truyền giáo trực tuyến', description: 'Accessing and viewing gospel content items online (videos on the official YouTube channel, official websites, web content, etc.)' },
  { code: '201', name: 'Giáo dục thánh đồ mới', description: 'Mọi công việc giáo dục và quản lý đối với thánh đồ mới (bao gồm việc thăm viếng, tư vấn, quản lý thánh đồ mới)' },
  { code: '202', name: 'Giáo dục thánh đồ không phải người truyền đạo', description: 'Mọi công việc giáo dục và quản lý người không phải người truyền đạo (bao gồm việc thăm viếng, tư vấn, quản lý người không phải người truyền đạo)' },
  { code: '203', name: 'Giáo dục người truyền đạo', description: 'Mọi công việc giáo dục và quản lý người truyền đạo (bao gồm việc thăm viếng, tư vấn, quản lý người truyền đạo)' },
  { code: '204', name: 'Giáo dục người chức phận chức trách', description: 'Mọi công việc giáo dục và quản lý đối với người chức phận - chức trách (bao gồm việc thăm viếng, tư vấn, quản lý người chức phận - chức trách)' },
  { code: '205', name: 'Giáo dục đào tạo người chăn', description: 'Mọi công việc giáo dục và quản lý đối với ứng cử viên người chăn như sinh đồ, sinh đồ dự bị, vợ sinh đồ (bao gồm việc thăm viếng, tư vấn, quản lý người chăn)' },
  { code: '206', name: 'Giáo dục người chăn', description: 'Mọi công việc giáo dục và quản lý đối với người chăn như hội trưởng, đồng liêu, người quản lý Hội Thánh chi nhánh, vợ hội trưởng, vợ đồng liêu, vợ người quản lý Hội Thánh chi nhánh (bao gồm việc thăm viếng, tư vấn, quản lý người chăn)' },
  { code: '207', name: 'Giáo dục khác', description: 'Mọi công việc giáo dục và quản lý dành cho đối tượng không xác định, không thuộc nhóm có mã số điện toán từ "201-206" (dàn nhạc, đội thánh ca, dàn hợp xướng ấu thiếu niên v.v...)' },
  { code: '210', name: 'Tài liệu giáo dục', description: 'Mọi hoạt động liên quan đến việc chế tác tài liệu cho mục đích giáo dục (Ảnh, video, âm thanh, xuất bản, điện toán, phiên dịch, chỉnh sửa v.v...)' },
  { code: '211', name: 'Hỗ trợ giáo dục', description: 'Mọi hoạt động hỗ trợ giáo dục (phụng sự xe cộ, phụng sự nhà bếp, phụng sự hướng dẫn, in ấn tài liệu giáo dục v.v...)' },
  { code: '212', name: 'Quản lý thánh đồ', description: 'Hoạt động đơn thuần được tiến hành với mục đích quản lý thánh đồ (thăm viếng gia đình, thăm viếng, tư vấn, sự kiện gia đình v.v...)' },
  { code: '213', name: 'Hỗ trợ giáo dục khác', description: 'Mọi hoạt động giáo dục không thuộc nhóm từ "210 - 212"' },
  { code: '301', name: 'Thờ phượng hàng tuần', description: 'Mọi hoạt động chuẩn bị hoặc hỗ trợ cho lễ thờ phượng Ngày Thứ Ba, lễ thờ phượng ngày Sabát' },
  { code: '302', name: 'Thờ phượng lễ trọng thể', description: 'Mọi hoạt động chuẩn bị hoặc hỗ trợ cho lễ thờ phượng lễ trọng thể hàng năm' },
  { code: '303', name: 'Thờ phượng kỷ niệm', description: 'Mọi hoạt động chuẩn bị hoặc hỗ trợ cho lễ thờ phượng kỷ niệm (Ngày Giáng Sinh, Ngày Giêrusalem Mới, Ngày Cha Mẹ trên trời, Tổng Hội định kỳ v.v...)' },
  { code: '304', name: 'Tài liệu thờ phượng', description: 'Mọi hoạt động nhằm chế tác tài liệu liên quan đến thờ phượng (chụp ảnh, quay phim, âm thanh, điện toán, phiên dịch, chỉnh sửa và chế tác tài liệu khác v.v...)' },
  { code: '305', name: 'Sự kiện thờ phượng khác', description: 'Mọi hoạt động chuẩn bị hoặc hỗ trợ cho lễ thờ phượng và sự kiện không thuộc nhóm từ "301-304"' },
  { code: '306', name: 'Education Event', description: 'All activities to prepare or support worship services and events, which do not belong to the codes 301-305' },
  { code: '401', name: 'Hành chính nhân sự', description: 'Mọi hoạt động hành chính liên quan đến nghiệp vụ nhân sự (Đơn đề cử, giấy xin đi công tác, làm visa v.v...)' },
  { code: '402', name: 'Hành chính tài vụ', description: 'Mọi hoạt động hành chính liên quan đến nghiệp vụ tài vụ (bao gồm giáo dục tài vụ)' },
  { code: '403', name: 'Hành chính pháp lý', description: 'Mọi hoạt động hành chính liên quan đến nghiệp vụ pháp lý (tố tụng, đăng ký Hội Thánh v.v...)' },
  { code: '404', name: 'Hành chính thư ký', description: 'Mọi hoạt động hành chính liên quan đến nghiệp vụ thư ký' },
  { code: '405', name: 'Hành chính điện toán', description: 'Mọi hoạt động hành chính liên quan đến nghiệp vụ điện toán (phát triển phần mềm, vận hành điện toán, bảo mật điện toán, sửa chữa điện toán, quản lý mạng lưới, giáo dục điện toán v.v...)' },
  { code: '406', name: 'Hành chính thư vụ', description: 'Mọi hoạt động hành chính liên quan đến nghiệp vụ thư vụ nói chung, chẳng hạn như soạn thảo và quản lý văn bản, quản lý dữ liệu, quản lý tự động hóa thư vụ, vận hành hội nghị v.v...' },
  { code: '407', name: 'Quản lý tài sản', description: 'Mọi hoạt động hành chính liên quan đến việc thu mua và quản lý tài sản như xe cộ, vật phẩm và trang thiết bị' },
  { code: '408', name: 'Phúc lợi', description: 'Mọi hoạt động hành chính nhằm hỗ trợ và hoạt động phúc lợi thông thường không thuộc vào nhóm truyền đạo, giáo dục, thờ phượng hoặc sự kiện' },
  { code: '409', name: 'Hành chính khác', description: 'Mọi hoạt động hành chính không thuộc nhóm từ "401-408" (gửi và nhận bưu kiện, hàng hóa v.v...)' },
  { code: '501', name: 'Xây dựng đền thờ', description: 'Mọi hoạt động liên quan đến việc xây dựng mới, sửa chữa bảo trì, lắp đặt (bảng hiệu) và tạo cảnh quan' },
  { code: '502', name: 'Quản lý trang thiết bị', description: 'Mọi hoạt động liên quan đến việc quản lý đền thờ và trang thiết bị (bao gồm bảng hiệu và tạo cảnh quan)' }
];

export type TimeSlot = 'morning' | 'afternoon' | 'evening';

export interface DaySchedule {
  date: string; // YYYY-MM-DD
  morning?: string; // activity code
  afternoon?: string; // activity code
  evening?: string; // activity code
}

export interface MemberWorkSchedule {
  memberId: string;
  schedules: DaySchedule[];
}