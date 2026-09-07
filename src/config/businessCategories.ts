export interface BusinessCategoryOption {
  id: string;
  title: string;
  iconHint?: string;
}

export const BUSINESS_CATEGORIES: BusinessCategoryOption[] = [
  { id: 'apparel', title: 'پوشاک، کیف، کفش و مد' },
  { id: 'cosmetics', title: 'لوازم آرایشی، بهداشتی و زیبایی' },
  { id: 'accessories', title: 'اکسسوری، زیورآلات و بدلیجات' },
  { id: 'jewelry', title: 'طلا، نقره و جواهرات' },
  { id: 'digital', title: 'موبایل، رایانه و لوازم جانبی دیجیتال' },
  { id: 'home_appliances', title: 'لوازم خانگی، برقی و صوتی تصویری' },
  { id: 'home_decor', title: 'دکوراسیون، خانه و آشپزخانه' },
  { id: 'furniture', title: 'مبلمان، سرویس خواب و صنایع چوب' },
  { id: 'grocery', title: 'سوپرمارکت، مواد غذایی و خواربار' },
  { id: 'sweets_nuts', title: 'آجیل، خشکبار، شیرینی و شکلات' },
  { id: 'restaurant_cafe', title: 'رستوران، فست‌فود، کافی‌شاپ و کترینگ' },
  { id: 'stationery_books', title: 'کتاب، نوشت‌افزار و محصولات فرهنگی' },
  { id: 'toys_games', title: 'اسباب‌بازی، بازی‌های فکری و سرگرمی' },
  { id: 'baby_maternity', title: 'سیسمونی و ملزومات نوزاد و کودک' },
  { id: 'sports_camping', title: 'تجهیزات و لوازم ورزشی و کمپینگ' },
  { id: 'supplements_health', title: 'مکمل‌های غذایی، دارویی و سلامت' },
  { id: 'tools_industrial', title: 'ابزارآلات، تجهیزات صنعتی و یراق‌آلات' },
  { id: 'auto_parts', title: 'قطعات یدکی، لوازم جانبی خودرو و موتورسیکلت' },
  { id: 'flowers_plants', title: 'گل و گیاه، گل‌فروشی، باغبانی و کشاورزی' },
  { id: 'handicrafts_art', title: 'صنایع دستی، هنر و آثار سفارشی دست‌ساز' },
  { id: 'watches_eyewear', title: 'ساعت، عینک و اپتیک' },
  { id: 'pet_shop', title: 'پت‌شاپ، ملزومات حیوانات خانگی و دامداری' },
  { id: 'medical_equipment', title: 'تجهیزات پزشکی، دندانپزشکی و ارتوپدی' },
  { id: 'education_courses', title: 'آموزشگاه، دوره‌های آموزشی و تدریس' },
  { id: 'technical_services', title: 'خدمات فنی، تعمیرات، تأسیسات و ساختمان' },
  { id: 'printing_advertising', title: 'چاپ، تبلیغات، بسته‌بندی و تابلو‌سازی' },
  { id: 'it_software', title: 'طراحی گرافیک، برنامه‌نویسی و فناوری اطلاعات' },
  { id: 'photography_media', title: 'عکاسی، فیلم‌برداری، آتلیه و تولید محتوا' },
  { id: 'finance_legal', title: 'حسابداری، خدمات مالی، حقوقی و مشاوره' },
  { id: 'events_tourism', title: 'خدمات تشریفات، تالار، مجالس و گردشگری' },
  { id: 'other', title: 'سایر (توضیح دهید)' },
];
