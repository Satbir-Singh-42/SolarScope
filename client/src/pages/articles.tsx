import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Calendar, Clock, TrendingUp, Zap, Leaf, DollarSign, Search, Filter, ChevronRight, ExternalLink, Newspaper, RefreshCw, Menu, Home, MessageCircle, HelpCircle, CloudSun } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  publishedAt: string;
  readTime: number;
  trending: boolean;
  tags: string[];
  imageUrl?: string;
  source: string;
  url?: string;
}

const solarNewsData = {
  articles: [
    {
      id: "solar-tech-2025-001",
      title: "Revolutionary Perovskite Solar Cells Achieve 26% Efficiency in Commercial Applications",
      summary: "Leading solar manufacturers report breakthrough in perovskite-silicon tandem cells, achieving record-breaking efficiency rates while maintaining cost-effectiveness for mass production.",
      content: "The solar industry reached a significant milestone this week as multiple manufacturers announced successful commercialization of perovskite-silicon tandem solar cells achieving 26% efficiency rates. This technology, which combines traditional silicon cells with a perovskite layer, represents a major advancement in solar energy capture.\n\nThe breakthrough comes after years of research addressing stability issues in perovskite materials. New encapsulation techniques and material compositions have extended the operational lifespan to over 25 years, making these cells commercially viable for residential and commercial installations.\n\nIndustry analysts predict this advancement could reduce solar installation costs by 15-20% while significantly improving energy output, accelerating the global transition to renewable energy. Major manufacturers including First Solar and Oxford PV are already scaling production for 2025 deployment.",
      category: "technology",
      publishedAt: "2025-01-11",
      readTime: 6,
      trending: true,
      tags: ["perovskite", "efficiency", "solar cells", "technology"],
      imageUrl: "/assets/articles/technology-1.jpg",
      source: "Solar Industry Magazine"
    },
    {
      id: "solar-energy-2025-002",
      title: "AI-Powered Solar Panel Optimization Reduces Energy Waste by 30%",
      summary: "Artificial intelligence systems now monitor and optimize solar panel performance in real-time, automatically adjusting positioning and identifying maintenance needs before failures occur.",
      content: "Solar installations worldwide are implementing AI-powered optimization systems that continuously monitor panel performance and environmental conditions. These systems can predict maintenance needs, optimize panel positioning, and detect potential failures before they impact energy production.\n\nThe technology uses machine learning algorithms to analyze weather patterns, dust accumulation, and electrical performance data. When combined with automated cleaning systems and micro-inverters, these AI systems have demonstrated energy output improvements of up to 30%.\n\nMajor solar installation companies including SunPower and Enphase Energy are now offering AI optimization as standard equipment, with many existing installations being retrofitted with smart monitoring systems to maximize their energy production potential.",
      category: "technology",
      publishedAt: "2025-01-10",
      readTime: 5,
      trending: true,
      tags: ["AI", "optimization", "smart solar", "efficiency"],
      imageUrl: "/assets/articles/technology-2.jpg",
      source: "Renewable Energy Today"
    },
    {
      id: "solar-market-2025-003",
      title: "Solar Installation Costs Drop 40% as Supply Chain Recovers",
      summary: "Improved manufacturing capacity and streamlined supply chains have led to significant cost reductions in solar panel installations, making renewable energy more accessible to homeowners.",
      content: "The solar installation industry reports a dramatic 40% reduction in costs compared to 2023 levels, as supply chain disruptions have been resolved and manufacturing capacity has increased significantly. This cost reduction applies to both residential and commercial installations.\n\nKey factors contributing to the cost reduction include increased polysilicon production, more efficient manufacturing processes, and improved logistics networks. Additionally, increased competition among installers has driven down labor costs while improving service quality.\n\nThe cost reduction is expected to accelerate solar adoption, with industry projections suggesting a 50% increase in residential installations over the next two years. Government incentives combined with these lower costs make solar energy more economically attractive than traditional grid electricity in most regions.",
      category: "market",
      publishedAt: "2025-01-09",
      readTime: 4,
      trending: true,
      tags: ["cost reduction", "installation", "market", "accessibility"],
      imageUrl: "/assets/articles/market-1.jpg",
      source: "Energy Market Report"
    },
    {
      id: "solar-storage-2025-004",
      title: "Next-Generation Battery Storage Systems Extend Solar Energy Availability",
      summary: "Advanced lithium-iron-phosphate batteries with 15-year warranties are now standard in solar installations, providing reliable energy storage for extended periods without sunlight.",
      content: "Solar energy storage has reached a new level of reliability with next-generation battery systems that can store solar energy for extended periods. These systems use advanced lithium-iron-phosphate chemistry that provides better safety, longer lifespan, and improved performance compared to previous generations.\n\nThe new battery systems offer 15-year warranties and can maintain 80% capacity after 8,000 charge cycles. They integrate seamlessly with solar installations and can provide backup power during grid outages while optimizing energy usage during peak demand periods.\n\nWith these improvements, solar installations can now provide consistent energy availability regardless of weather conditions, making them a more reliable alternative to traditional grid electricity for both residential and commercial applications.",
      category: "technology",
      publishedAt: "2025-01-08",
      readTime: 5,
      trending: false,
      tags: ["battery storage", "lithium", "backup power", "reliability"],
      imageUrl: "/assets/articles/technology-3.jpg",
      source: "Energy Storage News"
    },
    {
      id: "solar-policy-2025-005",
      title: "Government Extends Solar Tax Credits Through 2030 with Enhanced Incentives",
      summary: "Federal and state governments announce extended solar tax credit programs with additional incentives for energy storage systems and community solar projects.",
      content: "Government officials announced the extension of solar tax credit programs through 2030, with enhanced incentives for residential and commercial installations. The program now includes additional credits for energy storage systems and community solar participation.\n\nThe enhanced incentives provide up to 30% tax credits for solar installations, with an additional 10% credit for battery storage systems. Community solar programs receive special consideration with credits up to 40% for installations serving multiple households.\n\nThis policy extension is expected to drive significant growth in solar adoption, with industry estimates suggesting it could double the current installation rate by 2027. The program also includes provisions for workforce development and manufacturing incentives to support domestic solar industry growth.",
      category: "policy",
      publishedAt: "2025-01-07",
      readTime: 4,
      trending: false,
      tags: ["tax credits", "government", "incentives", "policy"],
      imageUrl: "/assets/articles/policy-1.jpg",
      source: "Policy Energy Review"
    },
    {
      id: "solar-environment-2025-006",
      title: "Solar Recycling Programs Achieve 95% Material Recovery Rate",
      summary: "Advanced recycling technologies now recover 95% of materials from end-of-life solar panels, creating a circular economy for solar components and reducing environmental impact.",
      content: "The solar industry has achieved a major environmental milestone with recycling programs now recovering 95% of materials from end-of-life solar panels. This breakthrough addresses previous concerns about solar panel disposal and creates a sustainable circular economy for solar components.\n\nNew recycling technologies can separate and purify silicon, silver, aluminum, and other valuable materials from decommissioned panels. These recovered materials are then used to manufacture new solar panels, significantly reducing the environmental impact of solar energy production.\n\nThe recycling programs are being implemented globally, with collection networks established in major solar markets. This development reinforces solar energy's position as a truly sustainable energy source with minimal long-term environmental impact.",
      category: "environment",
      publishedAt: "2025-01-06",
      readTime: 5,
      trending: false,
      tags: ["recycling", "sustainability", "circular economy", "environment"],
      imageUrl: "/assets/articles/environment-1.jpg",
      source: "Environmental Solar Review"
    },
    {
      id: "solar-innovation-2025-007",
      title: "Transparent Solar Windows Achieve Commercial Viability",
      summary: "Building-integrated photovoltaics now include transparent solar windows that generate electricity while maintaining architectural aesthetics and natural lighting.",
      content: "Transparent solar window technology has reached commercial viability, offering a revolutionary approach to building-integrated photovoltaics. These windows maintain optical transparency while generating electricity from solar energy, making them ideal for office buildings, residential homes, and urban environments.\n\nThe technology uses quantum dots and organic photovoltaic materials that selectively absorb non-visible light spectrums while allowing visible light to pass through. This innovation enables buildings to generate clean energy without compromising natural lighting or architectural design.\n\nMajor building developers are now incorporating transparent solar windows into new construction projects, with installations expected to increase by 200% over the next three years. The technology offers a pathway to net-zero energy buildings in urban environments.",
      category: "technology",
      publishedAt: "2025-01-05",
      readTime: 6,
      trending: false,
      tags: ["transparent solar", "building integration", "quantum dots", "architecture"],
      imageUrl: "/assets/articles/technology-4.jpg",
      source: "Building Technology Today"
    },
    {
      id: "solar-market-2025-008",
      title: "Community Solar Programs Expand Access to 50 Million Households",
      summary: "Innovative community solar programs now serve households that cannot install rooftop panels, democratizing access to clean energy and reducing electricity costs.",
      content: "Community solar programs have achieved unprecedented scale, now serving over 50 million households that previously couldn't access solar energy benefits. These programs allow multiple households to share electricity generated by a single solar installation, typically located in optimal solar conditions.\n\nThe programs particularly benefit renters, apartment dwellers, and homeowners with unsuitable rooftops for solar installation. Participants receive credits on their electricity bills based on their share of the solar farm's production, often reducing energy costs by 15-25%.\n\nUtility companies and solar developers are rapidly expanding community solar offerings, with regulatory support from state governments promoting equitable access to renewable energy. This model is expected to serve 100 million households by 2027.",
      category: "market",
      publishedAt: "2025-01-04",
      readTime: 5,
      trending: false,
      tags: ["community solar", "energy access", "shared solar", "renewable energy"],
      imageUrl: "/assets/articles/market-2.jpg",
      source: "Community Energy Report"
    }
  ],
  categories: ["technology", "environment", "market", "policy"],
  trending: []
};

