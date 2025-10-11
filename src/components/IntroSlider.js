import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const IntroSlider = ( {onComplete} ) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Welcome to FruitPOS",
      subtitle: "Your Complete Fruit Stall Management Solution",
      points: [
        "Manage inventory with real-time tracking",
        "Quick billing with barcode scanning",
        "Track sales and generate reports",
        "Customer management made easy"
      ],
      color: "#4CAF50",
      accentColor: "#81C784"
    },
    {
      title: "Smart Inventory Control",
      subtitle: "Never Run Out of Fresh Fruits",
      points: [
        "Automatic stock alerts and notifications",
        "Expiry date tracking for perishables",
        "Supplier management system",
        "Waste reduction analytics"
      ],
      color: "#FF9800",
      accentColor: "#FFB74D"
    },
    {
      title: "Boost Your Sales",
      subtitle: "Grow Your Business with Data",
      points: [
        "Daily, weekly, and monthly reports",
        "Customer purchase history",
        "Peak hours analysis",
        "Best-selling products insights"
      ],
      color: "#2196F3",
      accentColor: "#64B5F6"
    }
  ];

   const nextSlide = () => {
    if (currentSlide === slides.length - 1) {
      // Last slide - mark setup as complete and redirect
      localStorage.setItem('isInitialSetup', 'true');
      if (onComplete) {
        onComplete();
      }
      // If you want to redirect to a specific route, uncomment below:
      // window.location.href = '/dashboard'; // or use your router
    } else {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const FruitBasketSVG = ({ color, accentColor }) => (
    <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id={`grad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: accentColor, stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: color, stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <path d="M 40 120 Q 40 140 60 145 L 140 145 Q 160 140 160 120 L 150 80 L 50 80 Z" 
            fill={`url(#grad-${color})`} stroke={color} strokeWidth="2"/>
      <circle cx="80" cy="60" r="18" fill="#FF6B6B"/>
      <circle cx="120" cy="55" r="20" fill="#FFD93D"/>
      <circle cx="100" cy="70" r="16" fill="#95E1D3"/>
      <ellipse cx="65" cy="85" rx="12" ry="18" fill="#A8E6CF"/>
      <ellipse cx="130" cy="85" rx="14" ry="16" fill="#FF8B94"/>
      <path d="M 80 42 Q 80 35 85 32" stroke="#2D5016" strokeWidth="2" fill="none"/>
      <path d="M 120 37 Q 120 30 115 27" stroke="#2D5016" strokeWidth="2" fill="none"/>
    </svg>
  );

  const InventorySVG = ({ color, accentColor }) => (
    <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id={`inv-grad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: accentColor, stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: color, stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <rect x="50" y="60" width="100" height="80" rx="5" fill={`url(#inv-grad-${color})`} stroke={color} strokeWidth="2"/>
      <rect x="70" y="40" width="60" height="30" rx="3" fill={accentColor} stroke={color} strokeWidth="2"/>
      <circle cx="80" cy="90" r="8" fill="#FFD93D"/>
      <circle cx="120" cy="90" r="8" fill="#FF6B6B"/>
      <circle cx="100" cy="115" r="8" fill="#95E1D3"/>
      <path d="M 85 55 L 95 55 L 90 45 Z" fill={color}/>
      <line x1="60" y1="100" x2="140" y2="100" stroke={color} strokeWidth="1" opacity="0.3"/>
      <line x1="60" y1="120" x2="140" y2="120" stroke={color} strokeWidth="1" opacity="0.3"/>
    </svg>
  );

  const SalesSVG = ({ color, accentColor }) => (
    <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id={`sales-grad-${color}`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: accentColor, stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: color, stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <rect x="40" y="40" width="120" height="120" rx="5" fill="white" stroke={color} strokeWidth="2"/>
      <polyline points="60,130 80,110 100,120 120,80 140,90" 
                fill="none" stroke={`url(#sales-grad-${color})`} strokeWidth="3"/>
      <circle cx="60" cy="130" r="4" fill={color}/>
      <circle cx="80" cy="110" r="4" fill={color}/>
      <circle cx="100" cy="120" r="4" fill={color}/>
      <circle cx="120" cy="80" r="4" fill={color}/>
      <circle cx="140" cy="90" r="4" fill={color}/>
      <path d="M 130 60 L 140 70 L 130 70 Z" fill={accentColor}/>
      <line x1="50" y1="150" x2="150" y2="150" stroke={color} strokeWidth="2"/>
      <line x1="50" y1="50" x2="50" y2="150" stroke={color} strokeWidth="2"/>
    </svg>
  );

  const renderSVG = (index, color, accentColor) => {
    switch(index) {
      case 0:
        return <FruitBasketSVG color={color} accentColor={accentColor} />;
      case 1:
        return <InventorySVG color={color} accentColor={accentColor} />;
      case 2:
        return <SalesSVG color={color} accentColor={accentColor} />;
      default:
        return <FruitBasketSVG color={color} accentColor={accentColor} />;
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#f5f5f5',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0
    }}>
      {/* Slide Container */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        minHeight: 0,
        padding: '10px'
      }}>
        {slides.map((slide, index) => (
          <div key={index} style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: currentSlide === index ? 1 : 0,
            transform: `translateX(${(index - currentSlide) * 100}%)`,
            transition: 'all 0.5s ease-in-out',
            padding: '10px',
            boxSizing: 'border-box'
          }}>
            {/* SVG Container */}
            <div style={{
              width: '100%',
              maxWidth: 'min(250px, 40vh)',
              height: 'auto',
              aspectRatio: '1',
              marginBottom: '15px',
              flexShrink: 0
            }}>
              {renderSVG(index, slide.color, slide.accentColor)}
            </div>

            {/* Content */}
            <div style={{
              maxWidth: '600px',
              width: '100%',
              textAlign: 'center',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minHeight: 0,
              overflow: 'auto'
            }}>
              <h1 style={{
                fontSize: 'clamp(20px, 4vw, 32px)',
                color: slide.color,
                marginBottom: '8px',
                fontWeight: 'bold',
                marginTop: 0
              }}>
                {slide.title}
              </h1>
              <h2 style={{
                fontSize: 'clamp(14px, 2.5vw, 18px)',
                color: '#666',
                marginBottom: '15px',
                fontWeight: 'normal',
                marginTop: 0
              }}>
                {slide.subtitle}
              </h2>

              {/* Points */}
              <div style={{
                textAlign: 'left',
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: 'clamp(12px, 3vw, 20px) clamp(15px, 4vw, 25px)',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                margin: '0 auto',
                maxWidth: '100%'
              }}>
                {slide.points.map((point, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    marginBottom: idx === slide.points.length - 1 ? '0' : '10px'
                  }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: slide.color,
                      marginTop: '6px',
                      marginRight: '10px',
                      flexShrink: 0
                    }}></div>
                    <p style={{
                      margin: 0,
                      fontSize: 'clamp(13px, 2.2vw, 15px)',
                      color: '#333',
                      lineHeight: '1.5'
                    }}>
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      <div style={{
        padding: 'clamp(12px, 3vh, 20px) 10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'clamp(12px, 2vh, 16px)',
        flexShrink: 0,
        backgroundColor: '#f5f5f5'
      }}>
        {/* Dots Indicator */}
        <div style={{
          display: 'flex',
          gap: '8px'
        }}>
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              style={{
                width: currentSlide === index ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor: currentSlide === index ? slides[currentSlide].color : '#ccc',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Prev/Next Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          width: '100%',
          maxWidth: '400px',
          justifyContent: 'center'
        }}>
          <button
            onClick={prevSlide}
            style={{
              width: 'clamp(40px, 10vw, 48px)',
              height: 'clamp(40px, 10vw, 48px)',
              borderRadius: '50%',
              backgroundColor: 'white',
              border: `2px solid ${slides[currentSlide].color}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              color: slides[currentSlide].color,
              flexShrink: 0,
              padding: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = slides[currentSlide].color;
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.color = slides[currentSlide].color;
            }}
            aria-label="Previous slide"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={nextSlide}
            style={{
              padding: 'clamp(10px, 2vh, 14px) clamp(20px, 6vw, 35px)',
              borderRadius: '25px',
              backgroundColor: slides[currentSlide].color,
              color: 'white',
              border: 'none',
              fontSize: 'clamp(13px, 2.5vw, 16px)',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              whiteSpace: 'nowrap',
              flex: '0 1 auto'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
          </button>

          <button
            onClick={nextSlide}
            style={{
              width: 'clamp(40px, 10vw, 48px)',
              height: 'clamp(40px, 10vw, 48px)',
              borderRadius: '50%',
              backgroundColor: 'white',
              border: `2px solid ${slides[currentSlide].color}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              color: slides[currentSlide].color,
              flexShrink: 0,
              padding: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = slides[currentSlide].color;
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.color = slides[currentSlide].color;
            }}
            aria-label="Next slide"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default IntroSlider;