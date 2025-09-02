export interface Member {
  id: string;
  name: string;
}

export interface ScoringActivity {
  id: string;
  name: string;
  points: number;
  maxPointsPerDay?: number;
  maxPointsPerMonth?: number;
  type: 'checkbox' | 'number' | 'radio' | 'checkbox_double';
  weekdaysOnly?: boolean;
  monthlyOnly?: boolean;
  radioOptions?: number[];
}

export interface MemberScore {
  memberId: string;
  date: string;
  activities: { [activityId: string]: number | boolean };
  totalPoints: number;
}

export const MEMBERS: Member[] = [
  { id: '1', name: 'Vũ Huy Điệp' },
  { id: '2', name: 'Vũ Quang Minh' },
  { id: '3', name: 'Bùi Hồng Dương' },
  { id: '4', name: 'Hoàng Văn Đào' },
  { id: '5', name: 'Nguyễn Tiến Đạt' },
  { id: '6', name: 'Vương Văn Chính' },
  { id: '7', name: 'Ninh Văn Thành' },
  { id: '8', name: 'Ngô Ngọc Phúc' },
  { id: '9', name: 'Trương Đình Đạt' },
  { id: '10', name: 'Vũ Văn Bảng' },
  { id: '11', name: 'Nguyễn Ngọc Khanh' },
  { id: '12', name: 'Lê Trung Kiên' },
  { id: '13', name: 'Nguyễn Hồng Tam' },
  { id: '14', name: 'Đỗ Văn Thoại' },
  { id: '15', name: 'Nguyễn Văn Phương' },
  { id: '16', name: 'Lê Ngọc Trí' },
  { id: '17', name: 'Nguyễn Văn Khôi' },
  { id: '18', name: 'Khuất Thanh Duy' },
  { id: '19', name: 'Nguyễn Huy Công' },
  { id: '20', name: 'Nguyễn Văn Thắng' },
  { id: '21', name: 'Đỗ Long Thành' },
  { id: '22', name: 'Nguyễn Thái Ất' },
];

export const SCORING_ACTIVITIES: ScoringActivity[] = [
  {
    id: 'morning_group',
    name: 'Nhóm sáng: 8h-8h30',
    points: 50,
    maxPointsPerDay: 50,
    type: 'checkbox',
    weekdaysOnly: true
  },
  {
    id: 'speech',
    name: 'Phát biểu 1 bài GĐ',
    points: 50,
    type: 'number'
  },
  {
    id: 'edu_complete',
    name: 'Hoàn thành Edu',
    points: 500,
    maxPointsPerMonth: 500,
    type: 'checkbox',
    monthlyOnly: true
  },
  {
    id: 'mypage_complete',
    name: 'Hoàn thành My page',
    points: 100,
    maxPointsPerDay: 100,
    type: 'checkbox'
  },
  {
    id: 'pray_daily',
    name: 'Praydaily',
    points: 50,
    maxPointsPerDay: 50,
    type: 'checkbox'
  },
  {
    id: 'dedication_prayer',
    name: 'Cầu nguyện hằng hiến',
    points: 10,
    maxPointsPerDay: 20,
    type: 'checkbox_double'
  },
  {
    id: 'other_prayer',
    name: 'Cầu nguyện khác (3 phút trở lên)',
    points: 10,
    maxPointsPerDay: 100,
    type: 'number'
  },
  {
    id: 'teaching_post',
    name: 'Bốc giáo huấn viết lên nhóm',
    points: 10,
    maxPointsPerDay: 20,
    type: 'radio',
    radioOptions: [0, 1, 2]
  },
  {
    id: 'letter_to_mother',
    name: 'Viết thư lên Mẹ',
    points: 50,
    maxPointsPerDay: 50,
    type: 'number'
  },
  {
    id: 'gratitude_three',
    name: 'Viết 3 điều cảm tạ',
    points: 50,
    maxPointsPerDay: 50,
    type: 'checkbox'
  },
  {
    id: 'online_preaching',
    name: 'Truyền đạo trực tuyến',
    points: 50,
    maxPointsPerDay: 50,
    type: 'checkbox'
  },
  {
    id: 'ca_trudo',
    name: '1 Ca trudo',
    points: 200,
    type: 'number'
  },
  {
    id: 'baptism',
    name: 'Báp têm',
    points: 1000,
    type: 'number'
  },
  {
    id: 'pure',
    name: 'Đơn thuần',
    points: 50,
    type: 'number'
  },
  {
    id: 'effective',
    name: 'Hữu hiệu',
    points: 200,
    type: 'number'
  },
  {
    id: 'mymemo',
    name: 'Nhập Mymemo',
    points: 20,
    type: 'checkbox'
  }
];