import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock, TrendingUp, Zap, Leaf, DollarSign, Search, Filter, ChevronRight, ExternalLink, Newspaper, RefreshCw } from "lucide-react";
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
    try {
      // Try to fetch from API first, then fall back to static data
      const response = await fetch('/api/solar-news');
      if (response.ok) {
        const data = await response.json();
        setNewsData(data);
      } else {
        // Rotate articles for variety
        const rotatedArticles = [...newsData.articles.slice(1), newsData.articles[0]];
        setNewsData(prev => ({ ...prev, articles: rotatedArticles }));
      }
    } catch (error) {
      console.log('Using static data');
      // Rotate articles for variety
      const rotatedArticles = [...newsData.articles.slice(1), newsData.articles[0]];
      setNewsData(prev => ({ ...prev, articles: rotatedArticles }));
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 pt-16">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Newspaper className="text-white" size={20} />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-blue-600">Solar Industry News</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/">
                <button className="text-gray-600 hover:text-blue-600 transition-colors">Dashboard</button>
              </Link>
              <Link href="/chat">
                <button className="text-gray-600 hover:text-blue-600 transition-colors">AI Assistant</button>
              </Link>
              <Link href="/articles">
                <button className="text-blue-600 font-medium">Articles</button>
              </Link>
              <Link href="/about">
                <button className="text-gray-600 hover:text-blue-600 transition-colors">About</button>
              </Link>
              <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isRefreshing}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh Articles
              </Button>
            </nav>
            <div className="md:hidden">
              <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isRefreshing}>
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Solar Industry News</h2>
              <p className="text-gray-600 mt-1">Latest developments in solar technology and market trends</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Zap className="w-3 h-3 mr-1" />
                Live Updates
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search articles, topics, or technologies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {newsData.categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="latest" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="latest">Latest News</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="latest" className="space-y-6">
            {/* Featured Article */}
            {filteredArticles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="overflow-hidden border-l-4 border-l-blue-600">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                            {getCategoryIcon(filteredArticles[0].category)}
                            <span className="ml-1">Featured</span>
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {formatDate(filteredArticles[0].publishedAt)}
                          </span>
                        </div>
                        <CardTitle className="text-2xl leading-tight">
                          {filteredArticles[0].title}
                        </CardTitle>
                        <CardDescription className="text-base">
                          {filteredArticles[0].summary}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {filteredArticles[0].readTime} min read
                        </div>
                        <div className="flex items-center gap-1">
                          <span>Source: {filteredArticles[0].source}</span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleReadMore(filteredArticles[0])}
                      >
                        Read More <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.slice(1).map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleReadMore(article)}>
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {getCategoryIcon(article.category)}
                          <span className="ml-1">{article.category}</span>
                        </Badge>
                        {article.trending && (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Trending
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg leading-tight line-clamp-2">
                        {article.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-3">
                        {article.summary}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Separator className="mb-4" />
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {article.readTime} min
                        </div>
                        <span>{formatDate(article.publishedAt)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Source: {article.source}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {article.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trending" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {newsData.trending.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleReadMore(article)}>
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-orange-100 text-orange-700">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          #{index + 1} Trending
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {formatDate(article.publishedAt)}
                        </span>
                      </div>
                      <CardTitle className="text-xl">{article.title}</CardTitle>
                      <CardDescription>{article.summary}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {article.readTime} min read
                          </div>
                          <span>Source: {article.source}</span>
                        </div>
                        <Button variant="outline" size="sm" onClick={(e) => {
                          e.stopPropagation();
                          handleReadMore(article);
                        }}>
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Read More
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {newsData.categories.map((category) => {
                const categoryArticles = newsData.articles.filter(article => article.category === category);
                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedCategory(category)}>
                      <CardHeader className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                          {getCategoryIcon(category)}
                          <span className="ml-1 text-white">{getCategoryIcon(category)}</span>
                        </div>
                        <CardTitle className="text-lg capitalize">{category}</CardTitle>
                        <CardDescription>
                          {categoryArticles.length} articles
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
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