export default function Articles() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newsData, setNewsData] = useState(solarNewsData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());
  const [pullRefreshState, setPullRefreshState] = useState({ isPulling: false, pullDistance: 0, triggered: false });

  useEffect(() => {
    let filtered = newsData.articles;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    setFilteredArticles(filtered);
  }, [newsData, selectedCategory, searchQuery]);

  useEffect(() => {
    // Set trending articles
    const trending = newsData.articles.filter(article => article.trending).slice(0, 3);
    setNewsData(prev => ({ ...prev, trending }));
  }, []);

  // Auto-refresh every 3 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 180000); // 3 minutes

    return () => clearInterval(interval);
  }, []);

  // Pull-to-refresh for mobile
  useEffect(() => {
    let startY = 0;
    let isScrolling = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0 && !isRefreshing) {
        startY = e.touches[0].clientY;
        isScrolling = false;
        setPullRefreshState({ isPulling: false, pullDistance: 0, triggered: false });
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isScrolling && window.scrollY === 0 && !isRefreshing) {
        const currentY = e.touches[0].clientY;
        const diffY = currentY - startY;
        
        if (diffY > 0) {
          const pullDistance = Math.min(diffY * 0.6, 120); // Reduce sensitivity
          const triggered = pullDistance > 60;
          setPullRefreshState({ 
            isPulling: true, 
            pullDistance, 
            triggered 
          });
          
          if (diffY > 40) { // Prevent scroll when pulling
            e.preventDefault();
          }
        }
      }
    };

    const handleTouchEnd = () => {
      if (pullRefreshState.isPulling && pullRefreshState.triggered && !isRefreshing) {
        handleRefresh();
      }
      setPullRefreshState({ isPulling: false, pullDistance: 0, triggered: false });
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullRefreshState]);

  // Desktop scroll-to-refresh support
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    
    const handleScroll = () => {
      if (window.scrollY === 0 && !isRefreshing) {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          // Auto-refresh when user stays at top for 2 seconds
          if (window.scrollY === 0) {
            handleRefresh();
          }
        }, 2000);
      } else {
        clearTimeout(scrollTimeout);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [isRefreshing]);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'technology': return <Zap className="w-4 h-4" />;
      case 'environment': return <Leaf className="w-4 h-4" />;
      case 'market': return <DollarSign className="w-4 h-4" />;
      case 'policy': return <Calendar className="w-4 h-4" />;
      case 'trending': return <TrendingUp className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleReadMore = (article: Article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setLastRefreshTime(Date.now());
    
    try {
      // Try to fetch from API first, then fall back to static data
      const response = await fetch('/api/solar-news');
      if (response.ok) {
        const data = await response.json();
        setNewsData(data);
      } else {
        // Shuffle articles and update timestamps for variety
        const shuffledArticles = [...newsData.articles]
          .sort(() => Math.random() - 0.5)
          .map((article, index) => ({
            ...article,
            publishedAt: index < 3 ? new Date().toISOString().split('T')[0] : article.publishedAt,
            trending: index < 2 // Mark first 2 as trending
          }));
        setNewsData(prev => ({ ...prev, articles: shuffledArticles }));
      }
    } catch (error) {
      console.log('Using refreshed static data');
      // Shuffle articles and update timestamps for variety
      const shuffledArticles = [...newsData.articles]
        .sort(() => Math.random() - 0.5)
        .map((article, index) => ({
          ...article,
          publishedAt: index < 3 ? new Date().toISOString().split('T')[0] : article.publishedAt,
          trending: index < 2 // Mark first 2 as trending
        }));
      setNewsData(prev => ({ ...prev, articles: shuffledArticles }));
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface pt-16">
      {/* Loading indicator below navbar */}
      {isRefreshing && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex flex-col items-center justify-center py-4 px-4">
            {/* Custom loading spinner similar to attached image */}
            <div className="relative w-10 h-10 mb-2">
              <div className="absolute inset-0">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-3 bg-gray-300 rounded-full animate-pulse"
                    style={{
                      top: '2px',
                      left: '50%',
                      transformOrigin: '50% 18px',
                      transform: `translateX(-50%) rotate(${i * 30}deg)`,
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: '1.2s'
                    }}
                  />
                ))}
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={`dark-${i}`}
                    className="absolute w-1 h-3 bg-gray-600 rounded-full animate-pulse"
                    style={{
                      top: '2px',
                      left: '50%',
                      transformOrigin: '50% 18px',
                      transform: `translateX(-50%) rotate(${i * 30}deg)`,
                      animationDelay: `${i * 0.1 + 0.6}s`,
                      animationDuration: '1.2s',
                      opacity: i < 3 ? 1 : 0
                    }}
                  />
                ))}
              </div>
            </div>
            <span className="text-sm text-gray-600 font-medium">LOADING...</span>
          </div>
        </div>
      )}
      
      {/* Pull-to-refresh indicator */}
      {pullRefreshState.isPulling && !isRefreshing && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div 
            className="flex flex-col items-center justify-center transition-all duration-200"
            style={{ 
              height: `${Math.min(pullRefreshState.pullDistance, 60)}px`,
              opacity: pullRefreshState.pullDistance / 80
            }}
          >
            <div className="relative w-8 h-8 mb-1">
              <div className="absolute inset-0">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-0.5 h-2 bg-gray-300 rounded-full"
                    style={{
                      top: '2px',
                      left: '50%',
                      transformOrigin: '50% 14px',
                      transform: `translateX(-50%) rotate(${i * 30}deg)`,
                      opacity: pullRefreshState.triggered ? (i < 3 ? 0.8 : 0.3) : 0.5
                    }}
                  />
                ))}
              </div>
            </div>
            <span className="text-xs text-gray-600 font-medium">
              {pullRefreshState.triggered ? 'Release to refresh' : 'Pull to refresh'}
            </span>
          </div>
        </div>
      )}
      
      {/* Navigation Header */}
      <header className="bg-white shadow-material fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-lg flex items-center justify-center">
                <CloudSun className="text-white" size={20} />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-primary">SolarScope AI</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/?tab=installation">
                <button className="text-secondary-custom hover:text-primary transition-all duration-300 ease-in-out transform hover:scale-105">
                  Installation Planning
                </button>
              </Link>
              <Link href="/?tab=fault-detection">
                <button className="text-secondary-custom hover:text-primary transition-all duration-300 ease-in-out transform hover:scale-105">
                  Fault Detection
                </button>
              </Link>
              <Link href="/chat">
                <button className="text-secondary-custom hover:text-primary transition-all duration-300 ease-in-out transform hover:scale-105">
                  AI Assistant
                </button>
              </Link>
              <button className="text-primary font-medium transition-all duration-300 ease-in-out transform hover:scale-105">
                Articles
              </button>
              <Link href="/about">
                <button className="text-secondary-custom hover:text-primary transition-all duration-300 ease-in-out transform hover:scale-105">
                  About
                </button>
              </Link>
            </nav>
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="bg-white hover:bg-blue-50 text-black hover:text-blue-600 border-gray-300 hover:border-blue-400">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <SheetDescription className="sr-only">Main navigation menu</SheetDescription>
                  <nav className="flex flex-col space-y-6 mt-8">
                    <div className="flex flex-col space-y-4">
                      <h3 className="font-semibold text-lg text-primary">Navigation</h3>
                      <Link href="/?tab=installation">
                        <Button variant="outline" className="w-full justify-start space-x-3">
                          <Home size={20} />
                          <span>Installation Planning</span>
                        </Button>
                      </Link>
                      <Link href="/?tab=fault-detection">
                        <Button variant="outline" className="w-full justify-start space-x-3">
                          <Search size={20} />
                          <span>Fault Detection</span>
                        </Button>
                      </Link>
                      <Link href="/chat">
                        <Button variant="outline" className="w-full justify-start space-x-3">
                          <MessageCircle size={20} />
                          <span>AI Assistant</span>
                        </Button>
                      </Link>
                      <Button variant="default" className="w-full justify-start space-x-3">
                        <Newspaper size={20} />
                        <span>Articles</span>
                      </Button>
                      <Link href="/about">
                        <Button variant="outline" className="w-full justify-start space-x-3">
                          <HelpCircle size={20} />
                          <span>About</span>
                        </Button>
                      </Link>
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <div 
        className="max-w-4xl mx-auto px-4 transition-all duration-300"
        style={{ 
          paddingTop: `${24 + (isRefreshing || pullRefreshState.isPulling ? 60 : 0)}px`,
          paddingBottom: '24px'
        }}
      >
        {/* Last refresh status */}
        {!isRefreshing && !pullRefreshState.isPulling && (
          <div className="text-center mb-4">
            <span className="text-xs text-gray-500">
              Last updated: {new Date(lastRefreshTime).toLocaleTimeString()}
            </span>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-3 text-base bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
              className="rounded-full"
            >
              All
            </Button>
            {newsData.categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="rounded-full capitalize"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Articles List */}
        <div className="space-y-4">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No articles found matching your search.</p>
            </div>
          ) : (
            filteredArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card 
                  className="hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 bg-white"
                  onClick={() => handleReadMore(article)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      {/* Article Image */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                          {article.imageUrl ? (
                            <img 
                              src={article.imageUrl} 
                              alt={article.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              crossOrigin="anonymous"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                              <Calendar className="w-8 h-8 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Article Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 capitalize">
                            {article.category}
                          </Badge>
                          {article.trending && (
                            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Trending
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2 leading-tight">
                          {article.title}
                        </h3>
                        
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                          {article.summary}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {article.readTime} min read
                            </div>
                            <span>{formatDate(article.publishedAt)}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {article.source}
                          </div>
                        </div>
                      </div>
                      
                      {/* Arrow Icon */}
                      <div className="flex-shrink-0">
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Article Reading Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold pr-8">
              {selectedArticle?.title}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {selectedArticle?.summary}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[70vh] pr-4">
            {selectedArticle && (
              <div className="space-y-6">
                {/* Featured Image */}
                {selectedArticle.imageUrl && (
                  <div className="w-full h-64 rounded-lg overflow-hidden bg-gray-100">
                    <img 
                      src={selectedArticle.imageUrl} 
                      alt={selectedArticle.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      crossOrigin="anonymous"
                    />
                  </div>
                )}
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {getCategoryIcon(selectedArticle.category)}
                      <span className="ml-1">{selectedArticle.category}</span>
                    </Badge>
                    <span>{formatDate(selectedArticle.publishedAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {selectedArticle.readTime} min read
                  </div>
                  <span>Source: {selectedArticle.source}</span>
                </div>

                <div className="prose prose-lg max-w-none">
                  <p className="text-xl text-gray-700 leading-relaxed">
                    {selectedArticle.summary}
                  </p>
                  
                  <Separator className="my-6" />
                  
                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {selectedArticle.content}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-4">
                  {selectedArticle.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleCloseModal}>
              Close
            </Button>
            {selectedArticle?.url && (
              <Button onClick={() => window.open(selectedArticle.url, '_blank')}>
                <ExternalLink className="w-4 h-4 mr-1" />
                Read Original
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}