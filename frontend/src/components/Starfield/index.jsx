import { useEffect, useState, useMemo } from 'react';
import './starfield.css';

/**
 * Premium Galaxy Starfield Background
 * - Realistic twinkling stars at various depths
 * - Dynamic shooting stars that spawn randomly
 * - Subtle nebula glows
 * - Minimalistic and professional
 */
export default function Starfield() {
    // Generate static stars once on mount
    const stars = useMemo(() => {
        const generated = [];
        // Create 80 stars for a realistic but minimal look
        for (let i = 0; i < 80; i++) {
            const size = Math.random() * 2.5 + 0.5; // 0.5px to 3px
            const isColoredStar = Math.random() > 0.85; // 15% chance of colored star
            generated.push({
                id: i,
                left: Math.random() * 100,
                top: Math.random() * 100,
                size,
                opacity: Math.random() * 0.5 + 0.3, // 0.3 to 0.8
                twinkleDuration: Math.random() * 4 + 2, // 2s to 6s
                twinkleDelay: Math.random() * 6,
                color: isColoredStar
                    ? (Math.random() > 0.5 ? '#a78bfa' : '#60a5fa')
                    : '#ffffff',
            });
        }
        return generated;
    }, []);

    // Dynamic shooting stars
    const [shootingStars, setShootingStars] = useState([]);

    useEffect(() => {
        let mounted = true;

        const createShootingStar = () => {
            if (!mounted) return;

            const id = Date.now() + Math.random();
            const star = {
                id,
                startX: Math.random() * 60 + 20, // Start in middle 60% of screen
                startY: Math.random() * 40, // Start in upper 40%
                angle: Math.random() * 30 + 20, // 20-50 degree angle
                duration: Math.random() * 0.8 + 0.6, // 0.6s to 1.4s
                length: Math.random() * 80 + 60, // 60-140px
            };

            setShootingStars(prev => [...prev, star]);

            // Remove after animation completes
            setTimeout(() => {
                if (mounted) {
                    setShootingStars(prev => prev.filter(s => s.id !== id));
                }
            }, star.duration * 1000 + 500);
        };

        // Spawn shooting stars at random intervals
        const scheduleNext = () => {
            if (!mounted) return;
            const delay = Math.random() * 4000 + 3000; // 3-7 seconds
            setTimeout(() => {
                createShootingStar();
                scheduleNext();
            }, delay);
        };

        // Initial delay before first shooting star
        setTimeout(scheduleNext, 2000);

        return () => { mounted = false; };
    }, []);

    return (
        <div className="starfield-container">
            {/* Deep space background gradient */}
            <div className="space-gradient" />

            {/* Nebula glows */}
            <div className="nebula nebula-1" />
            <div className="nebula nebula-2" />
            <div className="nebula nebula-3" />

            {/* Static twinkling stars */}
            {stars.map((star) => (
                <div
                    key={star.id}
                    className="star"
                    style={{
                        left: `${star.left}%`,
                        top: `${star.top}%`,
                        width: `${star.size}px`,
                        height: `${star.size}px`,
                        backgroundColor: star.color,
                        boxShadow: `0 0 ${star.size * 2}px ${star.color}`,
                        animationDuration: `${star.twinkleDuration}s`,
                        animationDelay: `${star.twinkleDelay}s`,
                        opacity: star.opacity,
                    }}
                />
            ))}

            {/* Shooting stars */}
            {shootingStars.map((star) => (
                <div
                    key={star.id}
                    className="shooting-star"
                    style={{
                        left: `${star.startX}%`,
                        top: `${star.startY}%`,
                        width: `${star.length}px`,
                        transform: `rotate(${star.angle}deg)`,
                        animationDuration: `${star.duration}s`,
                    }}
                />
            ))}
        </div>
    );
}
