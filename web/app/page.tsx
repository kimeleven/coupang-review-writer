"use client";

import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Copy, Edit2, Trash2, ExternalLink, Sparkles, 
  CheckCircle, Clock, TrendingUp, Settings, Home, Package, FileText, 
  History, X, Link as LinkIcon 
} from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Server Actions (DB)
import { 
  getProducts, createProduct, deleteProduct,
  getReviews, createReview, deleteReview 
} from './actions';

// ==================== TYPES ====================
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  coupangUrl: string;
  partnersUrl: string;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  notes?: string;
  createdAt: string;
}

interface SavedReview {
  id: string;
  productId: string;
  productName: string;
  title: string;
  content: string;
  style: string;
  keywords: string[];
  createdAt: string;
}

interface GenerationOptions {
  platform: 'naver' | 'tistory';
  style: string;
  keywords: string;
  length: 'short' | 'medium' | 'long';
  targetReader: string;
  extraInstructions: string;
}

// ==================== CONSTANTS ====================
const CATEGORIES = ['전자기기', '주방/생활', '뷰티/헬스', '유아/아동', '패션/잡화', '가구/인테리어', '스포츠/레저'];

const POPULAR_PRODUCTS = [
  { name: "에어프라이어 5.5L 대용량", price: 89000, category: "주방/생활", image: "https://images.unsplash.com/photo-1585515320310-259814a2e9e2?w=400", rating: 4.7, reviews: 12480 },
  { name: "무선 청소기 스틱형 가성비", price: 135000, category: "주방/생활", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", rating: 4.5, reviews: 8930 },
  { name: "전기면도기 5중날 습식/건식", price: 68000, category: "뷰티/헬스", image: "https://images.unsplash.com/photo-1621607512214-682974801d29?w=400", rating: 4.6, reviews: 15200 },
  { name: "로봇청소기 물걸레 동시", price: 289000, category: "주방/생활", image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400", rating: 4.4, reviews: 6740 },
  { name: "고데기 32mm 롱배럴", price: 42000, category: "뷰티/헬스", image: "https://images.unsplash.com/photo-1522337360788-2742b2e1b8b3?w=400", rating: 4.8, reviews: 9870 },
  { name: "노이즈캔슬링 무선이어폰", price: 159000, category: "전자기기", image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400", rating: 4.6, reviews: 21340 },
  { name: "20L 대용량 가습기", price: 78000, category: "가구/인테리어", image: "https://images.unsplash.com/photo-1545259741-2f7a1c9f5e2e?w=400", rating: 4.3, reviews: 4310 },
  { name: "접이식 전기포트 1.5L", price: 29000, category: "주방/생활", image: "https://images.unsplash.com/photo-1544787219-7f5e2a1f0a3c?w=400", rating: 4.5, reviews: 7650 },
  { name: "LED 스탠드 무선 충전형", price: 35000, category: "전자기기", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f92c1?w=400", rating: 4.7, reviews: 5890 },
  { name: "3단계 코 필터 KF94 마스크 100매", price: 18500, category: "뷰티/헬스", image: "https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=400", rating: 4.2, reviews: 31200 },
];

const REVIEW_STYLES = [
  { value: 'honest', label: '솔직 사용 후기형', desc: '실제 사용 경험 중심, 장단점 균형' },
  { value: 'comparison', label: '비교 분석형', desc: '경쟁 제품과 비교하며 장점 부각' },
  { value: 'value', label: '가성비 추천형', desc: '가격 대비 성능 강조' },
  { value: 'first', label: '신제품 첫인상형', desc: '개봉기 + 초기 사용 느낌' },
  { value: 'longterm', label: '장기 사용기', desc: '3개월 이상 사용 후 진짜 후기' },
];

const PLATFORMS = [
  { value: 'naver', label: '네이버 블로그' },
  { value: 'tistory', label: '티스토리' },
];

const LENGTHS = [
  { value: 'short', label: '간단 (800~1200자)' },
  { value: 'medium', label: '일반 (1500~2200자)' },
  { value: 'long', label: '상세 (2800자 이상)' },
];

// ==================== MAIN APP ====================
export default function CoupangReviewWriter() {
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [savedReviews, setSavedReviews] = useState<SavedReview[]>([]);
  const [currentView, setCurrentView] = useState<'dashboard' | 'products' | 'writer' | 'history' | 'settings'>('dashboard');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPartnersHelperOpen, setIsPartnersHelperOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');

  // Writer state
  const [genOptions, setGenOptions] = useState<GenerationOptions>({
    platform: 'naver',
    style: 'honest',
    keywords: '',
    length: 'medium',
    targetReader: '',
    extraInstructions: '',
  });
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [writerTab, setWriterTab] = useState<'edit' | 'preview'>('edit');

  // Settings
  const [openaiKey, setOpenaiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  // Add product form
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: '주방/생활',
    coupangUrl: '',
    partnersUrl: '',
    imageUrl: '',
    notes: '',
  });

  // ==================== DATA LOADING FROM DB (Neon) ====================
  const loadData = async () => {
    try {
      const [dbProducts, dbReviews] = await Promise.all([
        getProducts(),
        getReviews()
      ]);

      // Map DB types to our frontend types (dates as string for compatibility)
      const mappedProducts: Product[] = dbProducts.map(p => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
        partnersUrl: p.partnersUrl || '',
        imageUrl: p.imageUrl || undefined,
        rating: p.rating || undefined,
        reviewCount: p.reviewCount || undefined,
        notes: p.notes || undefined,
      }));
      setProducts(mappedProducts);

      const mappedReviews: SavedReview[] = dbReviews.map(r => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      }));
      setSavedReviews(mappedReviews);
    } catch (error) {
      console.error('Failed to load data from DB:', error);
      toast.error('데이터베이스에서 데이터를 불러오지 못했습니다. .env의 DATABASE_URL을 확인하세요.');
    }
  };

  useEffect(() => {
    loadData();

    // Load OpenAI key from localStorage (remains client-side, user's own key)
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) setOpenaiKey(savedKey);
  }, []);

  useEffect(() => {
    if (openaiKey) localStorage.setItem('openai_api_key', openaiKey);
  }, [openaiKey]);

  // ==================== PRODUCT FUNCTIONS (now with Neon DB) ====================
  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt'>) => {
    try {
      await createProduct({
        name: productData.name,
        price: productData.price,
        category: productData.category,
        coupangUrl: productData.coupangUrl,
        partnersUrl: productData.partnersUrl,
        imageUrl: productData.imageUrl,
        rating: productData.rating,
        reviewCount: productData.reviewCount,
        notes: productData.notes,
      });
      await loadData(); // refresh from DB
      toast.success('상품이 추가되었습니다');
      setIsAddModalOpen(false);
      resetNewProductForm();
    } catch (error) {
      console.error(error);
      toast.error('상품 추가에 실패했습니다');
    }
  };

  const resetNewProductForm = () => {
    setNewProduct({
      name: '', price: '', category: '주방/생활',
      coupangUrl: '', partnersUrl: '', imageUrl: '', notes: '',
    });
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('이 상품을 삭제하시겠습니까? 관련 리뷰는 유지됩니다.')) return;
    try {
      await deleteProduct(id);
      await loadData();
      if (selectedProduct?.id === id) {
        setSelectedProduct(null);
        setGeneratedTitle('');
        setGeneratedContent('');
      }
      toast.success('상품이 삭제되었습니다');
    } catch (error) {
      toast.error('삭제에 실패했습니다');
    }
  };

  const quickAddPopular = (pop: typeof POPULAR_PRODUCTS[0]) => {
    const productData: Omit<Product, 'id' | 'createdAt'> = {
      name: pop.name,
      price: pop.price,
      category: pop.category,
      coupangUrl: `https://www.coupang.com/np/search?component=&q=${encodeURIComponent(pop.name)}`,
      partnersUrl: '',
      imageUrl: pop.image,
      rating: pop.rating,
      reviewCount: pop.reviews,
      notes: '인기 상품 빠른 추가 (링크 및 파트너스 URL을 실제 값으로 교체하세요)',
    };
    addProduct(productData);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === '전체' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // ==================== PARTNERS LINK HELPER ====================
  const validatePartnersLink = (url: string): boolean => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.includes('partners.coupang') || 
           lower.includes('link.coupang.com') || 
           lower.includes('subId') ||
           lower.includes('repurchase');
  };

  // ==================== REVIEW GENERATION ====================
  const generateReviewTemplate = (product: Product, opts: GenerationOptions): { title: string; content: string } => {
    const styleLabel = REVIEW_STYLES.find(s => s.value === opts.style)?.label || '사용 후기';
    const platformLabel = opts.platform === 'naver' ? '네이버 블로그' : '티스토리';
    
    const keywords = opts.keywords ? opts.keywords.split(',').map(k => k.trim()) : [product.name];
    const mainKeyword = keywords[0];

    let title = '';
    if (opts.style === 'honest') {
      title = `${product.name} 실제로 써보니... 솔직 후기 (2025)`;
    } else if (opts.style === 'value') {
      title = `${product.name} 가성비 끝판왕? ${Math.floor(product.price / 10000)}만원대 리뷰`;
    } else if (opts.style === 'comparison') {
      title = `${product.name} vs 다른 제품 비교! 어떤 걸 사야 할까?`;
    } else if (opts.style === 'first') {
      title = `${product.name} 개봉기 + 첫 사용 후기 (직접 써봤습니다)`;
    } else {
      title = `${product.name} 3개월 사용 후기 | 진짜 내돈내산 리뷰`;
    }

    const disclosure = `※ 이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 지급받을 수 있습니다.`;

    let content = `# ${title}\n\n`;
    content += `${disclosure}\n\n`;

    content += `안녕하세요! 오늘은 많은 분들이 관심 있어 하시는 **${product.name}**를 직접 사용해 본 솔직한 후기를 준비했습니다.\n\n`;

    if (product.price) {
      content += `**구매 가격**: ${product.price.toLocaleString()}원\n\n`;
    }

    content += `## 왜 이 제품을 선택했나요?\n\n`;
    content += `${opts.targetReader ? `${opts.targetReader}분들을 위해 ` : ''}요즘 ${mainKeyword} 찾으시는 분들 정말 많으시죠. 저도 사용 전에는 고민이 많았는데, 실제로 써보고 나니 확실히 알겠더라고요.\n\n`;

    content += `## 첫인상 및 스펙\n\n`;
    content += `- 가격대비 만족도가 상당히 높습니다\n`;
    content += `- ${product.category} 카테고리에서 최근 후기가 좋은 제품이에요\n`;
    if (product.rating) content += `- 실제 사용자 평점 ${product.rating}점 (리뷰 ${product.reviewCount?.toLocaleString() || '다수'}건)\n`;
    content += `\n`;

    content += `## 장점 (솔직 정리)\n\n`;
    content += `- **디자인/사용감**: 처음 열어보는 순간부터 고급스러운 느낌이 강했습니다.\n`;
    content += `- **성능**: 실제 사용 시 기대 이상으로 만족스러웠어요. 특히 일상에서 자주 쓰는 기능들이 잘 갖춰져 있더라고요.\n`;
    content += `- **가성비**: 비슷한 스펙의 다른 제품들과 비교했을 때 가격 경쟁력이 좋습니다.\n\n`;

    content += `## 단점 (있는 그대로)\n\n`;
    content += `- 처음 세팅할 때 설명서를 꼼꼼히 봐야 합니다. (5~10분 정도)\n`;
    content += `- 소음은 살짝 있는 편이지만, 크게 거슬리지는 않았어요.\n`;
    content += `- ${opts.style === 'longterm' ? '장기 사용 시 먼지 쌓임에 주의가 필요합니다.' : '고가 프리미엄 제품과 비교하면 디테일한 마감은 조금 차이가 납니다.'}\n\n`;

    if (opts.extraInstructions) {
      content += `## 추가로 말씀드리고 싶은 점\n\n`;
      content += `${opts.extraInstructions}\n\n`;
    }

    content += `## 총평 및 추천 대상\n\n`;
    content += `${product.name}는 **${styleLabel}**으로 충분히 추천드릴 수 있는 제품입니다.\n\n`;

    if (opts.length === 'long') {
      content += `### 누가 사면 좋을까요?\n\n`;
      content += `- ${opts.targetReader || '처음 구매하시는 분'}에게 특히 추천드려요.\n`;
      content += `- 이미 비슷한 제품을 써보신 분들도 가성비로 업그레이드하시기에 좋습니다.\n`;
      content += `- 선물용으로도 인기가 많더라고요.\n\n`;
    }

    content += `## 구매 링크\n\n`;
    if (product.partnersUrl) {
      content += `👉 **[쿠팡에서 구매하기 (파트너스 링크)](${product.partnersUrl})**\n\n`;
    } else if (product.coupangUrl) {
      content += `👉 **[쿠팡에서 검색하기](${product.coupangUrl})**\n\n`;
      content += `⚠️ **쿠팡파트너스 링크로 교체**하시면 수익이 발생합니다!\n\n`;
    }

    content += `---\n\n`;
    content += `이 글이 도움이 되셨다면 공감과 댓글 부탁드려요! 다음 리뷰도 기대해주세요 :)\n\n`;
    content += `*${platformLabel}에 최적화된 형태로 작성되었습니다.*`;

    return { title, content };
  };

  const generateWithOpenAI = async (product: Product, opts: GenerationOptions): Promise<{ title: string; content: string }> => {
    if (!openaiKey) {
      throw new Error('OpenAI API 키가 설정되지 않았습니다. 설정에서 키를 입력해주세요.');
    }

    const styleDesc = REVIEW_STYLES.find(s => s.value === opts.style)?.desc || '';
    const keywordsList = opts.keywords ? opts.keywords.split(',').map(k => k.trim()) : [];

    const systemPrompt = `당신은 한국에서 가장 유명한 쿠팡 제휴 리뷰 블로거입니다. 
네이버 블로그와 티스토리에 올라가는 실제 판매 전환율이 높은 리뷰를 전문적으로 작성합니다.

규칙:
1. 자연스럽고 신뢰감 있는 구어체 한국어로 작성 (과도한 과장 금지)
2. 장점과 단점을 솔직하게 균형 있게 다룸
3. 구체적인 사용 디테일을 넣어 진짜 사용한 것처럼 작성
4. 주요 키워드는 자연스럽게 3~5회 배치
5. 반드시 마지막 또는 상단에 광고/제휴 문구 명시
6. ${opts.platform === 'naver' ? '네이버 블로그' : '티스토리'} 에디터에 바로 붙여넣기 좋은 마크다운 형식
7. 제목은 클릭률이 높으면서도 과하지 않게 작성`;

    const userPrompt = `다음 상품에 대한 ${opts.platform === 'naver' ? '네이버 블로그' : '티스토리'} 리뷰를 작성해주세요.

[상품 정보]
- 상품명: ${product.name}
- 가격: ${product.price.toLocaleString()}원
- 카테고리: ${product.category}
- 평점: ${product.rating || '4.5'} (${product.reviewCount || 5000}개 리뷰)

[작성 조건]
- 스타일: ${styleDesc}
- 주요 키워드: ${keywordsList.join(', ') || product.name}
- 글 길이: ${opts.length}
- 타겟 독자: ${opts.targetReader || '일반 사용자'}
- 추가 지시: ${opts.extraInstructions || '없음'}

반드시 다음 형식을 지켜주세요:
1. 첫 줄에 매력적인 제목 (이모지 적당히 사용 가능)
2. 상단 또는 하단에 쿠팡파트너스 광고 문구
3. 실제 사용한 듯한 구체적 표현 다수 포함
4. 구매 링크는 반드시 "쿠팡에서 구매하기" 형태로 안내`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.75,
        max_tokens: opts.length === 'long' ? 3200 : opts.length === 'medium' ? 2200 : 1400,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenAI API 오류 (${response.status})`);
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || '';

    // Parse title and content
    const lines = raw.trim().split('\n');
    let title = lines[0].replace(/^#+\s*/, '').trim();
    let content = raw;

    // If first line is too title-like, use it
    if (title.length > 80) {
      title = `${product.name} 실제 사용 후기`;
    }

    return { title, content };
  };

  const handleGenerate = async () => {
    if (!selectedProduct) {
      toast.error('상품을 먼저 선택해주세요');
      return;
    }

    setIsGenerating(true);

    try {
      let result: { title: string; content: string };

      if (openaiKey && openaiKey.startsWith('sk-')) {
        result = await generateWithOpenAI(selectedProduct, genOptions);
        toast.success('AI가 고품질 리뷰를 생성했습니다!');
      } else {
        result = generateReviewTemplate(selectedProduct, genOptions);
        toast.success('템플릿 기반 리뷰가 생성되었습니다 (OpenAI 키 등록 시 더 고품질 생성 가능)');
      }

      setGeneratedTitle(result.title);
      setGeneratedContent(result.content);
      setWriterTab('edit');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || '생성 중 오류가 발생했습니다. 템플릿으로 대체합니다.');
      // Fallback to template
      const fallback = generateReviewTemplate(selectedProduct, genOptions);
      setGeneratedTitle(fallback.title);
      setGeneratedContent(fallback.content);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveCurrentReview = async () => {
    if (!selectedProduct || !generatedContent) {
      toast.error('저장할 내용이 없습니다');
      return;
    }

    try {
      await createReview({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        title: generatedTitle || selectedProduct.name + ' 리뷰',
        content: generatedContent,
        style: genOptions.style,
        keywords: genOptions.keywords ? genOptions.keywords.split(',').map(k => k.trim()) : [],
      });
      await loadData();
      toast.success('리뷰가 DB에 저장되었습니다');
    } catch (error) {
      console.error(error);
      toast.error('리뷰 저장에 실패했습니다');
    }
  };

  const loadReview = (review: SavedReview) => {
    const prod = products.find(p => p.id === review.productId);
    if (prod) {
      setSelectedProduct(prod);
    }
    setGeneratedTitle(review.title);
    setGeneratedContent(review.content);
    setCurrentView('writer');
    setWriterTab('edit');
    toast.info('저장된 리뷰를 불러왔습니다');
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm('이 리뷰 기록을 삭제할까요?')) return;
    try {
      await deleteReview(id);
      await loadData();
      toast.success('리뷰가 삭제되었습니다');
    } catch (error) {
      toast.error('삭제에 실패했습니다');
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} 복사 완료! 네이버/티스토리에 붙여넣기 하세요.`);
    } catch {
      toast.error('클립보드 복사에 실패했습니다');
    }
  };

  const getCopyOptimized = (content: string, platform: 'naver' | 'tistory') => {
    // Naver Blog loves simple newlines + some HTML, Tistory is more markdown friendly
    if (platform === 'naver') {
      return content
        .replace(/#{1,6}\s/g, '') // remove markdown headers
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\n/g, '\n\n'); // double line breaks
    }
    return content; // Keep markdown for Tistory
  };

  // ==================== UI HELPERS ====================
  const openWriterWithProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('writer');
    // Pre-fill some keywords
    setGenOptions(prev => ({
      ...prev,
      keywords: product.name.split(' ').slice(0, 3).join(', '),
    }));
    setGeneratedTitle('');
    setGeneratedContent('');
  };

  const updateGenOption = (key: keyof GenerationOptions, value: any) => {
    setGenOptions(prev => ({ ...prev, [key]: value }));
  };

  const clearGenerated = () => {
    setGeneratedTitle('');
    setGeneratedContent('');
  };

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-[#E5E5E5] sticky top-0 z-50">
        <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#E85D04] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-xl tracking-tighter">쿠팡 리뷰라이터</div>
                <div className="text-[10px] text-[#737373] -mt-1">Coupang Affiliate Blog Tool</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {[
              { id: 'dashboard', label: '대시보드', icon: Home },
              { id: 'products', label: '상품 관리', icon: Package },
              { id: 'writer', label: '리뷰 작성', icon: FileText },
              { id: 'history', label: '저장된 리뷰', icon: History },
              { id: 'settings', label: '설정', icon: Settings },
            ].map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive 
                    ? 'bg-[#E85D04] text-white' 
                    : 'text-[#525252] hover:bg-[#F5F5F5]'}`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="text-xs text-[#A3A3A3] font-mono">
            {products.length}개 상품 · {savedReviews.length}개 리뷰
          </div>
        </div>
      </nav>

      <div className="max-w-[1280px] mx-auto px-6 py-8">
        {/* DASHBOARD */}
        {currentView === 'dashboard' && (
          <div>
            <div className="mb-8">
              <h1 className="text-4xl font-bold tracking-tighter mb-2">안녕하세요! 👋</h1>
              <p className="text-xl text-[#525252]">오늘도 좋은 리뷰 하나 작성해볼까요?</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="card p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#E85D04]/10 flex items-center justify-center">
                    <Package className="w-6 h-6 text-[#E85D04]" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold tabular-nums">{products.length}</div>
                    <div className="text-[#737373]">등록된 상품</div>
                  </div>
                </div>
              </div>
              <div className="card p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#2D6A4F]/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-[#2D6A4F]" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold tabular-nums">{savedReviews.length}</div>
                    <div className="text-[#737373]">작성 완료된 리뷰</div>
                  </div>
                </div>
              </div>
              <div className="card p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#E85D04]/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-[#E85D04]" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold tabular-nums">{Math.floor(savedReviews.length * 1.3)}</div>
                    <div className="text-[#737373]">이번 달 예상 작성 가능</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Popular Products Quick Add */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">인기 상품 빠른 추가</h2>
                <p className="text-[#737373] mt-1">자주 리뷰되는 상품들을 원클릭으로 추가하세요. 나중에 실제 파트너스 링크로 교체하면 됩니다.</p>
              </div>
              <button onClick={() => setCurrentView('products')} className="btn-secondary">
                전체 상품 관리 →
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
              {POPULAR_PRODUCTS.map((pop, idx) => (
                <div key={idx} onClick={() => quickAddPopular(pop)} className="card p-4 cursor-pointer hover:border-[#E85D04] group">
                  <div className="aspect-[4/3] bg-[#F5F5F5] rounded-lg mb-3 overflow-hidden">
                    <img src={pop.image} alt={pop.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="font-semibold text-sm leading-tight mb-1.5 line-clamp-2">{pop.name}</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#E85D04] font-semibold">{pop.price.toLocaleString()}원</span>
                    <span className="text-[#A3A3A3]">{pop.rating}★</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <button onClick={() => { setCurrentView('products'); setIsAddModalOpen(true); }} className="btn-primary text-base px-8 py-3">
                <Plus className="w-5 h-5" /> 직접 상품 추가하기
              </button>
            </div>
          </div>
        )}

        {/* PRODUCTS VIEW */}
        {currentView === 'products' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">상품 관리</h1>
                <p className="text-[#737373] mt-1">쿠팡 상품과 파트너스 링크를 함께 관리하세요</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setIsPartnersHelperOpen(true)} className="btn-secondary">
                  <LinkIcon className="w-4 h-4" /> 파트너스 링크 도우미
                </button>
                <button onClick={() => setIsAddModalOpen(true)} className="btn-primary">
                  <Plus className="w-4 h-4" /> 상품 직접 추가
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-5">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-3.5 w-4 h-4 text-[#A3A3A3]" />
                <input
                  type="text"
                  placeholder="상품명 또는 메모 검색..."
                  className="input pl-11"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select className="input w-48" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                <option value="전체">전체 카테고리</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="card p-16 text-center">
                <Package className="w-12 h-12 mx-auto text-[#D4D4D4] mb-4" />
                <p className="text-lg font-medium">등록된 상품이 없습니다</p>
                <p className="text-[#737373] mt-1 mb-6">인기 상품을 추가하거나 직접 등록해보세요</p>
                <button onClick={() => setIsAddModalOpen(true)} className="btn-primary">첫 상품 추가하기</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProducts.map(product => (
                  <div key={product.id} className={`card p-5 product-card ${selectedProduct?.id === product.id ? 'selected' : ''}`}>
                    <div className="flex gap-4">
                      {product.imageUrl && (
                        <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-[#E5E5E5] bg-white">
                          <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-semibold leading-tight pr-6">{product.name}</div>
                            <div className="text-[#E85D04] font-semibold mt-1">{product.price.toLocaleString()}원</div>
                          </div>
                          <span className="badge">{product.category}</span>
                        </div>
                        {product.rating && (
                          <div className="text-xs text-[#737373] mt-1.5">{product.rating} · {product.reviewCount?.toLocaleString()} 리뷰</div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#E5E5E5] flex items-center gap-2 flex-wrap">
                      <button onClick={() => openWriterWithProduct(product)} className="btn-primary flex-1 justify-center text-sm py-2">
                        <Edit2 className="w-4 h-4" /> 리뷰 작성하기
                      </button>
                      <button onClick={() => { setSelectedProduct(product); setCurrentView('writer'); }} className="btn-ghost">선택</button>
                      <button onClick={() => handleDeleteProduct(product.id)} className="btn-ghost text-[#DC2626] hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-3 text-[12px] space-y-1">
                      {product.partnersUrl ? (
                        <a href={product.partnersUrl} target="_blank" className="flex items-center gap-1 text-[#2D6A4F] hover:underline">
                          <CheckCircle className="w-3.5 h-3.5" /> 파트너스 링크 등록됨 <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <div className="text-amber-600 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> 파트너스 링크 미등록
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* WRITER VIEW - THE CORE */}
        {currentView === 'writer' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">리뷰 작성</h1>
                <p className="text-[#737373]">상품을 선택하고 AI(또는 템플릿)로 전문 리뷰를 생성하세요</p>
              </div>
              <button onClick={() => setCurrentView('products')} className="btn-secondary">상품 목록으로</button>
            </div>

            {/* Product selector */}
            {!selectedProduct ? (
              <div className="card p-8 text-center">
                <p className="mb-4 text-lg">리뷰를 작성할 상품을 선택해주세요</p>
                <button onClick={() => setCurrentView('products')} className="btn-primary">상품 선택하러 가기</button>
              </div>
            ) : (
              <>
                {/* Selected Product Header */}
                <div className="card p-5 mb-6 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-4">
                    {selectedProduct.imageUrl && (
                      <img src={selectedProduct.imageUrl} alt="" className="w-16 h-16 object-cover rounded-lg border" />
                    )}
                    <div>
                      <div className="font-semibold text-lg">{selectedProduct.name}</div>
                      <div className="text-sm text-[#737373] flex gap-3 mt-0.5">
                        <span>{selectedProduct.price.toLocaleString()}원</span>
                        <span className="text-[#E85D04]">{selectedProduct.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {selectedProduct.partnersUrl && (
                      <a href={selectedProduct.partnersUrl} target="_blank" className="btn-secondary text-sm">파트너스 링크 열기</a>
                    )}
                    <a href={selectedProduct.coupangUrl} target="_blank" className="btn-ghost text-sm">쿠팡에서 보기 <ExternalLink className="w-3.5 h-3.5" /></a>
                    <button onClick={() => { setSelectedProduct(null); clearGenerated(); }} className="btn-ghost text-sm">상품 변경</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  {/* Generation Options */}
                  <div className="lg:col-span-2 space-y-5">
                    <div className="card p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#E85D04]" /> 생성 옵션</h3>

                      <div className="space-y-5">
                        <div>
                          <label className="block text-sm font-medium mb-1.5 text-[#525252]">플랫폼</label>
                          <div className="flex gap-2">
                            {PLATFORMS.map(p => (
                              <button key={p.value} onClick={() => updateGenOption('platform', p.value)}
                                className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition ${genOptions.platform === p.value ? 'border-[#E85D04] bg-[#FFF0E6] text-[#E85D04]' : 'border-[#E5E5E5] hover:bg-[#F5F5F5]'}`}>
                                {p.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1.5 text-[#525252]">리뷰 스타일</label>
                          <select className="input" value={genOptions.style} onChange={e => updateGenOption('style', e.target.value)}>
                            {REVIEW_STYLES.map(s => (
                              <option key={s.value} value={s.value}>{s.label} — {s.desc}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1.5 text-[#525252]">주요 키워드 (쉼표로 구분)</label>
                          <input className="input" value={genOptions.keywords} onChange={e => updateGenOption('keywords', e.target.value)} placeholder="에어프라이어, 대용량, 가성비" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1.5 text-[#525252]">글 길이</label>
                          <select className="input" value={genOptions.length} onChange={e => updateGenOption('length', e.target.value)}>
                            {LENGTHS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1.5 text-[#525252]">타겟 독자 (선택)</label>
                          <input className="input" value={genOptions.targetReader} onChange={e => updateGenOption('targetReader', e.target.value)} placeholder="30대 직장인, 신혼부부 등" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1.5 text-[#525252]">추가 지시사항</label>
                          <textarea className="textarea" rows={3} value={genOptions.extraInstructions} onChange={e => updateGenOption('extraInstructions', e.target.value)} placeholder="배송이 빨랐다는 점 강조, 단점은 솔직하게, 특정 기능 자세히..." />
                        </div>
                      </div>

                      <button 
                        onClick={handleGenerate} 
                        disabled={isGenerating} 
                        className="btn-primary w-full mt-6 py-3 text-base disabled:opacity-70"
                      >
                        {isGenerating ? 'AI가 리뷰를 작성 중입니다...' : (openaiKey ? '🤖 AI로 고품질 리뷰 생성' : '📝 템플릿으로 리뷰 생성')}
                      </button>
                      {!openaiKey && <p className="text-[12px] text-center mt-2 text-[#A3A3A3]">설정에서 OpenAI 키를 등록하면 훨씬 더 자연스러운 글이 나옵니다</p>}
                    </div>

                    <div className="card p-5 text-sm text-[#525252]">
                      <div className="font-semibold mb-2">💡 팁</div>
                      <ul className="space-y-1 text-xs pl-1 list-disc">
                        <li>파트너스 링크를 꼭 등록하면 수익이 발생합니다</li>
                        <li>키워드는 실제 검색량 많은 단어로 넣는 게 좋습니다</li>
                        <li>추가 지시사항에 실제 경험을 적으면 더 좋은 결과가 나와요</li>
                      </ul>
                    </div>
                  </div>

                  {/* Generated Output */}
                  <div className="lg:col-span-3">
                    <div className="card overflow-hidden flex flex-col" style={{ minHeight: '620px' }}>
                      <div className="border-b border-[#E5E5E5] px-5 flex items-center justify-between bg-[#FAFAFA]">
                        <div className="flex">
                          <div onClick={() => setWriterTab('edit')} className={`tab ${writerTab === 'edit' ? 'active' : ''}`}>편집</div>
                          <div onClick={() => setWriterTab('preview')} className={`tab ${writerTab === 'preview' ? 'active' : ''}`}>미리보기</div>
                        </div>
                        <div className="flex gap-2 py-2">
                          {generatedContent && (
                            <>
                              <button onClick={() => copyToClipboard(generatedTitle + '\n\n' + getCopyOptimized(generatedContent, genOptions.platform), '네이버용 텍스트')} className="btn-ghost text-xs">
                                <Copy className="w-3.5 h-3.5" /> 네이버용 복사
                              </button>
                              <button onClick={() => copyToClipboard(generatedContent, '티스토리 마크다운')} className="btn-ghost text-xs">
                                <Copy className="w-3.5 h-3.5" /> 티스토리용 복사
                              </button>
                              <button onClick={saveCurrentReview} className="btn-secondary text-xs py-1.5">저장</button>
                            </>
                          )}
                          {generatedContent && <button onClick={clearGenerated} className="btn-ghost text-xs">초기화</button>}
                        </div>
                      </div>

                      {!generatedContent ? (
                        <div className="flex-1 flex items-center justify-center text-center p-10">
                          <div>
                            <Sparkles className="w-10 h-10 mx-auto text-[#E5E5E5] mb-4" />
                            <p className="text-[#737373]">왼쪽 옵션을 선택하고<br />리뷰 생성 버튼을 눌러주세요</p>
                          </div>
                        </div>
                      ) : writerTab === 'edit' ? (
                        <div className="flex-1 p-5 flex flex-col">
                          <input 
                            className="input text-lg font-semibold mb-4" 
                            value={generatedTitle} 
                            onChange={e => setGeneratedTitle(e.target.value)}
                            placeholder="제목을 입력하세요"
                          />
                          <textarea 
                            className="textarea flex-1 font-mono text-[13px] leading-relaxed" 
                            value={generatedContent} 
                            onChange={e => setGeneratedContent(e.target.value)}
                          />
                        </div>
                      ) : (
                        <div className="flex-1 p-8 overflow-auto writer-output prose prose-sm max-w-none text-[#262626]">
                          <h1 className="text-2xl font-bold mb-6 tracking-tight">{generatedTitle}</h1>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{generatedContent}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* HISTORY */}
        {currentView === 'history' && (
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-6">저장된 리뷰</h1>
            
            {savedReviews.length === 0 ? (
              <div className="card p-12 text-center">
                <History className="mx-auto w-10 h-10 text-[#D4D4D4] mb-3" />
                <p>아직 저장된 리뷰가 없습니다</p>
              </div>
            ) : (
              <div className="space-y-4">
                {savedReviews.map(review => (
                  <div key={review.id} className="card p-5 flex gap-5 items-start">
                    <div className="flex-1">
                      <div className="font-semibold text-lg mb-1">{review.title}</div>
                      <div className="text-sm text-[#737373] mb-3">{review.productName} · {new Date(review.createdAt).toLocaleDateString('ko-KR')}</div>
                      <div className="text-sm text-[#525252] line-clamp-2 font-light pr-10">{review.content.slice(0, 220)}...</div>
                    </div>
                    <div className="flex flex-col gap-2 pt-1">
                      <button onClick={() => loadReview(review)} className="btn-primary text-sm py-1.5 px-5">불러오기</button>
                      <button onClick={() => handleDeleteReview(review.id)} className="btn-ghost text-red-600 text-sm">삭제</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SETTINGS */}
        {currentView === 'settings' && (
          <div className="max-w-xl">
            <h1 className="text-3xl font-bold tracking-tight mb-2">설정</h1>
            <p className="text-[#737373] mb-8">OpenAI 키를 등록하면 훨씬 더 자연스럽고 판매 전환율이 높은 리뷰를 생성할 수 있습니다.</p>

            <div className="card p-7">
              <div className="font-semibold mb-2">OpenAI API Key</div>
              <p className="text-sm text-[#737373] mb-4">gpt-4o-mini 모델을 사용합니다. 키는 브라우저 localStorage에만 저장됩니다.</p>

              <div className="relative">
                <input 
                  type={showKey ? "text" : "password"} 
                  className="input pr-20 font-mono text-sm" 
                  placeholder="sk-..." 
                  value={openaiKey} 
                  onChange={e => setOpenaiKey(e.target.value)} 
                />
                <button onClick={() => setShowKey(!showKey)} className="absolute right-3 top-3 text-xs font-medium text-[#525252]">
                  {showKey ? '숨기기' : '보기'}
                </button>
              </div>

              <div className="flex gap-3 mt-4">
                <button onClick={() => { localStorage.removeItem('openai_api_key'); setOpenaiKey(''); toast.info('API 키가 삭제되었습니다'); }} className="btn-secondary flex-1">키 삭제</button>
                <button onClick={() => { if (openaiKey) toast.success('API 키가 저장되었습니다'); }} className="btn-primary flex-1">저장</button>
              </div>
            </div>

            <div className="mt-8 text-xs text-[#A3A3A3] leading-relaxed">
              API 키가 없어도 템플릿 기반으로 충분히 좋은 품질의 리뷰를 생성할 수 있습니다.<br />
              OpenAI 키는 <a href="https://platform.openai.com/api-keys" target="_blank" className="underline">platform.openai.com</a> 에서 발급받으실 수 있습니다.
            </div>
          </div>
        )}
      </div>

      {/* ADD PRODUCT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4" onClick={() => { setIsAddModalOpen(false); resetNewProductForm(); }}>
          <div className="modal card w-full max-w-lg p-7" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <div className="font-semibold text-xl">상품 직접 추가</div>
              <button onClick={() => { setIsAddModalOpen(false); resetNewProductForm(); }}><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">상품명 *</label>
                <input className="input" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="에어프라이어 5.5L" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">가격 (원)</label>
                  <input className="input" type="number" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">카테고리</label>
                  <select className="input" value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">쿠팡 상품 URL</label>
                <input className="input" value={newProduct.coupangUrl} onChange={e => setNewProduct({ ...newProduct, coupangUrl: e.target.value })} placeholder="https://www.coupang.com/..." />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">쿠팡 파트너스 링크 (중요!)</label>
                <input className="input" value={newProduct.partnersUrl} onChange={e => setNewProduct({ ...newProduct, partnersUrl: e.target.value })} placeholder="https://link.coupang.com/..." />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">대표 이미지 URL (선택)</label>
                <input className="input" value={newProduct.imageUrl} onChange={e => setNewProduct({ ...newProduct, imageUrl: e.target.value })} placeholder="https://..." />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">메모</label>
                <textarea className="textarea" rows={2} value={newProduct.notes} onChange={e => setNewProduct({ ...newProduct, notes: e.target.value })} />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => { setIsAddModalOpen(false); resetNewProductForm(); }} className="btn-secondary flex-1">취소</button>
              <button 
                onClick={() => {
                  if (!newProduct.name) { toast.error('상품명을 입력해주세요'); return; }
                  addProduct({
                    name: newProduct.name,
                    price: parseInt(newProduct.price) || 0,
                    category: newProduct.category,
                    coupangUrl: newProduct.coupangUrl,
                    partnersUrl: newProduct.partnersUrl,
                    imageUrl: newProduct.imageUrl || undefined,
                    notes: newProduct.notes || undefined,
                  });
                }} 
                className="btn-primary flex-1"
              >
                상품 추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PARTNERS LINK HELPER MODAL */}
      {isPartnersHelperOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4" onClick={() => setIsPartnersHelperOpen(false)}>
          <div className="modal card w-full max-w-md p-7" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between mb-5">
              <div className="font-semibold text-xl">쿠팡 파트너스 링크 도우미</div>
              <button onClick={() => setIsPartnersHelperOpen(false)}><X /></button>
            </div>

            <div className="space-y-4 text-sm leading-relaxed text-[#404040]">
              <p>쿠팡 파트너스 링크는 <strong>직접 생성</strong>해야 합니다.</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li><a href="https://partners.coupang.com" target="_blank" className="text-[#E85D04] underline">쿠팡파트너스</a>에 로그인</li>
                <li>링크 생성 → 상품 검색 또는 URL 입력</li>
                <li>생성된 링크 복사해서 이 앱에 붙여넣기</li>
              </ol>
              <div className="pt-3 border-t">
                <div className="font-semibold mb-1">올바른 파트너스 링크 예시</div>
                <code className="text-xs bg-[#F5F5F5] px-2 py-1 rounded block break-all">https://link.coupang.com/a/xxxxxx?vendorItemId=123456789</code>
              </div>
              <div className="text-amber-600 text-xs">※ 이 도구는 링크를 자동으로 생성하지 않습니다. (로그인 필요)</div>
            </div>
            <button onClick={() => setIsPartnersHelperOpen(false)} className="btn-primary w-full mt-6">확인</button>
          </div>
        </div>
      )}
    </div>
  );
}
