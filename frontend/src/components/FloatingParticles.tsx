import React, { useMemo } from 'react';
import { Box } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const FloatingParticles = () => {
    // 25 Large bubbles with zoned distribution
    const count = 25;

    const particles = useMemo(() => {
        const colors = ['#B2F5EA', '#FEEBC8', '#BEE3F8', '#FEFCBF', '#E9D8FD', '#C6F6D5'];

        const getZonePosition = (index: number) => {
            const zone = index % 5;
            switch (zone) {
                case 0: return { x: Math.random() * 30 - 10, y: Math.random() * 30 - 10 }; // Top-Left
                case 1: return { x: Math.random() * 30 + 70, y: Math.random() * 30 - 10 }; // Top-Right
                case 2: return { x: Math.random() * 30 - 10, y: Math.random() * 30 + 70 }; // Bottom-Left
                case 3: return { x: Math.random() * 30 + 70, y: Math.random() * 30 + 70 }; // Bottom-Right
                default: return { x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 }; // Center
            }
        };

        return Array.from({ length: count }).map((_, i) => {
            const pos = getZonePosition(i);
            return {
                id: i,
                size: Math.random() * 450 + 250,
                x: pos.x,
                y: pos.y,
                duration: Math.random() * 15 + 15,
                bg: colors[Math.floor(Math.random() * colors.length)],
                delay: Math.random() * 5,
            };
        });
    }, []);

    return (
        <Box
            position="fixed"
            top={0}
            left={0}
            w="100vw"
            h="100vh"
            zIndex={-1}
            pointerEvents="none"
            overflow="hidden"
            bg="linear-gradient(-45deg, #fff5f5, #fff, #f0fff4, #fff)"
            backgroundSize="400% 400%"
            sx={{
                animation: "gradientAnimation 20s ease infinite"
            }}
        >
            <style>
                {`
                    @keyframes gradientAnimation {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                `}
            </style>

            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    style={{
                        position: 'absolute',
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.size,
                        height: p.size,
                        borderRadius: '50%',
                        backgroundColor: p.bg,
                        filter: 'blur(60px)',
                        opacity: 0,
                    }}
                    animate={{
                        x: [0, Math.random() * 300 - 150, Math.random() * 300 - 150, 0],
                        y: [0, Math.random() * 300 - 150, Math.random() * 300 - 150, 0],
                        scale: [1, 1.15, 0.9, 1],
                        opacity: [0.3, 0.65, 0.4, 0.7, 0.3],
                        rotate: [0, 45, -45, 0],
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: p.delay,
                        repeatType: "mirror"
                    }}
                />
            ))}
        </Box>
    );
};

export default FloatingParticles;
