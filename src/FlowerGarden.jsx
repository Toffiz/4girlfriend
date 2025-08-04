import React, { useEffect, useState } from 'react';
import './FlowerGarden.css';

const FlowerGarden = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Remove the not-loaded class after component mounts
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const FlowerComponent = ({ flowerNumber, leafCount = 6 }) => (
    <div className={`flower flower--${flowerNumber}`}>
      <div className={`flower__leafs flower__leafs--${flowerNumber}`}>
        <div className="flower__leaf flower__leaf--1"></div>
        <div className="flower__leaf flower__leaf--2"></div>
        <div className="flower__leaf flower__leaf--3"></div>
        <div className="flower__leaf flower__leaf--4"></div>
        <div className="flower__white-circle"></div>

        {/* Light effects */}
        {[1, 2, 3, 4, 5, 6, 7, 8].map(lightNum => (
          <div key={lightNum} className={`flower__light flower__light--${lightNum}`}></div>
        ))}
      </div>
      
      <div className="flower__line">
        {[...Array(leafCount)].map((_, index) => (
          <div key={index + 1} className={`flower__line__leaf flower__line__leaf--${index + 1}`}></div>
        ))}
      </div>
    </div>
  );

  const GrassComponent = ({ grassNumber }) => (
    <div className="growing-grass">
      <div className={`flower__grass flower__grass--${grassNumber}`}>
        <div className="flower__grass--top"></div>
        <div className="flower__grass--bottom"></div>
        
        {[1, 2, 3, 4, 5, 6, 7, 8].map(leafNum => (
          <div key={leafNum} className={`flower__grass__leaf flower__grass__leaf--${leafNum}`}></div>
        ))}
        
        <div className="flower__grass__overlay"></div>
      </div>
    </div>
  );

  const LongGrassComponent = ({ grassNumber, delay }) => (
    <div className={`long-g long-g--${grassNumber}`}>
      {[0, 1, 2, 3].map(leafIndex => (
        <div key={leafIndex} className="grow-ans" style={{ '--d': `${delay + leafIndex * 0.2}s` }}>
          <div className={`leaf leaf--${leafIndex}`}></div>
        </div>
      ))}
    </div>
  );

  const FrontGrassComponent = () => (
    <div className="grow-ans" style={{ '--d': '2.8s' }}>
      <div className="flower__g-front">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(wrapperNum => (
          <div key={wrapperNum} className={`flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--${wrapperNum}`}>
            <div className="flower__g-front__leaf"></div>
          </div>
        ))}
        <div className="flower__g-front__line"></div>
      </div>
    </div>
  );

  const FrGrassComponent = () => (
    <div className="grow-ans" style={{ '--d': '3.2s' }}>
      <div className="flower__g-fr">
        <div className="leaf"></div>
        {[1, 2, 3, 4, 5, 6, 7, 8].map(leafNum => (
          <div key={leafNum} className={`flower__g-fr__leaf flower__g-fr__leaf--${leafNum}`}></div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`flower-garden ${!isLoaded ? 'not-loaded' : ''}`}>
      {/* Night sky background */}
      <div className="night"></div>
      
      {/* Main flowers container */}
      <div className="flowers">
        {/* Three main flowers */}
        <FlowerComponent flowerNumber={1} leafCount={6} />
        <FlowerComponent flowerNumber={2} leafCount={4} />
        <FlowerComponent flowerNumber={3} leafCount={4} />

        {/* Long grass element */}
        <div className="grow-ans" style={{ '--d': '1.2s' }}>
          <div className="flower__g-long">
            <div className="flower__g-long__top"></div>
            <div className="flower__g-long__bottom"></div>
          </div>
        </div>

        {/* Grass components */}
        <GrassComponent grassNumber={1} />
        <GrassComponent grassNumber={2} />

        {/* Right grass elements */}
        <div className="grow-ans" style={{ '--d': '2.4s' }}>
          <div className="flower__g-right flower__g-right--1">
            <div className="leaf"></div>
          </div>
        </div>

        <div className="grow-ans" style={{ '--d': '2.8s' }}>
          <div className="flower__g-right flower__g-right--2">
            <div className="leaf"></div>
          </div>
        </div>

        {/* Front grass */}
        <FrontGrassComponent />

        {/* Fr grass */}
        <FrGrassComponent />

        {/* Long grass variations */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map(grassNum => (
          <LongGrassComponent 
            key={grassNum} 
            grassNumber={grassNum} 
            delay={3 + grassNum * 0.2} 
          />
        ))}
      </div>

      {/* Love Message */}
      <div className="love-message">
        <h1 className="love-text">I Love You, My Beautiful Flower! 🌸</h1>
        <p className="love-subtitle">Just like these flowers bloom, my love for you grows infinitely ❤️</p>
      </div>
    </div>
  );
};

export default FlowerGarden;
