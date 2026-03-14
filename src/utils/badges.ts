import { Badge } from "@/types/database"

export const BADGES = {
  FIRST_SPARK: {
    key: 'first_spark',
    name: 'الشرارة الأولى 🔥',
    description: 'عند إغلاق أول صفقة',
    icon: '🔥'
  },
  TEN_OUT_OF_TEN: {
    key: 'ten_out_of_ten',
    name: 'عشرة على عشرة 🎯',
    description: 'عند إجراء 10 اجتماعات',
    icon: '🎯'
  },
  DEAL_MAKER: {
    key: 'deal_maker',
    name: 'صانع الصفقات 💼',
    description: 'عند إغلاق 5 صفقات',
    icon: '💼'
  },
  HALFWAY: {
    key: 'halfway',
    name: 'نصف الطريق 📈',
    description: 'عند تحقيق 50% من التارقت الشهري',
    icon: '📈'
  },
  MONTHLY_HERO: {
    key: 'monthly_hero',
    name: 'البطل الشهري 🏆',
    description: 'عند تحقيق 100% من التارقت',
    icon: '🏆'
  }
}

export type BadgeKey = keyof typeof BADGES
